import { Program } from "../../common/interpreter/Program.ts";
import { Klass } from "../../common/interpreter/RuntimeConstants.ts";
import { IRange } from "../../common/range/Range.ts";
import { CodeSnippet } from "../codegenerator/CodeSnippet.ts";
import { JavaBaseModule } from "../module/JavaBaseModule.ts";
import { NonPrimitiveType } from "./NonPrimitiveType.ts";

export abstract class JavaTypeWithInstanceInitializer extends NonPrimitiveType {

    instanceInitializer: CodeSnippet[] = [];

    constructor(identifier: string, identifierRange: IRange, path: string, module: JavaBaseModule) {

        super(identifier, identifierRange, path, module);

    }


}
