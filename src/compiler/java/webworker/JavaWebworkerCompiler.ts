import { WebworkerWrapper } from '../../../tools/webworker/WebworkerWrapper';
import { IMain } from '../../common/IMain';
import { EventManager } from '../../common/interpreter/EventManager';
import { CompilerEvents } from '../../common/language/Language';
import { WebworkerCompiler } from '../../common/language/WebworkerCompiler';
import { FileTypeManager } from '../../common/module/FileTypeManager';
import { JavaLibraryModuleManager } from '../module/libraries/JavaLibraryModuleManager';
import { PrimitiveStringClass } from '../runtime/system/javalang/PrimitiveStringClass';
import { SystemModule } from '../runtime/system/SystemModule';
import type { JavaWebWorker, JavaWebworkerResult } from './JavaWebworker';
import workerUrl from './JavaWebworker?worker&url';


export class JavaWebworkerCompiler implements WebworkerCompiler {

    javaWebworkerCompiler: JavaWebWorker;

    lastTimeCompilationTriggered: number = performance.now();
    lastWebworkerResult: JavaWebworkerResult;

    // timeoutSet: boolean = false;

    constructor(private main: IMain, private eventManager: EventManager<CompilerEvents>) {
        const worker = new Worker(workerUrl, { type: 'module' });
        this.javaWebworkerCompiler = new WebworkerWrapper<JavaWebWorker>(worker, this).getWrapper();

        let serializedLibraryModuleManager = new JavaLibraryModuleManager([], new SystemModule(PrimitiveStringClass)).getSerializedLibraryModuleManager();
        this.javaWebworkerCompiler.setLibraryModuleManager(serializedLibraryModuleManager);
    }

    startableMainModuleExists(): boolean {
        if(!this.lastWebworkerResult) return false;
        return this.lastWebworkerResult.mainStartableFileUniqueID != null;
    }

    onCompilationFinished() {
        this.copyCompileInformationToFiles().then((result: JavaWebworkerResult) => {
            this.eventManager.fire("compilationFinished", undefined);
        });
    }
    
    async copyCompileInformationToFiles(): Promise<JavaWebworkerResult> {
        let result = await this.javaWebworkerCompiler.getWebworkerResult();
        if(result) this.lastWebworkerResult = result;
        
        const currentWorkspace = this.main?.getCurrentWorkspace();
        if (!currentWorkspace) return result;
        let files = currentWorkspace.getFiles().filter(file => FileTypeManager.filenameToFileType(file.name).language == 'myJava');
        for (let file of files) {
            let fileStatus = result.fileStatusMap[file.uniqueID];
            if(fileStatus){
                file.isStartable = fileStatus.isStartable;
                file.errors = fileStatus.errors;
                file.colorInformation = fileStatus.colorInformation;
            } else {
                file.isStartable = false;
            }
        }

        return result;
    
    }

    triggerCompile() {

        // let delta = performance.now() - this.lastTimeCompilationTriggered;
        // if (delta >= 500) {
        //     this.lastTimeCompilationTriggered = performance.now();
            // if we're not in test mode:
            if (this.main.getInterpreter().isRunningOrPaused()) return;
            const currentWorkspace = this.main?.getCurrentWorkspace();
            if (!currentWorkspace) return;
            let files = currentWorkspace.getFiles().filter(file => FileTypeManager.filenameToFileType(file.name).language == 'myJava');

            this.javaWebworkerCompiler.setFiles(files.map(f => f.serialize()), this.main.getCurrentWorkspace()?.getCurrentlyEditedModule()?.file.uniqueID);
    //     } else if (!this.timeoutSet) {
    //         this.timeoutSet = true;
    //         window.setTimeout(() => {
    //             this.triggerCompile();
    //         }, 510 - delta);
    //     }
    }

}