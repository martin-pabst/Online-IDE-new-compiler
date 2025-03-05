import { BaseWebworker } from "../../../tools/webworker/BaseWebWorker";
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

    constructor(ctx: DedicatedWorkerGlobalScope){
        super(ctx);
        // debugger;
        this.compiler = new JavaCompiler(undefined, undefined);
        this.compiler.eventManager.on('compilationFinished', () => {
            this.caller.onCompilationFinished();
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
        this.compiler.triggerCompile();
    }
    


}

new JavaWebWorkerCompiler(ctx);

