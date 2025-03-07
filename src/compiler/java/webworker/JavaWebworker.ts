import { BaseWebworker } from "../../../tools/webworker/BaseWebWorker";
import { Error } from "../../common/Error";
import type { Executable } from "../../common/Executable.ts";
import { EventManager } from "../../common/interpreter/EventManager.ts";
import { CompilerEvents } from "../../common/language/Language.ts";
import { CompilerFile } from "../../common/module/CompilerFile";
import { JavaCompiler } from "../JavaCompiler";
import type { JavaWebworkerCompiler } from "./JavaWebworkerCompiler";
import { SerializedLibraryModuleManager, WebworkerJavaLibraryModuleManager } from "./WebworkerJavaLibraryModuleManager";
import type * as monaco from 'monaco-editor'

const ctx: DedicatedWorkerGlobalScope = self as any;
// Beware: additional code at end of this file!

export type SerializedCompilerFile = {
    name: string,
    uniqueID: number,
    text: string,
    localVersion: number,
    lastSavedVersion: number
}

export type JavaWebworkerResult = {
    fileStatusMap: Record<number, JavaWebworkerFileStatus>,
    mainStartableFileUniqueID: number | undefined
}

export type JavaWebworkerFileStatus = {
    isStartable: boolean,
    errors: Error[],
    colorInformation: monaco.languages.IColorInformation[]
}

export class JavaWebWorker extends BaseWebworker<JavaWebworkerCompiler> {

    compiler: JavaCompiler;
    timeCompilationStarted: number;
    currentlyEditedFileUniqueID: number | undefined; // -> comes from main

    mainStartableFileUniqueID: number | undefined;  // -> is determined by compiler

    eventManager: EventManager<CompilerEvents> = new EventManager();

    constructor(ctx: DedicatedWorkerGlobalScope){
        super(ctx);
        // debugger;
        this.compiler = new JavaCompiler(undefined, true, this.eventManager);
        this.eventManager.on('compilationFinished', () => {
            this.onCompilationFinished();
            // console.log("Compilation took " + (Math.round(performance.now() - this.timeCompilationStarted)) + " ms");
        })

        this.eventManager.on('compilationFinished', (executable: Executable | undefined) => {
            this.mainStartableFileUniqueID = undefined;
            if(executable){
                if(this.currentlyEditedFileUniqueID){
                    let currentlyEditedModule = this.compiler.findModuleByFileUniqueID(this.currentlyEditedFileUniqueID);
                    this.mainStartableFileUniqueID = executable?.findStartableModule(currentlyEditedModule)?.file.uniqueID;
                }                
            } 
        })
    }
    
    onCompilationFinished(){
        this.caller.onCompilationFinished();
    }
    
    setLibraryModuleManager(serializedLibraryModuleManager: SerializedLibraryModuleManager){
        let lmm = new WebworkerJavaLibraryModuleManager(serializedLibraryModuleManager);
        this.compiler.setLibraryModuleManager(lmm);
    }
    
    setFiles(serializedCompilerFile: SerializedCompilerFile[], currentlyEditedFileUniqueID: number|undefined){
        let compilerFiles: CompilerFile[] = serializedCompilerFile.map(scf => CompilerFile.deserialize(scf));
        this.compiler.setFiles(compilerFiles);
        this.timeCompilationStarted = performance.now();
        this.currentlyEditedFileUniqueID = currentlyEditedFileUniqueID;
        this.compiler.triggerCompile();
    }
    
    getWebworkerResult(): JavaWebworkerResult {
        let fileStatusMap: Record<number, JavaWebworkerFileStatus> = {};
        for(let m of this.compiler.moduleManager.modules){
            fileStatusMap[m.file.uniqueID] = {
                errors: m.errors.map(e => {e.quickFix = undefined; return e;}),
                isStartable: m.file.isStartable,
                colorInformation: m.colorInformation
            } 
        }

        return {
            fileStatusMap: fileStatusMap,
            mainStartableFileUniqueID: this.mainStartableFileUniqueID
        }

    }

}

new JavaWebWorker(ctx);

