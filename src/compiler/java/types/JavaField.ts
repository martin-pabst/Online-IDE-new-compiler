import { BaseField, BaseSymbol } from "../../common/BaseSymbolTable";
import { BaseType } from "../../common/BaseType";
import { IRange } from "../../common/range/Range";
import { TokenType, TokenTypeReadable } from "../TokenType";
import { JavaLocalVariable } from "../codegenerator/JavaLocalVariable";
import { JavaBaseModule } from "../module/JavaBaseModule";
import { GenericTypeParameter } from "./GenericTypeParameter";
import { JavaClass } from "./JavaClass";
import { JavaEnum } from "./JavaEnum";
import { JavaInterface } from "./JavaInterface";
import { JavaType } from "./JavaType";
import { Visibility } from "./Visibility";

export class JavaField extends BaseField {

    _isStatic: boolean = false;
    _isFinal: boolean = false;
    _isTransient: boolean = false;

    /**
     * The class/enum this field belongs to
     */
    classEnum!: JavaClass | JavaEnum | JavaInterface;

    internalName?: string;
    template?: string;

    initialValue?: any;
    initialValueIsConstant: boolean = false;    // enables us to resolve values of final variables as constants
    initializedBeforeConstructor?: boolean;

    innerClassCopyOfOuterClassLocalVariable?: JavaLocalVariable;

    constructor(identifier: string, identifierRange: IRange, public module: JavaBaseModule,
         public type: JavaType, public visibility: Visibility = TokenType.keywordPublic){
            super(identifier, identifierRange, module);
    }

    getFieldIndentifier(): string {
        return this.getInternalName();
    }

    getCopyWithConcreteType(typeMap: Map<GenericTypeParameter, JavaType>): JavaField {
        let newType: JavaType = this.type.getCopyWithConcreteType(typeMap);
        if(newType == this.type) return this;

        let copy = new JavaField(this.identifier, this.identifierRange, this.module,
             newType, this.visibility);
        copy.documentation = this.documentation;
        copy.internalName = this.getInternalName();

        return copy;
    }

    getInternalName(): string {
        if(!this.internalName){
            this.internalName = "$f_" + this.identifier;
            if(this.classEnum instanceof JavaClass){
                let parent = this.classEnum.getExtends();
                while(parent){
                    if(parent.getFields().find(f => f.identifier == this.identifier)){
                        this.internalName = "_" + this.internalName;
                    }
                    parent = parent.getExtends();
                }
            }
        }

        return this.internalName;
    }

    getValue(stack: any, stackframeStart: number) {
        throw new Error("Method not implemented.");
    }

    getDeclaration(): string {

        if(this.classEnum?.isMainClass){     // local variables in main class are compiled as static fields => don't show that to students!
            return this.toString();
        }

        let decl: string = TokenTypeReadable[this.visibility] + " ";
        if(this._isStatic) decl += "static ";
        if(this._isFinal) decl += "final ";
        return decl + this.type?.toString() + " " + this.identifier;
    }

    toString(): string {
        return this.type?.toString() + " " + this.identifier;
    }

    getType(): BaseType {
        return this.type;
    }

    isStatic(): boolean {
        return this._isStatic;
    }

    isFinal(): boolean {
        return this._isFinal;
    }

    isTransient(): boolean {
        return this._isTransient;
    }

}