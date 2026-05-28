import { Program } from "../common/interpreter/Program";
import { Step } from "../common/interpreter/Step";
import { AssemblyToken } from "./AssemblyLexer";

export class AssemblyParser {

    steps: Step[];

    parse(tokens: AssemblyToken[]): Program {
        this.steps = [];
        


    }

}