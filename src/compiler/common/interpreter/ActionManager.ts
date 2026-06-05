import jQuery from 'jquery';
import { SoundTools } from '../../../tools/SoundTools';

export type ButtonToggler = (state: boolean) => void;

export type ActionListener = (name: string, buttonToggler?: ButtonToggler, pressed_key?: string) => void;

interface EditorContextKey {set(value: any): void;}

export type ActionEntry = {
    text?: string,
    keys: string[],
    actionListeners: ActionListener[],
    identifier: string, // name of Action is copied automatically to name of ActionEntry
    active: boolean
}

export class ActionManager {

    actions: { [actionIdentifier: string]: ActionEntry } = { };

    keyEntries: { [key: string]: ActionEntry[] } = {};

    buttons: { [actionIdentifier: string]: JQuery<HTMLElement>[] } = {};

    editorContextKeys: Map<string, EditorContextKey> = new Map();

    constructor(private $mainElement?: JQuery<HTMLElement> | undefined){

    }

    public init(){

        let $element:JQuery<any> | undefined = this.$mainElement;

        if(!$element) $element = jQuery(document);

        let that = this;
        $element.on("keydown", function (event: JQuery.KeyDownEvent) {
            if(event != null){
                that.executeKeyDownEvent(event);
            }
        });

    }

    trigger(actionIdentifier: string) {
        let ae = this.actions[actionIdentifier];
        if(ae != null){
            ae.actionListeners.forEach(listener => listener(actionIdentifier, undefined, ""));
        }
    }


    public registerActionListener(identifier: string, actionListener: ActionListener){
        let actionEntry = this.actions[identifier];
        if(!actionEntry){
            console.trace("ActionManager.registerActionListener: ActionEntry " + identifier + " not registered yet.");
            return;
        }
        actionEntry.actionListeners.push(actionListener);
    }

    public registerAction(identifier: string, keys: string[], text: string = "", listener?: ActionListener){
        let actionEntry: ActionEntry = {
            actionListeners: [],
            identifier: identifier,
            keys: keys,
            text: text,
            active: true
        };

        this.actions[identifier] = actionEntry;

        for(let key of keys){
            if(this.keyEntries[key.toLowerCase()] == null){
                this.keyEntries[key.toLowerCase()] = [];
            }
            this.keyEntries[key.toLowerCase()].push(actionEntry);
        }

        let buttons = this.buttons[identifier];

        if(buttons != null){
            for(let $button of buttons){
                this.setButtonTitle($button, actionEntry);
            }
        }

        if(listener) this.registerActionListener(identifier, listener);
    }

    public registerButton(actionIdentifier: string, $button: JQuery<HTMLElement>){
        if(this.buttons[actionIdentifier] == null){
            this.buttons[actionIdentifier] = [];
        }
        this.buttons[actionIdentifier].push($button);

        let actionEntry: ActionEntry = this.actions[actionIdentifier];
        if(actionEntry){
            this.setButtonTitle($button, actionEntry);
        }

        let mousePointer = window.PointerEvent ? "pointer" : "mouse";

        $button.on(mousePointer + 'down', () => {
            let actionEntry = this.actions[actionIdentifier];
            if(!actionEntry) return;
            if(actionEntry.active){
                actionEntry.actionListeners.forEach(listener => listener(actionIdentifier, undefined, "mousedown"));
            }
            if(actionIdentifier == "interpreter.start"){
                SoundTools.init();
            }
        });


    }

    setButtonTitle($button: JQuery<HTMLElement>, actionEntry: ActionEntry) {
        let t = actionEntry.text;
        if(!t) t = "";
        if(actionEntry.keys.length > 0){
            t += " [" + actionEntry.keys.join(", ") + "]";
        }

        $button.attr("title", t);

    }




    public isActive(actionIdentifier: string): boolean {

        let ae: ActionEntry = this.actions[actionIdentifier];

        if(ae == null) return false;

        return ae.active;

    }

    public setActive(actionIdentifier: string, active: boolean){
        let ae: ActionEntry = this.actions[actionIdentifier];

        if(ae != null){
            ae.active = active;
        }

        let buttons = this.buttons[actionIdentifier];
        if(buttons != null){
            for(let button of buttons){
                if(active){
                    button.addClass('jo_active');
                } else {
                    button.removeClass('jo_active');
                }
            }
        }

    }

    public setVisible(actionIdentifier: string, visible: boolean){
        let buttons = this.buttons[actionIdentifier];
        if(buttons != null){
            for(let button of buttons){
                if(visible){
                    button.show();
                } else {
                    button.hide();
                }
            }
        }

    }

    public executeKeyDownEvent(event: JQuery.KeyDownEvent) {

        if(document.activeElement?.tagName.toLowerCase() == "input"){
            return;
        }

        if (event.keyCode <= 18 && event.keyCode >= 16) {
            return; // ctrl, alt, shift
        }

        let key: string = "";

        if (event.ctrlKey) {
            key += "ctrl+";
        }

        if (event.shiftKey) {
            key += "shift+";
        }

        if (event.altKey) {
            key += "alt+";
        }

        if(event.key != null){
            key += event.key.toLowerCase();
        }

        let actionEntries = this.keyEntries[key];

        if(actionEntries != null){
            for(let actionEntry of actionEntries){
                if (actionEntry.active) {
                    event.stopPropagation();
                    event.preventDefault();
                    actionEntry.actionListeners.forEach(listener => listener(actionEntry.identifier, undefined, key));
                    break;
                }
            }
        }


    }

    hideButtons(actionIdentifier: string){
        let buttons = this.buttons[actionIdentifier];
        if(buttons){
            buttons.forEach(b => b.hide());
        }
    }

    showHideButtons(actionIdentifier: string, show: boolean){
        let buttons = this.buttons[actionIdentifier];
        if(buttons){
            buttons.forEach(b => {
                if(show){
                    b.show();
                } else {
                    b.hide();
                }
            });
        }
    }

    /**
     * Register a context key for monaco editor. This can be used to add preconditions
     * to editor actions
     *
     * @param identifier
     * @param editorContextKey
     */
    registerEditorContextKey(identifier: string, editorContextKey: EditorContextKey){
        this.editorContextKeys.set(identifier, editorContextKey);
    }

    setEditorContext(identifier: string, value: any){
        this.editorContextKeys.get(identifier)?.set(value);
    }

}