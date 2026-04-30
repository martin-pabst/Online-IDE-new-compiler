import { TokenType, TokenTypeReadable } from "../../compiler/java/TokenType";
import { GenericTypeParameter } from "../../compiler/java/types/GenericTypeParameter";
import { IJavaClass, JavaClass } from "../../compiler/java/types/JavaClass";
import { JavaEnum } from "../../compiler/java/types/JavaEnum";
import { JavaField } from "../../compiler/java/types/JavaField";
import { IJavaInterface, JavaInterface } from "../../compiler/java/types/JavaInterface";
import { GenericMethod, JavaMethod } from "../../compiler/java/types/JavaMethod";
import { Visibility } from "../../compiler/java/types/Visibility.ts";
import { APIPrinter } from "./APIPrinter";

type classEnumInterface = "class" | "enum" | "interface";

export class JavaSyntaxAPIPrinter extends APIPrinter {

    indentation: string = "   ";

    printClassEnumInterface(cei: JavaClass | JavaEnum | JavaInterface): string {
        let type: classEnumInterface;

        if (cei instanceof JavaClass) type = "class";
        if (cei instanceof JavaEnum) type = "enum";
        if (cei instanceof JavaInterface) type = "interface";

        let s: string = ""; 
            s += this.toJavaDocComment(cei.documentation, "");
            s += cei.getDeclaration();

        s += " {\n";
        if (cei instanceof JavaEnum) {
            s += this.indentation + cei.getFields().filter(field => field.visibility != TokenType.keywordPrivate && field.isStatic() && field.type == cei).map(v => v.identifier).join(", ") + ";\n\n";
            for (let a of cei.getFields().filter(field => !field.isStatic())) {
                s += this.printField(a);
            }
        }

        if (cei instanceof JavaClass) {
            for (let a of cei.getFields().filter(a => a.visibility == TokenType.keywordPublic)) {
                s += this.printField(a);
            }
        }

        for (let m of cei.methods.filter(m => m.isConstructor && m.visibility == TokenType.keywordPublic)) {
            s += this.printMethod(m);
        }

        for (let m of cei.methods.filter(m => !m.isConstructor && m.visibility == TokenType.keywordPublic)) {
            s += this.printMethod(m);
        }

        s += "}\n\n";

        return s;
    }

    genericTypeParameterToString(gtp: GenericTypeParameter) {
        let s: string = gtp.identifier;
        s += (gtp.lowerBound ? " super " + gtp.lowerBound?.pathAndIdentifier : "") +
            (gtp.upperBounds.length > 0 ? " extends " + gtp.upperBounds.map(ub => ub.pathAndIdentifier).join(" & ") : "");
        return s;
    }

    getVisibility(visibility: Visibility): string {
        return TokenTypeReadable[visibility];
    }

    printField(field: JavaField): string {
        if(field.type.identifier == 'Class') return "";
        let s = this.toJavaDocComment(field.documentation, this.indentation);
        s += this.indentation + this.getVisibility(field.visibility) + " ";
        if(field.isStatic()){
            s += "static ";
        } 
        if(field.isFinal()){
            s += "final ";
        }
        s += field.type.toString() + " " + field.identifier + ";\n"
        return s;
    }

    printMethod(method: JavaMethod): string {
        let s = this.toJavaDocComment(method.documentation, this.indentation);
        s += this.indentation + this.getVisibility(method.visibility) + " ";
        if(method.isStatic) s += "static ";
        if(method.isFinal) s += "final ";
        if(method instanceof GenericMethod){
            s += "<" + method.genericTypeParameters.map(tp => this.genericTypeParameterToString(tp)).join(", ") + "> ";           
        }
        if(!method.isConstructor){
            if(method.returnParameterType){
                s += method.returnParameterType.toString() + " ";
            } else {
                s += "void ";
            }
        }
        s += method.identifier + "(" + method.parameters.map(p => p.type.toString() + " " + p.identifier).join(", ") + ");\n";

        return s + "\n";
    }

}