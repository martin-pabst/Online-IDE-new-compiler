import { Program } from "../../../common/interpreter/Program.ts";
import { Helpers } from "../../../common/interpreter/StepFunction.ts";
import { Code, link, STEP } from "../../codegenerator/Code.ts";
import { Expr, toStack, toStatement } from "../../codegenerator/Expr.ts";
import { ExceptionTree } from "../../codegenerator/ExceptionTree.ts";
import { JavaSymbolTable } from "../../codegenerator/JavaSymbolTable.ts";
import { StatementCodeGenerator } from "../../codegenerator/StatementCodeGenerator.ts";
import { JavaCompiledModule } from "../../module/JavaCompiledModule.ts";
import { JavaTypeStore } from "../../module/JavaTypeStore.ts";
import { TokenType } from "../../TokenType.ts";
import { JavaType } from "../../types/JavaType.ts";
import { ASTAnonymousClassNode, ASTLambdaFunctionDeclarationNode, ASTStatementNode } from "../AST.ts";


export class JavaReplCodeGenerator extends StatementCodeGenerator {

    constructor(module: JavaCompiledModule, libraryTypestore: JavaTypeStore, compiledTypesTypestore: JavaTypeStore,
        exceptionTree: ExceptionTree) {
        super(module, libraryTypestore, compiledTypesTypestore, exceptionTree, undefined);
        
        this.isRepl = true;

    }

    start(baseSymbolTable: JavaSymbolTable, withToStringCall: boolean, isStandalone: boolean): Program {

        if(isStandalone){
            this.currentSymbolTable = baseSymbolTable;
            this.codeGenerationMode = "replStandalone";
            this.module.symbolTables = [baseSymbolTable];
        } else {
            this.currentSymbolTable = new JavaSymbolTable(this.module, this.module.ast!.range, true, baseSymbolTable);
            this.module.symbolTables.push(this.currentSymbolTable);
            this.codeGenerationMode = "repl";
        }
        this.symbolTableStack.push(this.currentSymbolTable)

        this.module.programsToCompileToFunctions = [];

        let program = new Program(this.module, this.currentSymbolTable, "Repl.method")

        let code: Code = [`${Helpers.startReplProgram}();\n`];

        let statements = this.module.ast!.mainProgramNode.statements;
        let lastIndex = statements.length - 1;
        let lastStatement = statements[lastIndex];
        if (lastStatement && lastStatement.kind == TokenType.block && lastStatement.isEmpty) lastIndex--;

        // value of last statement (if it is a term) is left on the stack
        let typeOfLastTerm: JavaType | undefined;
        let keepValueOnStack = (term: Expr): Code => {
            typeOfLastTerm = term.type;
            return term.type && term.type != this.voidType ? toStack(term).pre : toStatement(term);
        }

        for (let i = 0; i <= lastIndex; i++) {
            code.push(...this.compileStatementOrTerm(statements[i], i == lastIndex ? keepValueOnStack : toStatement) ?? []);
        }

        if (typeOfLastTerm && typeOfLastTerm != this.voidType) {
            if (withToStringCall) {
                code.push(`${Helpers.toString}(__t, undefined, ${Helpers.threadStack}[${Helpers.threadStack}.length - 1]);\n`, STEP);
            }
            this.module.returnType = typeOfLastTerm;
        }

        code.push(STEP, `${Helpers.returnFromReplProgram}();\n`);

        link(code, program, "Repl.method");

        // program.logAllSteps();

        return program;
    }


    compileAnonymousInnerClass(node: ASTAnonymousClassNode): Expr | undefined {
        throw new Error("Method not implemented.");
    }

    compileLambdaFunction(node: ASTLambdaFunctionDeclarationNode, expectedType: JavaType | undefined): Expr | undefined {
        throw new Error("Method not implemented.");
    }

}