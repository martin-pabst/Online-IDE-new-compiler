import { KlassData, Pruefung, WorkspaceShortData } from "../communication/Data";
import { w2form, w2popup, w2ui } from 'w2ui'
import { AdminMessages } from "./AdministrationMessages";


export class NewPruefungPopup {

    static callbackCancel: () => void;
    static callbackOK: (newPruefung: Pruefung) => void;

    static open(classList: KlassData[], workspaces: WorkspaceShortData[],
        callbackCancel: () => void,
        callbackOK: (newPruefung: Pruefung) => void) {

        NewPruefungPopup.callbackOK = callbackOK;
        NewPruefungPopup.callbackCancel = callbackCancel;

        w2ui["NewPruefungForm"]?.destroy();
        let form = new w2form({
            name: 'NewPruefungForm',
            style: 'border: 0px; background-color: transparent;',
            fields: [
                {
                    field: 'name', type: 'text', required: true,
                    html: { label: AdminMessages.nameOfTest(), attr: 'style="width: 300px"' }
                },
                {
                    field: 'klasse', type: 'list',
                    html: { label: AdminMessages.classWord(), attr: 'style="width: 300px"' },
                    options: { items: classList.sort((a, b) => a.text.localeCompare(b.text)) }
                },
                {
                    field: 'templateA', type: 'list',
                    html: { label: AdminMessages.templateWorkspace() + " A", attr: 'style="width: 450px"' },
                    options: { items: workspaces }
                },
                {
                    field: 'templateB', type: 'list',
                    html: { label: AdminMessages.templateWorkspace() + " B", attr: 'style="width: 450px"' },
                    options: { items: workspaces }
                },
            ],
            record: {
                name: "",
                klasse: classList.length > 0 ? classList[0] : null,
                template: workspaces[0]
            },
            actions: {
                "cancel": function () {
                    w2popup.close();
                    NewPruefungPopup.callbackCancel();
                    form.destroy();
                },
                "ok": function () {
                    w2popup.close();
                    NewPruefungPopup.callbackOK(
                        {
                            id: -1,
                            klasse_id: this.record["klasse"].id,
                            state: "preparing",
                            template_workspace_a_id: this.record["templateA"]?.id,
                            template_workspace_b_id: this.record["templateB"]?.id,
                            name: this.record["name"]
                        }
                    );
                    form.destroy();
                }
            }
        });



        w2popup.open({
            title: AdminMessages.createNewTest(),
            body: '<div id="form" style="width: 100%; height: 100%;"></div>',
            style: 'padding: 15px 0px 0px 0px',
            width: 750,
            height: 300,
            showMax: false
        }).then(() => {
            form.render("#w2ui-popup #form");
        });


    }

}