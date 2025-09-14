import { AdminMenuItem } from "./AdminMenuItem.js";
import { SchoolsWithAdminsMI } from "./SchoolsWithAdminsMI.js";
import { ajax, extractCsrfTokenFromGetRequest, extractLanguageFromGetRequest, fetchGetParameterValue } from "../communication/AjaxHelper.js";
import { GetUserDataResponse, UserData, ClassData } from "../communication/Data.js";
import { TeachersWithClassesMI } from "./TeachersWithClasses.js";
import { ClassesWithStudentsMI } from "./ClassesWithStudentsMI.js";
import { StudentBulkImportMI } from "./StudentBulkImortMI.js";
import { ExportImportMI } from "./ExportImportMI.js";
import { Pruefungen } from "./Pruefungen.js";
import { w2utils } from 'w2ui';
import { AutoLogout } from "../main/AutoLogout.js";
import { SchoolSettings as SchoolSettingsMI } from "./SchoolSettingsMI.js";
import jQuery from 'jquery'

import 'w2ui/w2ui-2.0.css';

import "/assets/css/icons.css";
import "/assets/css/administration.css";
import "/assets/fonts/fonts.css";

import w2uiLocale from '/assets/w2uilocale/de-de.json?url'



export class Administration {

    activeMenuItem: AdminMenuItem = null;

    menuItems: AdminMenuItem[] = [
        new SchoolsWithAdminsMI(this),
        // new SchoolSettingsMI(this),
        new TeachersWithClassesMI(this),
        new ClassesWithStudentsMI(this),
        new ExportImportMI(this),
        new Pruefungen(this)
    ]

    userData: UserData;
    classes: ClassData[];

    async start() {

        await extractCsrfTokenFromGetRequest(true);
        extractLanguageFromGetRequest();

        let that = this;
        //@ts-ignore
        w2utils.locale(w2uiLocale);

        ajax("getUserData", {}, (response: GetUserDataResponse) => {
            that.userData = response.user;
            that.classes = response.classdata;
            this.initMenu();
            new AutoLogout();
            jQuery('#schoolName').text(response.schoolName);
        }, (message) => {
            alert(message);
        });

    }

    initMenu() {

        if (!this.userData.vidis_akronym) {
            this.menuItems.push(new StudentBulkImportMI(this));
        }

        for (let mi of this.menuItems) {
            if (mi.checkPermission(this.userData)) {
                mi.$button = jQuery('<div class="jo_menuitem">' + mi.getButtonIdentifier() + '</div>');
                jQuery('#menuitems').append(mi.$button);
                mi.$button.on('click', () => {

                    jQuery('#main-heading').empty();

                    if (this.activeMenuItem != null) this.activeMenuItem.destroy();
                    this.activeMenuItem = mi;

                    jQuery('#main-table-left').empty().css("flex-grow", "1");
                    jQuery('#main-table-right').empty().css("flex-grow", "1");
                    this.removeGrid(jQuery('#main-table-left'));
                    this.removeGrid(jQuery('#main-table-right'));
                    jQuery('#main-footer').empty();

                    mi.onMenuButtonPressed(
                        jQuery('#main-heading'), jQuery('#main-table-left'), jQuery('#main-table-right'),
                        jQuery('#main-footer'));

                    jQuery('#menuitems .jo_menuitem').removeClass('jo_active');
                    mi.$button.addClass('jo_active');
                });
            }
        }

        let menuItemToSelect = fetchGetParameterValue('menuItem');
        if (menuItemToSelect == null) {
            jQuery('#menuitems .jo_menuitem').first().trigger("click");
        } else {
            let itemToStart = this.menuItems.find(mi => mi.identifier === menuItemToSelect);
            if (itemToStart != null) {
                itemToStart.$button.trigger("click");
            } else {
                jQuery('#menuitems .jo_menuitem').first().trigger("click");
            }
        }
    }

    removeGrid($element: JQuery<HTMLElement>) {
        $element.removeClass('w2ui-reset w2ui-grid w2ui-ss');
        $element.css('flex', '');
    }

}

jQuery(() => {
    new Administration().start();
});