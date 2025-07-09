import { FileTypeManager } from "./FileTypeManager";
import * as monaco from 'monaco-editor'

export type FileContentChangedListener = (changedfile: CompilerFile) => void;

export class CompilerFile {

    /**
     * filename == "" for test files
     */
    public name: string;

    
    private fileContentChangedListeners: FileContentChangedListener[] = [];
    
    private editorState: monaco.editor.ICodeEditorViewState | null = null;
    
    /*
    * monaco editor counts LanguageChangedListeners and issues ugly warnings in console if more than
    * 200, 300, ... are created. Unfortunately it creates one each time a monaco.editor.ITextModel is created.
    * To keep monaco.editor.ITextModel instance count low we instantiate it only when needed and dispose of it
    * when switching to another workspace. Meanwhile we store file text here:
    */
   private __textWhenMonacoModelAbsent: string = "";
   private lastSavedVersion: number = 0;
   protected localVersion: number = this.lastSavedVersion;


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



}