import { Main } from "../Main.js";
import { MainBase } from "../MainBase.js";
import jQuery from "jquery";
import { GuiMessages } from "./language/GuiMessages.js";


export type HelperDirection = "top" | "bottom" | "left" | "right";

export class Helper {

    public static openHelper(text: string, targetElement: JQuery<HTMLElement>, direction: HelperDirection) {

        let $helper = jQuery('.jo_arrow_box');
        $helper.removeClass(['jo_arrow_box_left', 'jo_arrow_box_right', 'jo_arrow_box_top', 'jo_arrow_box_bottom']);

        $helper.addClass('jo_arrow_box_' + direction);

        $helper.css({ left: '', right: '', top: '', bottom: '' });

        let to = targetElement.offset();
        let b = jQuery('body');

        let delta: number = 34;

        switch (direction) {
            case "bottom": $helper.css({
                left: to.left + targetElement.width() / 2 - delta,
                bottom: b.height() - to.top + delta
            });
                break;
            case "top": $helper.css({
                left: to.left + targetElement.width() / 2 - delta,
                top: to.top + targetElement.height() + 26
            });
                break;
            case "left": $helper.css({
                left: to.left + targetElement.width() + delta,
                top: to.top + targetElement.height() / 2 - delta
            });
                break;
            case "right": $helper.css({
                right: b.width() - to.left,
                top: to.top + targetElement.height() / 2 - delta
            });
                break;
        }

        $helper.find('span').html(text);

        let $button = $helper.find('.jo_button');
        $button.on('click', (e) => {
            e.stopPropagation();
            $button.off('click');
            Helper.close();
        });

        $helper.fadeIn(800);

    }

    static close() {
        let $helper = jQuery('.jo_arrow_box');
        $helper.fadeOut(800);
    }


    static showHelper(id: string, mainBase: MainBase, $element?: JQuery<HTMLElement>) {

        let main: Main;
        if (mainBase instanceof Main) {
            main = mainBase;
        } else {
            return;
        }

        let helperHistory = main.user.gui_state!.helperHistory;

        if (id == "speedControlHelper" && helperHistory["speedControlHelperDone"]) {
            id = "stepButtonHelper";
        }

        if (id == "spritesheetHelper" && !helperHistory["newFileHelperDone"]) {
            return;
        }

        let flag = id + "Done";

        if (helperHistory != null && (helperHistory[flag] == null || !helperHistory[flag])) {
            helperHistory[flag] = true;
            main.networkManager.sendUpdateGuiState();

            let text: string = "";
            let direction: HelperDirection = "left";

            switch (id) {
                case "folderButton":
                    text = GuiMessages.HelperFolder(),
                        direction = "top";
                    break;
                case "repositoryButton":
                    text = GuiMessages.HelperRepositoryButton();
                    direction = "top";
                    break;
                case "speedControlHelper":
                    text = GuiMessages.HelperSpeedControl();
                    direction = "top";
                    $element = main.programControlButtons.speedControl.$grip;
                    break;
                case "newFileHelper":
                    text = GuiMessages.HelperNewFile();
                    direction = "left";
                    break;
                case "newWorkspaceHelper":
                    text = GuiMessages.HelperNewWorkspace();
                    direction = "left";
                    break;
                case "homeButtonHelper":
                    text = GuiMessages.HelperHome();
                    direction = "top";
                    $element = jQuery('.img_home-dark');
                    break;
                case "stepButtonHelper":
                    text = GuiMessages.HelperStepButtons();
                    direction = "top";
                    $element = main.programControlButtons.getButton("interpreter.stepOver");
                    break;
                case "consoleHelper":
                    text = GuiMessages.HelperConsole();
                    direction = "bottom";
                    $element = jQuery(main.bottomDiv.console.consoleCommandline);
                    break;
                case "spritesheetHelper":
                    text = GuiMessages.HelperSpritesheet();
                    direction = "top";
                    $element = jQuery('#mainmenu').find('div:contains("Sprites")');
                    break;
            }

            if (text != "" && $element != null && $element.length > 0) {
                Helper.openHelper(text, $element, direction);
            }

        }

    }



}