import { Treeview } from './Treeview.ts';
import '/assets/css/treeview.css';
import '/assets/css/icons.css';
import { DOM } from '../../DOM.ts';
import { ExpandCollapseState } from '../ExpandCollapseComponent.ts';
import { TreeviewSplitter } from './TreeviewSplitter.ts';

export class TreeviewAccordion {

    treeviewList: Treeview<any, any>[] = [];
    splitterList: TreeviewSplitter[] = [];

    private _mainDiv: HTMLDivElement;
    public get mainDiv(): HTMLDivElement {
        return this._mainDiv;
    }
    public set mainDiv(value: HTMLDivElement) {
        this._mainDiv = value;
    }

    constructor(public parentHtmlELement: HTMLElement) {
        this._mainDiv = DOM.makeDiv(parentHtmlELement, 'jo_treeviewAccordion_mainDiv');
        window.addEventListener('resize', () => { this.onResize(false) });
    }

    onResize(initial: boolean) {
        let overallHeight = this._mainDiv.getBoundingClientRect().height - (this.treeviewList.length * 1.0);

        let fixedHeight: number = 0;
        let variableHeight: number = 0;
        for (let tv of this.treeviewList) {
            if (!tv.isCollapsed()) {
                variableHeight += tv.getTargetVariableHeight();
            }
            fixedHeight += tv.getFixedHeight();
        }

        let factor = variableHeight == 0 ? 0 : (overallHeight - fixedHeight) / variableHeight;
        
        for (let tv of this.treeviewList) {
            tv.outerDiv.style.flexBasis = "";
            tv.outerDiv.style.flexGrow = "";
        }

        for (let tv of this.treeviewList) {

            let height = (tv.isCollapsed() ? 0 : tv.getTargetVariableHeight()) * factor + tv.getFixedHeight();
            tv.outerDiv.style.height = height + "px";
            if(initial && !tv.isCollapsed()) tv._lastExpandedHeight = height;
        }
    }

    addTreeview(treeview: Treeview<any, any>) {
        this.treeviewList.push(treeview);
        if (this.treeviewList.length > 1) {
            this.splitterList.push(new TreeviewSplitter(this, this.treeviewList.length - 1));
        }
        let dummyElements = this._mainDiv.getElementsByClassName('jo_treeview_dummy');
        for(let i = 0; i < dummyElements.length; i++){
            dummyElements[i].remove();
        }
        DOM.makeDiv(this._mainDiv, 'jo_treeview_dummy');
    }

}

