import { Main } from "../Main.js";
import { UserData } from "../../communication/Data.js";
import { PasswordChanger } from "./UserMenu.js";
import { ajax, csrfToken } from "../../communication/AjaxHelper.js";
import { WorkspaceImporter } from "./WorkspaceImporter.js";
import jQuery from 'jquery';
import { Workspace } from "../../workspace/Workspace.js";
import { downloadFile } from "../../../tools/HtmlTools.js";
import { WorkspaceImporterExporter } from "../../workspace/WorkspaceImporterExporter.js";
import { IssueReporter } from "./IssueReporter.js";
import * as monaco from 'monaco-editor'
import { GuiMessages } from "./GuiMessages.js";


declare var BUILD_DATE: string;
declare var APP_VERSION: string;


export type Action = (identifier: string) => void;

type Menu = {
    items: MenuItem[];
    $element?: JQuery<HTMLElement>;
    level?: number;
}

type MenuItem = {
    identifier: string;
    $element?: JQuery<HTMLElement>;
    action?: Action;
    link?: string;
    subMenu?: Menu;
    noHoverAnimation?: boolean
}

export class MainMenu {

    constructor(private main: Main) {
        
    }

    currentSubmenu: { [level: number]: JQuery<HTMLElement> } = {};
    openSubmenusOnMousemove: boolean = false;

    initGUI(user: UserData, serverURL: string) {

        let that = this;
        let editor = this.main.getMainEditor();

        let mainMenu: Menu = {
            items: [
                {
                    identifier: GuiMessages.File(), subMenu:
                    {
                        items: [
                            {
                                identifier: GuiMessages.ImportWorkspace(),
                                action: () => { new WorkspaceImporter(this.main).show(); }
                            },
                            {
                                identifier: GuiMessages.ExportCurrentWorkspace(),
                                action: async () => {
                                    let ws: Workspace = this.main.currentWorkspace;
                                    if(ws == null){
                                        alert(GuiMessages.NoWorkspaceSelected());
                                    }
                                    let name: string = ws.name.replace(/\//g, "_");
                                    let pruefung = this.main.pruefungManagerForStudents?.pruefung;
                                    let user = this.main.user;
                                    if(pruefung != null){
                                        name = pruefung.name.replace(/\//g, "_") + " (" + user.familienname + " " + user.rufname + "; " + user.username + ")";
                                    }
                                    downloadFile(await WorkspaceImporterExporter.exportWorkspace(ws), name + ".json");
                                 }
                            },
                            {
                                identifier: GuiMessages.ExportAllWorkspaces(),
                                action: async () => {
                                    let name: string = "all_workspaces";
                                    let user = this.main.user;
                                    let workspaces = await WorkspaceImporterExporter.exportAllWorkspaces(this.main);
                                    downloadFile(workspaces, name + ".json");
                                 }
                            },
                            {
                                identifier: GuiMessages.SaveAndExit(),
                                action: () => { jQuery('#buttonLogout').trigger("click"); }
                            },

                        ]
                    }
                },
                {
                    identifier: GuiMessages.Edit(), subMenu:
                    {
                        items: [
                            { identifier: GuiMessages.Undo(), action: () => { editor.trigger(".", "undo", {}); } },
                            { identifier: GuiMessages.Redo(), action: () => { editor.trigger(".", "redo", {}); } },
                            { identifier: "-" },
                            { identifier: GuiMessages.Copy(), action: () => { editor.getAction("editor.action.clipboardCopyAction").run(); } },
                            { identifier: GuiMessages.Cut(), action: () => { editor.getAction("editor.action.clipboardCutAction").run(); } },
                            { identifier: GuiMessages.CopyToTop(), action: () => { editor.getAction("editor.action.copyLinesUpAction").run(); } },
                            { identifier: GuiMessages.CopyToBottom(), action: () => { editor.getAction("editor.action.copyLinesDownAction").run(); } },
                            { identifier: GuiMessages.MoveToTop(), action: () => { editor.getAction("editor.action.moveLinesUpAction").run(); } },
                            { identifier: GuiMessages.MoveToBottom(), action: () => { editor.getAction("editor.action.moveLinesDownAction").run(); } },
                            { identifier: "-" },
                            { identifier: GuiMessages.Find(), action: () => { editor.getAction("actions.find").run(); } },
                            { identifier: GuiMessages.Replace(), action: () => { editor.getAction("editor.action.startFindReplaceAction").run(); } },
                            { identifier: "-" },
                            { identifier: GuiMessages.ToggleComment(), action: () => { editor.getAction("editor.action.commentLine").run(); } },
                            { identifier: GuiMessages.AutoFormat(), action: () => { editor.getAction("editor.action.formatDocument").run(); } },
                            { identifier: "-" },
                            { identifier: GuiMessages.FindCorrespondingBracket(), action: () => { editor.getAction("editor.action.jumpToBracket").run(); } },
                            { identifier: "-" },
                            { identifier: GuiMessages.FoldAll(), action: () => { editor.getAction("editor.foldAll").run(); } },
                            { identifier: GuiMessages.UnfoldAll(), action: () => { editor.getAction("editor.unfoldAll").run(); } },
                            { identifier: "-" },
                            {
                                identifier: GuiMessages.TriggerSuggest(), action: () => {
                                    editor.focus();
                                    setTimeout(() => {
                                        editor.getAction("editor.action.triggerSuggest").run();
                                    }, 200);
                                }
                            },
                            { identifier: GuiMessages.TriggerParameterHint(), action: () => { editor.getAction("editor.action.triggerParameterHints").run(); } },
                            {
                                identifier: GuiMessages.GoToDefinition(), action: () => {
                                    editor.focus();
                                    setTimeout(() => {
                                        editor.getAction("editor.action.revealDefinition").run();
                                    }, 200);
                                }
                            },

                        ]
                    }
                },
                {
                    identifier: "Ansicht", subMenu:
                    {
                        items: [
                            {
                                identifier: "Theme",
                                subMenu: {
                                    items: [
                                        {
                                            identifier: "Dark",
                                            action: () => {
                                                that.switchTheme("dark");
                                            }
                                        },
                                        {
                                            identifier: "Light",
                                            action: () => {
                                                that.switchTheme("light");
                                            }
                                        }
                                    ]
                                }
                            },
                            { identifier: "-" },
                            { identifier: "Hoher Kontrast im Editor ein/aus", action: () => { editor.getAction("editor.action.toggleHighContrast").run(); } },

                            { identifier: "-" },
                            { identifier: "Zoom out (Strg + Mausrad)", action: () => { this.main.editor.changeEditorFontSize(-4); } },
                            { identifier: "Zoom normal", action: () => { this.main.editor.setFontSize(14); } },
                            { identifier: "Zoom in (Strg + Mausrad)", action: () => { this.main.editor.changeEditorFontSize(4); } },
                            { identifier: "-" },
                            { identifier: "Automatischer Zeilenumbruch ein/aus", action: () => {
                                let wordWrap = this.main.editor.editor.getOption(monaco.editor.EditorOption.wordWrap);
                                wordWrap = wordWrap == "on" ? "off" : "on";
                                this.main.editor.editor.updateOptions({wordWrap: wordWrap});
                            } },

                        ]
                    }
                },
                {
                    identifier: "Repository", subMenu: {
                        items: [
                            {
                                identifier: "Eigene Repositories verwalten ...",
                                action: () => { this.main.repositoryUpdateManager.show(null) }
                            },
                            {
                                identifier: "Workspace mit Repository verbinden (checkout) ...",
                                action: () => { this.main.repositoryCheckoutManager.show(null) }
                            },
                        ]
                    }
                },
                {
                    identifier: "Sprites", subMenu: {
                        items: [
                            {
                                identifier: "Spritesheet ergänzen ...",
                                action: () => { this.main.spriteManager.show() }
                            },
                            { identifier: "-" },
                            {
                                identifier: "Sprite-Bilderübersicht",
                                link: serverURL + "spriteLibrary.html?csrfToken=" + csrfToken
                            },
                        ]
                    }
                },
                {
                    identifier: "Hilfe", subMenu:
                    {
                        items: [
                            {
                                identifier: "Kurze Video-Tutorials zur Bedienung dieser IDE",
                                link: "https://www.learnj.de/doku.php?id=api:ide_manual:start"
                            },
                            {
                                identifier: "Interaktives Java-Tutorial mit vielen Beispielen",
                                link: "https://www.learnj.de/doku.php"
                            },
                            // {
                            //     identifier: "Materialien für Lehrkräfte",
                            //     link: "servlet/teachers/index.html"
                            // },
                            { identifier: "-" },
                            {
                                identifier: "API-Dokumentation",
                                link: "https://www.learnj.de/doku.php?id=api:documentation:start"
                                // link: "api_documentation.html"
                            },
                            {
                                identifier: "API-Verzeichnis",
                                //link: "https://www.learnj.de/doku.php?id=api:documentation:start"
                                link: serverURL + "api_documentation.html?csrfToken=" + csrfToken
                            },
                            { identifier: "-" },
                            {
                                identifier: "Tastaturkommandos (Shortcuts)",
                                link: serverURL + "shortcuts.html?csrfToken=" + csrfToken
                            },
                            { identifier: "-" },
                            {
                                identifier: "Java-Online Changelog",
                                link: "https://www.learnj.de/doku.php?id=javaonline:changelog"
                            },
                            {
                                identifier: "Java-Online Roadmap",
                                link: "https://www.learnj.de/doku.php?id=javaonline:roadmap"
                            },
                            { identifier: "-" },
                            {
                                identifier: "Befehlspalette (F1)",
                                action: () => {
                                    setTimeout(() => {
                                        that.main.getMainEditor().focus();
                                        editor.getAction("editor.action.quickCommand").run();
                                    }, 500);
                                }
                            },
                            { identifier: "-" },
                            {
                                identifier: "Passwort ändern...",
                                action: () => {
                                    let passwortChanger = new PasswordChanger(that.main);
                                    passwortChanger.show();
                                }
                            },
                            { identifier: "-" },
                            {
                                identifier: "Fehler melden...",
                                action: () => {
                                    new IssueReporter(this.main).show();
                                }
                            },
                            { identifier: "-" },
                            {
                                identifier: "Über die Online-IDE...",
                                link: "https://www.learnj.de/doku.php?id=javaonline:ueber"
                            },
                            {
                                identifier: "Impressum...",
                                link: "https://www.learnj.de/doku.php?id=ide:impressum"
                            },
                            {
                                identifier: "Datenschutzerklärung...",
                                link: "https://www.learnj.de/doku.php?id=ide:datenschutzerklaerung"
                            },
                            {
                                identifier: "<div class='jo_menu_version'>Version " + APP_VERSION + " vom " + BUILD_DATE + " </div>",
                                noHoverAnimation: true
                            }

                        ]
                    }
                },

                // ,
                // {
                //     identifier: "Bearbeiten", subMenu:
                //     {
                //         items: [
                //             { identifier: "Undo" },
                //             { identifier: "Redo" },
                //             { identifier: "Kopieren" },
                //             { identifier: "Formatieren"}
                //         ]
                //     }
                // },
            ]
        };

        if (user != null && (user.is_admin || user.is_schooladmin || user.is_teacher)) {
            mainMenu.items[0].subMenu.items.push(
                {
                    identifier: "Klassen/Benutzer/Prüfungen ...",
                    link: serverURL + "administration_mc.html?csrfToken=" + csrfToken
                }
            )
        }

        if (user != null && (user.is_admin)) {
            mainMenu.items[0].subMenu.items.push(
                {
                    identifier: "Serverauslastung ...",
                    link: serverURL + "statistics.html?csrfToken=" + csrfToken
                }, {
                identifier: "Shutdown server...",
                action: () => {
                    if (confirm("Server wirklich herunterfahren?")) {
                        ajax("shutdown", {}, () => {
                            alert('Server erfolgreich heruntergefahren.');
                        }, (message) => {
                            alert(message);
                        })
                    }
                }
            }
            )
        }

        jQuery('#mainmenu').empty();
        this.initMenu(mainMenu, 0);
    }

    switchTheme(theme: string) {
        this.main.viewModeController.setTheme(theme);
    }

    initMenu(menu: Menu, level?: number) {

        menu.level = level;

        if (level == 0) {
            menu.$element = jQuery('#mainmenu');
        } else {
            menu.$element = jQuery('<div class="jo_submenu"></div>');
            jQuery('body').append(menu.$element);
        }

        menu.$element.data('model', menu);
        for (let mi of menu.items) {
            if (mi.identifier == '-') {
                mi.$element = jQuery('<div class="jo_menuitemdivider"></div>');
            } else {
                let noHoverKlass = mi.noHoverAnimation ? ' class="jo_menuitem_nohover"' : '';
                mi.$element = jQuery(`<div${noHoverKlass}>${mi.identifier}</div>`);
                if (mi.link != null) {
                    let $link = jQuery('<a href="' + mi.link + '" target="_blank" class="jo_menulink"></a>');
                    $link.attr('style', 'color: var(--fontColorNormal) !important');
                    $link.on("pointerdown", (event) => {
                        event.stopPropagation();
                    })
                    $link.on("pointerup", (ev) => {
                        ev.stopPropagation();
                        setTimeout(() => {
                            menu.$element.hide();
                        }, 500);
                    })
                    $link.append(mi.$element);
                    mi.$element = $link;

                }
                if (mi.subMenu != null) {
                    this.initMenu(mi.subMenu, level + 1);
                }
                this.initMenuitemCallbacks(menu, mi);
                if (level == 0) {
                    mi.$element.addClass('jo_mainmenuitem');
                }
            }
            menu.$element.append(mi.$element);
            mi.$element.data('model', mi);
        }

        let that = this;
        jQuery(document).on('pointerdown', () => {
            for (let i = 0; i < 5; i++) {
                if (that.currentSubmenu[i] != null) {
                    that.currentSubmenu[i].hide();
                    that.currentSubmenu[i] = null;
                }
            }
            that.openSubmenusOnMousemove = false;
        });

    }

    initMenuitemCallbacks(menu: Menu, mi: MenuItem) {
        let that = this;

        if (mi.action != null) {
            mi.$element.on('pointerdown', (ev) => {
                ev.stopPropagation();
            })


            mi.$element.on('pointerup', (ev) => {
                ev.stopPropagation();
                mi.action(mi.identifier);
                for (let i = 0; i < 5; i++) {
                    if (that.currentSubmenu[i] != null) {
                        that.currentSubmenu[i].hide();
                        that.currentSubmenu[i] = null;
                    }
                }
                that.openSubmenusOnMousemove = false;
            });
        }

        if (mi.subMenu != null) {
            mi.$element.on('mousedown', (ev) => {
                that.opensubmenu(mi);
                that.openSubmenusOnMousemove = true;
                ev.stopPropagation();
            });

            mi.$element.on('mousemove.mainmenu', () => {
                if (that.openSubmenusOnMousemove) {
                    that.opensubmenu(mi);
                } else {
                    if (that.currentSubmenu[menu.level + 1] != null) {
                        that.currentSubmenu[menu.level + 1].hide();
                        that.currentSubmenu[menu.level + 1] = null;
                    }
                }
            });
        } else {
            mi.$element.on('mousemove.mainmenu', () => {
                if (that.currentSubmenu[menu.level + 1] != null) {
                    that.currentSubmenu[menu.level + 1].hide();
                    that.currentSubmenu[menu.level + 1] = null;
                }
            });
        }

    }

    opensubmenu(mi: MenuItem) {

        let subMenu = mi.subMenu;

        let left: number;
        let top: number;
        if (subMenu.level == 1) {
            left = mi.$element.position().left;
            top = 30;
        } else {
            left = mi.$element.offset().left + mi.$element.width();
            top = mi.$element.offset().top;
        }

        subMenu.$element.css({
            top: "" + top + "px",
            left: "" + left + "px"
        })

        if (this.currentSubmenu[subMenu.level] != null) {
            this.currentSubmenu[subMenu.level].hide();
        }

        subMenu.$element.show();
        this.currentSubmenu[subMenu.level] = subMenu.$element;
    }



}
