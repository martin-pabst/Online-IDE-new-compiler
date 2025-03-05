import { BaseWebworker } from "../../../tools/webworker/BaseWebWorker";
import { Error } from "../../common/Error";
import { CompilerFile } from "../../common/module/CompilerFile";
import { JavaCompiler } from "../JavaCompiler";
import type { JavaWebworkerCompilerController } from "./JavaWebworkerCompilerController";
import { SerializedLibraryModuleManager, WebworkerJavaLibraryModuleManager } from "./WebworkerJavaLibraryModuleManager";

const ctx: DedicatedWorkerGlobalScope = self as any;
// Beware: additional code at end of this file!

export type SerializedCompilerFile = {
    name: string,
    uniqueID: number,
    text: string,
    localVersion: number,
    lastSavedVersion: number
}

export class JavaWebWorkerCompiler extends BaseWebworker<JavaWebworkerCompilerController> {

    compiler: JavaCompiler;
    timeCompilationStarted: number;

    constructor(ctx: DedicatedWorkerGlobalScope){
        super(ctx);
        // debugger;
        this.compiler = new JavaCompiler(undefined, undefined, true);
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
    
    getErrors(){
        let errors: Record<number, Error[]> = {};
        for(let m of this.compiler.moduleManager.modules){
            errors[m.file.uniqueID] = m.errors.map(e => {e.quickFix = undefined; return e;});
        }
        return errors;
    }

}

new JavaWebWorkerCompiler(ctx);

