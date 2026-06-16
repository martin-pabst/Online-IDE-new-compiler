import { IMain } from "../IMain";
import { IPosition } from "../range/Position";
import { Range } from "../range/Range";
import * as monaco from 'monaco-editor'


export class EditorOpenerProvider implements monaco.editor.ICodeEditorOpener {

    constructor(private main: IMain) {
        monaco.editor.registerEditorOpener(this);
    }

    openCodeEditor(source: monaco.editor.ICodeEditor, resource: monaco.Uri, selectionOrPosition?: monaco.IRange | monaco.IPosition): boolean | Promise<boolean> {
        let editor = this.main.getMainEditor();


        let file = this.main.getCurrentWorkspace()?.getFiles().find(file => file.getMonacoModel()?.uri == resource);
        if (file && file.isHidden()) return false; // ponytail: prevent opening hidden scaffolding files
        let model = file?.getMonacoModel();

        if (model) {
            editor.setModel(model);
            if(!selectionOrPosition) return false;

            //@ts-ignore
            let position = selectionOrPosition.startLineNumber ? Range.getStartPosition(<monaco.IRange>selectionOrPosition) : <IPosition>selectionOrPosition;

            editor.setPosition(<IPosition>position);
            editor.revealLineInCenterIfOutsideViewport((<IPosition>position).lineNumber);
            return true;
        }

        return false;

    }

}