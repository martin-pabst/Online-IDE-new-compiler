import { Program } from "../../../common/interpreter/Program.ts";
import { Helpers } from "../../../common/interpreter/StepFunction.ts";
import { CodeSnippet, StringCodeSnippet } from "../../codegenerator/CodeSnippet.ts";
import { CodeSnippetContainer } from "../../codegenerator/CodeSnippetKinds.ts";
import { ExceptionTree } from "../../codegenerator/ExceptionTree.ts";
import { JavaSymbolTable } from "../../codegenerator/JavaSymbolTable.ts";
import { SnippetLinker } from "../../codegenerator/SnippetLinker.ts";
import { StatementCodeGenerator } from "../../codegenerator/StatementCodeGenerator.ts";
import { JavaCompiledModule } from "../../module/JavaCompiledModule.ts";
import { JavaTypeStore } from "../../module/JavaTypeStore.ts";
import { JavaType } from "../../types/JavaType.ts";
import { ASTAnonymousClassNode, ASTLambdaFunctionDeclarationNode } from "../AST.ts";


export class JavaReplCodeGenerator extends StatementCodeGenerator {

    constructor(module: JavaCompiledModule, libraryTypestore: JavaTypeStore, compiledTypesTypestore: JavaTypeStore,
        exceptionTree: ExceptionTree) {
        super(module, libraryTypestore, compiledTypesTypestore, exceptionTree);

    }

    start(baseSymbolTable: JavaSymbolTable, withToStringCall: boolean): Program {

        this.currentSymbolTable = new JavaSymbolTable(this.module, this.module.ast!.range, true, baseSymbolTable);
        this.module.symbolTables.push(this.currentSymbolTable);
        this.symbolTableStack.push(this.currentSymbolTable)

        this.module.programsToCompileToFunctions = [];

        let program = new Program(this.module, this.currentSymbolTable, "Repl.method")

        let snippets: CodeSnippet[] = [];
        snippets.push(new StringCodeSnippet(`${Helpers.startReplProgram}();\n`))

        let snippet: CodeSnippet | undefined;
        for (let statement of this.module.ast!.mainProgramNode.statements) {
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
                    let lastSnippet = new StringCodeSnippet(`${Helpers.toString}(__t, undefined, ${Helpers.threadStack}[${Helpers.threadStack}.length - 1]);\n`);
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