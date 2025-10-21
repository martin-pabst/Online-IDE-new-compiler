import { Workspace } from "../../workspace/Workspace.js";
import { Main } from "../Main.js";
import { MainBase } from "../MainBase.js";
import jQuery from 'jquery';
import { GUIFile } from "../../workspace/File.js";
import { Error } from "../../../compiler/common/Error.js";
import { MainEmbedded } from "../../embedded/MainEmbedded.js";
import type * as monaco from 'monaco-editor'
import { Range } from "../../../compiler/common/range/Range.js";
import { Tab, TabManager } from "../../../tools/TabManager.js";
import { ErrorManagerMessages } from "./language/GUILanguage.js";

export class ErrorManager {

    oldDecorations: Map<monaco.editor.ITextModel, string[]> = new Map();
    $errorDiv: JQuery<HTMLElement>;

    minimapColor: {[key: string]:string } = {};

    tab: Tab;

    constructor(private main: MainBase, tabManager: TabManager) {
        this.minimapColor["error"] = "#bc1616";
        this.minimapColor["warning"] = "#cca700";
        this.minimapColor["info"] = "#75beff";

        this.tab = new Tab(ErrorManagerMessages.errors(), ["jo_active", "jo_scrollable", "jo_editorFontSize", "jo_errorsTab"])
        tabManager.addTab(this.tab);
        this.$errorDiv = jQuery(this.tab.bodyDiv);
    }

    showErrors(workspace: Workspace): Map<GUIFile, number> {

        let errorCountMap: Map<GUIFile, number> = new Map();

        this.$errorDiv.empty();

        let hasErrors = false;

        for (let file of workspace.getFiles()) {


            let $errorList: JQuery<HTMLElement>[] = [];

            let errors = this.main.getCompiler().getSortedAndFilteredErrors(file);
            errorCountMap.set(file, errors.filter(error => error.level == "error").length);

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
            this.$errorDiv.append(jQuery(`<div class="jo_noErrorMessage">${ErrorManagerMessages.noErrorsFound()}</div>`));
        }

        return errorCountMap;

    }

    processError(error: Error, f: GUIFile, $errorDivs: JQuery<HTMLElement>[]) {

        let $div = jQuery('<div class="jo_error-line"></div>');
        let $lineColumn = jQuery('<span class="jo_error-position">[<span class="jo_linecolumn">' + error.range.startLineNumber + '</span>' +
            '/<span class="jo_linecolumn">' + error.range.startColumn + '</span>]</span>:&nbsp;');
        let category = "";
        switch (error.level) {
            case "error": category = `<span class="jo_error_category">${ErrorManagerMessages.error()}: </span>`; break;
            case "warning": category = `<span class="jo_warning_category">${ErrorManagerMessages.warning()}: </span>`; break;
            case "info": category = `<span class="jo_info_category">${ErrorManagerMessages.info()}: </span>`; break;
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

}