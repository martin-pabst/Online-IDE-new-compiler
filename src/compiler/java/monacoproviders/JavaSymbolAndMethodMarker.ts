import { IMain } from "../../common/IMain.ts";
import { Range } from "../../common/range/Range.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule.ts";
import * as monaco from 'monaco-editor'

export class JavaSymbolAndMethodMarker {

    decorations?: monaco.editor.IEditorDecorationsCollection;

    constructor(private main: IMain) {
        if (!main.getMainEditor()) {
            console.error("Call of construction of JavaSymbolMarker after creation of monaco editor.");
            return;
        }

        main.getMainEditor().onDidChangeCursorPosition((event) => {
            this.onDidChangeCursorPosition(event);
        })

    }

    onDidChangeCursorPosition(event: monaco.editor.ICursorPositionChangedEvent) {
        let editor = this.main.getMainEditor();
        if (!editor) return;

        if (editor.getModel()?.getLanguageId() != 'myJava') return;

        this.clearDecorations();

        let module = <JavaCompiledModule>this.main.getCurrentWorkspace()?.getModuleForMonacoModel(editor.getModel());
        if (!module) return;

        let decorations: monaco.editor.IModelDeltaDecoration[] = [];
        this.markSymbolUnderCursor(editor, module, event.position, decorations);
        this.markMethodUnderCursor(editor, module, event.position, decorations);

        this.decorations = editor.createDecorationsCollection(decorations);

    }

    private markSymbolUnderCursor(editor: monaco.editor.IStandaloneCodeEditor,
        module: JavaCompiledModule, position: monaco.Position, decorations: monaco.editor.IModelDeltaDecoration[]) {

        if (!module) return;

        let usagePosition = module.findSymbolAtPosition(position);

        if (usagePosition == null) {
            return;
        }

        let usagePositions = module.getUsagePositionsForSymbol(usagePosition?.symbol);

        if (!usagePositions) return;

        for (let up of usagePositions) {
            decorations.push({
                range: up.range,
                options: {
                    inlineClassName: 'jo_revealSyntaxElement', isWholeLine: false, overviewRuler: {
                        color: { id: "editorIndentGuide.background" },
                        darkColor: { id: "editorIndentGuide.activeBackground" },
                        position: monaco.editor.OverviewRulerLane.Left
                    }
                }
            })
        }

    }

    private markMethodUnderCursor(editor: monaco.editor.IStandaloneCodeEditor,
        module: JavaCompiledModule, position: monaco.Position, decorations: monaco.editor.IModelDeltaDecoration[]) {

        if(!(module instanceof JavaCompiledModule)) return;    
        let methodRange = module.methodDeclarationRanges.find(range => Range.containsPosition(range, position));

        if (methodRange) {
            decorations.push({
                range: { startColumn: 0, startLineNumber: methodRange.startLineNumber, endColumn: 100, endLineNumber: methodRange.endLineNumber },
                options: {
                    className: 'jo_highlightMethod', isWholeLine: true,
                    overviewRuler: {
                        color: { id: "jo_highlightMethod" },
                        darkColor: { id: "jo_highlightMethod" },
                        position: monaco.editor.OverviewRulerLane.Left
                    },
                    minimap: {
                        color: { id: 'jo_highlightMethod' },

                        position: monaco.editor.MinimapPosition.Inline
                    },
                    zIndex: -100
                }
            })
        }

    }


    clearDecorations() {
        if (this.decorations) {
            this.decorations.clear();
            this.decorations = undefined;
        }
    }

}