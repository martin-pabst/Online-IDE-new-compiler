import { Program } from "../../../common/interpreter/Program.ts";
import { Helpers } from "../../../common/interpreter/RuntimeConstants.ts";
import { CodeSnippet, StringCodeSnippet } from "../../codegenerator/CodeSnippet.ts";
import { CodeSnippetContainer, NextStepMark } from "../../codegenerator/CodeSnippetKinds.ts";
import { ExceptionTree } from "../../codegenerator/ExceptionTree.ts";
import { JavaSymbolTable } from "../../codegenerator/JavaSymbolTable.ts";
import { SnippetLinker } from "../../codegenerator/SnippetLinker.ts";
import { StatementCodeGenerator } from "../../codegenerator/StatementCodeGenerator.ts";
import { JavaCompiledModule } from "../../module/JavaCompiledModule.ts";
import { JavaTypeStore } from "../../module/JavaTypeStore.ts";
import { TokenType } from "../../TokenType.ts";
import { JavaType } from "../../types/JavaType.ts";
import { ASTAnonymousClassNode, ASTLambdaFunctionDeclarationNode, ASTStatementNode } from "../AST.ts";


export class JavaReplCodeGenerator extends StatementCodeGenerator {

    constructor(module: JavaCompiledModule, libraryTypestore: JavaTypeStore, compiledTypesTypestore: JavaTypeStore,
        exceptionTree: ExceptionTree) {
        super(module, libraryTypestore, compiledTypesTypestore, exceptionTree);
        
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

        let snippets: CodeSnippet[] = [];
        snippets.push(new StringCodeSnippet(`${Helpers.startReplProgram}();\n`))

        let snippet: CodeSnippet | undefined;
        let statement: ASTStatementNode;
        let statements = this.module.ast!.mainProgramNode.statements;

        for(let i = 0; i < statements.length; i++){
            statement = statements[i];
            if(statement.kind == TokenType.block && statement.isEmpty && i == statements.length - 1) break;
            snippet = this.compileStatementOrTerm(statement);
            if (snippet) snippets.push(snippet);
        }

        if (snippet && snippet.type) {
            if (snippet.type != this.voidType) {


                let snippetWithValueOnStack = snippet instanceof CodeSnippetContainer ? snippet : new CodeSnippetContainer(snippet, snippet.range, snippet.type);
                snippetWithValueOnStack.ensureFinalValueIsOnStack();
                snippets.pop();
                snippets.push(snippetWithValueOnStack);

                if(withToStringCall){
                    let lastSnippet:CodeSnippet = new StringCodeSnippet(`${Helpers.toString}(__t, undefined, ${Helpers.threadStack}[${Helpers.threadStack}.length - 1]);\n`);
                    lastSnippet = new CodeSnippetContainer([lastSnippet, new NextStepMark()]);    
                    snippets.push(lastSnippet);
                }

                this.module.returnType = snippet.type;

            }
        }

    
        snippets.push(new StringCodeSnippet(`${Helpers.returnFromReplProgram}();\n`))

        new SnippetLinker().link(snippets, program);

        // program.logAllSteps();

        return program;
    }


    compileAnonymousInnerClass(node: ASTAnonymousClassNode): CodeSnippet | undefined {
        throw new Error("Method not implemented.");
    }

    compileLambdaFunction(node: ASTLambdaFunctionDeclarationNode, expectedType: JavaType | undefined): CodeSnippet | undefined {
        throw new Error("Method not implemented.");
    }

}