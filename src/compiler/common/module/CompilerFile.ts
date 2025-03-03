import { SerializedCompilerFile } from "../../java/webworker/JavaWebworkerCompiler";
import { FileTypeManager } from "./FileTypeManager";
import * as monaco from 'monaco-editor'

export type FileContentChangedListener = (changedfile: CompilerFile) => void;

export class CompilerFile {

    /**
     * filename == "" for test files
     */
    public name: string;

    private lastSavedVersion: number = -1;

    private fileContentChangedListeners: FileContentChangedListener[] = [];

    private editorState: monaco.editor.ICodeEditorViewState | null = null;

    /*
     * monaco editor counts LanguageChangedListeners and issues ugly warnings in console if more than
     * 200, 300, ... are created. Unfortunately it creates one each time a monaco.editor.ITextModel is created.
     * To keep monaco.editor.ITextModel instance count low we instantiate it only when needed and dispose of it
     * when switching to another workspace. Meanwhile we store file text here:
     */
    private __textWhenMonacoModelAbsent: string = "";
    protected localVersion: number = 0;

    private static maxUniqueID: number = 0;
    private _uniqueID: number = CompilerFile.maxUniqueID++;
    get uniqueID(): number { return this._uniqueID;};
    set uniqueID(uniqueID: number){this._uniqueID = uniqueID;};

    constructor(name?: string) {
        this.name = name || "";
    }

    getText() {
        return this.__textWhenMonacoModelAbsent;
    }

    setText(text: string) {
        this.__textWhenMonacoModelAbsent = text;

        this.notifyListeners();
    }


    getLocalVersion(): number {
        return this.localVersion;
    }

    isSaved(): boolean {
        return this.lastSavedVersion == this.getLocalVersion();
    }

    setSaved(isSaved: boolean) {
        if (isSaved) {
            this.lastSavedVersion = this.getLocalVersion();
        } else {
            this.lastSavedVersion = -1;
        }
    }

    onFileContentChanged(listener: FileContentChangedListener) {
        this.fileContentChangedListeners.push(listener);
    }

    protected notifyListeners() {
        for (let listener of this.fileContentChangedListeners) {
            listener(this);
        }
    }

    saveViewState(editor: monaco.editor.IStandaloneCodeEditor) {
        this.editorState = editor.saveViewState();
    }

    restoreViewState(editor: monaco.editor.IStandaloneCodeEditor) {
        if (this.editorState) {
            try {
                editor.restoreViewState(this.editorState)
            } catch (e) {

            }
        };
        this.editorState = null;
    }

    serialize(): SerializedCompilerFile {
        return {
            lastSavedVersion: this.lastSavedVersion,
            localVersion: this.getLocalVersion(),
            name: this.name,
            text: this.getText(),
            uniqueID: this.uniqueID
        }
    }

    static deserialize(scf: SerializedCompilerFile): CompilerFile {
        let cf: CompilerFile = new CompilerFile(scf.name);
        cf.localVersion = scf.localVersion,
        cf.lastSavedVersion = scf.lastSavedVersion,
        cf.__textWhenMonacoModelAbsent = scf.text,
        cf.uniqueID = scf.uniqueID;

        return cf;
    }

}