import { DOM } from '../../../tools/DOM';
import '/assets/css/progressbar.css';


export interface ProgressIndicator {
    init(min: number, max: number);
    show();
    set(value: number, text?: string);
    hide();

}

export class SimpleProgressbar implements ProgressIndicator {

    elementOuter: HTMLDivElement;
    elementInner: HTMLDivElement;

    parent: HTMLElement;

    min: number;
    max: number;

    constructor(){
        this.parent = document.getElementById('bitteWarten');

        this.elementOuter = DOM.makeDiv(this.parent, "jo_progressBar");
        this.elementInner = DOM.makeDiv(this.elementOuter, "jo_progressBarInner");

    }
    
    show() {
        this.parent.style.display = 'flex';
    }
    
    hide() {
        this.parent.style.display = 'none';
    }

    init(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    set(value: number, text?: string) {
        let fraction = ((value - this.min)/(this.max - this.min)) * 100;
        this.elementInner.style.width = fraction + "%";
    }

    


}