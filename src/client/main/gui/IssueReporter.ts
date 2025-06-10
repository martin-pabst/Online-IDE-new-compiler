import { DOM } from "../../../tools/DOM.js";
import { ajax, ajaxAsync } from "../../communication/AjaxHelper.js";
import { Main } from "../Main.js";
import { Dialog } from "./Dialog.js";
import { IssueReporterMessages } from "./language/GUILanguage.js";
import '/assets/css/issuereporter.css';

type ReportIssueRequest = {
    workspace_id: number,
    description: string,
    mail: string,
    rufname: string,
    familienname: string
}

export class IssueReporter {

    dialog: Dialog;

    constructor(private main: Main) {

        this.dialog = new Dialog();

    }

    show() {
        let that = this;
        this.dialog.init();
        this.dialog.heading(IssueReporterMessages.reportBug());
        this.dialog.description(IssueReporterMessages.bugReport() + ":")

        let textfield = <HTMLTextAreaElement>DOM.makeElement(this.dialog.$dialogMain[0], "textarea", "jo_issuereporterr_textfield");

        let addWorkspace = this.dialog.addCheckbox(IssueReporterMessages.sendCopyOfWorkspace(), true, "jo_cbIssueAddWorkspace");
        let emailInput = this.dialog.input("text", IssueReporterMessages.email());
        let rufnameInput = this.dialog.input("text", IssueReporterMessages.firstName());
        let familiennameInput = this.dialog.input("text", IssueReporterMessages.lastName());


        this.dialog.buttons([
            {
                caption: IssueReporterMessages.cancel(),
                color: "#a00000",
                callback: () => { this.dialog.close() }
            },
            {
                caption: IssueReporterMessages.send(),
                color: "green",
                callback: async() => {

                    let request: ReportIssueRequest = {
                        workspace_id: addWorkspace() ? this.main.getCurrentWorkspace().id : null,
                        description: textfield.value,
                        mail: emailInput.val(),
                        rufname: rufnameInput.val(),
                        familienname: familiennameInput.val()
                    }

                    let response: {success: boolean, message: string} = await ajaxAsync("/servlet/reportIssue", request);
                    if(response.success){
                        alert(IssueReporterMessages.thanks());
                    }

                    this.dialog.close();

                }
            },
        ])
    }

}