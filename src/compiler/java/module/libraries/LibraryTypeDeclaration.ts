import { Klass } from "../../../common/interpreter/RuntimeConstants";

export type LMADeclarationType = "declaration" | "field" | "method";

export type LibraryClassDeclaration = {
    type: "declaration";
    signature: string;
    comment?: string | (() => string);
}

export type LibraryMethodDeclaration = {
    type: "method";
    signature: string;
    native?: Function;
    java?: Function;
    template?: string;
    constantFoldingFunction?: (...parms: any) => any;
    comment?: string | (() => string);
}

export type LibraryAttributeDeclaration = {
    type: "field";
    signature: string;
    nativeIdentifier?: string;
    template?: string;
    constantValue?: any;
    comment?: string | (() => string);
    hiddenWhenDebugging?: boolean
}

export type LibraryDeclaration = LibraryClassDeclaration | LibraryMethodDeclaration | LibraryAttributeDeclaration;

export type LibraryDeclarations = LibraryDeclaration[];

export type SerializedFunction = {
    parameters: string[],
    functionBody: string  // without {}
}

export function getSerializableCopyOfLibraryDeclarations(decl: LibraryDeclarations) {
    let ret = [];
    for (let d of decl) {
        let copy: LibraryDeclaration = Object.assign({}, d);
        if (typeof copy.comment == 'function') copy.comment = copy.comment();
        switch (d.type) {
            case "declaration":
                break;
            case "field":
                break;
            case "method":
                let cp = <LibraryMethodDeclaration>copy;
                //@ts-ignore
                if(d.native) cp.native = d.native.name;
                //@ts-ignore
                if(d.java) cp.java = d.java.name;
                if(d.constantFoldingFunction){
                    let functionAsText = d.constantFoldingFunction.toString();
                    // if(functionAsText.indexOf('Array.from') >= 0) debugger;
                    let sf: SerializedFunction = {
                        parameters: functionAsText.match(/^\(([a-zA-Z, ]*)\)/)[1].split(",").map(s => s.trim()),
                        functionBody: functionAsText.indexOf('{') >= 0 ? functionAsText.match(/{(.*)}/s)[1] : functionAsText.match(/=>(.*)/s)[1]
                    }
                    //@ts-ignore
                    cp.constantFoldingFunction = sf;
                }
                break;
        }
        ret.push(copy);
    }
    return ret;
}

export function deserializeLibraryDeclarations(lds: LibraryDeclaration[], klass: Klass) {
    for(let ld of lds){
        if(ld.type == "method"){
            if(ld.java){
                let identifier = <string><any>ld.java;
                let staticIndex = ld.signature.indexOf('static');
                if(staticIndex >= 0 && staticIndex <= ld.signature.indexOf("(")){
                    klass[identifier] = new Function(`return function ${identifier}(){}`)();
                    ld.java = klass[identifier];
                } else {
                    klass.prototype[identifier] = new Function(`return function ${identifier}(){}`)();
                    ld.java = klass.prototype[identifier];
                }
            }
            if(ld.native){
                let identifier = <string><any>ld.native;
                let staticIndex = ld.signature.indexOf('static');
                if(staticIndex >= 0 && staticIndex <= ld.signature.indexOf("(")){
                    klass[identifier] = new Function(`return function ${identifier}(){}`)();
                    ld.native = klass[identifier];
                } else {
                    klass.prototype[identifier] = new Function(`return function ${identifier}(){}`)();
                    ld.native = klass.prototype[identifier];
                }
            }
            if(ld.constantFoldingFunction){
                let cf = <SerializedFunction><any>ld.constantFoldingFunction;
                //@ts-ignore
                ld.constantFoldingFunction = new Function(...cf.parameters.concat([cf.functionBody]))
            }
        }
    }
    klass.__javaDeclarations = lds;
}