import { BaseArrayType, BaseType } from "../../common/BaseType";
import { CompilerFile } from "../../common/module/CompilerFile";
import { IRange } from "../../common/range/Range";
import { CodeTemplate } from "../codegenerator/CodeTemplate";
import { JavaBaseModule } from "../module/JavaBaseModule";
import { JavaTypeStore } from "../module/JavaTypeStore";
import { BinaryOperator, UnaryPrefixOperator } from "../parser/AST";
import { GenericTypeParameter } from "./GenericTypeParameter";
import { GenericVariantOfJavaClass } from "./JavaClass";
import { GenericVariantOfJavaInterface } from "./JavaInterface";
import { JavaType } from "./JavaType";

export class JavaArrayType extends JavaType implements BaseArrayType {
    getCompletionItemDetail(): string {
        return "";
    }

    constructor(public elementType: JavaType, public dimension: number,
        module: JavaBaseModule, identifierRange: IRange) {
        super(elementType.identifier + "[]".repeat(dimension), identifierRange, module);

        while(this.elementType instanceof JavaArrayType){
            this.dimension += this.elementType.dimension;
            this.elementType = this.elementType.elementType;
        }

        this.isPrimitive = false;
        this.genericTypeParameters = undefined;
    }

    getDefaultValue(){
        return null;
    }

    getCastFunction(_destType: JavaType): CodeTemplate | undefined {
        return undefined;  // you can't cast arrays in java (to my knowledge...).
    }

    getCopyWithConcreteType(_typeMap: Map<GenericTypeParameter, JavaType>): JavaType {

        let mappedElemenType: JavaType | undefined;
        if(this.elementType instanceof GenericVariantOfJavaClass || this.elementType instanceof GenericVariantOfJavaInterface){
            mappedElemenType = this.elementType.getCopyWithConcreteType(<any>_typeMap);
        } 
        if(this.elementType instanceof GenericTypeParameter){
            mappedElemenType = _typeMap.get(this.elementType);
        } 

        if(!mappedElemenType) return this;

        return new JavaArrayType(mappedElemenType, this.dimension, this.module, this.identifierRange)
    }

    getFile(): CompilerFile {
        throw new Error("Method not implemented.");
    }

    getBinaryResultType(_destType: JavaType, _operator: BinaryOperator, _typeStore: JavaTypeStore): JavaType | undefined {
        return undefined;
    }
    getBinaryOperation(_destType: JavaType, _operator: BinaryOperator): CodeTemplate | undefined {
        return undefined;
    }
    getUnaryResultType(_operator: UnaryPrefixOperator): JavaType | undefined {
        return undefined;
    }
    getUnaryOperation(_operator: UnaryPrefixOperator): CodeTemplate | undefined {
        return undefined;
    }

    toString(): string {
        let s: string = this.elementType.toString();
        for(let i = 0; i < this.dimension; i++) s += "[]";
        return s;
    }

    getAbsoluteName(): string {
        let s: string = this.elementType.getAbsoluteName();
        for(let i = 0; i < this.dimension; i++) s += "[]";
        return s;
    }

    getDeclaration(): string {
        let s: string = this.elementType.getDeclaration();
        for(let i = 0; i < this.dimension; i++) s += "[]";
        return s;
    }

    getInternalName(): string {
        let internalName = this.elementType.identifier;
        for(let i = 0; i < this.dimension; i++) internalName += "_I";
        return internalName;
    }

    static increaseArrayDimension(type: JavaType): JavaArrayType {
        if(type instanceof JavaArrayType){
            type.dimension++;
            return type;
        }
        return new JavaArrayType(type, 1, type.module, type.identifierRange);
    }

    getElementType(): JavaType {
        if(this.dimension == 1) return this.elementType;
        return new JavaArrayType(this.elementType, this.dimension - 1, this.module, this.identifierRange);
    }


}