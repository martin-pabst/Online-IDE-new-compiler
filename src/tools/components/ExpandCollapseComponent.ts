import { DOM } from "../DOM.ts";
import '/assets/css/icons.css';

export type ExpandCollapseState = "expanded" | "collapsed";

export type ExpandCollapseListener = (newState: ExpandCollapseState) => void;

export class ExpandCollapseComponent {

    private divElement: HTMLDivElement;

    private _state: ExpandCollapseState = "collapsed";

    public get state(): ExpandCollapseState{
        return this._state;
    }

    private darkLightState: DarkLightState = "dark";

    private currentIconClass?: string;

    private static iconClasses = {
        "light" : {
            "expanded": "img_chevron-down",
            "collapsed": "img_chevron-right"
        },
        "dark" : {
            "expanded": "img_chevron-down-dark",
            "collapsed": "img_chevron-right-dark"
        }
    };

    constructor(private _parent: HTMLElement, private listener: ExpandCollapseListener,
        initialState: ExpandCollapseState){

        this.divElement = DOM.makeDiv(_parent, 'jo_exandCollapseComponent');

        this.divElement.onpointerup = (ev) => {
            ev.stopPropagation();
            this.toggleState();
        }

        this._state = initialState;
        this.render();

    }

    public toggleState(){
        switch(this._state){
            case "collapsed": this.setState("expanded", true);
            break;
            case "expanded": this.setState("collapsed", true);
            break;
        }
    }

    public get parent(): HTMLElement {
        return this._parent;
    }

    setState(newState: ExpandCollapseState, invokeListener: boolean = true){
        this._state = newState;
        this.render();
        if(invokeListener) this.listener(newState);
    }

    render(){

        if(this.currentIconClass) this.divElement.classList.remove(this.currentIconClass);

        this.currentIconClass = ExpandCollapseComponent.iconClasses[this.darkLightState][this._state];

        this.divElement.classList.add(this.currentIconClass);
    }

    setDarkLightState(darkLightState: DarkLightState){
        this.darkLightState = darkLightState;
        this.render();
    }

    hide(){
        this.divElement.style.display = "none";
    }

    show(){
        this.divElement.style.display = "";
    }
}