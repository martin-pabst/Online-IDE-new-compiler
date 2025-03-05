import { GUIFile } from "../../../client/workspace/GUIFile"
import { IMain } from "../IMain"
import { Program } from "../interpreter/Program"
import { CompilerFile } from "../module/CompilerFile"
import { Module } from "../module/Module"
import { IRange } from "../range/Range"
import * as monaco from 'monaco-editor'


export type ProgramPointerPositionInfo = {
    programOrmoduleOrFile: Program | Module | CompilerFile,
    range: IRange,
}

export type ProgramPointerStyle = {
    key: string,
    isWholeLine: boolean,
    className: string,
    rulerColor: string, // "#6fd61b"
    minimapColor: string, // "#6fd61b"
    beforeContentClassName?: string
}

export class ProgramPointerManager {

    editor: monaco.editor.IStandaloneCodeEditor;

    keyToDecorationsMap: Map<string, monaco.editor.IEditorDecorationsCollection> = new Map();

    constructor(private main: IMain) {
        this.editor = main.getMainEditor();
    }

    fileIsCurrentlyShownInEditor(file: CompilerFile | undefined){
        if(!file) return false;
        return this.main.getCurrentWorkspace()?.getCurrentlyEditedFile() == file;
    }

    show(position: ProgramPointerPositionInfo, style: ProgramPointerStyle) {

        if(position.range.endLineNumber > position.range.startLineNumber){
            position.range = {
                startLineNumber: position.range.startLineNumber,
                startColumn: position.range.startColumn,
                endLineNumber: position.range.startLineNumber,
                endColumn: 1000
            }
        }

        let file: CompilerFile | undefined;
        if(position.programOrmoduleOrFile instanceof Program){
            file = position.programOrmoduleOrFile.module.file;
        } else if(position.programOrmoduleOrFile instanceof Module){
            file = position.programOrmoduleOrFile.file;
        } else {
            file = position.programOrmoduleOrFile;
        }

        if(file instanceof GUIFile){
            let model: monaco.editor.ITextModel | undefined = file.getMonacoModel();
    
            if(model){
                this.main.showProgramPosition(file, position.range, false);
            }
        }

        let oldDecorations = this.keyToDecorationsMap.get(style.key);
        oldDecorations?.clear();

        let decorationList: monaco.editor.IModelDeltaDecoration[] = [];
        decorationList.push({
            range: position.range,
            options: {
                isWholeLine: style.isWholeLine,
                className: style.className,
                overviewRuler: {
                    color: style.rulerColor,
                    position: monaco.editor.OverviewRulerLane.Center
                },
                minimap: {
                    color: style.minimapColor,
                    position: monaco.editor.MinimapPosition.Inline
                }
            },
        });
        if (style.beforeContentClassName) {
            decorationList.push({
                range: position.range,
                options: { beforeContentClassName: style.beforeContentClassName }
            })
        }

        let decorations = this.editor.createDecorationsCollection(decorationList);
        this.keyToDecorationsMap.set(style.key, decorations);
    }

    hide(key: string) {
        this.keyToDecorationsMap.get(key)?.clear();
        this.keyToDecorationsMap.delete(key);
    }

    hideAll(){
        this.keyToDecorationsMap.forEach((decoration, key) => {decoration?.clear()});
        this.keyToDecorationsMap.clear();
    }

}