import { Treeview } from "../../../tools/components/treeview/Treeview";
import { JavaSymbolTable } from "../../java/codegenerator/JavaSymbolTable";
import { BaseSymbol, BaseSymbolTable } from "../BaseSymbolTable";
import { IPosition } from "../range/Position";
import { Debugger } from "./Debugger";
import { DebuggerSymbolEntry, StackElementDebuggerEntry, StaticFieldDebuggerEntry } from "./DebuggerSymbolEntry";
import { DebuggerWatchEntry } from "./DebuggerWatchEntry";

export class SymbolTableSection {

    children: StackElementDebuggerEntry[] = [];
    staticFieldChildren: StaticFieldDebuggerEntry[] = [];

    constructor(public treeview: Treeview<DebuggerSymbolEntry, DebuggerSymbolEntry>,
        public symbolTable: BaseSymbolTable, public debugger1: Debugger) {

        // divToRenderInto.prepend(this.treeview.outerDiv);

        this.reReadSymbolTable();
        
    }
    
    reReadSymbolTable(){
        let oldChildren: StackElementDebuggerEntry[] = this.children.slice();
        this.children = [];

        let i = 0;
        let symbols = this.symbolTable.getSymbolsOnStackframeForDebugger();
        for (let symbol of symbols) {
            if(symbol.hiddenWhenDebugging) continue;

            if(oldChildren.length > i){
                let oldChild = oldChildren[i++];
                if(oldChild.identifier == symbol.identifier){
                    this.children.push(oldChild);
                    continue;
                }
            }

            this.children.push(new StackElementDebuggerEntry(
                this, symbol
            ));
        }
    
        if(this.symbolTable instanceof JavaSymbolTable && this.symbolTable.classContext?.isMainClass && this.symbolTable.classContext != this.symbolTable.parent?.classContext){
            for(let field of this.symbolTable.classContext.getFields().filter(field => field.isStatic() && !field.hiddenWhenDebugging)){
                this.staticFieldChildren.push(new StaticFieldDebuggerEntry(this, field));
            }
        }
        
    }

    renewValues(stack: any[], stackBase: number, position: IPosition) {

        this.children.forEach(c => c.fetchValueFromStackAndRender(stack, stackBase, position));
        this.staticFieldChildren.forEach(c => c.fetchValueAndRender(position, this.debugger1.main.getInterpreter()));

    }

    attachNodesToTreeview() {
        for(let child of this.children){
            child.attachNodesToTreeview();
        }
        for(let child of this.staticFieldChildren){
            child.attachNodesToTreeview();
        }
    }

}