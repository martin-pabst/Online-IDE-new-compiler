import { BaseSymbol } from "../../common/BaseSymbolTable";
import { Error } from "../../common/Error";
import { IRange } from "../../common/range/Range";
import { JCM } from "../language/JavaCompilerMessages";
import { JavaMethod } from "../types/JavaMethod";
import { JavaParameter } from "../types/JavaParameter";

class MissingStatements {

    symbols: BaseSymbol[];
    symbolReadHappened: boolean[];
    symbolWriteHappened: boolean[];

    returnHappened: boolean;
    children: MissingStatements[] = [];

    constructor(public parent?: MissingStatements){
        this.returnHappened = false;
        if(parent){
            this.symbols = parent.symbols.slice();
            this.symbolReadHappened = parent.symbolReadHappened.slice();
            this.symbolWriteHappened = parent.symbolWriteHappened.slice();
            parent.children.push(this);
        } else {
            this.symbols = [];
            this.symbolReadHappened = [];
            this.symbolWriteHappened = [];
        }
    }

    addSymbolDeclaration(symbol: BaseSymbol, withInitialization: boolean){
        this.symbols.push(symbol);
        this.symbolReadHappened.push(false);
        this.symbolWriteHappened.push(withInitialization);
    }

    onSymbolRead(symbol: BaseSymbol, range: IRange, errors: Error[]){
        let i = this.symbols.indexOf(symbol);
        if(i >= 0) {
            if(!this.symbolWriteHappened[i]){
                let error = JCM.variableNotInitialized(symbol.identifier);
                errors.push({message: error.message, id: error.id, level: "warning", range: range});
            }
            this.symbolReadHappened[i] = true;
        }
    }

    onSymbolWrite(symbol: BaseSymbol, range: IRange, errors: Error[]){
        let i = this.symbols.indexOf(symbol);
        if(i >= 0) {
            this.symbolWriteHappened[i] = true;
        }
    }

    onReturnHappened(){
        this.returnHappened = true;
    }

    onCloseBranch(errors: Error[]){

        for(let i = this.parent ? this.parent.symbolReadHappened.length : 0; i < this.symbolReadHappened.length; i++){
            if(!this.symbolReadHappened[i]){
                let error = JCM.noReadAccessForVariable(this.symbols[i].identifier)
                errors.push({message: error.message, id: error.id , level: "info", range: this.symbols[i].identifierRange});
            }
        }

    }

    /**
     * Only for debugging purposes
     */
    toString(){
        let result = "MissingStatements: ";
        if(this.symbols.length > 0){
            result += "Symbols: [";
            for(let i = 0; i < this.symbols.length; i++){
                result += this.symbols[i].identifier + (this.symbolReadHappened[i] ? "(read)" : "") + (this.symbolWriteHappened[i] ? "(write)" : "") + ", ";
            }
            result += "]";
        }
        if(this.returnHappened){
            result += " Return happened";
        } else {
            result += " Return not happened";
        }
        return result;
    }

}

export class MissingStatementManager {

    stack: MissingStatements[] = [];

    beginMethodBody(parameters: JavaParameter[]){
        this.stack = [];
        let missingStatements = new MissingStatements();
        for(let parameter of parameters) {
            if(parameter.trackMissingReadAccess){
                missingStatements.addSymbolDeclaration(parameter, true);
            }
        }
        this.stack.push(missingStatements);
    }

    openBranch(){
        this.stack.push(new MissingStatements(this.stack[this.stack.length - 1]));
    }

    closeBranch(errors: Error[]){
        this.stack.pop()?.onCloseBranch(errors);
    }

    endBranching(){

        let currentMissingStatements = this.stack[this.stack.length - 1];
        if(!currentMissingStatements) return;

        if(!currentMissingStatements.returnHappened){
            let returnHappenedInChildren = true;
            for(let child of currentMissingStatements.children){
                if(!child.returnHappened){
                    returnHappenedInChildren = false;
                    break;
                }
            }
            currentMissingStatements.returnHappened = returnHappenedInChildren;
        }

        for(let i = 0; i < currentMissingStatements.symbolWriteHappened.length; i++){
            if(!currentMissingStatements.symbolWriteHappened[i]){
                let writeHappenedInChildren = true;
                for(let child of currentMissingStatements.children){
                    if(!child.symbolWriteHappened[i]){
                        writeHappenedInChildren = false;
                        break;
                    }
                }
                currentMissingStatements.symbolWriteHappened[i] = writeHappenedInChildren;
            }
        }

        for(let i = 0; i < currentMissingStatements.symbolReadHappened.length; i++){
            if(!currentMissingStatements.symbolReadHappened[i]){
                let readHappenedInChildren = false;
                for(let child of currentMissingStatements.children){
                    if(child.symbolReadHappened[i]){
                        readHappenedInChildren = true;
                        break;
                    }
                }
                currentMissingStatements.symbolReadHappened[i] = readHappenedInChildren;
            }
        }

        currentMissingStatements.children = [];

    }

    endMethodBody(method: JavaMethod | undefined, errors: Error[]){
        let currentMissingStatements = this.stack[this.stack.length - 1];
        if(!currentMissingStatements) return;

        if(method && method.returnParameterType && method.returnParameterType.identifier != "void"){
            if(!currentMissingStatements.returnHappened && !method.isConstructor){
                let error = JCM.returnStatementMissing(method.identifier, method.returnParameterType.identifier);
                errors.push({message: error.message, id: error.id, level: "error", range: method.identifierRange});
            }
        }

        currentMissingStatements.onCloseBranch(errors);
    }

    addSymbolDeclaration(symbol: BaseSymbol, withInitialization: boolean){
        let currentMissingStatements = this.stack[this.stack.length - 1];
        if(currentMissingStatements) currentMissingStatements.addSymbolDeclaration(symbol, withInitialization);
    }

    onSymbolAccess(symbol: BaseSymbol, range: IRange, errors: Error[], isWrite: boolean){
        if(isWrite){
            this.onSymbolWrite(symbol, range, errors);
        } else {
            this.onSymbolRead(symbol, range, errors);
        }
    }

    onSymbolRead(symbol: BaseSymbol, range: IRange, errors: Error[]){
        let currentMissingStatements = this.stack[this.stack.length - 1];
        if(currentMissingStatements) currentMissingStatements.onSymbolRead(symbol, range, errors);
    }

    onSymbolWrite(symbol: BaseSymbol, range: IRange, errors: Error[]){
        let currentMissingStatements = this.stack[this.stack.length - 1];
        if(currentMissingStatements) currentMissingStatements.onSymbolWrite(symbol, range, errors);
    }

    onReturnHappened(){
        let currentMissingStatements = this.stack[this.stack.length - 1];
        if(currentMissingStatements) currentMissingStatements.onReturnHappened();
    }

    onCloseBranch(errors: Error[]){
        let currentMissingStatements = this.stack[this.stack.length - 1];
        if(currentMissingStatements) currentMissingStatements.onCloseBranch(errors);
    }

    hasReturnHappened(){
        let currentMissingStatements = this.stack[this.stack.length - 1];
        if(currentMissingStatements) return currentMissingStatements.returnHappened;
    }

}