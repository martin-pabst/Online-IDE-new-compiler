import { TokenType } from "../../TokenType.ts";
import { JCM } from "../../language/JavaCompilerMessages.ts";
import { JavaCompiledModule } from "../../module/JavaCompiledModule.ts";
import { ASTAnonymousClassNode, ASTClassDefinitionNode, ASTEnumDefinitionNode, ASTInterfaceDefinitionNode, ASTNewObjectNode, ASTNodeWithModifiers } from "../AST.ts";
import { ASTNodeFactory } from "../ASTNodeFactory.ts";
import { StatementParser } from "../StatementParser.ts";


export class JavaReplParser extends StatementParser {


    constructor(module: JavaCompiledModule) {
        super(module);
        this.nodeFactory = new ASTNodeFactory(this);
        this.initializeAST();
    }

    initializeAST() {
        let globalRange = {
            startLineNumber: 0, startColumn: 0,
            endLineNumber: this.endToken.range.endLineNumber, endColumn: this.endToken.range.endColumn
        };

        this.module.ast = {
            kind: TokenType.global,
            range: globalRange,
            innerTypes: [],
            mainProgramNode: this.nodeFactory.buildMainProgramNode(this.cct),
            collectedTypeNodes: [],
            path: "",
            importStatements: []
        }
    }

    parse() {

        while (!this.isEnd()) {
            let pos = this.pos;

            let statementNode = this.parseStatementOrExpression(false);
            if(statementNode){
                this.module.ast?.mainProgramNode.statements.push(statementNode);
            }

            if (pos == this.pos) {
                this.pushError(JCM.unexpectedToken("" + this.cct.value), "warning");
                this.nextToken();   // last safety net to prevent getting stuck in an endless loop
            }
        }

    }


    parseFieldOrMethodDeclaration(classASTNode: ASTClassDefinitionNode | ASTEnumDefinitionNode | ASTInterfaceDefinitionNode, modifiers: ASTNodeWithModifiers): void {
        throw new Error("Method not implemented.");
    }
    parseAnonymousInnerClassBody(newObjectNode: ASTNewObjectNode): ASTAnonymousClassNode | undefined {
        throw new Error("Method not implemented.");
    }


}

