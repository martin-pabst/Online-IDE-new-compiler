import type { IRange } from "monaco-editor";
import { JavaType } from "./JavaType";
import type { JavaBaseModule } from "../module/JavaBaseModule";
import type { GenericTypeParameter } from "./GenericTypeParameter";

export class JavaPackage extends JavaType {

    children: JavaPackage[] = [];

    constructor(identifier: string, identifierRange: IRange, module: JavaBaseModule, public basePackage: JavaPackage | undefined) {
        super(identifier, identifierRange, module);
        if(basePackage) {
            basePackage.children.push(this);
        }
    }

    getCopyWithConcreteType(typeMap: Map<GenericTypeParameter, JavaType>): JavaType {
        return this;
    }

    getDefaultValue() {
    }

    toString(): string {
        let name = "";
        if (this.basePackage) {
            name = this.basePackage.toString() + ".";
        }
        return name + this.identifier;
    }

    getAbsoluteName(): string {
        return this.toString();
    }

    getCompletionItemDetail(): string {
        return "package " + this.getAbsoluteName();
    }

    getDeclaration(): string {
        return "package " + this.getAbsoluteName() + ";";
    }

}