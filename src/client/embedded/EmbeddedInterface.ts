import type { IThrowable } from "../../compiler/common/interpreter/ThrowableType";
import type { RuntimeExceptionClass } from "../../compiler/java/runtime/system/javalang/RuntimeException";
import { GUIFile } from "../workspace/File";
import { MainEmbedded } from "./MainEmbedded";

export type ExitStatus = {
    exitCode: number;
    output: string;
    exception?: IThrowable;
    testProgress?: TestProgress;   
}

export type OnRunExitListener = (exitStatus: ExitStatus) => void;

interface IDEFileAccess {
    getName(): string;
    getText(): string;
}

interface IDEStatusAccess {
    registerOnRunExitListener(listener: OnRunExitListener): void;
}

interface SingleIDEAccess {
    getFiles(): IDEFileAccess[];
    registerOnRunExitListener(listener: OnRunExitListener): void;
}

interface OnlineIDEAccess {
    getIDE(id: string): SingleIDEAccess | undefined;
}


/** Implementation classes */

export class IDEFileAccessImpl implements IDEFileAccess {
    constructor(private file: GUIFile){

    }

    getName(): string {
        return this.file.name;
    }
    getText(): string {
        return this.file.getText();
    }

    
}

export class SingleIDEAccessImpl implements SingleIDEAccess {

    constructor(private ide: MainEmbedded, private enableFileAccess: boolean, private enableRunExitStatusAccess: boolean){

    }

    getFiles(): IDEFileAccess[] {
        if(!this.enableFileAccess){
            throw new Error("File access is not enabled for this IDE");
        }
        return this.ide.getCurrentWorkspace().getFiles().map(file => new IDEFileAccessImpl(file));        
    }

    registerOnRunExitListener(listener: OnRunExitListener): void {
        if(!this.enableRunExitStatusAccess){
            throw new Error("Run exit status access is not enabled for this IDE");
        }
        this.ide.registerOnRunExitListener(listener);
    }

}

export class OnlineIDEAccessImpl implements OnlineIDEAccess {
    
    private static  ideMap: Map<string, SingleIDEAccessImpl> = new Map();

    public static registerIDE(ide: MainEmbedded){
        OnlineIDEAccessImpl.ideMap.set(ide.config.id!,  
            new SingleIDEAccessImpl(ide, ide.config.enableFileAccess ?? false, ide.config.enableRunExitStatusAccess ?? false));
    }
    
    getIDE(id: string): SingleIDEAccess | undefined {
        return OnlineIDEAccessImpl.ideMap.get(id);
    }

}