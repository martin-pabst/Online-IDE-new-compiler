import jQuery from 'jquery';
import { copyTextToClipboard, getSelectedObject, makeDiv, openContextMenu, SelectItem, setSelectItems } from "../../../tools/HtmlTools.js";
import { ajax } from "../../communication/AjaxHelper.js";
import { DeleteRepositoryRequest, GetRepositoryListRequest, GetRepositoryListResponse, GetRepositoryUserListRequest, GetRepositoryUserListResponse, RepositoryInfo, RepositoryUser, RepositoryUserWriteAccessData, UpdateRepositoryRequest, UpdateRepositoryResponse, UpdateRepositoryUserWriteAccessRequest, UpdateRepositoryUserWriteAccessResponse } from "../../communication/Data.js";
import { Main } from "../../main/Main.js";
import { Workspace } from "../../workspace/Workspace.js";
import { RepositoryCreateManagerMessages, RepositorySettingsMessages } from '../language/RepositoryMessages.js';


export class RepositorySettingsManager {

    guiReady: boolean = false;

    $mainHeading: JQuery<HTMLDivElement>;

    $settingsDiv: JQuery<HTMLElement>;
    $repoName: JQuery<HTMLInputElement>;
    $repoDescription: JQuery<HTMLTextAreaElement>;
    $repoPublishedTo: JQuery<HTMLSelectElement>;
    $repoOwner: JQuery<HTMLSelectElement>;

    $repoListDiv: JQuery<HTMLElement>;

    $userlistDiv: JQuery<HTMLElement>;

    $exitButton: JQuery<HTMLElement>;
    $saveButton: JQuery<HTMLElement>;
    $deleteButton: JQuery<HTMLElement>;

    $settingsSecretRead: JQuery<HTMLElement>;
    $settingsSecretWrite: JQuery<HTMLElement>;

    publishedToItems: SelectItem[] = [];

    repositoryOwnerItems: SelectItem[] = [];

    users: RepositoryUser[] = [];

    workspace: Workspace;
    repositoryInfo: RepositoryInfo;

    constructor(public main: Main) {
    }

    initGUI() {
        this.guiReady = true;
        let that = this;
        let $updateDiv = jQuery('#updateRepo-div');

        $updateDiv.append(this.$mainHeading = makeDiv('updateRepo-mainHeading', "createUpdateRepo-mainHeading", ""));
        this.$mainHeading.append(makeDiv("", "", RepositorySettingsMessages.caption()));
        this.$mainHeading.append(this.$exitButton = makeDiv("", "jo_synchro_button", RepositorySettingsMessages.backToCoding(), { "background-color": "var(--speedcontrol-grip)", "color": "var(--fontColorLight)", "font-size": "10pt" }));
        this.$exitButton.on("click", () => { that.exitButtonClicked() })


        let $divBelow = makeDiv("updateRepo-divBelow");
        $updateDiv.append($divBelow);

        let $divLeft = makeDiv("updateRepo-divLeft");
        $divBelow.append($divLeft);

        $divLeft.append(makeDiv('', 'updateRepo-minorHeading', RepositorySettingsMessages.repositories()));

        this.$repoListDiv = makeDiv("updateRepo-repoListDiv");
        $divLeft.append(this.$repoListDiv);

        let $rightDiv = makeDiv("updateRepo-divRight");
        $divBelow.append($rightDiv);

        this.$settingsDiv = makeDiv("", "createUpdateRepo-settingsDiv");
        $rightDiv.append(this.$settingsDiv);

        this.$settingsDiv.append(jQuery(`<div class="createUpdateRepo-settingsLabel">${RepositoryCreateManagerMessages.nameOfRepository()}</div>`));
        this.$settingsDiv.append(this.$repoName = jQuery(`<input type="text" class="createUpdateRepo-inputcolumn"></input>`));
        this.$repoName.on("input", () => { that.enableSaveButton() });

        this.$settingsDiv.append(jQuery(`<div class="createUpdateRepo-settingsLabel">${RepositoryCreateManagerMessages.description()}</div>`));
        this.$settingsDiv.append(this.$repoDescription = jQuery(`<textarea class="createUpdateRepo-inputcolumn" style="min-height: 4em"></textarea>`));
        this.$repoDescription.on("input", () => { that.enableSaveButton() });


        this.$settingsDiv.append(jQuery(`<div class="createUpdateRepo-settingsLabel">${RepositoryCreateManagerMessages.publishedFor()}</div>`));
        this.$settingsDiv.append(this.$repoPublishedTo = jQuery(`<select class="createUpdateRepo-inputcolumn"></select>`));
        this.$repoPublishedTo.on("change", () => { that.enableSaveButton() });

        this.$settingsDiv.append(jQuery(`<div class="createUpdateRepo-settingsLabel">` + RepositorySettingsMessages.owner() + `</div>`));
        this.$settingsDiv.append(this.$repoOwner = jQuery(`<select class="createUpdateRepo-inputcolumn"></select>`));
        this.$repoOwner.on("change", () => { that.enableSaveButton() });

        this.$settingsDiv.append(jQuery(`<div class="createUpdateRepo-settingsLabel">${RepositorySettingsMessages.codeForRepoReadAccess()}</div>`));
        let $setSecrDivRead = jQuery(`<div class="createUpdateRepo-settingsSecret"></div>`);
        this.$settingsDiv.append($setSecrDivRead);
        this.$settingsSecretRead = jQuery('<div class="createUpdateRepo-settingsSecretSecret">---</div>')
        $setSecrDivRead.append(this.$settingsSecretRead);

        let $setSecrReadCopyButton = jQuery(`<button class="jo_button jo_copy_secret_button jo_active">${RepositorySettingsMessages.copy()}</button>`);
        $setSecrDivRead.append($setSecrReadCopyButton);
        $setSecrReadCopyButton.on("pointerdown", () => {copyTextToClipboard(this.$settingsSecretRead.text())})

        let $setSecrReadButton = jQuery(`<button class="jo_button jo_set_secret_button jo_active">${RepositorySettingsMessages.change()}</button>`);
        $setSecrDivRead.append($setSecrReadButton);
        $setSecrReadButton.on("pointerdown", () => {that.setSecret(true, false)})

        this.$settingsDiv.append(jQuery(`<div class="createUpdateRepo-settingsLabel">${RepositorySettingsMessages.codeForRepoWriteAccess()}</div>`));
        let $setSecrDivWrite = jQuery('<div class="createUpdateRepo-settingsSecret"></div>');
        this.$settingsDiv.append($setSecrDivWrite);
        this.$settingsSecretWrite = jQuery('<div class="createUpdateRepo-settingsSecretSecret">---</div>')
        $setSecrDivWrite.append(this.$settingsSecretWrite);

        let $setSecrWriteCopyButton = jQuery(`<button class="jo_button jo_copy_secret_button jo_active">${RepositorySettingsMessages.copy()}</button>`);
        $setSecrDivWrite.append($setSecrWriteCopyButton);
        $setSecrWriteCopyButton.on("pointerdown", () => {copyTextToClipboard(this.$settingsSecretWrite.text())})

        let $setSecrWriteButton = jQuery(`<button class="jo_button jo_set_secret_button jo_active">${RepositorySettingsMessages.change()}</button>`);
        $setSecrDivWrite.append($setSecrWriteButton);
        $setSecrWriteButton.on("pointerdown", () => {that.setSecret(false, true)})

        $rightDiv.append(this.$userlistDiv = makeDiv("updateRepo-userlistDiv"));

        this.$userlistDiv.append(makeDiv(null, "updateRepo-userlistheading", RepositorySettingsMessages.repositoryUsers(), { "grid-column": 1 }))
        this.$userlistDiv.append(makeDiv(null, "updateRepo-userlistheading", RepositorySettingsMessages.writeAccess(), { "grid-column": 2 }))

        let $buttonDiv = makeDiv("updateRepo-buttonDiv");

        $buttonDiv.append(this.$saveButton = makeDiv("", "jo_synchro_button", RepositorySettingsMessages.saveChanges(), { "background-color": "var(--updateButtonBackground)", "color": "var(--updateButtonColor)" }));
        this.$saveButton.on("click", () => { that.saveButtonClicked() })
        this.$saveButton.hide();

        $rightDiv.append($buttonDiv);

    }

    setSecret(read: boolean, write: boolean){

        this.main.networkManager.sendSetSecret(this.repositoryInfo.id, read, write, (response) => {
            let praefix = this.repositoryInfo.id + "T";
            this.$settingsSecretRead.text(praefix + response.secret_read);
            this.$settingsSecretWrite.text(praefix + response.secret_write);
        })

    }

    enableSaveButton() {
        this.$saveButton.show();
    }

    show(repository_id: number) {

        if (!this.guiReady) {
            this.initGUI();
        }

        let $synchroDiv = jQuery('#updateRepo-div');
        $synchroDiv.css('visibility', 'visible');
        let $mainDiv = jQuery('#main');
        $mainDiv.css('visibility', 'hidden');

        let user = this.main.user;
        let is_student = !(user.is_teacher || user.is_admin || user.is_schooladmin);

        this.publishedToItems = [
            { value: 0, object: 0, caption: RepositoryCreateManagerMessages.privateRepository() },
            { value: 1, object: 1, caption: is_student ? RepositoryCreateManagerMessages.publishedToClassStudents() : RepositoryCreateManagerMessages.publishedToClasses() },
            { value: 2, object: 2, caption: RepositoryCreateManagerMessages.publishedToSchool() },
        ];

        setSelectItems(this.$repoPublishedTo, this.publishedToItems, 0);

        this.$saveButton.show();

        this.showRepositoryList();

        let that = this;

        this.main.windowStateManager.registerOneTimeBackButtonListener(() => {
            that.hide();
        });

    }

    deleteRepository(repInfo: RepositoryInfo) {

        let that = this;
        let request: DeleteRepositoryRequest = { repository_id: repInfo.id };
        ajax('deleteRepository', request, () => {
            that.showRepositoryList();
            let workspaces = that.main.workspaceList.filter((ws) => {return ws.repository_id == repInfo.id});
            for(let ws of workspaces){
                ws.repository_id = null;
                let node = this.main.projectExplorer.workspaceTreeview.findNodeByElement(ws);
                node.iconClass = "img_workspace-dark";
                ws.renderSynchronizeButton(node);
            }
        });

    }

    showRepositoryList() {
        this.emptyRepositoryInfo();
        let grlq: GetRepositoryListRequest = {
            onlyOwnRepositories: true
        }

        this.$repoListDiv.empty();
        let that = this;
        ajax('getRepositoryList', grlq, (response: GetRepositoryListResponse) => {

            let $firstDiv: JQuery<HTMLDivElement>;
            let firstRepInfo: RepositoryInfo;

            if(response.repositories.length == 0){
                alert(RepositorySettingsMessages.noRepositoryPresent());
                that.exitButtonClicked();
                return;
            }

            response.repositories.forEach(repInfo => {
                let $div = makeDiv('', 'updateRepo-repoListItem');
                let $namediv = makeDiv('', '', repInfo.name);
                let $deleteDiv = jQuery(`<div class="img_delete jo_button jo_active" title="${RepositorySettingsMessages.deleteRepository()}"></div>`);
                $div.append($namediv, $deleteDiv);
                this.$repoListDiv.append($div);
                $div.on('click', (e) => {
                    that.selectRepository($div, repInfo);
                })
                $div.data('repoInfo', repInfo);
                if (firstRepInfo == null) {
                    firstRepInfo = repInfo;
                    $firstDiv = $div;
                }

                $deleteDiv.on("click", (ev) => {
                    ev.preventDefault();
                    openContextMenu([{
                        caption: RepositorySettingsMessages.cancel(),
                        callback: () => { }
                    }, {
                        caption: RepositorySettingsMessages.sureDelete(),
                        color: "#ff6060",
                        callback: () => {
                            that.deleteRepository(repInfo);
                        }
                    }], ev.pageX + 2, ev.pageY + 2);
                    ev.stopPropagation();
                });
            });

            if ($firstDiv != null) {
                this.selectRepository($firstDiv, firstRepInfo);
            }

        }, (message) => {
            console.log(message);
            alert(RepositorySettingsMessages.noRepositoryPresent());
            that.exitButtonClicked();
            return;
        });
    }

    selectRepository($repoDiv: JQuery<HTMLDivElement>, repInfo: RepositoryInfo) {
        this.repositoryInfo = repInfo;

        this.emptyRepositoryInfo();
        if (this.$saveButton.is(":visible")) {
            let selectedItem = this.$repoListDiv.find('.active').first();
            let repoData: RepositoryInfo = <any>selectedItem.data('repoInfo');
            if (repoData) {
                alert(RepositorySettingsMessages.changesNotSaved(repoData.name));
            }
        }

        this.$saveButton.hide();
        this.$repoListDiv.find('.updateRepo-repoListItem').removeClass('active');
        $repoDiv.addClass('active');
        this.$repoName.val(repInfo.name);
        this.$repoDescription.val(repInfo.description);
        this.$repoPublishedTo.val(repInfo.published_to);
        this.$settingsSecretRead.text(repInfo.secret_read == null ? "--------" : repInfo.id + "T" + repInfo.secret_read);
        this.$settingsSecretWrite.text(repInfo.secret_write == null ? "--------" : repInfo.id + "T" + repInfo.secret_write);

        this.$repoOwner.empty();
        this.$userlistDiv.children().not('.updateRepo-userlistheading').remove();

        let req: GetRepositoryUserListRequest = { repository_id: repInfo.id };
        let that = this;

        ajax('getRepositoryUserList', req, (response: GetRepositoryUserListResponse) => {

            response.repositoryUserList.forEach(userData => {

                let $userDiv = makeDiv("", "updateRepo-userDiv", `${userData.firstName} ${userData.lastName} (${userData.username})`, { 'grid-column': 1 });

                let $canWriteDiv = makeDiv("", "canWriteDiv", "", { 'grid-column': 2 });
                let $canWriteCheckBox = jQuery('<input type="checkbox">');
                $canWriteDiv.append($canWriteCheckBox);

                //@ts-ignore
                $canWriteCheckBox.attr('checked', userData.canWrite);
                $canWriteCheckBox.data('user', userData);
                $canWriteCheckBox.on("change", () => { that.enableSaveButton() });

                that.$userlistDiv.append($userDiv, $canWriteDiv);
            });

            that.$repoOwner.empty();
            let selectedItems = response.repositoryUserList.map(userData => {
                let se: SelectItem = {
                    caption: `${userData.firstName} ${userData.lastName} (${userData.username})`,
                    object: userData,
                    value: userData.user_id + ""
                }
                return se;
            });

            if(!response.repositoryUserList.some(user => user.user_id == repInfo.owner_id)){
                selectedItems.push({
                    caption: `${repInfo.owner_name} (${repInfo.owner_username})`,
                    object: {
                        user_id: repInfo.owner_id,
                        username: repInfo.owner_username,
                        firstName: "",
                        lastName: "",
                        klasse: "",
                        canWrite: true
                    },
                    value: repInfo.owner_id + ""
                })
            }

            setSelectItems(that.$repoOwner, selectedItems, repInfo.owner_id + "")

        });

    }

    emptyRepositoryInfo() {
        this.$repoOwner.empty();
        this.$repoName.val('');
        this.$repoDescription.val('');
        this.$userlistDiv.find('.updateRepo-userDiv').remove();
        this.$userlistDiv.find('.canWriteDiv').remove();
    }

    hide() {
        let $synchroDiv = jQuery('#updateRepo-div');
        $synchroDiv.css('visibility', 'hidden');
        let $mainDiv = jQuery('#main');
        $mainDiv.css('visibility', 'visible');
    }

    saveButtonClicked() {

        let that = this;

        let selectedItem = this.$repoListDiv.find('.active').first();
        let repoData: RepositoryInfo = <any>selectedItem.data('repoInfo');

        let name: string = <string>this.$repoName.val();
        let owner: RepositoryUser = getSelectedObject(this.$repoOwner);
        let published_to: number = getSelectedObject(this.$repoPublishedTo);

        let updateRepositoryRequest: UpdateRepositoryRequest = {
            owner_id: owner.user_id,
            description: <string>this.$repoDescription.val(),
            published_to: published_to,
            repository_id: repoData.id,
            name: name
        };


        // update user write access:

        let writeAccessList: RepositoryUserWriteAccessData[] = [];

        that.$userlistDiv.find('input').each((index, element) => {
            let $element = jQuery(element);
            let user: RepositoryUser = <any>$element.data('user');
            writeAccessList.push({
                has_write_access: <any>jQuery(element).is(':checked'),
                user_id: user.user_id
            });
        });

        let request: UpdateRepositoryUserWriteAccessRequest = {
            repository_id: repoData.id,
            writeAccessList: writeAccessList
        }

        if (repoData.owner_id == owner.user_id ||
              confirm(RepositorySettingsMessages.transferOwnership(repoData.name, owner.username))) {
            ajax('updateRepositoryUserWriteAccess', request, (response: UpdateRepositoryUserWriteAccessResponse) => {


                ajax("updateRepository", updateRepositoryRequest, (response: UpdateRepositoryResponse) => {

                    repoData.name = name;
                    repoData.owner_id = owner.user_id;
                    repoData.owner_name = owner.firstName + " " + owner.lastName;
                    repoData.owner_username = owner.username;
                    repoData.published_to = published_to;
                    repoData.description = updateRepositoryRequest.description;

                    alert(RepositorySettingsMessages.changesSavedSuccessfully())
                    that.$saveButton.hide();
                    that.showRepositoryList();


                }, (errorMessage: string) => {
                    alert(RepositorySettingsMessages.error() + errorMessage);
                    that.exitButtonClicked();
                });

            }, (errorMessage: string) => {
                alert(RepositorySettingsMessages.error() + errorMessage);
                that.exitButtonClicked();
            }
            );
        } else {
            alert(RepositorySettingsMessages.notSaved());
        }
    }


    exitButtonClicked() {
        window.history.back();
    }


}