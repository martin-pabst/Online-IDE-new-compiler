import { DOM } from "../../../tools/DOM";
import { BaseType } from "../BaseType";
import { Module } from "../module/Module";
import { CodeFragment } from "./CodeFragment";

import { Executable } from "../Executable";
import { IMain } from "../IMain";
import { Step } from "../interpreter/Step.ts";
import { CompilerFile } from "../module/CompilerFile";
import { ProgramPointerPositionInfo } from "../monacoproviders/ProgramPointerManager";
import { IRange } from "../range/Range";
import '/assets/css/disassembler.css';
import { Klass } from "../interpreter/RuntimeConstants.ts";
import { NonPrimitiveType } from "../../java/types/NonPrimitiveType";
import { JavaClass } from "../../java/types/JavaClass.ts";
import * as monaco from 'monaco-editor'

type DisassembledStep = {
    element: HTMLElement;
    range: IRange;
}

export class Disassembler {

    currentModule?: Module;
    currentType?: BaseType;

    disassembledSteps: DisassembledStep[] = [];
    stepToHtmlElementMap: Map<Step, HTMLElement> = new Map();

    currentElementAtProgramPointer: HTMLElement | undefined;

    disassemblerDiv: HTMLDivElement;

    lastMarkedElement?: HTMLElement;

    constructor(parentElement: HTMLElement, private main: IMain) {
        parentElement.innerHTML = "";
        this.disassemblerDiv = DOM.makeDiv(parentElement, 'jo_disassemblerDiv', 'jo_scrollable');
        let compiler = this.main.getCompiler();
        compiler.eventManager.on("compilationFinishedWithNewExecutable", (executable: Executable) => {
            setTimeout(() => {
                this.currentModule = undefined;
                this.disassemble();
            }, 300);
        });

        this.main.getInterpreter().eventManager.on("showProgramPointer", () => {
            let step = this.main.getInterpreter().scheduler.getNextStep();
            if (step) {
                this.showProgramPointer(step);
            } else {
                this.hideProgramPointer();
            }
        })

        // event stop is also fired when compiler sends new Executable to interpreter!
        this.main.getInterpreter().eventManager.on("stop", () => {
            this.unmarkException();
        })

        this.main.getInterpreter().eventManager.on("hideProgramPointer", () => {
            this.hideProgramPointer();
        })

        this.disassemble();
    }

    disassemble() {
        let module = this.main.getCurrentWorkspace()?.getCurrentlyEditedModule();
        if (module) this.disassembleModule(module);
    }

    disassembleModule(module: Module | undefined) {
        if (!module) return;
        if (module == this.currentModule) return;

        this.clear();
        this.currentModule = module;
        this.currentType = undefined;

        for (let fragment of module.getCodeFragments()) {
            this.dissassembleFragment(fragment, 0);
        }
    }

    markProgramPointer(element: HTMLElement) {
        this.unmarkProgramPointer();
        element.classList.add("jo_revealDisassemblerPosition");
        this.lastMarkedElement = element;
    }

    unmarkProgramPointer() {
        //@ts-ignore
        for (let element of this.disassemblerDiv.children) {
            element.classList.remove("jo_revealDisassemblerPosition");
        }
    }

    markException(step: Step) {
        this.unmarkException();

        let element = this.findHtmlElementForStep(step);
        element?.classList.add("jo_revealDisassemblerException");
        element?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    unmarkException() {
        //@ts-ignore
        for (let element of this.disassemblerDiv.children) {
            element.classList.remove("jo_revealDisassemblerException");
        }
    }

    showElementpositionInMonacoModel(file: CompilerFile | undefined, range: IRange | undefined) {
        if(!file || !range) return;
        let programPointerManager = this.main.getInterpreter().programPointerManager;
        if (!programPointerManager) return;

        let p: ProgramPointerPositionInfo = {
            programOrmoduleOrFile: file,
            range: range
        }

        programPointerManager.show(p, {
            key: "disassemblerPosition",
            isWholeLine: true,
            className: "jo_revealDisassemblerPosition",
            minimapColor: "#d6c91b56",
            rulerColor: "#d6c91b56",
            beforeContentClassName: "jo_revealDisassemblerPositionBefore"
        })

    }

    hideElementPositionsInMonacoModel() {
        this.main.getInterpreter().programPointerManager?.hide("disassemblerPosition");
    }

    showProgramPointer(step: Step) {
        this.hideProgramPointer();
        this.currentElementAtProgramPointer = this.findHtmlElementForStep(step);

        if (this.currentElementAtProgramPointer) {
            this.currentElementAtProgramPointer.classList.add("jo_revealProgramPointer");
            this.currentElementAtProgramPointer.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    }

    findHtmlElementForStep(step: Step): HTMLElement | undefined {
        let element = this.stepToHtmlElementMap.get(step);
        if (element) return element;

        this.currentModule = undefined;
        this.disassembleModule(step.module);

        return this.stepToHtmlElementMap.get(step);
    }


    hideProgramPointer() {

        if (this.currentElementAtProgramPointer) {
            this.currentElementAtProgramPointer.classList.remove("jo_revealProgramPointer");
        }

        this.currentElementAtProgramPointer = undefined;
    }

    clear() {
        this.currentModule = undefined;
        this.disassemblerDiv.innerHTML = ""; // erase all old content
        this.disassembledSteps = [];
        this.stepToHtmlElementMap.clear();
        this.currentType = undefined;
    }

    dissassembleFragment(fragment: CodeFragment, marginLeft: number) {

        if ((typeof this.currentType != "undefined") && this.currentType != fragment.type) {
            this.insertHorizontalLine(2);
        }

        if (this.currentType != fragment.type) {
            this.currentType = fragment.type;
            this.insertTypeHeading(fragment.type, marginLeft);
        }

        this.insertSignature(fragment.signature, fragment.methodDeclarationRange, marginLeft)
        this.insertCode(fragment, marginLeft);

    }

    insertHorizontalLine(width: number) {
        let lineDiv = DOM.makeDiv(this.disassemblerDiv, 'jo_disassemblerHorizontalLine');
        lineDiv.style.borderTopWidth = width + "px";
    }

    insertTypeHeading(type: BaseType, marginLeft: number) {
        let headingDiv = DOM.makeDiv(this.disassemblerDiv, "jo_disassemblerHeading");
        headingDiv.style.marginLeft = marginLeft + "px";
        if (type instanceof JavaClass && type.isMainClass) {
            headingDiv.textContent = "Main method:";
        } else {
            headingDiv.textContent = type.getDeclaration();
        }


        let module = type.module;
        if (type.identifierRange && module) {
            headingDiv.addEventListener('pointerdown', (ev) => {
                this.showElementpositionInMonacoModel(module.file, type.identifierRange);
                this.markProgramPointer(headingDiv);
            })
            headingDiv.classList.add("jo_disassemblerLink");
        }

    }

    insertSignature(signature: string, range: IRange | undefined, marginLeft: number) {
        let signatureDiv = DOM.makeDiv(this.disassemblerDiv, "jo_disassemblerSignature");


        monaco.editor.colorize(signature, 'myJava', { tabSize: 3 }).then((html) => {
            signatureDiv.innerHTML = html;
        });

        let module = this.currentModule;
        if (range && module) {
            signatureDiv.addEventListener('pointerdown', (ev) => {
                this.showElementpositionInMonacoModel(module?.file, range);
                this.markProgramPointer(signatureDiv);
            })
            signatureDiv.classList.add("jo_disassemblerLink");
            signatureDiv.style.marginLeft = marginLeft + "px";
        }

    }

    insertCode(fragment: CodeFragment, marginLeft: number) {
        let index: number = 0;
        let elements: HTMLElement[] = [];

        for (let step of fragment.program.stepsSingle) {
            let stepDiv = DOM.makeDiv(this.disassemblerDiv, "jo_disassemblerStep");
            stepDiv.style.marginLeft = marginLeft + "px";
            elements.push(stepDiv);
            let stepIndex = DOM.makeSpan(stepDiv, "jo_disassemblerStepIndex");
            stepIndex.textContent = index + ":";
            let codeSpan = DOM.makeSpan(stepDiv, "jo_disassemblerCodeSpan");

            /*
             * prettify code
             */
            let code = step.codeAsString.trim();

            // remove jumps to next step:
            let regExp = new RegExp("(.*)return " + (index + 1) + ";(\s*)$", "s");
            let match = code.match(regExp);
            if (match) {
                code = match[1].trim();
            }

            let code1 = code.replaceAll(/\/\/ Label \d*\s*/g, "");
            if (code1 !== code) stepIndex.classList.add("jo_disassemblerStepWithLabel");

            code1 = code1.replaceAll(/(return) (\d*)/g, "jumpTo($2)")

            code = code1;

            index++;

            monaco.editor.colorize(code, 'javascript', { tabSize: 3 }).then((html) => {
                // html = html.replaceAll("&nbsp;", " ");
                html = html.replaceAll("\u00a0", " ");
                codeSpan.innerHTML = html;
            });

            let range = step.range;
            if (range) {
                if (range.startLineNumber && range.endLineNumber && range.startColumn && range.endColumn) {
                    this.disassembledSteps.push({
                        element: stepDiv,
                        range: <IRange>range
                    })
                    this.stepToHtmlElementMap.set(step, stepDiv);
                }
                let module = this.currentModule;
                if (range.startLineNumber && range.startColumn) {
                    stepDiv.addEventListener('pointerdown', (ev) => {
                        this.showElementpositionInMonacoModel(module!.file, <IRange>range);
                        this.markProgramPointer(stepDiv);
                    })
                    stepDiv.classList.add("jo_disassemblerLink");
                }
            }

            if (step.lambdaObject || step.innerClass) {
                this.insertLambdaOrInnerClass(step, marginLeft + 10);
            }

        }
    }

    insertLambdaOrInnerClass(step: Step, marginLeft: number) {
        if(!step.innerClass) return;
        let klass: Klass = step.innerClass;
        if (step.lambdaObject) klass = step.lambdaObject.constructor;

        let type: NonPrimitiveType = klass.type;
        let innerclassOrLambdaHeading = step.innerClass ? "Inner class:" : "Lambda object:";

        this.insertHorizontalLine(1);

        let headingDiv = DOM.makeDiv(this.disassemblerDiv, "jo_disassemblerLambdaHeading");
        headingDiv.style.marginLeft = marginLeft + "px";
        headingDiv.textContent = innerclassOrLambdaHeading;

        this.insertSignature(type.getDeclaration(), type.identifierRange, marginLeft);

        let codeFragments: CodeFragment[] = type.getOwnMethods()
            .filter(method => typeof method.program !== "undefined")
            .map(method => {
                return {
                    type: type,
                    program: method.program!,
                    signature: method.getSignature(),
                    methodDeclarationRange: method.identifierRange
                }
            })

        for (let fragment of codeFragments) {
            this.insertSignature(fragment.signature, fragment.methodDeclarationRange, marginLeft);
            this.insertCode(fragment, marginLeft);
        }

        this.insertHorizontalLine(1);

    }



}