import { DOM } from "../DOM.ts";
import '/assets/css/icons.css';

export class IconButtonComponent {

    public divElement: HTMLDivElement;

    private darkLightState: DarkLightState = "dark";

    private isActive: boolean = true;

    private currentIconClass?: string;
    private currentState: number = 0;

    public tag?: string;

    private _iconClasses: string[];
    private _toolTips: string[];

    private _toggleBetweenStates: boolean;

    constructor(private _parent: HTMLElement, iconClass: string | string[],
        private listener: (event, state) => void, tooltips: string | string[] = [],
        toogleBetweenStates: boolean = false,
        appendPrepend: "append" | "prepend" = "prepend") {

        this._toggleBetweenStates = toogleBetweenStates;

        this.divElement = DOM.makeDiv(undefined, 'jo_iconButton');
        switch (appendPrepend) {
            case "prepend":
                _parent.prepend(this.divElement);
                break;
            case "append":
                _parent.append(this.divElement);
                break;
        }

        if (!Array.isArray(tooltips)) {
            tooltips = [tooltips];
        }

        this._toolTips = tooltips;

        this.divElement.onpointerup = (ev: PointerEvent) => {
            ev.stopPropagation();

            if (this._toggleBetweenStates) {
                this.currentState = (this.currentState + 1) % this._iconClasses.length;
                this.render();
            }

            if (this.listener) this.listener(ev, this.currentState);
        }

        if (!Array.isArray(iconClass)) iconClass = [iconClass];

        this._iconClasses = iconClass.map(ic => this.stripDark(ic));

        this.render();
    }

    public get parent(): HTMLElement {
        return this._parent;
    }

    set title(title: string) {
        this.divElement.title = title;
    }

    private stripDark(className: string): string {
        if (className.endsWith("-dark")) {
            return className.substring(0, className.length - "-dark".length);
        } else {
            return className;
        }
    }

    set iconClass(ic: string) {
        ic = this.stripDark(ic);
        this._iconClasses[0] = ic;
        this.render();
    }

    set state(state: number) {
        this.currentState = state;
        this.render();
    }

    render() {

        if (this.currentIconClass) this.divElement.classList.remove(this.currentIconClass);

        this.currentIconClass = this._iconClasses[this.currentState];
        if (this.darkLightState == "dark") this.currentIconClass += "-dark";

        this.divElement.classList.add(this.currentIconClass);

        if (this._toolTips.length > 0) {
            if (this._toolTips.length == 1) {
                this.divElement.title = this._toolTips[0];
            } else {
                this.divElement.title = this._toolTips[this.currentState];
            }
        }

    }

    setDarkLightState(darkLightState: DarkLightState) {
        this.darkLightState = darkLightState;
        this.render();
    }

    setActive(active: boolean) {
        if (this.isActive != active) {
            this.divElement.classList.toggle("jo_iconButton_active");
            this.isActive = active;
        }
    }

    setVisible(visible: boolean) {
        this.divElement.style.display = visible ? "" : "none";
    }

    remove() {
        this.divElement.remove();
    }

}