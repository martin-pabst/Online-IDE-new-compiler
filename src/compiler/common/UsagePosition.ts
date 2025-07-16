import { JavaMethod } from "../java/types/JavaMethod.ts";
import { BaseSymbol } from "./BaseSymbolTable";
import { CompilerFile } from "./module/CompilerFile";
import { Module } from "./module/Module";
import { Position } from "./range/Position";
import { IRange, Range } from "./range/Range";

export class UsagePosition {
    constructor(public symbol: BaseSymbol, public file: CompilerFile, public range: IRange) { }
}


/**
 *  - for onHover or code completion we have to search for symbols by given sourcecode position
 *  - for refactor->rename and to display all occurrences of a symbol we have to search for all
 *    usage positions for a given symbol
 */
export class UsageTracker {

    private lineToUsagePositionListMap: Map<number, UsagePosition[]> = new Map();

    private symbolToUsagePositionListMap: Map<BaseSymbol, UsagePosition[]> = new Map();

    private dependsOnModules: Map<Module, boolean> = new Map();

    constructor(public module: Module) {

    }

    clear() {
        this.lineToUsagePositionListMap.clear();
        this.symbolToUsagePositionListMap.clear();
        this.dependsOnModules.clear();
    }

    registerUsagePosition(symbol: BaseSymbol, file: CompilerFile, range: IRange) {
        if (!range) return;

        if (symbol instanceof JavaMethod) {

            if (symbol.implementedMethod) {
                if (symbol.implementedMethod.module["prepareSystemModule"]) {
                    this.module.systemSymbolsUsageTracker.registerUsagePosition(symbol.implementedMethod, this.module.file, range);
                } else {
                    this.module.compiledSymbolsUsageTracker.registerUsagePosition(symbol.implementedMethod, this.module.file, range);
                }
                return;
            }
        }


        let up = new UsagePosition(symbol, file, range);

        for (let line = range.startLineNumber; line <= range.endLineNumber; line++) {
            let list = this.lineToUsagePositionListMap.get(line);
            if (!list) {
                list = [];
                this.lineToUsagePositionListMap.set(line, list);
            }
            list.push(up);
        }

        let upList = this.symbolToUsagePositionListMap.get(symbol);
        if (!upList) {
            upList = [];
            this.symbolToUsagePositionListMap.set(symbol, upList);
        }
        upList.push(up);

        if (!symbol.module.isLibraryModule) {
            this.dependsOnModules.set(symbol.module, true);
            // let moduleUsage = this.dependsOnModules.get(symbol.module);
            // if(!moduleUsage){
            //     moduleUsage = new ModuleUsage(this, symbol.module);
            //     this.dependsOnModules.set(symbol.module, moduleUsage);
            // }
            // moduleUsage.addSymbol(symbol);
        }
    }

    findSymbolAtPosition(position: Position): UsagePosition | undefined {
        let usagePositionsOnLine = this.lineToUsagePositionListMap.get(position.lineNumber);
        if (!usagePositionsOnLine) return undefined;

        let bestUP: UsagePosition | undefined = undefined;

        for (let up of usagePositionsOnLine) {
            if (Range.containsPosition(up.range, position)){
                if(bestUP == null || up.range.endColumn - up.range.startColumn <= bestUP.range.endColumn - bestUP.range.startColumn){
                    bestUP = up;
                }
            }
        }

        return bestUP;
    }

    getUsagePositionsForSymbol(symbol: BaseSymbol) {
        return this.symbolToUsagePositionListMap.get(symbol);
    }

    getModulesWhichThisModuleDependsOn(): Module[] {
        let modules: Module[] = [];

        this.dependsOnModules.forEach((v, module) => { modules.push(module) });

        return modules;
    }

    getDependsOnModulesDebugInformation(): string {
        let str: string = "";

        this.dependsOnModules.forEach((moduleUsage, module) => {
            let mu: string = moduleUsage.toString();
            if (mu.length > 0) {
                str += "Depends on module " + module.file.name + ":\n";
                str += moduleUsage.toString();
            }
        })

        return str;
        // let str: string = chalk.red("");

        // this.dependsOnModules.forEach((moduleUsage, module) => {
        //     let mu: string = moduleUsage.toString();
        //     if(mu.length > 0){
        //         str += chalk.blue("Depends on module " + module.file.name + ":\n");
        //         str += chalk.white(moduleUsage.toString());
        //     }
        // })

        // return str;
    }

    existsDependencyToOtherDirtyModule(): boolean {

        for (let entry of this.dependsOnModules.entries()) {
            // TODO: analyze if used signatures are available

            if (entry[0].isDirty()) {
                return true;
            }
        }

        return false;
    }

    existsDependencyToOtherModuleWithErrors(): boolean {

        for (let entry of this.dependsOnModules.entries()) {
            // TODO: analyze if used signatures are available

            if (entry[0].dependsOnModuleWithErrorsFlag) {
                return true;
            }
        }

        return false;
    }

    existsDependencyToModule(module: Module) {
        return this.dependsOnModules.get(module) == true;
    }

}