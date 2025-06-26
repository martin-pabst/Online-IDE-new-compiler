import { ajaxAsync } from "../../communication/AjaxHelper.js";
import { Pruefung, ReportPruefungStudentStateRequest, ReportPruefungStudentStateResponse, WorkspaceData } from "../../communication/Data.js";
import { PushClientManager } from "../../communication/pushclient/PushClientManager.js";
import { Main } from "../Main.js";
import jQuery from "jquery";
import { PruefungManagerForStudentsMessages } from "./PruefungManagerForStudentsMessages.js";

type MessagePruefungStart = { pruefung: Pruefung }

export class PruefungManagerForStudents {

    pruefung: Pruefung;
    $pruefungLaeuft: JQuery<HTMLDivElement>;

    timer: any;

    constructor(private main: Main) {
        jQuery('#pruefunglaeuft').remove();
        this.$pruefungLaeuft = jQuery(`<div id="pruefunglaeuft"> <span class="img_test-state-running"></span> ${PruefungManagerForStudentsMessages.pruefungLaeuft()}</div>`);
        jQuery('.jo_projectexplorer').prepend(this.$pruefungLaeuft);

        PushClientManager.subscribe("startPruefung", (message: MessagePruefungStart) => {
            this.startPruefung(message.pruefung);
        })
        PushClientManager.subscribe("stopPruefung", (message: MessagePruefungStart) => {
            this.stopPruefung(true);
        })
    }

    close() {
        if (this.pruefung != null) {
            PushClientManager.unsubscribe("startPruefung");
            PushClientManager.unsubscribe("stopPruefung");
            if (this.timer != null) clearInterval(this.timer);
            this.main.networkManager.sendUpdatesAsync(true, false, false).then(() => {
                let projectExplorer = this.main.projectExplorer;
                projectExplorer.workspaceListPanel.show();
                projectExplorer.fetchAndRenderOwnWorkspaces();
            })
            this.pruefung = null;
        }

    }

    startPruefung(pruefung: Pruefung) {

        if (this.pruefung != null) return;

        this.pruefung = pruefung;

        this.main.networkManager.sendUpdatesAsync(true, false, false).then(() => {

            let wss = this.main.workspaceList.filter(ws => ws.pruefung_id == pruefung.id);
            if (wss.length == 0) {
                alert('Workspace missing.');
                return;
            }

            let pruefungWorkspace = wss[0];
            this.main.workspaceList = [pruefungWorkspace];
            this.main.currentWorkspace = pruefungWorkspace;
            let projectExplorer = this.main.projectExplorer;
            projectExplorer.workspaceListPanel.clear();
            projectExplorer.fileListPanel.clear();
            projectExplorer.workspaceListPanel.hide();
            projectExplorer.fileListPanel.enableNewButton(true);

            projectExplorer.setWorkspaceActive(pruefungWorkspace);
            pruefungWorkspace.saved = false;

            // this.pruefung = pruefung;

            jQuery('#pruefunglaeuft').css('display', 'block');
            if (this.timer != null) {
                clearInterval(this.timer);
                this.timer = null;
            }

            let sendPruefungState = () => {
                let request: ReportPruefungStudentStateRequest = { pruefungId: this.pruefung.id, clientState: "", running: true }
                ajaxAsync('/servlet/reportPruefungState', request).then(
                    (response: ReportPruefungStudentStateResponse) => {
                        if (response.pruefungState != "running") {
                            this.stopPruefung(true);
                        }
                    }
                )
            }

            sendPruefungState();
            this.timer = setInterval(sendPruefungState, 5000)

        });

    }

    /**
     * 
     * @param renderWorkspaces set to false if user has logged out
     * @returns 
     */
    async stopPruefung(renderWorkspaces: boolean) {
        // await this.main.networkManager.sendUpdatesAsync();  // is done by fetchAndRenderOwnWorkspaces later on

        console.log("Stopping pruefung...");

        if (this.timer != null) clearInterval(this.timer);
        this.timer = null;

        if (this.pruefung == null) {
            return;
        }

        if(!renderWorkspaces){
            let request: ReportPruefungStudentStateRequest = { pruefungId: this.pruefung.id, clientState: "", running: false }
            ajaxAsync('/servlet/reportPruefungState', request)
        }


        this.pruefung = null;

        this.main.projectExplorer.workspaceListPanel.show();

        if (renderWorkspaces) {
            await this.main.projectExplorer.fetchAndRenderOwnWorkspaces();
        }

        jQuery('#pruefunglaeuft').css('display', 'none');
    }



}