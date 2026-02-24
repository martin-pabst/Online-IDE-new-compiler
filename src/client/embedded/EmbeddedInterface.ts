import { GUIFile } from "../workspace/File";
import { MainEmbedded } from "./MainEmbedded";

type FileRenamedCallback  = (previousName: string, newName: string) => void;
type FileDeletedCallback  = (fileName: string) => void;
type FileCreatedCallback  = (fileName: string) => void;
type FileSelectedCallback = (fileName: string) => void;

interface IDEFileAccess {
    getName(): string;
    getText(): string;
    setText(text: string): void;
}

interface SingleIDEAccess {
    getFiles(): IDEFileAccess[];
    onFileRenamed(callback: FileRenamedCallback): void;
    onFileDeleted(callback: FileDeletedCallback): void;
    onFileCreated(callback: FileCreatedCallback): void;
    onFileSelected(callback: FileSelectedCallback): void;
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
    setText(text: string) {
        this.file.setText(text);
    }

    
}

export class SingleIDEAccessImpl implements SingleIDEAccess {

    private fileRenamedCallbacks:  FileRenamedCallback[]  = [];
    private fileDeletedCallbacks:  FileDeletedCallback[]  = [];
    private fileCreatedCallbacks:  FileCreatedCallback[]  = [];
    private fileSelectedCallbacks: FileSelectedCallback[] = [];

    constructor(private ide: MainEmbedded){

    }

    getFiles(): IDEFileAccess[] {
        return this.ide.getCurrentWorkspace().getFiles().map(file => new IDEFileAccessImpl(file));        
    }

    onFileRenamed(callback: FileRenamedCallback): void {
        this.fileRenamedCallbacks.push(callback);
    }

    onFileDeleted(callback: FileDeletedCallback): void {
        this.fileDeletedCallbacks.push(callback);
    }

    onFileCreated(callback: FileCreatedCallback): void {
        this.fileCreatedCallbacks.push(callback);
    }

    onFileSelected(callback: FileSelectedCallback): void {
        this.fileSelectedCallbacks.push(callback);
    }

    notifyFileRenamed(previousName: string, newName: string): void {
        this.fileRenamedCallbacks.forEach(cb => cb(previousName, newName));
    }

    notifyFileDeleted(fileName: string): void {
        this.fileDeletedCallbacks.forEach(cb => cb(fileName));
    }

    notifyFileCreated(fileName: string): void {
        this.fileCreatedCallbacks.forEach(cb => cb(fileName));
    }

    notifyFileSelected(fileName: string): void {
        this.fileSelectedCallbacks.forEach(cb => cb(fileName));
    }

}

export class OnlineIDEAccessImpl implements OnlineIDEAccess {
    
    private static ideMap: Map<string, SingleIDEAccessImpl> = new Map();

    public static registerIDE(ide: MainEmbedded){
        OnlineIDEAccessImpl.ideMap.set(ide.config.id!,  new SingleIDEAccessImpl(ide));
    }

    public static notifyFileRenamed(ide: MainEmbedded, previousName: string, newName: string): void {
        OnlineIDEAccessImpl.ideMap.get(ide.config.id!)?.notifyFileRenamed(previousName, newName);
    }

    public static notifyFileDeleted(ide: MainEmbedded, fileName: string): void {
        OnlineIDEAccessImpl.ideMap.get(ide.config.id!)?.notifyFileDeleted(fileName);
    }

    public static notifyFileCreated(ide: MainEmbedded, fileName: string): void {
        //console.log(`Notifying file created: ${fileName} in IDE ${ide.config.id}`);
        OnlineIDEAccessImpl.ideMap.get(ide.config.id!)?.notifyFileCreated(fileName);
    }

    public static notifyFileSelected(ide: MainEmbedded, fileName: string): void {
        //console.log(`Notifying file selected: ${fileName} in IDE ${ide.config.id}`);
        OnlineIDEAccessImpl.ideMap.get(ide.config.id!)?.notifyFileSelected(fileName);
    }
    
    getIDE(id: string): SingleIDEAccess | undefined {
        return OnlineIDEAccessImpl.ideMap.get(id);
    }

}