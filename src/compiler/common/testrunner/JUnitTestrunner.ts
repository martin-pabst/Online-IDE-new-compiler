import { Slider } from "../../../tools/components/Slider";
import { Treeview } from "../../../tools/components/treeview/Treeview";
import { DOM } from "../../../tools/DOM";
import { JavaClass } from "../../java/types/JavaClass";
import { JavaMethod } from "../../java/types/JavaMethod";
import { Executable } from "../Executable";
import { IMain } from "../IMain";
import { Module } from "../module/Module";
import { AssertionResult } from "./AggregatingAssertionObserver";
import { JUnitTestrunnerLanguage } from "./JUnitTestrunnerLanguage";
import { JUnitTreeviewEntry } from "./JUnitTreeviewEntry";
import '/assets/css/junit.css';
import { JUnitProgressbar } from './JUnitProgressbar';
import { TreeviewNode } from '../../../tools/components/treeview/TreeviewNode';
import * as monaco from 'monaco-editor';

// see https://vite.dev/guide/assets
import compileGifUrl from '/assets/graphics/compile.gif'
import { GUIFile } from "../../../client/workspace/File";



type MouseDownHandler = () => void;

type DecorationInfo = {
    model: monaco.editor.ITextModel,
    decorations: string[]
}


export class JUnitTestrunner {
    decorationInfoList: DecorationInfo[] = [];

    mouseDownHandler: Map<Module, Map<number, MouseDownHandler>> = new Map();

    mainDiv?: HTMLDivElement;
    outputDiv!: HTMLDivElement;
    rightDiv!: HTMLDivElement;

    testTreeview!: Treeview<JUnitTreeviewEntry, JUnitTreeviewEntry>;

    executingTestDiv?: HTMLDivElement;

    progressbar!: JUnitProgressbar;

    constructor(public main: IMain, parentElement: HTMLElement) {
        this.registerHandler();
        this.initGUI(parentElement);
    }

    initGUI(parentElement: HTMLElement) {

        if (this.mainDiv) return; // someone came along here ...

        this.mainDiv = DOM.makeDiv(parentElement, "jo_junitTestrunnerMain");

        let leftDiv = DOM.makeDiv(this.mainDiv, "jo_junitTestrunnerLeft");
        this.rightDiv = DOM.makeDiv(this.mainDiv, "jo_junitTestrunnerRight");

        this.progressbar = new JUnitProgressbar(this.rightDiv);
        this.outputDiv = DOM.makeDiv(this.rightDiv, "jo_junitTestrunnerOutput", "jo_scrollable");

        this.testTreeview = new Treeview(leftDiv, {
            captionLine: { enabled: false
             },
            initialExpandCollapseState: 'expanded',
            buttonAddFolders: false,
            buttonAddElements: false,
            withDeleteButtons: false,
            isDragAndDropSource: false,
            contextMenu: {

            },
            withSelection: true
        })

        this.testTreeview.contextMenuProvider = (element: JUnitTreeviewEntry, node: TreeviewNode<JUnitTreeviewEntry, JUnitTreeviewEntry>) => {
            return [
                {
                    caption: element.children.length > 0 ? "Tests starten" : "Test starten",
                    callback: (element, node) => {
                        element.runTests();
                    }
                }
            ]
        }

        new Slider(leftDiv, false, false, () => { });

    }

    registerHandler() {
        this.main.getActionManager().registerAction("interpreter.startTests", [], JUnitTestrunnerLanguage.ExecuteAllTestsInWorkspace(), (name) => {
            this.executeAllTests();
        });

        let editor = this.main.getMainEditor();

        editor.onMouseDown((e: monaco.editor.IEditorMouseEvent) => {
            if (e.target.type != monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS) {
                return;
            }

            let model = editor.getModel();
            let module = this.main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
            if (!module) return;

            this.onMarginMouseDown(module, e.target.position.lineNumber);
            return;
        });

        this.main.getInterpreter().eventManager.on("afterExcecutableInitialized", this.onAfterExecutableInitialized, this);
    }

    onMarginMouseDown(module: Module, lineNumber: number) {
        let map = this.mouseDownHandler.get(module);
        if (map) {
            let handler = map.get(lineNumber);
            if (handler) {
                handler();
            }
        }
    }

    onAfterExecutableInitialized(executable: Executable) {
        this.markTestsInEditor(executable);
        this.testTreeview.clear();
        new JUnitTreeviewEntry(this, undefined, executable.moduleManager, undefined, undefined);
    }

    markTestsInEditor(executable: Executable) {

        this.decorationInfoList.forEach(decorationInfo => {
            if (!decorationInfo.model.isDisposed()) decorationInfo.model.deltaDecorations(decorationInfo.decorations, []);
        });
        this.decorationInfoList = [];

        this.mouseDownHandler.clear();

        if (executable) {

            let testClassToTestMethodMap = executable.getTestMethods();

            let size = 0;
            testClassToTestMethodMap.forEach((methodList, klass) => size += methodList.length);

            if (size == 0) {
                let example = JUnitTestrunnerLanguage.noTestsAvailableExampleProgram();
                monaco.editor.colorize(example, "myJava", {}).then(
                    (html) => {
                        this.outputDiv.setHTMLUnsafe(JUnitTestrunnerLanguage.noTestsAvailableHtml(html));
                    }
                );

            } else {
                this.outputDiv.setHTMLUnsafe(JUnitTestrunnerLanguage.testsFound(size));
            }

            testClassToTestMethodMap.forEach((methods, klass) => {

                let decorations: monaco.editor.IModelDeltaDecoration[] = [];
                let file = klass.module.file;
                if(!(file instanceof GUIFile)) return;
                let model = file.getMonacoModel();
                if (!model) return;

                let annotation = klass.getAnnotation("Test");
                if (annotation) {
                    decorations.push(this.getDecoration(false, klass.module, annotation.range.startLineNumber, "Alle JUnit-Tests der Klasse ausführen", () => {
                        this.executeAllTestsOfClass(klass);
                    }));
                }

                // decorations.push(this.getDecoration(true, klass.module, klass.identifierRange.startLineNumber, "Alle JUnit-Tests dieser Klasse ausführen", () => {
                //     this.executeAllTestsOfClass(klass);
                // }));

                for (let method of methods) {
                    let annotation = method.getAnnotation("Test");
                    if (!annotation) continue;
                    decorations.push(this.getDecoration(false, klass.module, annotation?.range.startLineNumber, "Diesen JUnit-Test ausführen", () => {
                        this.executeTestMethod(method);
                    }));

                }

                this.decorationInfoList.push({
                    model: model,
                    decorations: model.deltaDecorations([], decorations)
                });
            })

        }

    }

    getDecoration(isClass: boolean, module: Module, lineNumber: number, tooltip: string, mouseDownHandler: MouseDownHandler): monaco.editor.IModelDeltaDecoration {
        let map = this.mouseDownHandler.get(module);
        if (!map) {
            map = new Map<number, MouseDownHandler>();
            this.mouseDownHandler.set(module, map);
        }

        map.set(lineNumber, mouseDownHandler);

        return {
            range: { startLineNumber: lineNumber, endLineNumber: lineNumber, startColumn: 1, endColumn: 1 },
            options: {
                marginClassName: "jo_margin_start_test",
                stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,

            }
        }
    }

    printLine(caption: string, cssClass?: string): HTMLDivElement {
        let captionLine = DOM.makeDiv(this.outputDiv, cssClass);
        captionLine.innerHTML = caption;
        return captionLine;
    }

    printResult(result: AssertionResult) {
        if (result.messageHtmlElement) this.outputDiv.appendChild(result.messageHtmlElement);
    }

    printExecutingTestCaption(method: JavaMethod) {
        this.executingTestDiv = DOM.makeDiv(this.outputDiv);
        this.executingTestDiv.style.marginTop = '5px';
        this.executingTestDiv.innerHTML = JUnitTestrunnerLanguage.executingTestMethod(method.classEnumInterface.identifier, method.identifier) +
            `<img src="${compileGifUrl}" />`;
        // this.executingTestDiv.scrollIntoView();
    }

    eraseExecutingTestCaption() {
        this.executingTestDiv?.remove();
    }

    printError(error: string) {
        let div = DOM.makeDiv(this.outputDiv);
        div.innerHTML = JUnitTestrunnerLanguage.couldntGetMainThread();
    }

    clearOutput() {
        this.outputDiv.innerHTML = '';
    }

    findTreeviewEntry(klass: JavaClass | undefined, method: JavaMethod | undefined) {
        if (method) {
            return this.testTreeview.nodes.find(entry => entry.externalObject?.method == method)?.externalObject;
        }
        if (klass) {
            return this.testTreeview.nodes.find(entry => entry.externalObject?.klass == klass)?.externalObject;
        }
        return this.testTreeview.nodes.find(entry => !entry.externalObject?.klass && !entry.externalObject?.method)?.externalObject;

    }

    async executeAllTests() {
        let treeviewEntry = this.findTreeviewEntry(undefined, undefined) || undefined;
        await this.executeTests(treeviewEntry);
    }


    async executeAllTestsOfClass(klass: JavaClass) {
        let treeviewEntry = this.findTreeviewEntry(klass, undefined) || undefined;
        await this.executeTests(treeviewEntry);
    }

    async executeTestMethod(method: JavaMethod) {
        let treeviewEntry = this.findTreeviewEntry(undefined, method) || undefined;
        await this.executeTests(treeviewEntry);
    }

    async executeTests(treeviewEntry: JUnitTreeviewEntry | undefined) {
        this.main.getInterpreter().printManager.clear();
        this.main.showJUnitDiv();
        if (treeviewEntry) {
            treeviewEntry.treeviewNode.setSelected(true);
            this.clearOutput();
            await treeviewEntry?.runTests();
        }
    }



}