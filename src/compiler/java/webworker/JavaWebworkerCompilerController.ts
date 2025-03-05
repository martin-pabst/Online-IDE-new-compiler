import { WebworkerWrapper } from '../../../tools/webworker/WebworkerWrapper';
import { IMain } from '../../common/IMain';
import { FileTypeManager } from '../../common/module/FileTypeManager';
import { JavaLibraryModuleManager } from '../module/libraries/JavaLibraryModuleManager';
import { PrimitiveStringClass } from '../runtime/system/javalang/PrimitiveStringClass';
import { SystemModule } from '../runtime/system/SystemModule';
import { JavaWebWorkerCompiler } from './JavaWebworkerCompiler';
import workerUrl from './JavaWebworkerCompiler?worker&url';


export class JavaWebworkerCompilerController {

    javaWebworkerCompiler: JavaWebWorkerCompiler;

    lastTimeCompilationTriggered: number = performance.now();
    timeoutSet: boolean = false;

    constructor(private main: IMain) {
        const worker = new Worker(workerUrl, { type: 'module' });
        this.javaWebworkerCompiler = new WebworkerWrapper<JavaWebWorkerCompiler>(worker, this).getWrapper();

        let serializedLibraryModuleManager = new JavaLibraryModuleManager([], new SystemModule(PrimitiveStringClass)).getSerializedLibraryModuleManager();
        this.javaWebworkerCompiler.setLibraryModuleManager(serializedLibraryModuleManager);
    }

    onCompilationFinished() {
        console.log("Compilation finished!");
    }

    triggerCompile() {
        let delta = performance.now() - this.lastTimeCompilationTriggered;
        if (delta >= 500) {
            this.lastTimeCompilationTriggered = performance.now();
            // if we're not in test mode:
            if (this.main.getInterpreter().isRunningOrPaused()) return;
            const currentWorkspace = this.main?.getCurrentWorkspace();
            if (!currentWorkspace) return;
            let files = currentWorkspace.getFiles().filter(file => FileTypeManager.filenameToFileType(file.name).language == 'myJava');

            this.javaWebworkerCompiler.setFiles(files.map(f => f.serialize()));
        } else if(!this.timeoutSet){
            this.timeoutSet = true;
            window.setTimeout(() => {
                this.triggerCompile();
            }, 510 - delta);
        }
    }

}