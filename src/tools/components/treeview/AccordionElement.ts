import { DOM } from "../../DOM";
import { ExpandCollapseComponent, ExpandCollapseState } from "../ExpandCollapseComponent";
import { IconButtonComponent } from "../IconButtonComponent";
import { AccordionElementInterface } from "./AccordionElementInterface";
import { TreeviewAccordion } from "./TreeviewAccordion";

export type AccordionElementConfig = {
    captionLine: {
        enabled: boolean,
        text?: string,
        element?: HTMLElement
    },
    flexWeight?: string,
    minHeight?: number,

    initialExpandCollapseState?: ExpandCollapseState,
}

export class AccordionElement implements AccordionElementInterface {

    _lastExpandedHeight: number = 0;
    private parentDiv: HTMLDivElement;

    private _outerDiv!: HTMLDivElement;
    get outerDiv(): HTMLElement {
        return this._outerDiv;
    }

    public getOuterDiv(): HTMLDivElement {
        return this._outerDiv;
    }

    // div with nodes
    private _nodeDiv!: HTMLDivElement;
    get nodeDiv(): HTMLDivElement {
        return this._nodeDiv;
    }


    // caption
    private captionLineDiv!: HTMLDivElement;
    private captionLineExpandCollapseDiv!: HTMLDivElement;
    private captionLineTextDiv!: HTMLDivElement;
    private captionLineButtonsLeftDiv!: HTMLDivElement;
    private captionLineButtonsRightDiv!: HTMLDivElement;

    captionLineExpandCollapseComponent!: ExpandCollapseComponent;



    constructor(private treeviewAccordion: TreeviewAccordion, private config: AccordionElementConfig) {
        this.parentDiv = this.treeviewAccordion.mainDiv;
    }

    public getTargetVariableHeight(): number {
        return Math.max(this.config.minHeight, 100, this._lastExpandedHeight - this.getFixedHeight(), this.getCurrentVariableHeight());
    }

    protected getCurrentVariableHeight(): number {
        if (this.isCollapsed) return 0;
        return this._outerDiv.getBoundingClientRect().height - this.getFixedHeight();
    }

    public getFixedHeight(): number {
        let height = this.captionLineDiv.getBoundingClientRect().height;
        if (height == 0) height = 20;
        return height;
    }

    protected getCaptionHeight(): number {
        return this.captionLineDiv.getBoundingClientRect().height;
    }

    private buildHtmlScaffolding() {
        this._outerDiv = DOM.makeDiv(this.parentDiv, 'jo_treeview_outer');

        this.buildCaption();
        this._nodeDiv = DOM.makeDiv(this._outerDiv, "jo_treeview_nodediv", "jo_scrollable");
        if (this.config.initialExpandCollapseState == "collapsed") {
            // this._nodeDiv.style.display = "none";
            this.captionLineExpandCollapseComponent.setState("collapsed", false);
        }

    }

    private buildCaption() {
        this.captionLineDiv = DOM.makeDiv(this._outerDiv, 'jo_treeview_caption');
        this.captionLineExpandCollapseDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treevew_caption_expandcollapse')
        this.captionLineButtonsLeftDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treeview_caption_buttons')
        this.captionLineTextDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treeview_caption_text')
        this.captionLineButtonsRightDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treeview_caption_buttons')
        this.captionLineDiv.style.display = this.config.captionLine.enabled ? "flex" : "none";
        this.captionLineTextDiv.textContent = this.config.captionLine.text || "";
        if (this.config.captionLine.element) {
            this.captionLineTextDiv.appendChild(this.config.captionLine.element);
        }


        this.captionLineExpandCollapseComponent = new ExpandCollapseComponent(this.captionLineExpandCollapseDiv, (newState: ExpandCollapseState) => {
            if (this.isCollapsed()) {
                this._lastExpandedHeight = this._outerDiv.getBoundingClientRect().height;
                this.nodeDiv.style.display = 'none';
            } else {
                this.nodeDiv.style.display = '';
            }
            if (this.treeviewAccordion) this.treeviewAccordion.onResize(false);

        }, "expanded")


    }

    captionLineAddIconButton(iconClass: string, where: "left" | "right", callback: () => void, tooltip?: string): IconButtonComponent {
        switch (where) {
            case "left":
                return new IconButtonComponent(this.captionLineButtonsLeftDiv, iconClass, callback, tooltip);
            case "right":
                return new IconButtonComponent(this.captionLineButtonsRightDiv, iconClass, callback, tooltip);
        }
    }

    captionLineAddElementToButtonDiv(element: HTMLElement, where: "left" | "right") {
        switch (where) {
            case "left":
                this.captionLineButtonsLeftDiv.prepend(element);
                break;
            case "right":
                this.captionLineButtonsRightDiv.prepend(element);
                break;
        }
    }

    isCollapsed(): boolean {
        return this.captionLineExpandCollapseComponent.state == "collapsed";
    }

}