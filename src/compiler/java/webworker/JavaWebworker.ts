import { BaseWebworker } from "../../../tools/webworker/BaseWebWorker";
import { Error } from "../../common/Error";
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

export type FileStatus = {
    isStartable: boolean,
    errors: Error[],
    colorInformation: monaco.languages.IColorInformation[];
    
}

export class JavaWebWorker extends BaseWebworker<JavaWebworkerCompiler> {

    compiler: JavaCompiler;
    timeCompilationStarted: number;

    constructor(ctx: DedicatedWorkerGlobalScope){
        super(ctx);
        // debugger;
        this.compiler = new JavaCompiler(undefined, true);
        this.compiler.eventManager.on('compilationFinished', () => {
            this.caller.onCompilationFinished();
            // console.log("Compilation took " + (Math.round(performance.now() - this.timeCompilationStarted)) + " ms");
        })
        
        this.run();
    }
    
    async run(){
        
    }
    
    setLibraryModuleManager(serializedLibraryModuleManager: SerializedLibraryModuleManager){
        let lmm = new WebworkerJavaLibraryModuleManager(serializedLibraryModuleManager);
        this.compiler.setLibraryModuleManager(lmm);
    }
    
    setFiles(serializedCompilerFile: SerializedCompilerFile[]){
        let compilerFiles: CompilerFile[] = serializedCompilerFile.map(scf => CompilerFile.deserialize(scf));
        this.compiler.setFiles(compilerFiles);
        this.timeCompilationStarted = performance.now();
        this.compiler.triggerCompile();
    }
    
    getFileStatus(){
        let errors: Record<number, FileStatus> = {};
        for(let m of this.compiler.moduleManager.modules){
            errors[m.file.uniqueID] = {
                errors: m.errors.map(e => {e.quickFix = undefined; return e;}),
                isStartable: m.file.isStartable,
                colorInformation: m.colorInformation
            } 
        }
        return errors;
    }

}

new JavaWebWorker(ctx);

