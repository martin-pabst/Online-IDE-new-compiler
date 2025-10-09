import { EmptyRange, IRange, Range } from "../../common/range/Range";
import { TokenType } from "../TokenType";
import { Token } from "../lexer/Token.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule.ts";
import { ASTAnnotationNode, ASTFieldDeclarationNode, ASTAttributeDereferencingNode, ASTBlockNode, ASTBreakNode, ASTCaseNode, ASTCastNode, ASTCatchNode, ASTClassDefinitionNode, ASTLiteralNode, ASTContinueNode, ASTDoWhileNode, ASTEnumDefinitionNode, ASTEnumValueNode, ASTForLoopNode, ASTIfNode, ASTInterfaceDefinitionNode, ASTLambdaFunctionDeclarationNode, ASTLocalVariableDeclaration, ASTMethodCallNode, ASTMethodDeclarationNode, ASTNewObjectNode, ASTNodeWithModifiers, ASTParameterNode, ASTPlusPlusMinusMinusSuffixNode, ASTPrintStatementNode, ASTProgramNode, ASTReturnNode, ASTSelectArrayElementNode, ASTEnhancedForLoopNode, ASTStatementNode, ASTSuperNode, ASTSwitchCaseNode, ASTTermNode, ASTThisNode, ASTTryCatchNode, ASTTypeNode, ASTUnaryPrefixNode, ASTSymbolNode, ASTWhileNode, TypeScope as ASTTypeScope, ASTNewArrayNode, ASTInstanceInitializerNode, ASTStaticInitializerNode, ASTAnonymousClassNode, ASTWildcardTypeNode, ASTVoidTypeNode, ASTArrayTypeNode, ASTGenericTypeInstantiationNode, ASTBaseTypeNode, ASTArrayLiteralNode, TypeScope, ASTVarTypeNode, ASTSynchronizedBlockNode, ASTBracketNode } from "./AST";
import { TermParser } from "./TermParser.ts";

export class ASTNodeFactory {

    public collectedTypenodesGettingRegisteredAtTypeResolver: ASTTypeNode[] = [];

    constructor(private parser: TermParser) {

    }

    buildArrayLiteralNode(): ASTArrayLiteralNode {
        return {
            kind: TokenType.arrayLiteral,
            elements: [],
            range: this.parser.cct.range
        }
    }

    buildBracketNode(range: IRange, nodeInsideBrackets: ASTTermNode): ASTBracketNode {
        return {
            kind: TokenType.leftBracket,
            range: range,
            nodeInsideBrackets: nodeInsideBrackets
        }
    }

    buildWildcardTypeNode(startRange?: IRange): ASTWildcardTypeNode {
        if (!startRange) startRange = this.parser.cct.range;

        let type: ASTWildcardTypeNode =  {
            kind: TokenType.wildcardType,
            range: startRange,
            extends: []
        }
        this.collectedTypenodesGettingRegisteredAtTypeResolver.push(type);

        return type;

    }

    buildVoidTypeNode(startRange?: IRange): ASTVoidTypeNode {
        if (!startRange) startRange = this.parser.cct.range;

        let type: ASTVoidTypeNode = {
            kind: TokenType.voidType,
            range: startRange
        }

        this.collectedTypenodesGettingRegisteredAtTypeResolver.push(type);

        return type;
    }

    buildVarTypeNode(startRange?: IRange): ASTVarTypeNode {
        if (!startRange) startRange = this.parser.cct.range;

        let type: ASTVarTypeNode = {
            kind: TokenType.varType,
            range: startRange
        }

        this.collectedTypenodesGettingRegisteredAtTypeResolver.push(type);

        return type;
    }

    buildArrayTypeNode(arrayOf: ASTTypeNode, startRange?: IRange, additionalDimension: number = 1): ASTArrayTypeNode {
        if (!startRange) startRange = this.parser.cct.range;

        let ret: ASTArrayTypeNode;

        /**
         * Store String[] always as string[] for performance reasons and to reduce memory footprint?
         * It suffices to uncomment this:
         */
        if(arrayOf.kind == TokenType.baseType && (<ASTBaseTypeNode>arrayOf).identifiers[0].identifier == "String"){
            (<ASTBaseTypeNode>arrayOf).identifiers[0].identifier = "string";
        }

        if (arrayOf.kind == TokenType.arrayType) {
            let atype = <ASTArrayTypeNode>arrayOf;
            ret = {
                kind: TokenType.arrayType,
                range: startRange,
                arrayDimensions: atype.arrayDimensions + additionalDimension,
                arrayOf: atype.arrayOf
            }

        } else {
            ret = {
                kind: TokenType.arrayType,
                range: startRange,
                arrayDimensions: additionalDimension,
                arrayOf: arrayOf
            }
        }

        this.collectedTypenodesGettingRegisteredAtTypeResolver.push(ret);

        return ret;

    }

    buildGenericTypeInstantiationNode(baseType: ASTTypeNode, startRange?: IRange): ASTGenericTypeInstantiationNode {
        if (!startRange) startRange = this.parser.cct.range;

        return {
            kind: TokenType.genericTypeInstantiation,
            range: startRange,
            baseType: baseType,
            actualTypeArguments: []
        }
    }

    buildBaseTypeNode(identifier: string, startRange?: IRange): ASTBaseTypeNode {
        if (!startRange) startRange = this.parser.cct.range;

        let parentTypeScope: TypeScope | undefined = this.parser.currentMethod || this.parser.currentClassOrInterface;

        return {
            kind: TokenType.baseType,
            range: startRange,
            identifiers: [{
                identifier: identifier,
                identifierRange: startRange
            }],
            parentTypeScope: parentTypeScope
        }
    }



    // buildTypeNode(parentTypeScope: ASTTypeScope | undefined, startRange?: IRange): ASTTypeNode {

    //     if (!startRange) startRange = this.parser.cct.range;

    //     return {
    //         kind: TokenType.type,
    //         range: startRange,
    //         identifier: "",
    //         arrayDimensions: 0,
    //         genericParameterInvocations: [],
    //         isVoidType: false,
    //         isVarKeyword: false,
    //         parentTypeScope: parentTypeScope
    //     }

    // }

    buildClassNode(modifiers: ASTNodeWithModifiers, identifier: Token | undefined,
        parent: ASTTypeScope, annotations: ASTAnnotationNode[], module: JavaCompiledModule): ASTClassDefinitionNode {

        let identifierValue = identifier ? <string>identifier.value : "";

        let path: string = (parent.path != "" ? parent.path + "." : "") + identifierValue;

        let node: ASTClassDefinitionNode = {
            kind: TokenType.keywordClass,
            range: modifiers.range,
            parent: parent,
            path: path,
            extends: undefined,
            implements: [],
            identifier: identifierValue,
            identifierRange: identifier ? identifier.range : EmptyRange.instance,
            visibility: modifiers.visibility,
            isFinal: modifiers.isFinal,
            isStatic: modifiers.isStatic,
            isAbstract: modifiers.isAbstract,
            isDefault: modifiers.isDefault,
            isSynchronized: modifiers.isSynchronized,
            genericParameterDeclarations: [],
            fieldsOrInstanceInitializers: [],
            methods: [],
            innerTypes: [],
            annotations: [],
            resolvedType: undefined,
            module: module,
            isAnonymousInnerType: false,
            isMainClass: false
        }

        if (annotations.length > 0) {
            node.annotations = annotations.slice();
            annotations.splice(0, annotations.length);
        }

        parent.innerTypes.push(node);
        return node;

    }

    buildEnumNode(modifiers: ASTNodeWithModifiers, identifier: Token,
        parent: ASTTypeScope, annotations: ASTAnnotationNode[], module: JavaCompiledModule): ASTEnumDefinitionNode {

        let path: string = (parent.path != "" ? parent.path + "." : "") + identifier.value;

        let node: ASTEnumDefinitionNode = {
            kind: TokenType.keywordEnum,
            range: modifiers.range,
            parent: parent,
            path: path,
            identifier: <string>identifier.value,
            identifierRange: identifier.range,
            visibility: modifiers.visibility,
            fieldsOrInstanceInitializers: [],
            methods: [],
            annotations: [],
            valueNodes: [],
            isAbstract: false,
            isFinal: false,
            isStatic: false,
            isDefault: modifiers.isDefault,
            isSynchronized: modifiers.isSynchronized,
            resolvedType: undefined,
            innerTypes: [],
            module: module,
            isAnonymousInnerType: false
        }

        if (annotations.length > 0) {
            node.annotations = annotations.slice();
            annotations.splice(0, annotations.length);
        }

        parent.innerTypes.push(node);
        return node;

    }

    buildEnumValueNode(identifier: Token): ASTEnumValueNode {
        let node: ASTEnumValueNode = {
            kind: TokenType.initializeEnumValue,
            range: identifier.range,
            identifier: <string>identifier.value,
            identifierRange: identifier.range,
            parameterValues: []
        }

        return node;
    }

    buildInterfaceNode(modifiers: ASTNodeWithModifiers, identifier: Token,
        parent: ASTTypeScope, annotations: ASTAnnotationNode[], module: JavaCompiledModule): ASTInterfaceDefinitionNode {

        let path: string = (parent.path != "" ? parent.path + "." : "") + identifier.value;

        let node: ASTInterfaceDefinitionNode = {
            kind: TokenType.keywordInterface,
            range: modifiers.range,
            parent: parent,
            path: path,
            implements: [],
            identifier: <string>identifier.value,
            identifierRange: identifier.range,
            visibility: modifiers.visibility,
            isFinal: modifiers.isFinal,
            isStatic: modifiers.isStatic,
            isAbstract: modifiers.isAbstract,
            isDefault: modifiers.isDefault,
            isSynchronized: modifiers.isSynchronized,
            genericParameterDeclarations: [],
            methods: [],
            annotations: [],
            fieldsOrInstanceInitializers: [], // only static fields and static initializers...,
            resolvedType: undefined,
            innerTypes: [],
            module: module,
            isAnonymousInnerType: false
        }

        if (annotations.length > 0) {
            node.annotations = annotations.slice();
            annotations.splice(0, annotations.length);
        }

        parent.innerTypes.push(node);
        return node;

    }

    buildMethodNode(returnParameterType: ASTTypeNode | undefined, isContructor: boolean, modifiers: ASTNodeWithModifiers,
        identifier: Token, rangeStart: IRange, annotations: ASTAnnotationNode[], parent: ASTClassDefinitionNode | ASTEnumDefinitionNode | ASTInterfaceDefinitionNode): ASTMethodDeclarationNode {

        let node: ASTMethodDeclarationNode = {
            kind: TokenType.methodDeclaration,
            range: rangeStart,
            identifier: <string>identifier.value,
            identifierRange: identifier.range,
            visibility: modifiers.visibility,
            isFinal: modifiers.isFinal,
            isStatic: modifiers.isStatic,
            isAbstract: modifiers.isAbstract,
            isContructor: isContructor,
            isDefault: modifiers.isDefault,
            isSynchronized: modifiers.isSynchronized,
            parameters: [],
            returnParameterType: returnParameterType,
            statement: undefined,
            annotations: [],
            parentTypeScope: parent,
            innerTypes: [],
            path: parent.path + "." + <string>identifier.value,
            genericParameterDeclarations: []
        }

        if (annotations.length > 0) {
            node.annotations = annotations.slice();
            annotations.splice(0, annotations.length);
        }

        return node;

    }

    buildFieldDeclarationNode(rangeStart: IRange, identifier: Token, type: ASTTypeNode,
        initialization: ASTTermNode | undefined, modifiers: ASTNodeWithModifiers,
        annotations: ASTAnnotationNode[]): ASTFieldDeclarationNode {

        let node: ASTFieldDeclarationNode = {
            kind: TokenType.fieldDeclaration,
            range: rangeStart,
            identifier: <string>identifier.value,
            identifierRange: identifier.range,
            type: type,
            initialization: initialization,
            visibility: modifiers.visibility,
            isFinal: modifiers.isFinal,
            isStatic: modifiers.isStatic,
            isAbstract: modifiers.isAbstract,
            isDefault: modifiers.isDefault,
            isSynchronized: modifiers.isSynchronized,
            annotations: []
        }

        if (annotations.length > 0) {
            node.annotations = annotations.slice();
            annotations.splice(0, annotations.length);
        }

        return node;
    }


    buildNodeWithModifiers(startRange: IRange): ASTNodeWithModifiers {
        return {
            range: startRange,
            visibility: TokenType.keywordPublic,
            isFinal: false,
            isStatic: false,
            isAbstract: false,
            isDefault: false,
            isSynchronized: false,
        }
    }

    buildParameterNode(startRange: IRange, identifier: Token, type: ASTTypeNode | undefined, isEllipsis: boolean, isFinal: boolean): ASTParameterNode {
        return {
            kind: TokenType.parameterDeclaration,
            range: startRange,
            identifier: <string>identifier.value,
            identifierRange: identifier.range,
            type: type,
            isEllipsis: isEllipsis,
            isFinal: isFinal,
            trackMissingReadAccess: true
        }
    }

    buildPlusPlusMinusMinusSuffixNode(operator: Token, childNode: ASTTermNode): ASTPlusPlusMinusMinusSuffixNode {
        return {
            kind: TokenType.plusPlusMinusMinusSuffix,
            range: { startLineNumber: childNode.range.startLineNumber, startColumn: childNode.range.startColumn, endLineNumber: operator.range.endLineNumber, endColumn: operator.range.endColumn },
            operator: <any>operator.tt,
            term: childNode
        }
    }

    buildUnaryPrefixNode(operator: Token, childNode: ASTTermNode): ASTUnaryPrefixNode {
        return {
            kind: TokenType.unaryPrefixOp,
            range: { startLineNumber: operator.range.startLineNumber, startColumn: operator.range.startColumn, endLineNumber: childNode.range.endLineNumber, endColumn: childNode.range.endColumn },
            operator: <any>operator.tt,
            term: childNode
        }
    }

    buildAttributeDereferencingNode(node: ASTTermNode, identifier: Token): ASTAttributeDereferencingNode {
        return {
            kind: TokenType.dereferenceAttribute,
            range: identifier.range,
            attributeIdentifier: <string>identifier.value,
            nodeToGetObject: node
        }
    }

    buildMethodCallNode(identifier: Token, nodeToGetObject: ASTTermNode | undefined): ASTMethodCallNode {
        let id: string = <string>identifier.value;
        if (identifier.tt == TokenType.keywordThis || identifier.tt == TokenType.keywordSuper) {
            id = "";
        }

        return {
            kind: TokenType.methodCall,
            identifier: id,
            identifierRange: identifier.range,
            range: identifier.range,
            nodeToGetObject: nodeToGetObject,
            parameterValues: [],
            commaPositions: [],
            rightBracketPosition: undefined
        }
    }

    buildLambdaFunctionDeclarationNode(startToken: Token): ASTLambdaFunctionDeclarationNode {
        return {
            kind: TokenType.lambdaOperator,
            range: startToken.range,
            parameters: [],
            statement: undefined
        }
    }

    buildCastNode(startToken: Token, castType: ASTTypeNode, objectToCast: ASTTermNode): ASTCastNode {
        return {
            range: startToken.range,
            kind: TokenType.castValue,
            castType: castType,
            objectToCast: objectToCast
        }
    }

    buildVariableNode(identifier: Token): ASTSymbolNode {
        return {
            kind: TokenType.symbol,
            range: identifier.range,
            identifier: <string>identifier.value
        }
    }

    buildNewObjectNode(startToken: Token, type: ASTTypeNode, object: ASTTermNode | undefined): ASTNewObjectNode {
        return {
            kind: TokenType.newObject,
            range: startToken.range,
            klassIdentifierRange: type.range,
            parameterValues: [],
            type: type,
            object: object,
            commaPositions: [],
            rightBracketPosition: undefined
        }
    }

    buildAnonymousInnerClassNode(newObjectNode: ASTNewObjectNode, klass: ASTClassDefinitionNode): ASTAnonymousClassNode {

        let range = new Range(newObjectNode.range.startLineNumber, newObjectNode.range.startColumn, klass.range.endLineNumber, klass.range.endColumn);

        return {
            kind: TokenType.anonymousClass,
            newObjectNode: newObjectNode,
            klass: klass,
            range: range
        }
    }

    buildNewArrayNode(startToken: Token, arrayType: ASTTypeNode, dimensions: ASTTermNode[]): ASTNewArrayNode {
        return {
            kind: TokenType.newArray,
            range: startToken.range,
            arrayType: arrayType,
            dimensions: dimensions
        }
    }

    buildSelectArrayElement(array: ASTTermNode): ASTSelectArrayElementNode {
        return {
            kind: TokenType.selectArrayElement,
            range: array.range,
            array: array,
            indices: []
        };
    }

    buildWhileNode(whileToken: Token, tokenAfterWhileBlock: Token, condition: ASTTermNode, statementToRepeat: ASTStatementNode): ASTWhileNode {
        return {
            kind: TokenType.keywordWhile,
            range: { startLineNumber: whileToken.range.startLineNumber, startColumn: whileToken.range.startColumn, endLineNumber: tokenAfterWhileBlock.range.endLineNumber, endColumn: tokenAfterWhileBlock.range.endColumn },
            condition: condition,
            statementToRepeat: statementToRepeat
        }
    }

    buildDoWhileNode(doToken: Token, tokenAfterDoWhileBlock: Token, condition: ASTTermNode, statementToRepeat: ASTStatementNode): ASTDoWhileNode {
        return {
            kind: TokenType.keywordDo,
            range: { startLineNumber: doToken.range.startLineNumber, startColumn: doToken.range.startColumn, endLineNumber: tokenAfterDoWhileBlock.range.endLineNumber, endColumn: tokenAfterDoWhileBlock.range.endColumn },
            condition: condition,
            statementToRepeat: statementToRepeat
        }
    }

    buildIfNode(ifToken: Token, tokenAfterIfBlock: Token, condition: ASTTermNode, statementIfTrue: ASTStatementNode, statementIfFalse: ASTStatementNode | undefined): ASTIfNode {
        return {
            kind: TokenType.keywordIf,
            range: { startLineNumber: ifToken.range.startLineNumber, startColumn: ifToken.range.startColumn, endLineNumber: tokenAfterIfBlock.range.endLineNumber, endColumn: tokenAfterIfBlock.range.endColumn },
            condition: condition,
            statementIfTrue: statementIfTrue,
            statementIfFalse: statementIfFalse,

        }
    }

    buildForLoopNode(forToken: Token, firstStatement: ASTStatementNode | undefined, condition: ASTTermNode | undefined,
        lastStatement: ASTStatementNode | undefined,
        statementToRepeat: ASTStatementNode): ASTForLoopNode {
        return {
            kind: TokenType.keywordFor,
            range: { startLineNumber: forToken.range.startLineNumber, startColumn: forToken.range.startColumn, endLineNumber: statementToRepeat.range.endLineNumber, endColumn: statementToRepeat.range.endColumn },
            firstStatement: firstStatement,
            condition: condition,
            lastStatement: lastStatement,
            statementToRepeat: statementToRepeat
        }
    }

    buildMainProgramNode(beginToken: Token): ASTProgramNode {
        return {
            kind: TokenType.program,
            range: beginToken.range,
            statements: []
        }

    }

    buildPrintStatement(beginToken: Token, isPrintln: boolean): ASTPrintStatementNode {
        return {
            kind: TokenType.print,
            range: beginToken.range,
            isPrintln: isPrintln,
            firstParameter: undefined,
            secondParameter: undefined,
            commaPositions:  [],
            rightBracketPosition: undefined
        }
    }

    buildConstantNode(token: Token): ASTLiteralNode {
        return {
            kind: TokenType.literal,
            range: token.range,
            constantType: token.tt,
            value: token.tt == TokenType.keywordNull ? null : token.value
        }
    }

    buildThisNode(token: Token): ASTThisNode {
        return {
            kind: TokenType.keywordThis,
            range: token.range
        }
    }

    buildSuperNode(token: Token): ASTSuperNode {
        return {
            kind: TokenType.keywordSuper,
            range: token.range
        }
    }

    buildSynchronizedBlockNode(synchronizedToken: Token, lockObject: ASTTermNode, block: ASTBlockNode): ASTSynchronizedBlockNode {
        return {
            kind: TokenType.synchronizedBlock,
            range: synchronizedToken.range,
            lockObject: lockObject,
            block: block
        }
    }

    buildBlockNode(leftCurlyBrace: Token): ASTBlockNode {
        return {
            kind: TokenType.block,
            range: leftCurlyBrace.range,
            statements: []
        }
    }

    buildBlockNodeFromStatements(statement: ASTStatementNode[]): ASTStatementNode | ASTBlockNode {
        if (statement.length == 1) return statement[0];

        let range: IRange = {
            startLineNumber: statement[0].range.startLineNumber,
            startColumn: statement[0].range.startColumn,
            endLineNumber: statement[1].range.endLineNumber,
            endColumn: statement[1].range.endColumn,
        }

        return {
            kind: TokenType.block,
            range: range,
            statements: statement
        }
    }

    buildInstanceInitializerNode(leftCurlyBrace: Token): ASTInstanceInitializerNode {
        return {
            kind: TokenType.instanceInitializerBlock,
            range: leftCurlyBrace.range,
            statements: []
        }
    }

    buildStaticInitializerNode(leftCurlyBrace: Token): ASTStaticInitializerNode {
        return {
            kind: TokenType.staticInitializerBlock,
            range: leftCurlyBrace.range,
            statements: []
        }
    }

    buildEnhancedForLoop(tokenFor: Token, elementType: ASTTypeNode, elementIdentifier: Token, collection: ASTTermNode, statementsToRepeat: ASTStatementNode): ASTEnhancedForLoopNode {
        return {
            kind: TokenType.enhancedForLoop,
            range: { startLineNumber: tokenFor.range.startLineNumber, startColumn: tokenFor.range.startColumn, endLineNumber: statementsToRepeat.range.endLineNumber, endColumn: statementsToRepeat.range.endColumn },
            elementType: elementType,
            elementIdentifier: <string>elementIdentifier.value,
            elementIdentifierPosition: elementIdentifier.range,
            collection: collection,
            statementToRepeat: statementsToRepeat,
            elementIsFinal: false
        }
    }

    buildSwitchCaseNode(tokenSwitch: Token, term: ASTTermNode): ASTSwitchCaseNode {
        return {
            kind: TokenType.keywordSwitch,
            range: tokenSwitch.range,
            term: term,
            caseNodes: [],
            defaultNode: undefined
        }
    }

    buildCaseNode(caseToken: Token, constants: ASTTermNode[] | undefined): ASTCaseNode {
        return {
            kind: TokenType.keywordCase,
            range: caseToken.range,
            constants: constants,
            statements: []
        }
    }

    buildContinueNode(continueToken: Token): ASTContinueNode {
        return {
            kind: TokenType.keywordContinue,
            range: continueToken.range
        }
    }

    buildBreakNode(breakToken: Token): ASTBreakNode {
        return {
            kind: TokenType.keywordBreak,
            range: breakToken.range
        }
    }

    buildReturnNode(returnToken: Token, term: ASTTermNode | undefined): ASTReturnNode {
        return {
            kind: TokenType.keywordReturn,
            range: term ? { startLineNumber: returnToken.range.startLineNumber, startColumn: returnToken.range.startColumn, endLineNumber: term.range.endLineNumber, endColumn: term.range.endColumn } : returnToken.range,
            term: term,
            keywordReturnRange: returnToken.range
        }
    }

    buildTryCatchNode(tryToken: Token, statement: ASTStatementNode): ASTTryCatchNode {
        return {
            kind: TokenType.keywordTry,
            range: { startLineNumber: tryToken.range.startLineNumber, startColumn: tryToken.range.startColumn, endLineNumber: statement.range.endLineNumber, endColumn: statement.range.endColumn },
            tryStatement: statement,
            catchCases: []
        }
    }

    buildCatchNode(catchToken: Token, exceptionTypes: ASTTypeNode[], exceptionIdentifier: Token, statement: ASTStatementNode): ASTCatchNode {
        return {
            kind: TokenType.keywordCatch,
            range: { startLineNumber: catchToken.range.startLineNumber, startColumn: catchToken.range.startColumn, endLineNumber: statement.range.endLineNumber, endColumn: statement.range.endColumn },
            exceptionTypes: exceptionTypes,
            exceptionIdentifier: <string>exceptionIdentifier.value,
            exceptionIdentifierPosition: exceptionIdentifier.range,
            statement: statement
        }
    }

    buildAnnotationNode(identifer: Token): ASTAnnotationNode {
        return {
            kind: TokenType.annotation,
            range: identifer.range,
            identifier: <string>identifer.value
        }
    }

    buildLocalVariableDeclaration(type: ASTTypeNode, identifer: Token, initialization: ASTTermNode | undefined, isFinal: boolean): ASTLocalVariableDeclaration {
        let end = initialization ? initialization : identifer;

        return {
            kind: TokenType.localVariableDeclaration,
            identifier: <string>identifer.value,
            identifierRange: identifer.range,
            range: { startLineNumber: type.range.startLineNumber, startColumn: type.range.startColumn, endLineNumber: end.range.endLineNumber, endColumn: end.range.endColumn },
            type: type,
            initialization: initialization,
            isFinal: isFinal
        }
    }
}