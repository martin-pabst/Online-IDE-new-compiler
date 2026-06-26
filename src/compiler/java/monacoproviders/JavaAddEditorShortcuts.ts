import * as monaco from 'monaco-editor'
import { IMain } from '../../common/IMain';
import * as actions from "monaco-editor/esm/vs/platform/actions/common/actions";


export class JavaAddEditorShortcuts {
    static addActions(editor: monaco.editor.IStandaloneCodeEditor, main?: IMain) {
        editor.addAction({
            // A unique identifier of the contributed action.
            id: 'Find bracket',

            // A label of the action that will be presented to the user.
            label: 'Finde korrespondierende Klammer',

            // An optional array of keybindings for the action.
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],

            // A precondition for this action.
            precondition: undefined,

            // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
            keybindingContext: undefined,

            contextMenuGroupId: 'navigation',

            contextMenuOrder: 1.5,

            // Method that will be executed when the action is triggered.
            // @param editor The editor instance is passed in as a convenience
            run: function (ed) {
                ed.getAction('editor.action.jumpToBracket')?.run();
                return undefined;
            }
        });

        // Strg + # funktioniert bei Firefox nicht, daher alternativ Strg + ,:
        editor.addAction({
            // A unique identifier of the contributed action.
            id: 'Toggle line comment',

            // A label of the action that will be presented to the user.
            label: 'Zeilenkommentar ein-/ausschalten',

            // An optional array of keybindings for the action.
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Comma],

            // A precondition for this action.
            precondition: undefined,

            // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
            keybindingContext: undefined,

            contextMenuGroupId: 'insert',

            contextMenuOrder: 1.5,

            // Method that will be executed when the action is triggered.
            // @param editor The editor instance is passed in as a convenience
            run: function (ed) {
                console.log('Hier!');
                ed.getAction('editor.action.commentLine')?.run();
                return undefined;
            }
        });

        if (main) editor.addAction({
            id: 'Debugger Goto Cursor',
            label: 'Führe Programm aus bis zu dieser Zeile',

            // // An optional array of keybindings for the action.
            // keybindings: [
            //     monaco.KeyMod.Shift | monaco.KeyCode.F10],

            // A precondition for this action.
            precondition: "Scheduler_running || Scheduler_paused",

            // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
            keybindingContext: undefined,

            contextMenuGroupId: 'navigation',

            contextMenuOrder: 1.5,

            // Method that will be executed when the action is triggered.
            // @param editor The editor instance is passed in as a convenience
            run: (ed) => {
                main.getActionManager().trigger("interpreter.gotoCursor")
            }
        });

        editor.addAction({
            id: "myPaste",
            label: "Paste_",
            contextMenuGroupId: "9_cutcopypaste",
            contextMenuOrder: 2,
            run: (editor) => {
                navigator.clipboard.readText().then(text => {
                    let selection = editor.getSelection()
                    let id = { major: 1, minor: 1 }
                    let textFromClipboard = text
                    let op = { identifier: id, range: selection, text: textFromClipboard, forceMoveMarkers: true }
                    editor.executeEdits("my-source", [op])
                })
            }
        })

        const idsToRemove = ['editor.action.clipboardPasteAction'];

        // const actionMap: Map<{ id: string }, string[]> = actions.MenuRegistry._menuItems;
        // const contextMenuKey = actionMap.keys().find(key => key.id === 'SimpleEditorContext');
        // let contextMenu = actionMap.get(contextMenuKey);
        // if (contextMenu) {
        //     let entryList = [];

        //     for (let cm of contextMenu) { 
        //         if(!idsToRemove.includes(cm.command.id)) {
        //             entryList.push(cm);
        //         }
        //     }

        //     contextMenu.clear();
        //     for (let cm of entryList) {
        //         contextMenu.push(cm);
        //     }

        // }


        const contextmenu: any = editor.getContribution('editor.contrib.contextmenu');
        const realMethod = contextmenu._getMenuActions;
        contextmenu._getMenuActions = function () {
            const items = realMethod.apply(contextmenu, arguments);
            return items.filter(function (item) {
                return !idsToRemove.includes(item.id);
            });
        };
    }
}