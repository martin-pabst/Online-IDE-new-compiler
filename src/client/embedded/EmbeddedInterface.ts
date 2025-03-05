import { GUIFile } from "../workspace/GUIFile";
import { MainEmbedded } from "./MainEmbedded";

interface IDEFileAccess {
    getName(): string;
    getText(): string;
}

interface SingleIDEAccess {
    getFiles(): IDEFileAccess[];
}

interface OnlineIDEAccess {
    getIDE(id: string): SingleIDEAccess | undefined;
}


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

    constructor(private ide: MainEmbedded){

    }

    getFiles(): IDEFileAccess[] {
        return this.ide.getCurrentWorkspace().getFiles().map(file => new IDEFileAccessImpl(file));        
    }


}

export class OnlineIDEAccessImpl implements OnlineIDEAccess {
    
    private static  ideMap: Map<string, SingleIDEAccessImpl> = new Map();

    public static registerIDE(ide: MainEmbedded){
        OnlineIDEAccessImpl.ideMap.set(ide.config.id!,  new SingleIDEAccessImpl(ide));
    }
    
    getIDE(id: string): SingleIDEAccess | undefined {
        return OnlineIDEAccessImpl.ideMap.get(id);
    }

}