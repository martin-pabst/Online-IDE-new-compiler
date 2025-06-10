import jQuery from 'jquery';
import { getSelectedObject, makeDiv, setSelectItems } from "../../../tools/HtmlTools.js";
import { ajax } from "../../communication/AjaxHelper.js";
import { AttachWorkspaceToRepositoryRequest, AttachWorkspaceToRepositoryResponse, GetRepositoryListRequest, GetRepositoryListResponse, RepositoryInfo } from "../../communication/Data.js";
import { Main } from "../../main/Main.js";
import { Workspace } from "../../workspace/Workspace.js";
import { RepocheckoutManagerMessages } from '../language/RepositoryMessages.js';


export class RepositoryCheckoutManager {

    guiReady: boolean = false;

    $mainHeading: JQuery<HTMLDivElement>;

    $repoListDiv: JQuery<HTMLElement>;

    $exitButton: JQuery<HTMLElement>;
    $checkoutButton: JQuery<HTMLElement>;

    $workspaceDropdown: JQuery<HTMLSelectElement>;
    $filterButtonDiv: JQuery<HTMLElement>;
    $filterInput: JQuery<HTMLInputElement>;

    filterbuttonOptions = [RepocheckoutManagerMessages.all(), RepocheckoutManagerMessages.private(), 
        RepocheckoutManagerMessages.accessableForClass(), RepocheckoutManagerMessages.accessableForSchool()];

    workspace: Workspace;

    repositories: RepositoryInfo[] = [];
    $codeInput: JQuery<HTMLElement>;

    constructor(public main: Main) {
    }

    initGUI() {
        this.guiReady = true;
        let that = this;
        let $checkoutDiv = jQuery('#checkoutRepo-div');

        $checkoutDiv.append(this.$mainHeading = makeDiv('checkoutRepo-mainHeading', "createUpdateRepo-mainHeading", ""));
        this.$mainHeading.append(makeDiv("", "", RepocheckoutManagerMessages.caption()));
        this.$mainHeading.append(this.$exitButton = makeDiv("", "jo_synchro_button", RepocheckoutManagerMessages.backToCoding(), { "background-color": "var(--speedcontrol-grip)", "color": "var(--fontColorLight)", "font-size": "10pt" }));
        this.$exitButton.on("click", () => { that.exitButtonClicked() })


        let $divBelow = makeDiv("checkoutRepo-divBelow");
        $checkoutDiv.append($divBelow);

        let $chooseWorkspaceDiv = makeDiv("", "checkoutRepo-chooseDiv");
        $divBelow.append($chooseWorkspaceDiv);
        $chooseWorkspaceDiv.append(makeDiv("", "checkoutRepo-minorHeading", RepocheckoutManagerMessages.connectThisWorkspaceToRepository()));
        this.$workspaceDropdown = jQuery('<select></select>');
        $chooseWorkspaceDiv.append(this.$workspaceDropdown);

        let $codeDiv = makeDiv("", "checkoutRepo-chooseDiv");
        $divBelow.append($codeDiv);
        $codeDiv.append(makeDiv("", "checkoutRepo-minorHeading", RepocheckoutManagerMessages.inputRepositoryCode()));
        this.$codeInput = jQuery('<input type="text"></input>');
        $codeDiv.append(this.$codeInput);

        this.$codeInput.on("input", (e) => {
            let text = that.$codeInput.val();
            if(text == ''){
                this.$repoListDiv.show();
            } else {
                this.$repoListDiv.hide();
            }
        });

        let $publishedToFilterDiv = makeDiv("", "checkoutRepo-chooseDiv");
        $divBelow.append($publishedToFilterDiv);
        $publishedToFilterDiv.append(makeDiv("", "checkoutRepo-minorHeading", RepocheckoutManagerMessages.showTheseRepositories()));
        this.$filterButtonDiv = jQuery('<fieldset></fieldset>');
        $publishedToFilterDiv.append(this.$filterButtonDiv);

        this.filterbuttonOptions.forEach((value, index) => {
            let $radioButton = jQuery(`<input type="radio" id="b${index}" name="publishedFilter" value="${index}" ${index == 0 ? "checked" : ""}>`);
            $radioButton.data('value', index);
            $radioButton.on("change", (e) => {
                that.showRepositories();
            })
            this.$filterButtonDiv.append($radioButton);
            this.$filterButtonDiv.append(jQuery(`<label for="b${index}">${value}</label>`));
        })

        let $inputFilterDiv = makeDiv("", "checkoutRepo-chooseDiv");
        $divBelow.append($inputFilterDiv);
        $inputFilterDiv.append(makeDiv("", "checkoutRepo-minorHeading", RepocheckoutManagerMessages.filterSearch()));
        this.$filterInput = jQuery('<input type="text"></input>');
        $inputFilterDiv.append(this.$filterInput);

        this.$filterInput.on("input", (e) => {
            that.showRepositories();
        });

        $divBelow.append(makeDiv('', 'updateRepo-minorHeading', 'Repositories:', {'margin-bottom': '10px', 'margin-top': '20px'}));

        this.$repoListDiv = makeDiv('checkoutRepo-repoListDiv', 'jo_scrollable');
        $divBelow.append(this.$repoListDiv);

        let $buttonDiv = makeDiv("updateRepo-buttonDiv");

        $buttonDiv.append(this.$checkoutButton = makeDiv("", "jo_synchro_button", "Checkout", { "background-color": "var(--updateButtonBackground)", "color": "var(--updateButtonColor)" }));
        this.$checkoutButton.on("click", () => { that.checkoutButtonClicked() })

        $divBelow.append($buttonDiv);

    }

    show(workspace: Workspace) {

        if (!this.guiReady) {
            this.initGUI();
        }

        let $checkoutDiv = jQuery('#checkoutRepo-div');
        $checkoutDiv.css('visibility', 'visible');
        let $mainDiv = jQuery('#main');
        $mainDiv.css('visibility', 'hidden');

        let user = this.main.user;

        let grlq: GetRepositoryListRequest = {
            onlyOwnRepositories: false
        }

        this.$repoListDiv.empty();
        let that = this;
        ajax('getRepositoryList', grlq, (response: GetRepositoryListResponse) => {

            this.repositories = response.repositories;

            this.showRepositories();

        });

        // Init Workspace-Dropdown
        this.$workspaceDropdown.empty();
        setSelectItems(this.$workspaceDropdown, [{
            caption: RepocheckoutManagerMessages.createNewWorkspace(),
            object: null,
            value: -1
        }].concat(this.main.workspaceList.filter(ws => ws.repository_id == null && !ws.isFolder).map(ws => {
            return {
                caption: ws.name,
                object: ws,
                value: ws.id
            }
        }))
        , -1);

        this.main.windowStateManager.registerOneTimeBackButtonListener(() => {
            that.hide();
        });

    }


    showRepositories(){

        let that = this;

        this.$repoListDiv.find('.checkoutRepo-repoListItem').remove();

        let published_to = this.$filterButtonDiv.find('input:checked').data('value') - 1;

        let filteredRepositories: RepositoryInfo[] = published_to < 0 ? this.repositories :
            this.repositories.filter(repoInfo => repoInfo.published_to == published_to);

        let filterSearch: string = <string>this.$filterInput.val();
        filterSearch = filterSearch.toLocaleLowerCase();

        if(filterSearch != ""){
            filteredRepositories = filteredRepositories.filter(
                repInfo => [repInfo.owner_username , repInfo.owner_name , repInfo.name , repInfo.description].join(" ").toLocaleLowerCase().indexOf(filterSearch) >= 0
            )
        }

        filteredRepositories.forEach(repInfo => {
            let $div = makeDiv('', 'checkoutRepo-repoListItem');
            let $divLeft = makeDiv('', 'checkoutRepo-repoListItemLeft');
            $div.append($divLeft);

            $divLeft.append(makeDiv('', 'checkoutRepo-repoListName', repInfo.name));
            $divLeft.append(makeDiv('', 'checkoutRepo-repoListOwner', repInfo.owner_name + " (" + repInfo.owner_username + ")"));

            let $divRight = makeDiv('', 'checkoutRepo-repoListItemRight', repInfo.description);
            $div.append($divRight);

            this.$repoListDiv.append($div);
            $div.data('repoInfo', repInfo);
            $div.on("click", () => {
                that.selectRepository($div, repInfo);
            })
        });

        this.selectFirstRepository();

    }

    selectRepository($repoDiv: JQuery<HTMLDivElement>, repInfo: RepositoryInfo) {
        this.$repoListDiv.find('.checkoutRepo-repoListItem').removeClass('active');
        if($repoDiv != null){
            $repoDiv.addClass('active');
        }
    }

    selectFirstRepository(){
        this.$repoListDiv.find('.checkoutRepo-repoListItem').removeClass('active');
        this.$repoListDiv.find('.checkoutRepo-repoListItem').first().addClass('active');
    }

    hide() {
        let $synchroDiv = jQuery('#checkoutRepo-div');
        $synchroDiv.css('visibility', 'hidden');
        let $mainDiv = jQuery('#main');
        $mainDiv.css('visibility', 'visible');
    }

    checkoutButtonClicked() {

        let repositoryId: number = -1;
        let secret: string = null;

        let combinedSecret = <string>this.$codeInput.val();
        if(combinedSecret != ""){
            let tIndex = combinedSecret.indexOf('T');
            if(tIndex < 0){
                alert(RepocheckoutManagerMessages.codeMustContainT());
                return;
            }
            let number = Number.parseInt(combinedSecret.substring(0, tIndex));
            if(number >= 0){
                repositoryId = number;
                secret = combinedSecret.substring(tIndex + 1);
            } else {
                alert (RepocheckoutManagerMessages.digitPriorToTInsideCode());
                return;
            }
        } else {
            let selectedItem = this.$repoListDiv.find('.active').first();
            let repoData: RepositoryInfo = <any>selectedItem.data('repoInfo');
            repositoryId = repoData.id;
        }

        let workspace: Workspace = getSelectedObject(this.$workspaceDropdown);

        let request: AttachWorkspaceToRepositoryRequest = {
            repository_id: repositoryId,
            createNewWorkspace: workspace == null,
            workspace_id: workspace == null ? null : workspace.id,
            secret: secret
        }

        let that = this;
        ajax('attachWorkspaceToRepository', request, (response: AttachWorkspaceToRepositoryResponse) => {

            if(response.message != null){
                alert(response.message);
                return;
            }

            if(workspace == null && response.new_workspace != null){

                let newWorkspace = that.main.networkManager.createNewWorkspaceFromWorkspaceData(response.new_workspace);
                that.main.projectExplorer.workspaceListPanel.sortElements();
                setTimeout(() => {
                    that.main.projectExplorer.setWorkspaceActive(newWorkspace, true);
                }, 400);

                alert(RepocheckoutManagerMessages.newWorkspaceCreateSuccessfully(response.new_workspace.name));

            } else {

                workspace.repository_id = repositoryId;
                let explorer = that.main.projectExplorer;
                explorer.workspaceListPanel.setElementClass(workspace.panelElement, "repository");
                alert(RepocheckoutManagerMessages.workspaceSuccessfullyConnectedToRepository(workspace.name));

            }

            window.history.back();

        });

        // let updateRepositoryRequest: UpdateRepositoryRequest = {
        //     owner_id: owner.user_id,
        //     description: <string>this.$repoDescription.val(),
        //     published_to: published_to,
        //     repository_id: repoData.id
        // };

        // ajax("updateRepository", updateRepositoryRequest, (response: UpdateRepositoryResponse) => {

        //     //TODO: update user write access..


        // });



    }


    exitButtonClicked() {
        this.hide();
    }


}