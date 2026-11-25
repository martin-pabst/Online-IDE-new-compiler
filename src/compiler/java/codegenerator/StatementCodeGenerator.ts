import { SettingsStore } from "../../../client/settings/SettingsStore.ts";
import { FOR_EACH_VIA_GET_ELEMENTS } from "../../common/BaseType.ts";
import { ErrorLevel } from "../../common/Error.ts";
import { CatchBlockInfo } from "../../common/interpreter/ExceptionInfo.ts";
import { Helpers, StepParams } from "../../common/interpreter/StepFunction";
import { EmptyRange, IRange, Range } from "../../common/range/Range.ts";
import { TokenType } from "../TokenType";
import { JCM } from "../language/JavaCompilerMessages.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule";
import { JavaTypeStore } from "../module/JavaTypeStore";
import { ReplaceTokenQuickfix } from "../monacoproviders/quickfix/ReplaceTokenQuickfix.ts";
import { ASTArrayLiteralNode, ASTAttributeDereferencingNode, ASTBinaryNode, ASTBlockNode, ASTBracketNode, ASTBreakNode, ASTCaseNode, ASTContinueNode, ASTDoWhileNode, ASTEnhancedForLoopNode, ASTFirstMainMethodStatementNode, ASTForLoopNode, ASTIfNode, ASTInitialFieldAssignmentInMainProgramNodes, ASTLambdaFunctionDeclarationNode, ASTLocalVariableDeclaration, ASTLocalVariableDeclarations, ASTMethodCallNode, ASTNode, ASTPrintStatementNode, ASTReturnNode, ASTStatementNode, ASTSwitchCaseNode, ASTSymbolNode, ASTSynchronizedBlockNode, ASTTermNode, ASTThrowNode, ASTTryCatchNode, ASTUnaryPrefixNode, ASTWhileNode } from "../parser/AST";
import { ObjectClass } from "../runtime/system/javalang/ObjectClassStringClass.ts";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType";
import { GenericTypeParameter } from "../types/GenericTypeParameter.ts";
import { JavaArrayType } from "../types/JavaArrayType.ts";
import { GenericVariantOfJavaClass, IJavaClass } from "../types/JavaClass.ts";
import { JavaEnum } from "../types/JavaEnum.ts";
import { JavaField } from "../types/JavaField.ts";
import { GenericVariantOfJavaInterface, IJavaInterface } from "../types/JavaInterface.ts";
import { JavaMethod } from "../types/JavaMethod.ts";
import { JavaType } from "../types/JavaType.ts";
import { NonPrimitiveType } from "../types/NonPrimitiveType.ts";
import { at, Code, hook, isEmptyCode, jump, Label, STEP } from "./Code";
import { combine, Expr, frame, isConstant, statement, term, toStatement } from "./Expr";
import { ExceptionTree } from "./ExceptionTree.ts";
import { FlowState } from "./FlowAnalyzer.ts";
import { JavaLocalVariable } from "./JavaLocalVariable";
import { TermCodeGenerator } from "./TermCodeGenerator";

export type CodeGenerationMode = "normal" | "repl" | "replStandalone";

export abstract class StatementCodeGenerator extends TermCodeGenerator {

    synchronizedBlockCount: number = 0;

    codeGenerationMode: CodeGenerationMode = "normal";

    constructor(module: JavaCompiledModule, libraryTypestore: JavaTypeStore, compiledTypesTypestore: JavaTypeStore,
        protected exceptionTree: ExceptionTree,
        settingsStore: SettingsStore | undefined) {
        super(module, libraryTypestore, compiledTypesTypestore, settingsStore);

    }


    /**
     * @param termToCode converts term statements (method call, assignment, ...) into code; default: evaluate and
     * discard value
     */
    compileStatementOrTerm(ast: ASTStatementNode | undefined, termToCode: (term: Expr) => Code = toStatement): Code | undefined {

        if (!ast) return undefined;

        let snippet: Code | undefined;

        switch (ast.kind) {
            case TokenType.localVariableDeclaration:
                snippet = this.compileLocalVariableDeclaration(<ASTLocalVariableDeclaration>ast); break;
            case TokenType.localVariableDeclarations:
                snippet = this.compileLocalVariableDeclarations(<ASTLocalVariableDeclarations>ast); break;
            case TokenType.print:
                snippet = this.compilePrintStatement(<ASTPrintStatementNode>ast); break;
            case TokenType.keywordBreak:
                snippet = this.compileBreakStatement(<ASTBreakNode>ast); break;
            case TokenType.keywordContinue:
                snippet = this.compileContinueStatement(<ASTContinueNode>ast); break;
            case TokenType.keywordIf:
                snippet = this.compileIfStatement(<ASTIfNode>ast); break;
            case TokenType.keywordSwitch:
                snippet = this.compileSwitchCaseStatement(<ASTSwitchCaseNode>ast); break;
            case TokenType.block:
                snippet = this.compileBlockNode(<ASTBlockNode>ast, undefined, undefined); break;
            case TokenType.synchronizedBlock:
                let block = <ASTSynchronizedBlockNode>ast;
                snippet = this.compileBlockNode(block.block, block.lockObject, block.range); break;
            case TokenType.keywordWhile:
                snippet = this.compileWhileStatement(<ASTWhileNode>ast); break;
            case TokenType.keywordDo:
                snippet = this.compileDoStatement(<ASTDoWhileNode>ast); break;
            case TokenType.keywordFor:
                snippet = this.compileForStatement(<ASTForLoopNode>ast); break;
            case TokenType.enhancedForLoop:
                snippet = this.compileEnhancedForLoop(<ASTEnhancedForLoopNode>ast); break;
            case TokenType.keywordReturn:
                snippet = this.compileReturnStatement(<ASTReturnNode>ast);
                this.flow.markDead();   // not before: compiling the return value may read variables
                break;
            case TokenType.keywordTry:
                snippet = this.compileTryCatchStatement(<ASTTryCatchNode>ast); break;
            case TokenType.keywordThrow:
                snippet = this.compileThrowStatement(<ASTThrowNode>ast);
                this.flow.markDead();   // not before: compiling the exception term may read variables
                break;
            case TokenType.initialFieldAssignementInMainProgram:
                snippet = this.compileInitialFieldAssignmentInMainProgram(<ASTInitialFieldAssignmentInMainProgramNodes>ast); break;
            case TokenType.firstMainProgramStatement:
                snippet = this.compileFirstMainProgramStatement(<ASTFirstMainMethodStatementNode>ast); break;


            default:
                let termSnippet = this.compileTerm(ast);
                if (termSnippet) snippet = termToCode(termSnippet);

                // explicit super(...)-call in constructor: field initializers and instance initializer blocks follow
                if (this.snippetsToInsertAfterSuperConstructorCall && ast.kind == TokenType.methodCall &&
                    (<ASTMethodCallNode>ast).identifier == "" && (<ASTMethodCallNode>ast).nodeToGetObject?.kind == TokenType.keywordSuper) {
                    if (snippet) {
                        snippet = [...snippet, ...this.snippetsToInsertAfterSuperConstructorCall];
                    }
                    this.snippetsToInsertAfterSuperConstructorCall = undefined;
                }
        }

        // each statement begins with a new step
        if (snippet) snippet = [STEP, ...snippet];

        return snippet;

    }

    /**
     * Compiles the statements of a block or of a statement group in a switch statement and warns about the first
     * one which can't be reached, e.g. because it follows a return statement.
     * see https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.22
     */
    compileStatementSequence(statements: ASTStatementNode[]): Code {
        // if the sequence itself is unreachable then the statement containing it has already been reported
        let reportUnreachableStatement = this.flow.state.alive;

        return statements.map(statementNode => {
            if (reportUnreachableStatement && !this.flow.state.alive && statementNode && !statementNode.isEmpty) {
                this.pushError(JCM.unreachableStatement(), "warning", statementNode);
                reportUnreachableStatement = false;
            }
            return this.compileStatementOrTerm(statementNode) ?? [];
        }).flat();
    }

    compileFirstMainProgramStatement(arg0: ASTFirstMainMethodStatementNode): Code {
        let klass = this.currentSymbolTable.classContext;
        return [`${StepParams.stack}.push(${Helpers.classes}.${klass.identifier});\n`];
    }

    compileInitialFieldAssignmentInMainProgram(node: ASTInitialFieldAssignmentInMainProgramNodes): Code | undefined {

        let code: Code = [];
        for (let assignment of node.assignments) {
            let field = <JavaField>this.currentSymbolTable.findSymbol(assignment.fieldNode.identifier).symbol;
            let leftSideSnippet = this.compileSymbolNode(assignment.fieldNode, true);
            let rightSideSnippet = this.compileInitialValue(assignment.initialTerm, leftSideSnippet.type);

            if (rightSideSnippet?.type && !field.type) field.type = rightSideSnippet.type;

            if (leftSideSnippet && rightSideSnippet) {
                let assignmentSnippet = this.assign(leftSideSnippet, rightSideSnippet, this.voidType, node.range, (l, r) => `${l} = ${r}`);
                code.push(...statement(assignmentSnippet, value => value + ";"));
            }

        }

        if (code.length == 0) return undefined;

        return code;

    }

    compileBreakStatement(node: ASTBreakNode): Code | undefined {
        let label = this.breakStack[this.breakStack.length - 1];
        if (!label) {
            this.pushError(JCM.breakNotExpected(), "error", node);
            return undefined;
        }
        this.flow.jumpTo(label);
        return [jump(label, node.range)];
    }

    compileContinueStatement(node: ASTContinueNode): Code | undefined {
        let label = this.continueStack[this.continueStack.length - 1];
        if (!label) {
            this.pushError(JCM.continueNotExpected(), "error", node);
            return undefined;
        }
        this.flow.jumpTo(label);
        return [jump(label, node.range)];
    }


    compileReturnStatement(node: ASTReturnNode): Code | undefined {

        let code: Code = [];

        let method: JavaMethod | undefined = this.currentSymbolTable.methodContext;
        if (!method) {
            this.pushError(JCM.returnNotExpected(), "error", node.range);
            return undefined;
        }

        if (this.synchronizedBlockCount > 0) {
            code.push(`${Helpers.leaveAllSynchronizedBlocksInCurrentMethod}();\n`, ...at(node.range));
        }

        if (this.currentSymbolTable.methodContext?.isSynchronized) {
            code.push(`${Helpers.elementRelativeToStackbase(0)}.${ObjectClass.prototype.leaveSynchronizedBlock.name}(${StepParams.thread});\n`, ...at(node.range));
        }


        if (node.term) {

            if (!method.returnParameterType || method.returnParameterType == this.voidType) {
                this.pushError(JCM.returnValueNotExpected(), "error", node.range);
                return undefined;
            }

            let termSnippet = this.compileTermWithTargetType(node.term, method.returnParameterType);
            if (!termSnippet) return undefined;

            if (method.returnParameterType instanceof GenericTypeParameter && method.returnParameterType.catches) {
                if (termSnippet.type.isPrimitive) termSnippet = this.box(termSnippet);
                method.returnParameterType.catches.push(<NonPrimitiveType>termSnippet.type);
            } else {
                if (!this.canCastTo(termSnippet.type, method.returnParameterType, "implicit")) {
                    this.pushError(JCM.wrongReturnValueType(method.returnParameterType.identifier, termSnippet.type?.identifier || "(---)"), "error", node.keywordReturnRange);
                    return undefined;
                }

                termSnippet = this.compileCast(termSnippet, method.returnParameterType, "implicit");

            }


            code.push(...statement(termSnippet, value => `${Helpers.return}(${value});\n`, node.range));

        } else {

            if (method.isConstructor) {
                code.push(`${Helpers.return}(${Helpers.elementRelativeToStackbase(0)});\n`, ...at(node.range));
            } else {
                if (method.returnParameterType && method.returnParameterType != this.voidType) {
                    this.pushError(JCM.returnValueExpected(method.returnParameterType.identifier), "error", node.range);
                    return undefined;
                }
                code.push(`${Helpers.return}();\n`, ...at(node.range));
            }
        }

        code.push(STEP);

        return code;
    }

    compileEnhancedForLoop(node: ASTEnhancedForLoopNode): Code | undefined {

        let elementType = node.elementType.resolvedType;
        let collectionSnippet = this.compileTerm(node.collection);

        if (!(elementType || node.elementType.kind == TokenType.varType) || !collectionSnippet || !collectionSnippet.type) return undefined;

        /*
        * Local variables declared in head of for statement are valid inside whole for statement,
        * so we need a symbol table that encompasses the whole for statement:
        */
        let forLoopSymbolTable = this.pushAndGetNewSymbolTable(node.range, false);

        // the loop body may be executed zero times, so the state before it is valid after the loop, too
        let stateBeforeBody = this.flow.snapshot();

        let continueLabel = new Label();
        this.continueStack.push(continueLabel);

        let breakLabel = new Label();
        this.breakStack.push(breakLabel);

        let stackIndexForCollection = forLoopSymbolTable.getStackFrame()!.insertInvisibleLocalVariableAndGetItsIndex();


        let code: Code = [];
        let collectionRange = node.collection.range;

        /*
        * There are 3 cases:
        * a) loop over array (using an index)
        * b) loop over a SystemCollection
        * c) loop over an Iterable
        */

        let collectionType = collectionSnippet.type;
        let collectionElementType: JavaType;

        if (collectionType instanceof JavaArrayType) {
            /*
            * Loop over array
            */
            code.push(...statement(collectionSnippet, value => `${Helpers.elementRelativeToStackbase(stackIndexForCollection)} = ${Helpers.checkNPE(value, collectionRange)};\n`, collectionRange));

            collectionElementType = collectionType.getElementType();
            let loopVariableNeedsConversion = false;
            if (node.elementType.kind != TokenType.varType) {
                if (!this.typesAreIdentical(elementType!, collectionElementType)) {
                    if (this.isForEachLoopVariableTypeCompatible(elementType!, collectionElementType)) {
                        loopVariableNeedsConversion = true;
                    } else if (!this.canCastTo(collectionElementType, elementType, "implicit")) {
                        // (if canCastTo is true nevertheless, e.g. for(int i : Object[]), the loop variable gets the
                        // array's element type as before)
                        this.pushError(JCM.wrongArrayElementType(elementType!.toString(), node.elementIdentifier, collectionElementType.toString()), "error", node.elementIdentifierPosition);
                    }
                }
            }
            if (!loopVariableNeedsConversion) elementType = collectionElementType;
            let elementVariable = new JavaLocalVariable(node.elementIdentifier, node.elementIdentifierPosition,
                elementType, forLoopSymbolTable);
            forLoopSymbolTable.addSymbol(elementVariable);


            let stackIndexForLoopIndex = forLoopSymbolTable.getStackFrame()!.insertInvisibleLocalVariableAndGetItsIndex();
            let loopIndex = Helpers.elementRelativeToStackbase(stackIndexForLoopIndex);
            let collection = Helpers.elementRelativeToStackbase(stackIndexForCollection);
            code.push(`${loopIndex} = -1;\n`, ...at(collectionRange), STEP,
                continueLabel,
                `${loopIndex}++;\nif(${loopIndex} >= ${collection}.length){\n   `, ...at(collectionRange), jump(breakLabel), `}\n`,
                `${Helpers.elementRelativeToStackbase(elementVariable.stackframePosition!)} = ${collection}[${loopIndex}];\n`);
            if (loopVariableNeedsConversion) {
                code.push(...this.compileForEachLoopVariableConversion(elementVariable, collectionElementType, node.elementIdentifierPosition) ?? []);
            }

            code.push(...this.compileStatementOrTerm(node.statementToRepeat) ?? [], jump(continueLabel), STEP, breakLabel);

        } else if (collectionType instanceof IJavaClass && collectionType.runtimeClass!.prototype.getElements
            && collectionType.runtimeClass![FOR_EACH_VIA_GET_ELEMENTS] !== false) {

            if (elementType == this.stringType) elementType = this.stringNonPrimitiveType;

            /*
             * Loop over SystemCollection
            */
            code.push(...statement(collectionSnippet, value => `${Helpers.elementRelativeToStackbase(stackIndexForCollection)} = ${Helpers.checkNPE(value, collectionRange)}.getElements();\n`, collectionRange));

            collectionElementType = this.objectType;
            if (collectionType instanceof GenericVariantOfJavaClass) {
                let firstGenericParametersType = collectionType.getFirstTypeParametersType();
                if (!firstGenericParametersType) {
                    this.pushError(JCM.cantComputeArrayElementType(collectionType.toString()), "error", node.collection.range);
                } else {
                    collectionElementType = firstGenericParametersType;
                }
            } else if (collectionType.identifier == "Group") {
                collectionElementType = this.libraryTypestore.getType("Shape")!;
            }
            collectionElementType = this.replaceWildcardByUpperBound(collectionElementType);
            let loopVariableNeedsConversion = false;
            if (node.elementType.kind != TokenType.varType) {
                if (!this.typesAreIdentical(elementType!, collectionElementType)) {
                    if (this.isForEachLoopVariableTypeCompatible(elementType!, collectionElementType)) {
                        loopVariableNeedsConversion = true;
                    } else {
                        this.pushError(JCM.wrongCollectionElementType(elementType!.toString(), node.elementIdentifier, collectionElementType.toString()), "error", node.elementIdentifierPosition);
                    }
                }
            }
            if (!loopVariableNeedsConversion) elementType = collectionElementType;
            let elementVariable = new JavaLocalVariable(node.elementIdentifier, node.elementIdentifierPosition,
                elementType, forLoopSymbolTable);
            forLoopSymbolTable.addSymbol(elementVariable);


            let stackIndexForLoopIndex = forLoopSymbolTable.getStackFrame()!.insertInvisibleLocalVariableAndGetItsIndex();
            let loopIndex = Helpers.elementRelativeToStackbase(stackIndexForLoopIndex);
            let collection = Helpers.elementRelativeToStackbase(stackIndexForCollection);
            code.push(`${loopIndex} = -1;\n`, ...at(collectionRange), STEP,
                continueLabel,
                `${loopIndex}++;\nif(${loopIndex} >= ${collection}.length){\n   `, ...at(collectionRange), jump(breakLabel), `}\n`,
                `${Helpers.elementRelativeToStackbase(elementVariable.stackframePosition!)} = ${collection}[${loopIndex}];\n`);
            if (loopVariableNeedsConversion) {
                code.push(...this.compileForEachLoopVariableConversion(elementVariable, collectionElementType, node.elementIdentifierPosition) ?? []);
            }

            code.push(...this.compileStatementOrTerm(node.statementToRepeat) ?? [], jump(continueLabel), STEP, breakLabel);


        } else if (this.canCastTo(collectionType, this.iterableType, "implicit")) {
            /*
             * Loop over Iterable
            */
            let iterator = Helpers.elementRelativeToStackbase(stackIndexForCollection);
            code.push(...statement(collectionSnippet, value => `${Helpers.checkNPE(value, collectionRange)}._mj$iterator$Iterator$(${StepParams.thread}, undefined);\n`), STEP,
                `${iterator} = ${Helpers.threadStack}.pop();\n`, ...at(collectionRange));

            collectionElementType = this.objectType;
            let nptCollectionType = collectionType as (IJavaClass | IJavaInterface);

            let iterableInterface = nptCollectionType.findImplementedInterface("Iterable");
            if (!iterableInterface) {
                this.pushError(JCM.cantComputeCollectionElementType(collectionType.toString()), "error", node.collection.range);
            } else {
                if (iterableInterface instanceof GenericVariantOfJavaInterface) {
                    collectionElementType = iterableInterface.typeMap.get(iterableInterface.isGenericVariantOf.genericTypeParameters![0])!;
                }
            }
            collectionElementType = this.replaceWildcardByUpperBound(collectionElementType);

            let loopVariableNeedsConversion = false;
            if (node.elementType.kind != TokenType.varType) {
                if (elementType == this.stringType && collectionElementType == this.stringNonPrimitiveType) {
                    elementType = collectionElementType;
                } else if (!this.typesAreIdentical(elementType!, collectionElementType)) {
                    if (this.isForEachLoopVariableTypeCompatible(elementType!, collectionElementType)) {
                        loopVariableNeedsConversion = true;
                    } else {
                        this.pushError(JCM.elementTypeDoesntFitToIterable(elementType!.toString(), node.elementIdentifier, collectionElementType.toString()), "error", node.elementIdentifierPosition);
                    }
                }
            }
            if (!loopVariableNeedsConversion) elementType = collectionElementType;
            let elementVariable = new JavaLocalVariable(node.elementIdentifier, node.elementIdentifierPosition,
                elementType, forLoopSymbolTable);
            forLoopSymbolTable.addSymbol(elementVariable);

            code.push(STEP,
                continueLabel,
                `${iterator}._mj$hasNext$boolean$(${StepParams.thread}, undefined);\n`, ...at(collectionRange), STEP,
                `if(!${Helpers.threadStack}.pop()){\n   `, ...at(collectionRange), jump(breakLabel), `}\n`,
                `${iterator}._mj$next$E$(${StepParams.thread}, undefined);\n`, ...at(collectionRange), STEP,
                `${Helpers.elementRelativeToStackbase(elementVariable.stackframePosition!)} = ${Helpers.threadStack}.pop();\n`, ...at(collectionRange));
            if (loopVariableNeedsConversion) {
                code.push(...this.compileForEachLoopVariableConversion(elementVariable, collectionElementType, node.elementIdentifierPosition) ?? []);
            }

            code.push(...this.compileStatementOrTerm(node.statementToRepeat) ?? [], jump(continueLabel), STEP, breakLabel);

        } else {
            this.pushError(JCM.enhancedForLoopOnlyForArraysCollectionsIterables(), "error", node.collection.range);
        }

        this.continueStack.pop();
        this.breakStack.pop();

        this.flow.restore(stateBeforeBody);
        this.flow.joinJumpsTo(breakLabel);

        this.popSymbolTable();
        return code;

    }

    /**
     * Elements of a collection with wildcard element type have the wildcard's upper bound as type,
     * e.g. List<? extends Number> -> Number, List<? extends T> -> T; List<?> and List<? super X> -> Object
     */
    replaceWildcardByUpperBound(type: JavaType): JavaType {
        if (type instanceof GenericTypeParameter && type.isWildcard) {
            return type.upperBounds.find(ub => ub.identifier != "Object") ?? this.objectType;
        }
        return type;
    }

    typesAreIdentical(type1: JavaType, type2: JavaType) {
        if (!type1 || !type2) return false;
        return type1.toString() == type2.toString();
    }

    /**
     * Enhanced for loop whose declared loop variable type differs from the element type of the array/collection:
     * as in Java, each element is assigned to the loop variable with an assignment conversion, e.g.
     * for(int i : List<Integer>) (unboxing), for(long l : List<Integer>) (unboxing and widening),
     * for(double d : int[]) (widening), for(Integer i : int[]) (boxing), for(Object o : List<String>).
     */
    isForEachLoopVariableTypeCompatible(loopVariableType: JavaType, elementType: JavaType): boolean {
        if (!loopVariableType || !elementType) return false;
        if (loopVariableType.isPrimitive && !elementType.isPrimitive) {
            // only unboxing (canCastTo would also allow Object -> primitive type, which java doesn't)
            let unboxedType = this.getUnboxedType(elementType);
            if (!unboxedType || unboxedType == this.stringType) return false;
        }
        return this.canCastTo(elementType, loopVariableType, "implicit");
    }

    compileForEachLoopVariableConversion(loopVariable: JavaLocalVariable, elementType: JavaType, range: IRange): Code | undefined {
        if (!loopVariable.type.isPrimitive && !elementType.isPrimitive) return undefined;  // widening reference conversion
        let loopVariableAccess = Helpers.elementRelativeToStackbase(loopVariable.stackframePosition!);
        let converted = this.compileCast(term(loopVariableAccess, elementType, range), loopVariable.type, "implicit");
        return statement(converted, value => `${loopVariableAccess} = ${value};\n`);
    }

    compileForStatement(node: ASTForLoopNode): Code | undefined {

        /*
        * Local variables declared in head of for statement are valid inside whole for statement,
        * so we need a symbol table that encompasses the whole for statement:
        */
        this.pushAndGetNewSymbolTable(node.range, false);

        let firstStatement = this.compileStatementOrTerm(node.firstStatement);


        let conditionNode = node.condition;
        // if (!conditionNode) return undefined;


        let negationResult = this.negateConditionIfPossible(conditionNode);

        conditionNode = negationResult?.newNode;

        let condition = this.compileTerm(conditionNode);
        condition = this.convertToBooleanPrimitiveAndPrintErrorIfNotPossible(condition, node.condition);
        // if (!condition) condition = term('true', this.booleanType, node.range);

        let labelBeforeCheckingCondition = new Label();

        let labelBeforeLastStatement = new Label();
        this.continueStack.push(labelBeforeLastStatement);

        let labelAfterForBlock = new Label();
        this.breakStack.push(labelAfterForBlock);

        // the loop body may be executed zero times, so the state after the condition is valid after the loop, too
        let stateAfterCondition = this.flow.snapshot();

        let statementsToRepeat = this.compileStatementOrTerm(node.statementToRepeat);

        // the last statement (e.g. i++) is executed after the body and after continue statements
        this.flow.joinJumpsTo(labelBeforeLastStatement);
        let lastStatement = this.compileStatementOrTerm(node.lastStatement);

        this.continueStack.pop();
        this.breakStack.pop();

        // for(...; ; ...) and for(...; true; ...) can only be left by a break statement
        let conditionIsConstantTrue = !node.condition || this.isConstantWithValue(condition, !negationResult?.negationHappened);
        this.flow.restore(conditionIsConstantTrue ? FlowState.dead() : stateAfterCondition);
        this.flow.joinJumpsTo(labelAfterForBlock);

        if (!statementsToRepeat) {
            this.popSymbolTable();
            return undefined;
        }
        let code: Code = [];

        if (firstStatement) {
            code.push(...firstStatement, STEP);
        }
        code.push(labelBeforeCheckingCondition);
        if (condition) {
            code.push(...statement(condition, value => negationResult?.negationHappened ? `if(${value}){\n` : `if(!(${value})){\n`, node.condition!.range),
                jump(labelAfterForBlock), "}\n", STEP);
        }

        code.push(...statementsToRepeat, STEP, labelBeforeLastStatement);

        let rangeOfJumpBack: IRange | undefined;
        if (lastStatement) {
            code.push(...lastStatement);
        } else {
            rangeOfJumpBack = {
                startLineNumber: node.range.endLineNumber,
                startColumn: node.range.endColumn,
                endLineNumber: node.range.endLineNumber,
                endColumn: node.range.endColumn
            }
        }

        code.push(jump(labelBeforeCheckingCondition, rangeOfJumpBack), STEP, labelAfterForBlock);

        this.popSymbolTable();
        return code;
    }


    compileDoStatement(node: ASTDoWhileNode): Code | undefined {
        let labelBeforeEvaluatingCondition = new Label();
        this.continueStack.push(labelBeforeEvaluatingCondition);

        let labelAfterDoWhileBlock = new Label();
        this.breakStack.push(labelAfterDoWhileBlock);

        let statementToRepeat = this.compileStatementOrTerm(node.statementToRepeat);

        this.breakStack.pop();
        this.continueStack.pop();

        // The condition is evaluated after the body and after continue statements, so it has to be compiled
        // after the body: do { x = ... } while (x < 0) reads x after the assignment.
        this.flow.joinJumpsTo(labelBeforeEvaluatingCondition);
        let condition = this.compileTerm(node.condition);

        condition = this.convertToBooleanPrimitiveAndPrintErrorIfNotPossible(condition, node.condition);

        // do ... while(true) can only be left by a break statement
        if (this.isConstantWithValue(condition, true)) this.flow.markDead();
        this.flow.joinJumpsTo(labelAfterDoWhileBlock);

        if (!condition || !statementToRepeat) return undefined;

        let labelAtBeginOfDoWhileBlock = new Label();

        return [
            labelAtBeginOfDoWhileBlock,
            ...statementToRepeat, STEP,
            labelBeforeEvaluatingCondition,
            ...statement(condition, value => `if(${value}){\n`), jump(labelAtBeginOfDoWhileBlock), "}", STEP,
            labelAfterDoWhileBlock
        ];
    }

    compileBlockNode(node: ASTBlockNode, lockObject: ASTTermNode | undefined, synchronizedTokenRange: IRange | undefined): Code | undefined {
        this.pushAndGetNewSymbolTable(node.range, false);

        let code: Code = [];

        if (lockObject) {
            this.synchronizedBlockCount++;
            let getLockObjectSnippet = this.compileTerm(lockObject);
            if (getLockObjectSnippet) {
                code.push(...statement(getLockObjectSnippet, value => `return this.index + ${value}.${ObjectClass.prototype.beforeEnteringSynchronizedBlock.name}(${StepParams.thread});\n`), STEP);
            }
        }

        code.push(...this.compileStatementSequence(node.statements));

        if (lockObject) {
            let getLockObjectSnippet = this.compileTerm(lockObject);
            if (getLockObjectSnippet) {
                code.push(...statement(getLockObjectSnippet, value => `${value}.${ObjectClass.prototype.leaveSynchronizedBlock.name}(${StepParams.thread});\n`), STEP);
            }
            this.synchronizedBlockCount--;
        }

        this.popSymbolTable();
        return code;
    }

    convertToBooleanPrimitiveAndPrintErrorIfNotPossible(snippet: Expr, node: ASTNode): Expr {
        let type = snippet?.type
        if (!type) return snippet;

        if (type.identifier != "boolean") {
            if (type.identifier == "Boolean") {
                return this.unbox(snippet);
            } else if (node.kind == TokenType.binaryOp && (<ASTBinaryNode>node).operator == TokenType.assignment) {
                let error = this.pushError(JCM.assignmentInsteadOfComparisonOperator(), "error", (<ASTBinaryNode>node).operatorRange);
                this.module.quickfixes.push(new ReplaceTokenQuickfix((<ASTBinaryNode>node).operatorRange, "==", JCM.ReplaceTokenQuickfixDefaultMessage("=", "=="), error))
            } else {
                this.pushError(JCM.booleanTermExpected(type.identifier), "error", node);
            }
        }

        return snippet;
    }

    compileWhileStatement(node: ASTWhileNode): Code | undefined {
        let conditionNode = node.condition;
        if (!conditionNode) return undefined;

        let negationResult = this.negateConditionIfPossible(conditionNode);

        conditionNode = negationResult.newNode;

        let condition = this.compileTerm(conditionNode);

        condition = this.convertToBooleanPrimitiveAndPrintErrorIfNotPossible(condition, node.condition);

        let labelAtBeginOfWhileBlock = new Label();
        this.continueStack.push(labelAtBeginOfWhileBlock);

        let labelAfterWhileBlock = new Label();
        this.breakStack.push(labelAfterWhileBlock);

        // the loop body may be executed zero times, so the state after the condition is valid after the loop, too
        let stateAfterCondition = this.flow.snapshot();

        let statementToRepeat = this.compileStatementOrTerm(node.statementToRepeat);

        this.breakStack.pop();
        this.continueStack.pop();

        // while(true) can only be left by a break statement
        let conditionIsConstantTrue = this.isConstantWithValue(condition, !negationResult.negationHappened);
        this.flow.restore(conditionIsConstantTrue ? FlowState.dead() : stateAfterCondition);
        this.flow.joinJumpsTo(labelAfterWhileBlock);

        if (!condition || !statementToRepeat) return undefined;

        return [
            labelAtBeginOfWhileBlock,
            ...statement(condition, value => negationResult.negationHappened ? `if(${value}){\n` : `if(!(${value})){\n`), jump(labelAfterWhileBlock), "}", STEP,
            ...statementToRepeat,
            jump(labelAtBeginOfWhileBlock, Range.fromPositions(Range.getEndPosition(node.statementToRepeat.range))), STEP,
            labelAfterWhileBlock
        ];
    }


    isConstantWithValue(snippet: Expr | undefined, value: boolean): boolean {
        return !!snippet && isConstant(snippet) && snippet.constant === value;
    }

    negateConditionIfPossible(node: ASTTermNode): { newNode: ASTTermNode, negationHappened: boolean } {
        if (!node) return undefined;
        if (node.kind == TokenType.binaryOp) {
            let node1 = <ASTBinaryNode>node;
            switch (node1.operator) {
                case TokenType.lower: node1.operator = TokenType.greaterOrEqual; break;
                case TokenType.lowerOrEqual: node1.operator = TokenType.greater; break;
                case TokenType.greater: node1.operator = TokenType.lowerOrEqual; break;
                case TokenType.greaterOrEqual: node1.operator = TokenType.lower; break;
                case TokenType.notEqual: node1.operator = TokenType.equal; break;
                case TokenType.equal: node1.operator = TokenType.notEqual; break;
                default:
                    return { newNode: node1, negationHappened: false };
            }
            return { newNode: node1, negationHappened: true };
        }

        if (node.kind == TokenType.unaryPrefixOp) {
            let node1 = <ASTUnaryPrefixNode>node;
            if (node1.operator == TokenType.not) {
                return { newNode: node1.term, negationHappened: true }
            }
        }

        return { newNode: node, negationHappened: false }
    }

    // General helper function
    // -> where to go?
    isDefined<A>(x: A | undefined | null): x is A {
        return x != undefined;
    }

    compileCaseStatement(node: ASTCaseNode, label: Label,
        typeId: string | undefined, enumType: JavaEnum | undefined): [Code, Code] | undefined {

        let caseCode: Code = [];

        if (node.isDefaultNode) {
            caseCode.push("default: \n", ...at(node.range));
        } else if (!this.compileCaseLabels(node, caseCode, typeId, enumType)) {
            return undefined;
        }

        caseCode.push(jump(label));

        let statementCode = this.compileStatementSequence(node.statements);

        return [caseCode, [label, ...statementCode, STEP]];
    }

    /**
     * Compiles the constants of a case node and adds a javascript case label for each of them to caseSnippet.
     * @returns false if no constant could be compiled
     */
    compileCaseLabels(node: ASTCaseNode, caseCode: Code,
        typeId: string | undefined, enumType: JavaEnum | undefined): boolean {

        let constants: Expr[] = [];

        for (let constantNode of node.constants) {
            let constant: Expr | undefined;

            if (enumType) {
                let enumIdentifier = "";
                let enumIdentifierRange: IRange = EmptyRange.instance;
                switch (constantNode.kind) {
                    case TokenType.dereferenceAttribute:
                        enumIdentifier = (<ASTAttributeDereferencingNode>constantNode).attributeIdentifier;
                        enumIdentifierRange = (<ASTAttributeDereferencingNode>constantNode).range;
                        break;
                    case TokenType.symbol:
                        enumIdentifier = (<ASTSymbolNode>constantNode).identifier;
                        enumIdentifierRange = constantNode.range;
                        break;
                }
                let enumIndex = enumType.fields.findIndex(field => field.identifier == enumIdentifier);
                if (enumIndex < 0) {
                    this.pushError(JCM.enumIdentifierUnknown(enumType.identifier, enumIdentifier), "error", constantNode.range);
                    return false;
                }
                this.registerUsagePosition(enumType.fields[enumIndex], enumIdentifierRange);
                constant = term(enumIndex + "", this.intType, enumIdentifierRange, enumIndex);
            } else {
                constant = this.compileTerm(constantNode);
            }

            if (constant) {
                if (!(isConstant(constant) || constant.isFinalField)) {
                    this.pushError(JCM.constantValueExpectedAfterCase(), "error", constantNode.range);
                } else if (!constant.type || constant.type.identifier.toLowerCase() != typeId?.toLowerCase()) {
                    this.pushError(JCM.caseValueDoesntFitToSwitchValue(typeId || "---", constant.type!.identifier), "error", constantNode.range);
                }
                constants.push(constant);
            } else {
                this.pushError(JCM.valueNotComputable(), "error", constantNode);
            }
        }

        if (constants.length == 0) {
            return false;
        }

        for (let constant of constants) {
            let constantValue = constant.constant;

            if (typeof constantValue != 'undefined') {
                switch (typeId) {
                    case 'String':
                    case 'string':
                    case 'char':
                        caseCode.push(`case ${JSON.stringify(constantValue)}: \n`, ...at(node.range)); break;
                    default:
                        caseCode.push(`case ${constantValue}: \n`, ...at(node.range));
                }
            } else {
                caseCode.push(`case ${constant.value}: \n`, ...at(node.range));
            }
        }

        return true;
    }

    /*
        Preliminary implementation
        For TODOs -> switch-case.md
    */


    compileSwitchCaseStatement(node: ASTSwitchCaseNode): Code | undefined {
        let term = this.compileTerm(node.term);


        if (!this.isDefined(term)) return undefined;
        if (!term.type) return undefined;

        let type = term.type;

        let enumType = type instanceof JavaEnum ? type as JavaEnum : undefined;

        if (enumType) {
            term = frame(term, "§1.ordinal");
        }

        // switch on wrapper types: unboxing (throws NullPointerException if value is null, like in java)
        if (type.identifier && ["Byte", "Short", "Integer", "Character"].includes(type.identifier)) {
            term = this.unbox(term);
            type = term.type!;
        }

        if (!(enumType || type.identifier && ["byte", "short", "int", "char", "String", "string"].includes(type.identifier))) {
            this.pushError(JCM.switchOnlyFeasibleForTypes(), "error", node.term.range);
        }

        if (type == this.stringNonPrimitiveType) {
            term = this.unbox(term);
            type = this.stringType;
        }

        if (!type) return undefined;

        this.pushAndGetNewSymbolTable(node.range, false);

        let breakLabel = new Label();
        this.breakStack.push(breakLabel);

        // Statement groups (case ...: statements; default: statements) are compiled and emitted
        // in source code order, because control falls through from each group to the next one.
        // Each of them gets its own label; the javascript switch statement only jumps to these labels.
        let caseLabelSnippets: Code[] = [];
        let statementGroupSnippets: Code[] = [];

        let stateBeforeSwitchBlock = this.flow.snapshot();

        for (let caseNode of node.caseNodes) {
            // a statement group is reached by jumping to its label or by falling through from the previous group
            this.flow.joinWith(stateBeforeSwitchBlock);
            let caseSnippets = this.compileCaseStatement(caseNode, new Label(), enumType ? "int" : type.identifier, enumType);
            if (caseSnippets) {
                caseLabelSnippets.push(caseSnippets[0]);
                statementGroupSnippets.push(caseSnippets[1]);
            }
        }

        // without default label no statement group is executed if no case label matches
        let hasDefaultNode = node.caseNodes.some(caseNode => caseNode.isDefaultNode);
        if (!hasDefaultNode) this.flow.joinWith(stateBeforeSwitchBlock);
        this.flow.joinJumpsTo(breakLabel);

        this.breakStack.pop();
        this.popSymbolTable();

        return [
            ...statement(term, value => `switch(${value}){\n`),
            ...caseLabelSnippets.flat(),
            "\n }\n", jump(breakLabel), STEP,
            ...statementGroupSnippets.flat(),
            breakLabel
        ];
    }


    compileIfStatement(node: ASTIfNode): Code | undefined {

        let conditionNode = node.condition;
        if (!conditionNode) return undefined;


        let negationResult = this.negateConditionIfPossible(conditionNode);

        conditionNode = negationResult.newNode;

        let condition = this.compileTerm(conditionNode);

        condition = this.convertToBooleanPrimitiveAndPrintErrorIfNotPossible(condition, node.condition);

        let instanceOfVariables = negationResult.negationHappened ? conditionNode.negatedInstanceofVariables : conditionNode.instanceofVariables;
        let negatedInstanceofVariables = negationResult.negationHappened ? conditionNode.instanceofVariables : conditionNode.negatedInstanceofVariables;

        let stateAfterCondition = this.flow.snapshot();

        if (instanceOfVariables) {
            let symbolTable = this.pushAndGetNewSymbolTable(conditionNode.range, false);
            instanceOfVariables.forEach(v => symbolTable.addSymbolWithoutAddingToStackframe(v));
        }
        let statementIfTrue = this.compileStatementOrTerm(node.statementIfTrue);

        if (statementIfTrue && isEmptyCode(statementIfTrue)) {
            this.pushError(JCM.emptyStatementAfterIf(), "warning", node.statementIfTrue.range);
        }

        if (instanceOfVariables) {
            this.popSymbolTable();
        }
        // if(!(o instanceof String s)) return; -> s is in scope after the if statement
        if (negatedInstanceofVariables && !this.flow.state.alive) {
            negatedInstanceofVariables.forEach(v => this.currentSymbolTable.addSymbolWithoutAddingToStackframe(v));
        }
        let stateAfterStatementIfTrue = this.flow.snapshot();

        this.flow.restore(stateAfterCondition);
        if (negatedInstanceofVariables) {
            let symbolTable = this.pushAndGetNewSymbolTable(conditionNode.range, false);
            negatedInstanceofVariables.forEach(v => symbolTable.addSymbolWithoutAddingToStackframe(v));
        }
        let statementIfFalse = this.compileStatementOrTerm(node.statementIfFalse);
        if (negatedInstanceofVariables) {
            this.popSymbolTable();
        }
        if (instanceOfVariables && !this.flow.state.alive) {
            instanceOfVariables.forEach(v => this.currentSymbolTable.addSymbolWithoutAddingToStackframe(v));
        }

        this.flow.joinWith(stateAfterStatementIfTrue);

        if (!condition || !statementIfTrue) return undefined;

        let label1 = new Label();
        let code: Code = [
            ...statement(condition, value => negationResult.negationHappened ? `if(${value}){\n` : `if(!(${value})){\n`), jump(label1), "}\n", STEP
        ];

        if (statementIfFalse) {
            let label2 = new Label();
            code.push(...statementIfTrue, jump(label2), STEP,
                label1, ...statementIfFalse, STEP,
                label2);
        } else {
            // without else case:
            code.push(...statementIfTrue, STEP, label1);
        }

        return code;

    }

    compilePrintStatement(node: ASTPrintStatementNode): Code | undefined {
        let firstParameter = this.compileTerm(node.firstParameter);
        let secondParameter = node.secondParameter ? this.compileTerm(node.secondParameter) : undefined;


        let printMethod = node.isPrintln ? Helpers.println : Helpers.print;

        if (firstParameter?.type && firstParameter.type != this.voidType) {

            if (firstParameter.type.isPrimitive) {
                firstParameter = this.compileCast(firstParameter, this.stringType, "implicit", true);
            } else {
                firstParameter = this.wrapWithToStringCall(firstParameter, "string");
            }

            if (secondParameter) {
                let suffix = secondParameter.type == this.stringNonPrimitiveType ? '.value' : '';
                let printCall = combine(this.voidType, node.range, [firstParameter, secondParameter], (first, second) => `${printMethod}(${first}, ${second}${suffix});\n`);
                return statement(printCall, value => value);
            }
            return statement(firstParameter, value => `${printMethod}(${value}, undefined);\n`, node.range);
        }
        return [`${printMethod}(undefined, undefined);\n`, ...at(node.range)];
    }

    compileLocalVariableDeclarations(node: ASTLocalVariableDeclarations): Code | undefined {
        let code: Code = [];

        for (let lvd of node.declarations) {
            code.push(...this.compileLocalVariableDeclaration(lvd) ?? []);
        }

        if (code.length == 0) return undefined;

        return code;

    }

    compileLocalVariableDeclaration(node: ASTLocalVariableDeclaration): Code | undefined {

        if (this.codeGenerationMode == "repl") {
            this.pushError(JCM.noVariableDeclarationWhileProgramIsRunning(), "error", node.range);
        }

        let variable = new JavaLocalVariable(node.identifier, node.identifierRange,
            node.type.resolvedType!, this.currentSymbolTable);
        variable.isFinal = node.isFinal;

        let initValueSnippet: Expr | undefined = this.compileInitialValue(node.initialization, variable.type);

        let shadowedSymbolInformation = this.currentSymbolTable.findSymbol(variable.identifier);
        let shadowedSymbol = shadowedSymbolInformation?.symbol;

        if (shadowedSymbolInformation) {
            let shadowedVariableErrorLevel: ErrorLevel | "ignore" = this.settingStore.getValue("compiler.shadowedSymbolErrorLevel") as ErrorLevel | "ignore";
            if (this.codeGenerationMode == "replStandalone") shadowedVariableErrorLevel = "error";
            if (["normal", "replStandalone"].includes(this.codeGenerationMode)) {
                let shadowedSymbolLine = shadowedSymbol.identifierRange.startLineNumber;
                if (shadowedSymbol instanceof JavaLocalVariable) {
                    if (shadowedSymbolInformation.symbolTable == this.currentSymbolTable && this.codeGenerationMode == "normal") {
                        this.pushError(JCM.cantRedeclareVariableError(variable.identifier), "error", node.range);
                        variable = shadowedSymbol;
                    } else {
                        if (shadowedVariableErrorLevel != "ignore") this.pushError(JCM.shadowedVariableError(variable.identifier, shadowedSymbolLine), shadowedVariableErrorLevel, node.identifierRange);
                    }
                } else if (shadowedSymbol instanceof JavaField && shadowedSymbol.classEnum.isMainClass) {
                    if (shadowedVariableErrorLevel != "ignore") this.pushError(JCM.shadowedVariableError(variable.identifier, shadowedSymbolLine), shadowedVariableErrorLevel, node.identifierRange);
                }
            }
        }

        if (variable != shadowedSymbolInformation?.symbol) {
            if (shadowedSymbolInformation == null || this.codeGenerationMode != "replStandalone") {
                this.currentSymbolTable.addSymbol(variable);
            }
        }

        this.module.compiledSymbolsUsageTracker.registerUsagePosition(variable, this.module.file, node.identifierRange);

        this.flow.declare(variable, node.initialization ? true : false);

        let accesLocalVariableSnippet = this.compileSymbolOnStackframeAccess(variable, node.identifierRange);

        if (initValueSnippet && accesLocalVariableSnippet) {
            if (node.type.kind == TokenType.varType) {
                let valueType = initValueSnippet.type!;
                variable.type = valueType;
                if (valueType == this.floatType && isConstant(initValueSnippet)) {
                    variable.type = this.doubleType;
                }

            }

            return toStatement(this.assign(accesLocalVariableSnippet, initValueSnippet, variable.type, node.range, (l, r) => `${l} = ${r}`));
        }

        return undefined;
    }

    compileInitialValue(initializationNode: ASTTermNode | undefined, destinationType: JavaType): Expr | undefined {

        let initValueSnippet: Expr | undefined;

        if (initializationNode) {

            switch (initializationNode.kind) {
                case TokenType.lambdaOperator:
                    initValueSnippet = this.compileLambdaFunction(<ASTLambdaFunctionDeclarationNode>initializationNode, destinationType);
                    break;
                case TokenType.arrayLiteral:
                    let type1 = destinationType;
                    if (type1 && type1 instanceof JavaArrayType) {
                        initValueSnippet = this.compileArrayLiteral(type1.getElementType(), <ASTArrayLiteralNode>initializationNode);
                    } else {
                        this.pushError(JCM.cantAssignArrayLiteralToNonArrayVariable(), "error", initializationNode);
                    }
                    break;
                default:
                    initValueSnippet = this.compileTermWithTargetType(initializationNode, destinationType);
            }



            if (!initValueSnippet?.type) return undefined;


            if (destinationType) {

                // allow instantiating generic types without declaring generic parameters like
                // List<String> test = new ArrayList<String>;
                if (initializationNode.kind == TokenType.newObject) {
                    if (destinationType instanceof GenericVariantOfJavaClass || destinationType instanceof GenericVariantOfJavaInterface) {
                        if (this.canCastTo(initValueSnippet.type, destinationType.isGenericVariantOf, "implicit")) {
                            return { ...initValueSnippet, type: destinationType };
                        }
                    }

                }

                if (!this.canCastTo(initValueSnippet.type, destinationType, "implicit")) {
                    // byte b = 10; short s = 300; char c = 65;
                    if (this.isImplicitConstantNarrowingPossible(initValueSnippet, destinationType)) {
                        return this.compileCast(initValueSnippet, destinationType, "explicit");
                    }
                    this.pushError(JCM.localVariableDeclarationWrongInitializerType(initValueSnippet.type.toString(), destinationType.toString()), "error", initializationNode);
                    return undefined;
                }

                initValueSnippet = this.compileCast(initValueSnippet, destinationType, "implicit");
            }


        } else {
            if (!destinationType) return undefined;

            let defaultValueAsString: string = destinationType.isPrimitive ? (<PrimitiveType>destinationType).defaultValueAsString : "null";
            let defaultValue = destinationType.isPrimitive ? (<PrimitiveType>destinationType).defaultValue : null;
            initValueSnippet = term(defaultValueAsString, destinationType, EmptyRange.instance, defaultValue);

        }

        return initValueSnippet;
    }

    compileThrowStatement(node: ASTThrowNode): Code | undefined {
        let exceptionSnippet = this.compileTerm(node.exception);
        if (!exceptionSnippet) return undefined;

        if(exceptionSnippet.type){
            if (!this.canCastTo(exceptionSnippet.type, this.throwableType, "implicit")) {
                this.pushError(JCM.throwExpressionTypeMustBeThrowable(exceptionSnippet.type.toString()), "error", node.exception.range);
                return undefined;
            }
        }

        return statement(exceptionSnippet, value => `throw ${value};\n`, node.range);
    }

    compileTryCatchStatement(node: ASTTryCatchNode): Code | undefined {
        let catchCaseLabels: Label[] = [];
        let catchBlockInfos: CatchBlockInfo[] = [];


        for (let i = 0; i < node.catchCases.length; i++) {
            let catchCase = node.catchCases[i];
            let exceptionTypes: Record<string, boolean> = {};

            for (let type of catchCase.exceptionTypes) {
                if (type.resolvedType instanceof NonPrimitiveType) {
                    Object.assign(exceptionTypes, this.exceptionTree.getAllSubExceptions(type.resolvedType.pathAndIdentifierAsDotSeparatedString));
                    exceptionTypes[type.resolvedType.identifier] = true;
                }
            }

            catchCaseLabels[i] = new Label();
            catchBlockInfos[i] = {
                exceptionTypes: exceptionTypes,
                catchBlockBeginsWithStepIndex: -1
            };
        }

        let finallyBlockLabel = new Label();

        // this in context of Step.run-function points to Step-object
        let beginTryBlock: Code = [`${Helpers.beginTryBlock}({catchBlockInfos: this.catchBlockInfoList, finallyBlockIndex: this.finallyBlockIndex});\n`, ...at(node.range),
        hook(step => {
            // labels already know their step index when hooks are called
            catchBlockInfos.forEach((catchBlockInfo, i) => catchBlockInfo.catchBlockBeginsWithStepIndex = catchCaseLabels[i].stepIndex);
            step.catchBlockInfoList = catchBlockInfos;
            step.finallyBlockIndex = node.finallyStatement ? finallyBlockLabel.stepIndex : -1;
        })];

        // catch blocks and finally block may be entered after an exception anywhere in the try block,
        // so they start with the state before the try statement
        let stateBeforeTryStatement = this.flow.snapshot();
        let tryBlockStatements = this.compileStatementOrTerm(node.tryStatement);
        let stateAfterTryAndCatchBlocks = this.flow.snapshot();
        if (!tryBlockStatements) return undefined;

        let labelAfterLastCatchBlock = new Label();
        let code: Code = [...beginTryBlock, ...this.withoutLeadingSteps(tryBlockStatements),
            `${Helpers.endTryBlock}();\n`, ...at(node.range), jump(labelAfterLastCatchBlock)];


        for (let i = 0; i < node.catchCases.length; i++) {
            let catchCase = node.catchCases[i];
            let exceptionType: JavaType = catchCase.exceptionTypes[0].resolvedType!;
            if (catchCase.exceptionTypes.length > 0) exceptionType = this.throwableType;

            // exception lies on top of stack
            let exceptionVariable = new JavaLocalVariable(catchCase.exceptionIdentifier, catchCase.exceptionIdentifierPosition, exceptionType, this.currentSymbolTable);
            exceptionVariable.isFinal = true;
            this.currentSymbolTable.addSymbol(exceptionVariable);

            code.push(STEP, catchCaseLabels[i],
                `${Helpers.threadStack}[${StepParams.stackBase} + ${exceptionVariable.stackframePosition}] = ${Helpers.getExceptionAndTrimStack}(true);\n`);

            this.flow.restore(stateBeforeTryStatement);
            let statement = this.compileStatementOrTerm(catchCase.statement);
            stateAfterTryAndCatchBlocks = stateAfterTryAndCatchBlocks.join(this.flow.state);

            if (statement) code.push(...this.withoutLeadingSteps(statement));

            code.push(jump(labelAfterLastCatchBlock));

        }

        this.flow.restore(stateAfterTryAndCatchBlocks);

        code.push(STEP, labelAfterLastCatchBlock);
        if (node.finallyStatement) {
            code.push(finallyBlockLabel, `${Helpers.getExceptionAndTrimStack}(false);\n`);
            this.flow.restore(stateBeforeTryStatement);
            let finallyStatement = this.compileStatementOrTerm(node.finallyStatement);
            this.flow.afterFinallyBlock(stateAfterTryAndCatchBlocks);
            if (finallyStatement) code.push(...this.withoutLeadingSteps(finallyStatement));
            code.push(`if(${Helpers.getExceptionAndTrimStack}(false)){${Helpers.return}(); return;};\n`, ...at(node.range));
        }

        return code;

    }

    withoutLeadingSteps(code: Code): Code {
        let i = 0;
        while (i < code.length && code[i] === STEP) i++;
        return code.slice(i);
    }



}