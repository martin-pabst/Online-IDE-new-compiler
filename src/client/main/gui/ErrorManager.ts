import { Workspace } from "../../workspace/Workspace.js";
import { Main } from "../Main.js";
import { MainBase } from "../MainBase.js";
import jQuery from 'jquery';
import { GUIFile } from "../../workspace/GUIFile.js";
import { Error, ErrorLevel } from "../../../compiler/common/Error.js";
import { MainEmbedded } from "../../embedded/MainEmbedded.js";
import type * as monaco from 'monaco-editor'
import { Range } from "../../../compiler/common/range/Range.js";
import { CompilerFile } from "../../../compiler/common/module/CompilerFile.js";

export class ErrorManager {

    oldDecorations: Map<monaco.editor.ITextModel, string[]> = new Map();
    $errorDiv: JQuery<HTMLElement>;

    minimapColor: {[key: string]:string } = {};

    constructor(private main: MainBase, private $bottomDiv: JQuery<HTMLElement>, $mainDiv: JQuery<HTMLElement>) {
        this.minimapColor["error"] = "#bc1616";
        this.minimapColor["warning"] = "#cca700";
        this.minimapColor["info"] = "#75beff";


        let that = this;
        $mainDiv.find(".jo_pw_undo").on("click", () => {
            let editor = that.main.getMainEditor();
            editor.trigger(".", "undo", {});
        }).attr('title', 'Undo');
    }

    showErrors(workspace: Workspace) {

        this.$errorDiv = this.$bottomDiv.find('.jo_tabs>.jo_errorsTab');
        this.$errorDiv.empty();

        let hasErrors = false;

        for (let file of workspace.getFiles()) {


            let $errorList: JQuery<HTMLElement>[] = [];

            let errors = this.getSortedAndFilteredErrors(file);

            for (let error of errors) {

                this.processError(error, file, $errorList);

            }

            if ($errorList.length > 0 && this.$errorDiv.length > 0) {
                hasErrors = true;
                let $file = jQuery('<div class="jo_error-filename">' + file.name + '&nbsp;</div>');
                this.$errorDiv.append($file);
                for (let $error of $errorList) {
                    this.$errorDiv.append($error);
                }
            }

        }

        if (!hasErrors && this.$errorDiv.length > 0) {
            this.$errorDiv.append(jQuery('<div class="jo_noErrorMessage">Keine Fehler gefunden :-)</div>'));
        }

    }

    processError(error: Error, f: GUIFile, $errorDivs: JQuery<HTMLElement>[]) {

        let $div = jQuery('<div class="jo_error-line"></div>');
        let $lineColumn = jQuery('<span class="jo_error-position">[Z&nbsp;<span class="jo_linecolumn">' + error.range.startLineNumber + '</span>' +
            ' Sp&nbsp;<span class="jo_linecolumn">' + error.range.startColumn + '</span>]</span>:&nbsp;');
        let category = "";
        switch (error.level) {
            case "error": break;
            case "warning": category = '<span class="jo_warning_category">Warnung: </span>'; break;
            case "info": category = '<span class="jo_info_category">Info: </span>'; break;
        }
        let $message = jQuery('<div class="jo_error-text">' + category + error.message + "</div>");

        $div.append($lineColumn).append($message);

        let that = this;
        $div.on("mousedown", (ev) => {
            this.$errorDiv.find('.jo_error-line').removeClass('jo_active');
            $div.addClass('jo_active');
            that.showError(f, error);
        });

        $errorDivs.push($div);
    }

    showError(f: GUIFile, error: Error) {

        if (this.main instanceof Main) {
            if (f != this.main.getCurrentWorkspace()?.getCurrentlyEditedFile()) {
                this.main.editor.dontDetectLastChange();
                this.main.projectExplorer.setFileActive(f);
            }
        }

        if(this.main instanceof MainEmbedded){
            this.main.setFileActive(f);
        }

        this.main.getMainEditor().revealRangeInCenter(error.range);
        this.main.getMainEditor().setPosition(Range.getStartPosition(error.range));
        setTimeout(() => {
            this.main.getMainEditor().focus();
        }, 10);

        // let className: string = "";
        // switch (error.level) {
        //     case "error": className = "jo_revealError"; break;
        //     case "warning": className = "jo_revealWarning"; break;
        //     case "info": className = "jo_revealInfo"; break;
        // }


        // this.hideAllErrorDecorations();

        // let model = f.getMonacoModel();
        // let oldDecorations: string[] = this.oldDecorations.get(model) || [];

        // oldDecorations = model.deltaDecorations(oldDecorations, [
        //     {
        //         range: error.range,
        //         options: { className: className, isWholeLine: true },

        //     }
        // ]);

        // this.oldDecorations.set(model, oldDecorations);

    }

    hideAllErrorDecorations(){

        let files = this.main.getCurrentWorkspace()?.getFiles();

        for(let file of files){
            let model = file.getMonacoModel();
            let oldDecorations: string[] = this.oldDecorations.get(model) || [];
    
            oldDecorations = model.deltaDecorations(oldDecorations, [
            ]);
    
            this.oldDecorations.delete(model);
        }
        
    }

    getSortedAndFilteredErrors(file: CompilerFile): Error[] {

        const list: Error[] = file.errors.slice();

        list.sort((a, b) => {
            return Range.compareRangesUsingStarts(a.range, b.range);
        });

        for (let i = 0; i < list.length - 1; i++) {
            const e1 = list[i];
            const e2 = list[i + 1];
            if (e1.range.startLineNumber == e2.range.startLineNumber && e1.range.startColumn + 10 > e2.range.startColumn) {
                if (this.#errorLevelCompare(e1.level, e2.level) == 1) {
                    list.splice(i + 1, 1);
                } else {
                    list.splice(i, 1);
                }
                i--;
            }
        }

        return list;
    }

    #errorLevelCompare(level1: ErrorLevel, level2: ErrorLevel): number {
        if (level1 == "error") return 1;
        if (level2 == "error") return -1;
        if (level1 == "warning") return 1;
        if (level2 == "warning") return -1;
        return 1;
    }


}