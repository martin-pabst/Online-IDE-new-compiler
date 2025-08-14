import { DOM } from "../DOM.ts";
import '/assets/css/icons.css';

export class IconButtonComponent {

    private divElement: HTMLDivElement;

    private darkLightState: DarkLightState = "dark";

    private isActive: boolean = true;

    private currentIconClass?: string;

    constructor(private _parent: HTMLElement, private iconClass: string, private listener: () => void, tooltip?: string){

        this.divElement = DOM.makeDiv(undefined, 'jo_iconButton');
        _parent.prepend(this.divElement);

        if(tooltip) this.divElement.title = tooltip;

        if(this.iconClass.endsWith("-dark")) this.iconClass = this.iconClass.substring(0, this.iconClass.length - "-dark".length);

        this.divElement.onpointerup = (ev) => {
            ev.stopPropagation();
            if(this.listener) this.listener();
        }

        this.render();

    }

    public get parent(): HTMLElement {
        return this._parent;
    }

    render(){

        if(this.currentIconClass) this.divElement.classList.remove(this.currentIconClass);

        this.currentIconClass = this.iconClass;
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