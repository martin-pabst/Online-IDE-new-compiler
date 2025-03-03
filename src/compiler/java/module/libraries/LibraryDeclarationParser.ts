import { Helpers, Klass, StepParams } from "../../../common/interpreter/StepFunction";
import { EmptyRange, IRange } from "../../../common/range/Range";
import { TokenType } from "../../TokenType";
import { EnumClass } from "../../runtime/system/javalang/EnumClass";
import { PrimitiveType } from "../../runtime/system/primitiveTypes/PrimitiveType";
import { JavaArrayType } from "../../types/JavaArrayType";
import { JavaField } from "../../types/JavaField";
import { GenericTypeParameters, GenericTypeParameter } from "../../types/GenericTypeParameter";
import { JavaClass } from "../../types/JavaClass";
import { JavaEnum } from "../../types/JavaEnum";
import { JavaInterface } from "../../types/JavaInterface";
import { JavaType } from "../../types/JavaType";
import { GenericMethod, JavaMethod } from "../../types/JavaMethod";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { JavaParameter } from "../../types/JavaParameter";
import { Visibility } from "../../types/Visibility";
import { JavaBaseModule } from "../JavaBaseModule";
import { JavaTypeStore } from "../JavaTypeStore";
import { LibraryAttributeDeclaration, LibraryMethodDeclaration, LibraryMethodOrAttributeDeclaration } from "./DeclareType";
import { LibraryKlassType, JavaTypeMap, JavaLibraryModule } from "./JavaLibraryModule";
import { LdToken, LibraryDeclarationLexer } from "./LibraryDeclarationLexer";
import { SystemModule } from "../../runtime/system/SystemModule.ts";
import { WebworkerSystemModule } from "../../webworker/WebworkerSystemModule.ts";

type ModifiersAndType = {
    visibility: Visibility,
    final: boolean,
    static: boolean,
    abstract: boolean,
    default: boolean,
    type: TokenType.keywordClass | TokenType.keywordInterface | TokenType.keywordEnum
}

export class LibraryDeclarationParser extends LibraryDeclarationLexer {

    static endOfSourcecodeToken: LdToken = { tt: TokenType.endofSourcecode, value: "" };
    static visibilityTokens: TokenType[] = [TokenType.keywordPublic, TokenType.keywordProtected, TokenType.keywordPrivate];

    static nullRange: IRange = { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 };

    tokenList: LdToken[] = [];
    pos: number = 0;
    cct: LdToken = LibraryDeclarationParser.endOfSourcecodeToken;
    tt: TokenType = TokenType.endofSourcecode;
    currentDeclaration: string = "";
    currentClassIdentifier: string = "";

    currentTypeStore: JavaTypeStore = new JavaTypeStore();
    genericParameterMapStack: Record<string, GenericTypeParameter>[] = [];

    startBracketList: TokenType[] = [TokenType.leftBracket, TokenType.leftCurlyBracket, TokenType.leftSquareBracket, TokenType.lower];
    endBracketList: TokenType[] = [TokenType.rightBracket, TokenType.rightCurlyBracket, TokenType.rightSquareBracket, TokenType.greater];

    constructor(public systemModule: SystemModule | WebworkerSystemModule) {
        super();
    }

    parseClassOrEnumOrInterfaceDeclarationWithoutGenerics(klass: Klass & LibraryKlassType, module: JavaBaseModule): NonPrimitiveType {

        let javaClassDeclaration = klass.__javaDeclarations?.find(decl => decl.type == "declaration");

        if (!javaClassDeclaration) {
            console.log("Error parsing library class " + klass.name + ": missing java class declaration.");
        }

        let signature = javaClassDeclaration ? javaClassDeclaration.signature : "public class " + klass.name + " extends Object";

        this.initTokens(signature);

        let modifiersAndType = this.parseModifiersAndType(true);

        let path: string[] = [];
        do {
            this.expect(TokenType.identifier, false);
            path.push(this.cct.value);
            this.nextToken();
        } while(this.comesToken(TokenType.dot, true));

        let pathAndIdentifier = path.join(".");
        let identifier: string = path.pop()!;
        this.currentClassIdentifier = identifier;

        let parentPath = path.length > 0 ? path.join(".") : undefined;

        let npt: NonPrimitiveType;

        switch (modifiersAndType.type) {
            case TokenType.keywordClass:
                npt = new JavaClass(identifier, LibraryDeclarationParser.nullRange, "", module);
                npt.isLibraryType = true;
                let npt1 = <JavaClass>npt;
                npt1.runtimeClass = klass;
                npt1.isStatic = modifiersAndType.static;
                npt1.isFinal = modifiersAndType.final;
                npt1._isAbstract = modifiersAndType.abstract;
                npt1.pathAndIdentifier = pathAndIdentifier;
                if(klass["isPrimitiveTypeWrapper"]) npt.isPrimitiveTypeWrapper = true;
                break;
            case TokenType.keywordInterface:
                npt = new JavaInterface(identifier, LibraryDeclarationParser.nullRange, "", module);
                npt.isLibraryType = true;
                npt.pathAndIdentifier = pathAndIdentifier;
                npt.runtimeClass = klass;
                break;
            case TokenType.keywordEnum:
                npt = new JavaEnum(identifier, LibraryDeclarationParser.nullRange, "", module, Object.getPrototypeOf(Object.getPrototypeOf(klass)).type);
                npt.isLibraryType = true;
                let npt2 = <JavaEnum>npt;
                npt2.runtimeClass = klass;
                npt2.pathAndIdentifier = pathAndIdentifier;
                npt2.baseEnumClass = <any>this.findType("Enum");
                this.initEnumValues(npt2, klass, module);
                npt2.addValuesMethod(klass, this.systemModule.types.find(type => type.identifier == "string") as PrimitiveType);
                break;
        }

        klass.type = npt;
        npt.documentation = javaClassDeclaration?.comment;

        if(parentPath){
            let parent = this.currentTypeStore.getType(parentPath);
            if(parent){
                npt.outerType = parent as JavaClass;
            }
        }


        return npt;
    }

    parseClassOrInterfaceDeclarationGenericsAndExtendsImplements(klass: Klass & LibraryKlassType, typestore: JavaTypeStore, module: JavaBaseModule) {

        this.currentClassIdentifier = klass.name;

        this.currentTypeStore = typestore;

        let javaClassDeclaration = klass.__javaDeclarations?.find(decl => decl.type == "declaration");

        if (!javaClassDeclaration) {
            console.log("Error parsing library class " + klass.name + ": missing java class declaration.");
        }

        let signature = javaClassDeclaration ? javaClassDeclaration.signature : "public class " + klass.name + " extends Object";

        this.initTokens(signature);

        this.skipTill([TokenType.lower, TokenType.keywordExtends, TokenType.keywordImplements], false);

        let npt = klass.type as JavaClass | JavaInterface | JavaEnum;

        if (this.comesToken(TokenType.lower, false)) {
            if (npt instanceof JavaEnum) {
                this.pushError("Ein enum-Typ kann nicht generisch sein.");
                this.skipTill([TokenType.keywordExtends, TokenType.keywordImplements], false);
            } else {
                npt.genericTypeParameters = this.parseGenericParameters(module);
            }
        }

        while (this.comesToken([TokenType.keywordExtends, TokenType.keywordImplements], false)) {
            if (npt instanceof JavaEnum) {
                this.pushError("Ein enum-Typ kann nicht generisch sein.");
                this.skipTill([TokenType.keywordExtends, TokenType.keywordImplements], false);
            } else {
                let npt1: JavaClass | JavaInterface = <any>npt;
                let tt = this.tt;
                this.nextToken();
                switch (tt) {
                    case TokenType.keywordExtends:
                        let types = this.parseCommaSeparatedTypeList(module);
                        if (types.length > 0) {
                            if (npt1 instanceof JavaClass) {
                                npt1.setExtends(<any>types[0])
                            } else {
                                npt1.addExtends(<any>types);
                            }
                        }
                        break;
                    case TokenType.keywordImplements:
                        let types1 = this.parseCommaSeparatedTypeList(module)
                        if (types1.length > 0) {
                            if (npt1 instanceof JavaClass) {
                                npt1.addImplements(<any>types1);
                            }
                        }
                        break;
                }
            }

        }

        if(npt instanceof JavaClass && !npt.getExtends() && npt.identifier != "Object"){
            npt.setExtends(<JavaClass>this.currentTypeStore.getType("Object"));
        }

    }

    parseCommaSeparatedTypeList(module: JavaBaseModule): JavaType[] {
        let types: JavaType[] = [];
        do {
            types.push(this.parseType(module))
        } while (this.comesToken(TokenType.comma, true));
        return types;
    }

    parseGenericParameters(module: JavaBaseModule): GenericTypeParameters {
        if (!this.comesToken(TokenType.lower, true)) return [];
        let startPos = this.pos;
        if (!this.comesToken(TokenType.identifier, false)) {
            this.pushError("Lese Definition eines generischen Parameters. Nach dem < wird ein Bezeichner erwartet.");
            return [];
        }

        let gi: GenericTypeParameters = [];

        let currentGenericParameterMap = this.genericParameterMapStack[this.genericParameterMapStack.length - 1];

        // first step: only collect identifiers because generic parameters can reference each other recursively
        do {

            let identifier = <string>this.cct.value;
            let gp = new GenericTypeParameter(identifier, module, LibraryDeclarationParser.nullRange, [], undefined);
            gi.push(gp);
            currentGenericParameterMap[identifier] = gp;
            this.nextToken();
            this.skipSymmetricBracketsUntil([TokenType.comma, TokenType.greater])

        } while (this.comesToken(TokenType.comma, true))

        this.expect(TokenType.greater, true);

        // second step: parse generic parameters with their upper/lower bounds
        this.pos = startPos - 1;
        this.nextToken();

        do {
            this.parseGenericParameterDeclaration(module)
        } while (this.comesToken(TokenType.comma, true));

        this.expect(TokenType.greater, true);

        return gi;
    }



    skipSymmetricBracketsUntil(tt: TokenType[]) {
        let bracketCounter: number = 0;

        while (this.pos < this.tokenList.length && (bracketCounter > 0 || tt.indexOf(this.tt) < 0)) {
            if (this.startBracketList.indexOf(this.tt) >= 0) {
                bracketCounter++;
            } else if (this.endBracketList.indexOf(this.tt) >= 0) {
                bracketCounter--;
            }
            this.nextToken();
        }

    }


    parseGenericParameterDeclaration(module: JavaBaseModule): GenericTypeParameter {
        let identifier = this.expectIdentifier();
        let upperBounds: (JavaClass | JavaInterface)[] = [];
        let lowerBound: JavaClass | undefined = undefined;

        while (this.comesToken([TokenType.keywordExtends, TokenType.keywordImplements], false)) {
            let tt = this.tt;
            this.nextToken();
            switch (tt) {
                case TokenType.keywordExtends:
                    do {
                        upperBounds.push(<any>this.parseType(module));
                    } while (this.comesToken(TokenType.ampersand, true))
                    break;
                case TokenType.keywordImplements:
                    lowerBound = <any>this.parseType(module);
                    break;
            }
        }

        let currentGenericParameterMap = this.genericParameterMapStack[this.genericParameterMapStack.length - 1];
        let gp = currentGenericParameterMap[identifier];
        gp.upperBounds = upperBounds;
        gp.lowerBound = lowerBound;

        return gp;
    }

    /**
     * int, int[][], HashMap<Integer, Boolean>[]
     *
     */
    parseType(module: JavaBaseModule): JavaType {
        let id = this.expectIdentifier();
        while(this.comesToken(TokenType.dot, true)){
            id += "." + this.expectIdentifier();
        }

        if (id == "") return this.currentTypeStore.getType("void")!;

        if (id == "?") {
            let gt = new GenericTypeParameter(id, module, EmptyRange.instance);
            gt.isWildcard = true;
            return gt;
        }

        let type = this.findType(id);

        if (this.comesToken(TokenType.lower, true)) {
            if ((type.genericTypeParameters?.length || 0) == 0) {
                this.pushError("Der Typ " + type.identifier + " ist nicht generisch.");
                this.skipTill(TokenType.greater, true);
            } else {
                let typeMap: Map<GenericTypeParameter, JavaType> = new Map();
                for (let gtp of type.genericTypeParameters!) {
                    let t = this.parseType(module);

                    if (t instanceof GenericTypeParameter && t.isWildcard) {
                        if (this.comesToken(TokenType.keywordExtends, true)) {
                            t.upperBounds.push(<any>this.parseType(module));
                        }
                        if (this.comesToken(TokenType.keywordSuper, true)) {
                            t.lowerBound = <any>this.parseType(module);
                        }
                    }

                    typeMap.set(gtp, t)
                    if (this.comesToken(TokenType.greater, false)) break;
                    this.expect(TokenType.comma, true);
                }
                this.expect(TokenType.greater, true);
                type = type.getCopyWithConcreteType(typeMap);
            }
        }

        while (this.comesToken(TokenType.leftSquareBracket, true)) {
            if (type instanceof JavaArrayType) {
                type.dimension++;
            } else {
                type = new JavaArrayType(type, 1, module, LibraryDeclarationParser.nullRange);
            }
            this.expect(TokenType.rightSquareBracket, true);
        }

        return type;
    }

    findType(id: string): JavaType {

        let type: JavaType = undefined;

        for(let i = this.genericParameterMapStack.length - 1; i >= 0; i--){
            const gpm = this.genericParameterMapStack[i];
            type = gpm[id];
            if (type) return type;
        }

        type = this.currentTypeStore.getType(id);
        if (type) return type;


        this.pushError("Konnte den Typ " + id + " nicht finden.");

        return this.currentTypeStore.getType("void")!;
    }

    expectIdentifier(): string {
        if (this.comesToken(TokenType.identifier, false)) {
            let id: string = this.cct.value;
            this.nextToken();
            return id;
        }
        this.pushError("Ein Bezeichner wird erwartet, gefunden wurde " + this.cct.value + ".");
        return "";
    }

    parseModifiersAndType(withType: boolean): ModifiersAndType {
        let m: ModifiersAndType = {
            visibility: TokenType.keywordPublic,
            static: false,
            final: false,
            abstract: false,
            default: false,
            type: TokenType.keywordClass
        }

        let typeMissing: boolean = true;

        while (!this.isEnd()) {
            switch (this.tt) {
                case TokenType.keywordPublic:
                case TokenType.keywordProtected:
                case TokenType.keywordPrivate:
                    m.visibility = this.tt;
                    break;
                case TokenType.keywordStatic:
                    m.static = true;
                    break;
                case TokenType.keywordFinal:
                    m.final = true;
                    break;
                case TokenType.keywordAbstract:
                    m.abstract = true;
                    break;
                case TokenType.keywordDefault:
                    m.default = true;
                    break;
                case TokenType.keywordClass:
                case TokenType.keywordInterface:
                case TokenType.keywordEnum:
                    m.type = this.tt;
                    typeMissing = false;
                    break;
                default:
                    {
                        if (typeMissing && withType) this.pushError("Es fehlt der Typ (class, interface oder enum).")
                        return m;
                    }
            }
            this.nextToken();
        }

        return m;
    }

    initTokens(declaration: string) {
        this.tokenList = this.lex(declaration);
        this.pos = 0;
        this.cct = this.tokenList[0];
        this.tt = this.cct.tt;
        this.currentDeclaration = declaration;
    }

    comesToken(tt: TokenType | TokenType[], skip: boolean) {
        if (!Array.isArray(tt)) tt = [tt];

        if (tt.indexOf(this.tt) >= 0) {
            if (skip) this.nextToken();
            return true;
        }

        return false;
    }

    skipTill(tt: TokenType | TokenType[], skipIfFound: boolean) {
        if (!Array.isArray(tt)) tt = [tt];

        while (!this.isEnd() && tt.indexOf(this.tt) < 0) {
            this.nextToken();
        }

        if (skipIfFound) this.nextToken();

        return;
    }

    nextToken() {
        this.pos++;
        if (this.pos >= this.tokenList.length) {
            this.cct = LibraryDeclarationParser.endOfSourcecodeToken;
            this.tt = this.cct.tt;
            return;
        }
        this.cct = this.tokenList[this.pos];
        this.tt = this.cct.tt;
    }

    isEnd(): boolean {
        return this.pos >= this.tokenList.length;
    }

    pushError(error: string) {
         console.log("Error parsing library declaration for class " + this.currentClassIdentifier + " (" + error + "): " + this.currentDeclaration); 
    } 

    expect(tt: TokenType, skip: boolean): boolean {
        if (tt == this.tt) {
            if (skip) this.nextToken();
            return true;
        }
        this.pushError("Erwartet wird " + TokenType[tt] + ", gefunden wurde: " + this.cct.value);
        return false;

    }

    /**
     * Parse fields and Methods
     */

    parseFieldsAndMethods(klass: Klass & LibraryKlassType, typestore: JavaTypeStore, module: JavaBaseModule) {

        this.currentTypeStore = typestore;

        let javaClassDeclaration = klass.__javaDeclarations;

        if (!javaClassDeclaration) {
            return;
        }

        this.currentClassIdentifier = klass.name;

        for (let decl of javaClassDeclaration.filter(cd => cd.type == "field" || cd.type == "method")) {
            this.initTokens(decl.signature);
            this.parseFieldOrMethod(klass, module, decl);
        }

        this.insertClassField(klass);
        
    }
    
    insertClassField(klass: Klass & LibraryKlassType){
        let npt = <JavaClass | JavaInterface | JavaEnum>klass.type;
        
        if(npt instanceof JavaClass || npt instanceof JavaEnum){
            let classType = this.currentTypeStore.getType("Class");
            if(classType){
                npt.fields.push(npt.createClassField(<NonPrimitiveType>classType));
            }
        }
    }


    parseFieldOrMethod(klass: Klass & LibraryKlassType, module: JavaBaseModule, decl: LibraryMethodOrAttributeDeclaration) {

        this.genericParameterMapStack.push({}); 

        let klassType = <JavaClass | JavaInterface | JavaEnum>klass.type;

        // example: "public <E> E testMethod(List<? extends E> li, E element)"
        let modifiers = this.parseModifiersAndType(false);

        // if(decl.signature.indexOf('getCollidingShapes') >= 0){
        //     debugger;
        // }

        let genericParameters = this.parseGenericParameters(module);

        let type = this.parseType(module);

        let isConstructor: boolean = type == klassType && this.comesToken(TokenType.leftBracket, false);

        let identifier = isConstructor ? klassType.identifier : this.expectIdentifier();

        if (decl.type == "method") {
            this.comesToken(TokenType.leftBracket, true);
            // method
            let m = genericParameters.length == 0 ?
                new JavaMethod(identifier, EmptyRange.instance, module, modifiers.visibility) :
                new GenericMethod(identifier, EmptyRange.instance, module, modifiers.visibility, genericParameters);
            m.returnParameterType = type;
            m.isConstructor = isConstructor;
            m.documentation = decl.comment;

            if (!this.comesToken(TokenType.rightBracket, false)) {
                do {
                    let isFinal = this.comesToken(TokenType.keywordFinal, true);
                    let type = this.parseType(module);
                    let isEllipsis = this.comesToken(TokenType.ellipsis, true);
                    if (isEllipsis) type = new JavaArrayType(type, 1, module, EmptyRange.instance);
                    let id = this.expectIdentifier();
                    m.parameters.push(new JavaParameter(id, EmptyRange.instance, module, type, isFinal, isEllipsis, false));
                } while (this.comesToken(TokenType.comma, true));
            }

            m.isStatic = modifiers.static;
            m.isFinal = modifiers.final;
            m.isAbstract = modifiers.abstract;
            m.classEnumInterface = klassType;
            m.isDefault = modifiers.default;

            this.expect(TokenType.rightBracket, true);
            klassType.methods.push(m);

            let mdecl = <LibraryMethodDeclaration>decl;
            let hasReturnValue: boolean = m.returnParameterType?.identifier != 'void';

            if (mdecl.native) {
                let realName: string = mdecl.native.name;
                if (m.isStatic) {
                    klass[m.getInternalName("native")] = mdecl.native;
                } else {
                    klass.prototype[m.getInternalName("native")] = mdecl.native;
                }

                if (!mdecl.java) {
                    let parameterNames = m.parameters.map(p => p.identifier);

                    let body: string;
                    if (m.isConstructor) {
                        body = `
                            this.${realName}(${parameterNames.join(", ")});
                            ${Helpers.threadStack}.push(this);
                        `
                        parameterNames.unshift('callback1');
                        parameterNames.unshift('__t');
                        parameterNames.push(body);

                        klass.prototype[m.getInternalName("java")] = new Function(...parameterNames);
                    } else if (m.isStatic) {
                        body = `
                            ${hasReturnValue ? 'let __returnValue = ' : ''}this.${realName}(${parameterNames.join(", ")});
                            ${hasReturnValue ? `${Helpers.threadStack}.push(__returnValue);` : ''}
                        `
                        parameterNames.unshift('__t');
                        parameterNames.push(body);

                        klass[m.getInternalName("java")] = new Function(...parameterNames);
                    } else {
                        body = `
                            ${hasReturnValue ? 'let __returnValue = ' : ''}this.${realName}(${parameterNames.join(", ")});
                            ${hasReturnValue ? `${Helpers.threadStack}.push(__returnValue);` : ''}
                            if(__callback)__callback();
                        `
                        parameterNames.unshift('__callback');
                        parameterNames.unshift('__t');
                        parameterNames.push(body);

                        klass.prototype[m.getInternalName("java")] = new Function(...parameterNames);
                    }

                }
                m.hasImplementationWithNativeCallingConvention = true;
            }

            if (mdecl.java) {
                if (klassType instanceof JavaInterface || m.isAbstract) {
                    if (mdecl.java.name != m.getInternalName("java")) {
                        console.log(`${LibraryDeclarationParser.name}: Method ${mdecl.java.name} in class/enum/interface ${klassType.identifier} should have identifier ${m.getInternalName("java")}.`);
                    }
                } else {
                    if (m.isStatic) {
                        klass[m.getInternalName("java")] = mdecl.java;
                    } else {
                        klass.prototype[m.getInternalName("java")] = mdecl.java;
                    }
                }
            }

            if (mdecl.template) {
                m.template = mdecl.template;
                if(m.template.indexOf("&") >= 0){
                    console.log("WARNING: Template '" + m.template + "' contains letter & instead of §!")
                }
            }

            if (mdecl.constantFoldingFunction) {
                m.constantFoldingFunction = mdecl.constantFoldingFunction;
            }

        } else {
            let adecl = <LibraryAttributeDeclaration>decl;
            // attribute
            let a = new JavaField(identifier, EmptyRange.instance, module, type, modifiers.visibility);
            a.hiddenWhenDebugging = (<LibraryAttributeDeclaration> decl).hiddenWhenDebugging;
            a._isStatic = modifiers.static;
            a._isFinal = modifiers.final;
            a.classEnum = klassType;
            a.documentation = adecl.comment;

            a.internalName = adecl.nativeIdentifier || identifier;
            a.template = adecl.template;
            if (typeof adecl.constantValue !== "undefined") {
                a.initialValue = adecl.constantValue;
                a.initialValueIsConstant = true;
                klass[a.internalName] = adecl.constantValue;
            }

            klassType.fields.push(a);

        }

        this.genericParameterMapStack.pop();

    }

    initEnumValues(enumType: JavaEnum, klass: Klass & LibraryKlassType, module: JavaBaseModule) {
        let values: EnumClass[] = klass.values;
        for(let value of values){
            // attribute
            let a = new JavaField(value.name, EmptyRange.instance, module, enumType, TokenType.keywordPublic);
            a._isStatic = true;
            a._isFinal = true;
            a.classEnum = enumType;
            a.initialValueIsConstant = true;
            a.initialValue = value;

            enumType.fields.push(a);
            klass[a.getInternalName()] = value;
        }
    }

}

