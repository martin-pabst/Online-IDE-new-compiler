import { Treeview } from './Treeview.ts';
import '/assets/css/treeview.css';
import '/assets/css/icons.css';
import { DOM } from '../../DOM.ts';
import { ExpandCollapseState } from '../ExpandCollapseComponent.ts';
import { TreeviewSplitter } from './TreeviewSplitter.ts';
import { AccordionElementInterface } from './AccordionElementInterface.ts';

export class TreeviewAccordion {

    ElementList: AccordionElementInterface[] = [];
    splitterList: TreeviewSplitter[] = [];

    debounceTimer: any;

    private _mainDiv: HTMLDivElement;
    public get mainDiv(): HTMLDivElement {
        return this._mainDiv;
    }
    public set mainDiv(value: HTMLDivElement) {
        this._mainDiv = value;
    }

    constructor(public parentHtmlELement: HTMLElement, private outerElementWithCorrectSize?: HTMLElement) {
        this.outerElementWithCorrectSize = outerElementWithCorrectSize || parentHtmlELement;
        this._mainDiv = DOM.makeDiv(parentHtmlELement, 'jo_treeviewAccordion_mainDiv');
        
        // window.addEventListener('resize', () => { this.onResize(false) });

        const resizeObserver = new ResizeObserver(() => {

            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.onResize(false);
            }, 200);


        });
        resizeObserver.observe(document.body);



    }

    remove(){
        this._mainDiv.remove();
    }

    hide(){
        this._mainDiv.style.display = "none";
    }

    show(){
        this._mainDiv.style.display = "";
        this.onResize(true);
    }

    onResize(initial: boolean) {
        let overallHeight = this.outerElementWithCorrectSize.getBoundingClientRect().height - (this.ElementList.length * 1.0);

        let fixedHeight: number = 0;
        let variableHeight: number = 0;
        for (let tv of this.ElementList) {
            if (!tv.isCollapsed()) {
                variableHeight += tv.getTargetVariableHeight();
            }
            fixedHeight += tv.getFixedHeight();
        }

        let factor = variableHeight == 0 ? 0 : (overallHeight - fixedHeight) / variableHeight;

        for (let tv of this.ElementList) {
            tv.getOuterDiv().style.flexBasis = "";
            tv.getOuterDiv().style.flexGrow = "";
        }

        for (let tv of this.ElementList) {

            let height = (tv.isCollapsed() ? 0 : tv.getTargetVariableHeight()) * factor + tv.getFixedHeight();
            tv.getOuterDiv().style.height = height + "px";
            if (initial && !tv.isCollapsed()) tv._lastExpandedHeight = height;
        }
    }

    addTreeview(treeview: AccordionElementInterface) {
        this.ElementList.push(treeview);
        if (this.ElementList.length > 1) {
            this.splitterList.push(new TreeviewSplitter(this, this.ElementList.length - 1));
        }
        let dummyElements = this._mainDiv.getElementsByClassName('jo_treeview_dummy');
        for (let i = 0; i < dummyElements.length; i++) {
            dummyElements[i].remove();
        }
        DOM.makeDiv(this._mainDiv, 'jo_treeview_dummy');
    }

}

