import jQuery from 'jquery';
import { ajax } from "../communication/AjaxHelper.js";
import { getUserDisplayName, LoginRequest, LoginResponse, LogoutRequest, UserData } from "../communication/Data.js";
import { Main } from "./Main.js";
import { Helper } from "./gui/Helper.js";
import { SoundTools } from "../../tools/SoundTools.js";
import { UserMenu } from "./gui/UserMenu.js";
import { escapeHtml } from "../../tools/StringTools.js";
import { PruefungManagerForStudents } from './pruefung/PruefungManagerForStudents.js';
import { PushClientManager } from '../communication/pushclient/PushClientManager.js';
import { DatabaseNewLongPollingListener } from '../../tools/database/DatabaseNewLongPollingListener.js';
import { SqlIdeUrlHolder } from './SqlIdeUrlHolder.js';
import { AutoLogout } from './AutoLogout.js';
import { SchedulerState } from "../../compiler/common/interpreter/SchedulerState.js";
import * as monaco from 'monaco-editor';
import { LoginMessages } from './language/MainLanguage.js';
import { Settings } from '../settings/Settings.js';

export class Login {

    loggedInWithVidis: boolean = false;

    constructor(private main: Main) {
        new AutoLogout(this);
    }

    initGUI() {

        let that = this;
        jQuery('#login').css('display', 'flex');
        jQuery('#bitteWarten').css('display', 'none');

        let $loginSpinner = jQuery('#login-spinner>img');

        jQuery('#login-username').focus();

        jQuery('#login-username').on('keydown', (e) => {
            if (e.key == "Enter") {
                jQuery('#login-password').focus();
            }
        });

        jQuery('#login-password').on('keydown', (e) => {
            if (e.key == "Enter") {
                jQuery('#login-button').trigger('click');
            }
        });

        jQuery('#login-password').on('keydown', (e) => {
            if (e.key == "Tab") {
                e.preventDefault();
                jQuery('#login-button').focus();
                jQuery('#login-button').addClass('jo_active');
            }
            if (e.key == "Enter") {
                jQuery('#login-button').trigger('click');
            }
        });

        jQuery('#login-button').on('keydown', (e) => {
            if (e.key == "Tab") {
                e.preventDefault();
                jQuery('#login-username').focus();
                jQuery('#login-button').removeClass('jo_active');
            } else {
                jQuery('#login-button').trigger('click');
            }
        });


        jQuery('#jo_testuser-login-button').on('click', () => {
            jQuery('#login-username').val('Testuser');
            jQuery('#login-password').val('');
            jQuery('#login-button').trigger('click');

        })

        // Avoid double login when user does doubleclick:
        let loginHappened = false;
        jQuery('#login-button').on('click', () => {

            SoundTools.init();

            $loginSpinner.show();

            if (loginHappened) return;
            loginHappened = true;

            setTimeout(() => {
                loginHappened = false;
            }, 1000);

            this.sendLoginRequest(null);

        });

        jQuery('#buttonLogout').on('click', () => {
            that.logout();
        });


    }

    logout() {
        if (!this.main.user || this.main.user.is_testuser) {
            window.location.assign("/");
            return;
        }

        this.main.interpreter.eventManager.fire("resetRuntime");

        jQuery('#bitteWartenText').html(LoginMessages.pleaseWaitWhileSaving());
        jQuery('#bitteWarten').css('display', 'flex');
        
        if (this.main.workspacesOwnerId != this.main.user.id) {
            this.main.projectExplorer.onHomeButtonClicked();
        }
        
        this.main.networkManager.sendUpdatesAsync().then(() => {
            
            this.main.pruefungManagerForStudents?.stopPruefung(false);
            
            this.main.rightDiv.classDiagram.clearAfterLogout();
            
            let logoutRequest: LogoutRequest = {
                currentWorkspaceId: this.main.currentWorkspace?.pruefung_id == null ? this.main.currentWorkspace?.id : null
            }
            
            let that = this;
            ajax('logout', logoutRequest, () => {
                // window.location.href = 'index.html';
                
                if (this.loggedInWithVidis) {
                    // window.location.assign("https://aai-test.vidis.schule/auth/realms/vidis/protocol/openid-connect/logout?ID_TOKEN_HINT=" + this.main.user.vidis_sub + "&post_logout_redirect_uri=https%3A%2F%2Fwww.online-ide.de");
                    window.location.assign("https://aai.vidis.schule/auth/realms/vidis/protocol/openid-connect/logout?ID_TOKEN_HINT=" + this.main.user.vidis_sub + "&post_logout_redirect_uri=https%3A%2F%2Fwww.online-ide.de");
                    
                } else {
                    jQuery('#bitteWartenText').html(LoginMessages.done());
                    window.location.assign("/");
                    // that.showLoginForm();
                }

            });
        });

        PushClientManager.getInstance().close();
        DatabaseNewLongPollingListener.close();


    }

    sendLoginRequest(singleUseToken: string | null) {
        let that = this;

        let servlet = "login";

        let loginRequest: LoginRequest = {
            username: <string>jQuery('#login-username').val(),
            password: <string>jQuery('#login-password').val(),
            singleUseToken: singleUseToken
        }

        ajax(servlet, loginRequest, (response: LoginResponse) => {

            if (!response.success) {
                jQuery('#login-message').html(LoginMessages.wrongUsernameOrPassword());
                jQuery('#login-spinner>img').hide();
            } else {

                // We don't do this anymore for security reasons - see AjaxHelper.ts
                // Alternatively we now set a long expiry interval for cookie.
                // credentials.username = loginRequest.username;
                // credentials.password = loginRequest.password;

                jQuery('#login').hide();
                jQuery('#main').css('visibility', 'visible');

                jQuery('#bitteWartenText').html(LoginMessages.pleaseWait());
                jQuery('#bitteWarten').css('display', 'flex');

                let user: UserData = response.user;
                user.is_testuser = response.isTestuser;

                if (user.gui_state == null || user.gui_state.helperHistory == null) {
                    user.gui_state = {
                        helperHistory: {
                            consoleHelperDone: false,
                            newFileHelperDone: false,
                            newWorkspaceHelperDone: false,
                            speedControlHelperDone: false,
                            homeButtonHelperDone: false,
                            stepButtonHelperDone: false,
                            repositoryButtonDone: false,
                            folderButtonDone: false
                        },
                        viewModes: null,
                        classDiagram: null,
                        language: 'de'
                    }
                }

                that.main.user = user;
                that.main.settings = new Settings(user, 
                    response.userSettings, response.classSettings, response.schoolSettings);

                that.main.languagemanager.setLanguage(user.gui_state.language);

                SqlIdeUrlHolder.sqlIdeURL = response.sqlIdeForOnlineIdeClient + "/servlet/";

                this.main.startupAfterLogin();

                that.main.mainMenu.initGUI(user, "");

                that.main.bottomDiv.gradingManager?.initGUI();

                jQuery('#bitteWarten').hide();
                let $loginSpinner = jQuery('#login-spinner>img');
                $loginSpinner.hide();
                jQuery('#menupanel-username').html(escapeHtml(getUserDisplayName(user)));

                new UserMenu(that.main).init();

                if (user.is_teacher) {
                    that.main.initTeacherExplorer(response.classdata);
                }


                that.main.workspacesOwnerId = user.id;
                that.main.restoreWorkspaces(response.workspaces, true);

                that.main.networkManager.initializeTimer();

                that.main.projectExplorer.fileTreeview.setFixed(!user.is_teacher);
                that.main.projectExplorer.workspaceTreeview.setFixed(!user.is_teacher);

                that.main.rightDiv?.classDiagram?.clear();

                if (user.gui_state.classDiagram != null) {
                    that.main.rightDiv?.classDiagram?.deserialize(user.gui_state.classDiagram);
                }

                that.main.viewModeController.initViewMode();
                that.main.bottomDiv.hideHomeworkTab();

                if (!this.main.user.gui_state.helperHistory.folderButtonDone && that.main.projectExplorer.workspaceTreeview.elements.length > 5) {

                    Helper.showHelper("folderButton", this.main, jQuery('.img_add-folder-dark'));

                }

                that.main.networkManager.initializeSSE();

                this.main.pruefungManagerForStudents?.close();

                if (!user.is_teacher && !user.is_admin && !user.is_schooladmin) {
                    this.main.pruefungManagerForStudents = new PruefungManagerForStudents(this.main);
                    if (response.activePruefung != null) {

                        let workspaceData = this.main.workspaceList.filter(w => w.pruefung_id == response.activePruefung.id)[0].getWorkspaceData(true);

                        this.main.pruefungManagerForStudents.startPruefung(response.activePruefung);
                    }
                }

            }

        }, (errorMessage: string) => {
            jQuery('#login-message').html(LoginMessages.loginFailed() + errorMessage);
            jQuery('#login-spinner>img').hide();
        }
        );

    }

    loginWithVidis(singleUseToken: string) {
        this.loggedInWithVidis = true;
        jQuery('#login').hide();
        jQuery('#main').css('visibility', 'visible');

        jQuery('#bitteWartenText').html(LoginMessages.pleaseWait());
        jQuery('#bitteWarten').css('display', 'flex');
        this.sendLoginRequest(singleUseToken);
    }


    private showLoginForm() {
        jQuery('#login').show();
        jQuery('#main').css('visibility', 'hidden');
        jQuery('#bitteWarten').css('display', 'none');
        jQuery('#login-message').empty();
        this.main.interpreter.setState(SchedulerState.not_initialized);
        this.main.getMainEditor().setModel(monaco.editor.createModel("", "myJava"));
        this.main.projectExplorer.fileTreeview.clear();
        this.main.projectExplorer.fileTreeview.setCaption('');
        this.main.projectExplorer.workspaceTreeview.clear();
        this.main.bottomDiv?.console?.clear();
        this.main.interpreter.printManager.clear();

        if (this.main.teacherExplorer != null) {
            this.main.teacherExplorer.removePanels();
            this.main.teacherExplorer = null;
        }

        this.main.currentWorkspace = null;
        this.main.user = null;

    }

}