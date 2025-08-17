import { DOM } from "../DOM.ts";
import '/assets/css/icons.css';

export class IconButtonComponent {

    private divElement: HTMLDivElement;

    private darkLightState: DarkLightState = "dark";

    private isActive: boolean = true;

    private currentIconClass?: string;

    public tag?: string;

    private _iconClass: string;

    constructor(private _parent: HTMLElement, iconClass: string, private listener: () => void, tooltip?: string){

        this.divElement = DOM.makeDiv(undefined, 'jo_iconButton');
        _parent.prepend(this.divElement);

        if(tooltip) this.divElement.title = tooltip;

        this.divElement.onpointerup = (ev) => {
            ev.stopPropagation();
            if(this.listener) this.listener();
        }

        this.iconClass = iconClass;

    }

    public get parent(): HTMLElement {
        return this._parent;
    }

    set title(title: string){
        this.divElement.title = title;
    }

    set iconClass(ic: string){
        if(ic.endsWith("-dark")) ic = ic.substring(0, ic.length - "-dark".length);
        this._iconClass = ic;
        this.render();
    }

    render(){

        if(this.currentIconClass) this.divElement.classList.remove(this.currentIconClass);

        this.currentIconClass = this._iconClass;
        if(this.darkLightState == "dark") this.currentIconClass += "-dark";

        this.divElement.classList.add(this.currentIconClass);
    }

    setDarkLightState(darkLightState: DarkLightState){
        this.darkLightState = darkLightState;
        this.render();
    }

    setActive(active: boolean){
        if(this.isActive != active){
            this.divElement.classList.toggle("jo_iconButton_active");
            this.isActive = active;
        }
    }

    setVisible(visible: boolean){
        this.divElement.style.display = visible ? "" : "none";
    }

}