import { Program } from "../../common/interpreter/Program.ts";
import { Klass } from "../../common/interpreter/StepFunction.ts";
import { EmptyRange, IRange, Range } from "../../common/range/Range";
import { TokenType } from "../TokenType.ts";
import { JavaBaseModule } from "../module/JavaBaseModule";
import { JavaField } from "./JavaField";
import { JavaType } from "./JavaType";
import { JavaMethod } from "./JavaMethod";
import { StaticNonPrimitiveType } from "./StaticNonPrimitiveType.ts";
import { Visibility } from "./Visibility.ts";
import { BaseObjectType } from "../../common/BaseType.ts";
import { JavaAnnotation } from "./JavaAnnotation.ts";
import type * as monaco from 'monaco-editor'
import type { ClassClass } from "../runtime/system/ClassClass.ts";
import { JRC } from "../language/JavaRuntimeLibraryComments.ts";
import { GenericVariantOfJavaClass, JavaClass } from "./JavaClass.ts";
import { JavaCompilerStringConstants } from "../JavaCompilerStringConstants.ts";
import { JavaAnnotations } from "./JavaAnnotations.ts";

/**
 * A NonPrimitiveType
 *  - may have attributes
 *  - may have fields (de: "Attribute")
 *  - may have methods
 */
export abstract class NonPrimitiveType extends JavaType implements BaseObjectType {

    abstract isGenericVariant(): boolean;
    abstract isGenericTypeParameter(): boolean;

    abstract canExplicitlyCastTo(otherType: JavaType): boolean;  // you can cast long to int or Number to Integer EXPLICITLY, e.g. int c = (int)10L
    abstract canImplicitlyCastTo(otherType: JavaType): boolean; // int gets casted to long implicitly; Integer gets casted to Number implicitly e.g. in: Number n = new Integer(10);

    abstract getFields(): JavaField[];
    abstract getOwnMethods(): JavaMethod[];
    abstract getAllMethods(): JavaMethod[];

    private _isMainClass?: boolean;

    set isMainClass(isMainClass: boolean) {
        this._isMainClass = true;
    }

    get isMainClass(): boolean {
        return this._isMainClass != null;
    }

    getOwnAndInheritedFields(): JavaField[] {
        return this.getFields();
    }

    abstract getField(identifier: string, uptoVisibility: Visibility, forceStatic?: boolean): JavaField | undefined;

    abstract getCompletionItems(visibilityUpTo: Visibility, leftBracketAlreadyThere: boolean, identifierAndBracketAfterCursor: string,
        rangeToReplace: monaco.IRange, methodContext: JavaMethod | undefined, onlyStatic?: boolean): monaco.languages.CompletionItem[];

    visibility: Visibility = TokenType.keywordPublic;
    isStatic: boolean = false; // static inner classes behave differently from non-static inner classes
    isFinal: boolean = false;

    private _outerType?: NonPrimitiveType | StaticNonPrimitiveType;      // a local class defined inside a static method has a StaticNonPrimitiveType outerType

    public isPrimitiveTypeWrapper: boolean = false;

    set outerType(ot: NonPrimitiveType | StaticNonPrimitiveType) {
        this._outerType = ot;
        ot.innerTypes.push(this);
    }

    get outerType(): NonPrimitiveType | StaticNonPrimitiveType | undefined {
        return this._outerType;
    }

    innerTypes: (NonPrimitiveType | StaticNonPrimitiveType)[] = [];

    private runtimeClass_?: Klass;

    public get runtimeClass(): Klass | undefined {
        return this.runtimeClass_;
    }

    public set runtimeClass(klass: Klass) {
        this.runtimeClass_ = klass;
    }

    isLibraryType: boolean = false;

    private extendsImplements: Record<string, boolean> = {};

    staticInitializer?: Program;

    staticConstructorsDependOn: Map<NonPrimitiveType, boolean> = new Map();

    public pathAndIdentifier: string;

    public staticType: StaticNonPrimitiveType;

    annotations: JavaAnnotation[] = [];

    constructor(identifier: string, identifierRange: IRange, pathAndIdentifier: string, module: JavaBaseModule) {
        super(identifier, identifierRange, module);
        this.isPrimitive = false;
        this.pathAndIdentifier = pathAndIdentifier || identifier;
        this.extendsImplements[this.pathAndIdentifier] = true;
        this.extendsImplements["Object"] = true;
        this.staticType = new StaticNonPrimitiveType(this);
    }



    getExtendedImplementedIdentifiers(): string[] {
        return Object.getOwnPropertyNames(this.extendsImplements);
    }

    fastExtendsImplements(identifier: string) {
        return this.extendsImplements[identifier] ? true : false;
    }

    registerChildType(childType: NonPrimitiveType) {
        childType.extendsImplements[this.pathAndIdentifier] = true;
    }

    getDefaultValue() {
        return null;
    }

    initRuntimeClass(baseClass: Klass) {
        let that = this;
        this.runtimeClass = class extends baseClass {
            static type = that;
            constructor() {
                super();
            }
        };
    }

    getPossibleMethods(identifier: string, isConstructor: boolean, hasToBeStatic: boolean): JavaMethod[] {
        let methodsWithArbitraryParameterCount: JavaMethod[] = [];

        if (isConstructor) {
            let type: NonPrimitiveType | undefined = this;
            while (type) {
                let constructorList = type.getOwnMethods().filter(m => m.isConstructor);
                methodsWithArbitraryParameterCount = methodsWithArbitraryParameterCount
                    .concat(constructorList);
                //@ts-ignore
                if (type["getExtends"] && constructorList.length == 0) {
                    //@ts-ignore
                    type = type.getExtends();
                } else {
                    break;
                }
            }

        } else {

            methodsWithArbitraryParameterCount = this.getOwnMethods()
                .filter(m => !m.isConstructor && m.identifier == identifier && (!hasToBeStatic || m.isStatic))

            //@ts-ignore
            let ext = this.getExtends() as NonPrimitiveType | NonPrimitiveType[] | undefined;        // is array if this instanceOf JavaInterface

            if (ext) {
                if (!Array.isArray(ext)) ext = [ext];

                for (let type of ext) {
                    methodsWithArbitraryParameterCount = methodsWithArbitraryParameterCount
                        .concat(type.getPossibleMethods(identifier, isConstructor, hasToBeStatic));
                }
            }

        }

        return methodsWithArbitraryParameterCount;
    }

    isVisibleFrom(classContext: NonPrimitiveType | undefined) {
        if (this.visibility == TokenType.keywordPublic || !classContext) return true;
        if (this.outerType == classContext || this.innerTypes.includes(classContext)) return true;
        if (this.visibility == TokenType.keywordProtected) {
            if (this.outerType && classContext.extendsImplements[(<NonPrimitiveType>this.outerType).pathAndIdentifier]) {
                return true;
            }
        }
        return false;
    }

    hasFullSpeedMethods(): boolean {
        return this.hasAnnotation(JavaAnnotations.Fullspeed.identifier);
    }

    hasAnnotation(identifier: string) {
        return this.annotations.find(a => a.identifier == identifier) != null;
    }

    getAnnotation(identifier: string) {
        return this.annotations.find(a => a.identifier == identifier);
    }

    setAnnotations(annotations: JavaAnnotation[]) {
        this.annotations = annotations;
    }

    createClassField(classType: NonPrimitiveType): JavaField {
        const cf = new JavaField("class", EmptyRange.instance, this.module, this, TokenType.keywordPublic);
        cf._isStatic = true;
        cf.template = "§1.type.getClassObject()";    
        cf.classEnum = <any>this;
        cf.documentation = JRC.classFieldComment;
        cf.hiddenWhenDebugging = true;
        let typeMap = new Map();
        typeMap.set(classType.genericTypeParameters[0], this);
        cf.type = new GenericVariantOfJavaClass(<JavaClass>classType, typeMap);
        return cf;
    }

    getArraySnippetEnding(dimension: number): string {
        let snippetEnding: string = ""; 
        for (let i = 0; i < dimension; i++) {
            snippetEnding += "[$" + i + "]";
        }
        return snippetEnding;
    }

} 