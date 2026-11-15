import { Main } from "../Main.js";
import { openContextMenu, ContextMenuItem } from "../../../tools/HtmlTools.js";
import { Dialog } from "./Dialog.js";
import { ajax } from "../../communication/AjaxHelper.js";
import jQuery from 'jquery';
import { UserMenuMessages } from "./language/GUILanguage.js";
import type { EnrolToClassRequest, EnrolToClassResponse, UserData } from "../../communication/Data.js";

export class UserMenu {



    constructor(private main: Main){

    }

    init(user: UserData){
        let $userSettingsButton = jQuery('#buttonUserSettings');
        let that = this;

        let isStudent = !user.is_teacher && !user.is_admin && !user.is_schooladmin && !user.is_testuser;
        let hasChangePassword = !user.vidis_akronym;

        if (!hasChangePassword && !isStudent) {
            $userSettingsButton.css("display", "none");
        } else {
            $userSettingsButton.css("display", "");
            $userSettingsButton.off("click").on("click", (e) => {
                let contextMenuItems: ContextMenuItem[] = [];

                if (hasChangePassword) {
                    contextMenuItems.push({
                        caption: UserMenuMessages.changePassword() + "...",
                        callback: () => {
                            let passwortChanger = new PasswordChanger(that.main);
                            passwortChanger.show();
                        }
                    });
                }

                if (isStudent) {
                    contextMenuItems.push({
                        caption: UserMenuMessages.enrolInClass(),
                        callback: () => {
                            let key = prompt(UserMenuMessages.enterEnrolmentKey());
                            if (key == null || key.trim() === "") return;

                            let request: EnrolToClassRequest = { key: key.trim() };
                            ajax("enrolInClass", request, (response: EnrolToClassResponse) => {
                                alert(UserMenuMessages.enrolInClassSuccess(response.className ?? ""));
                            }, (message: string) => {
                                alert(UserMenuMessages.enrolInClassError(message));
                            });
                        }
                    });
                }

                openContextMenu(contextMenuItems, $userSettingsButton.offset().left, $userSettingsButton.offset().top + $userSettingsButton.height());
            });
        }

    }


}


export class PasswordChanger {

    dialog: Dialog;

    constructor(private main: Main){

        this.dialog = new Dialog();

    }

    show() {
        this.dialog.initAndOpen();
        this.dialog.heading(UserMenuMessages.changePassword());
        this.dialog.description(UserMenuMessages.changePasswordDescription())
        let $oldPassword = this.dialog.input("password", UserMenuMessages.oldPassword());
        let $newPassword1 = this.dialog.input("password", UserMenuMessages.newPassword());
        let $newPassword2 = this.dialog.input("password", UserMenuMessages.repeatNewPassword());
        let $errorDiv = this.dialog.description("", "red");
        let waitDiv = this.dialog.waitMessage(UserMenuMessages.pleaseWait())

        this.dialog.buttons([
            {
                caption: UserMenuMessages.cancel(),
                color: "#a00000",
                callback: () => {this.dialog.close()}
            },
            {
                caption: UserMenuMessages.ok(),
                color: "green",
                callback: () => {
                    if($newPassword1.val() != $newPassword2.val()){
                        $errorDiv.text(UserMenuMessages.passwordsDontMatch())
                    } else {
                        waitDiv(true);
                        ajax("changePassword", {oldPassword: $oldPassword.val(), newPassword: $newPassword1.val()}, () => {
                            waitDiv(false);
                            alert(UserMenuMessages.settingPasswordSuccessful());
                            this.dialog.close();
                        }, (message) => {
                            waitDiv(false);
                            $errorDiv.text(message)
                        })
                    }

                }
            },
        ])
    }

}