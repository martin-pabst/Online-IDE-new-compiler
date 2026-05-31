import { IMain } from "../../common/IMain.ts";
import { Range } from "../../common/range/Range.ts";
import * as monaco from 'monaco-editor'
import { AssemblyModule } from "../AssemblyModule.ts";

export class AssemblySymbolAndMethodMarker {

    decorations?: monaco.editor.IEditorDecorationsCollection;

    constructor(private main: IMain) {
        if (!main.getMainEditor()) {
            console.error("Call construction of AssemblySymbolMarker after creation of monaco editor.");
            return;
        }

        main.getMainEditor().onDidChangeCursorPosition((event) => {
            this.onDidChangeCursorPosition(event);
        })

    }

    onDidChangeCursorPosition(event: monaco.editor.ICursorPositionChangedEvent) {
        let editor = this.main.getMainEditor();
        if (!editor) return;

        if (editor.getModel()?.getLanguageId() != 'myAssembly') return;

        this.clearDecorations();

        let module = <AssemblyModule>this.main.getCurrentWorkspace()?.getModuleForMonacoModel(editor.getModel());

        if (!module || !(module instanceof AssemblyModule)) {
            return undefined;
        }

        let decorations: monaco.editor.IModelDeltaDecoration[] = [];
        this.markSymbolUnderCursor(editor, module, event.position, decorations);

        this.decorations = editor.createDecorationsCollection(decorations);


    }

    markSymbolUnderCursor(editor: monaco.editor.IStandaloneCodeEditor, module: AssemblyModule, position: monaco.Position, decorations: monaco.editor.IModelDeltaDecoration[]) {
        let cpu = module.cpu;
        let labelMap = cpu.getLabelMap();
        let labelEntries = labelMap.get(position.lineNumber);
        if (!labelEntries) return undefined;

        let label = labelEntries.find(le => Range.containsPosition(le.range, position))?.label;
        if (!label) return undefined;

        let usagePositions = label.usages.slice();
        usagePositions.push(label.declaration);

        for (let up of usagePositions) {
            decorations.push({
                range: up,
                options: {
                    inlineClassName: 'jo_revealSyntaxElement', isWholeLine: false, overviewRuler: {
                        color: { id: "editorIndentGuide.background" },
                        darkColor: { id: "editorIndentGuide.activeBackground" },
                        position: monaco.editor.OverviewRulerLane.Left

                    }
                }
            });
        }

    }

    clearDecorations() {
        if (this.decorations) {
            this.decorations.clear();
            this.decorations = undefined;
        }
    }

}