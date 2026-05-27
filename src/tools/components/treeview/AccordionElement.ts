import { DOM } from "../../DOM";
import { ExpandCollapseComponent, ExpandCollapseState } from "../ExpandCollapseComponent";
import { IconButtonComponent } from "../IconButtonComponent";
import { AccordionElementInterface } from "./AccordionElementInterface";
import { TreeviewAccordion } from "./TreeviewAccordion";
import { TreeviewMessages } from "./TreeviewMessages";

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
    protected parentElement: HTMLDivElement;

    protected _outerDiv!: HTMLDivElement;
    get outerDiv(): HTMLElement {
        return this._outerDiv;
    }

    public getOuterDiv(): HTMLDivElement {
        return this._outerDiv;
    }

    // div with nodes
    protected _innerDiv!: HTMLDivElement;
    get innerDiv(): HTMLDivElement {
        return this._innerDiv;
    }


    // caption
    protected captionLineDiv!: HTMLDivElement;
    protected captionLineExpandCollapseDiv!: HTMLDivElement;
    protected captionLineTextDiv!: HTMLDivElement;
    protected captionLineButtonsLeftDiv!: HTMLDivElement;
    protected captionLineButtonsRightDiv!: HTMLDivElement;

    captionLineExpandCollapseComponent!: ExpandCollapseComponent;

    protected treeviewAccordion: TreeviewAccordion;

    constructor(parent: HTMLDivElement | TreeviewAccordion, private accordionElementConfig?: AccordionElementConfig) {
        if (parent instanceof TreeviewAccordion) {
            this.treeviewAccordion = parent;
            this.parentElement = this.treeviewAccordion.mainDiv;
        } else {
            this.parentElement = parent;
        }

        let standardConfig: AccordionElementConfig = {

            captionLine: {
                enabled: true,
                text: TreeviewMessages.caption()
            },
            minHeight: 150,
            initialExpandCollapseState: "expanded"
        }

        if (!accordionElementConfig) accordionElementConfig = standardConfig;
        accordionElementConfig = Object.assign(standardConfig, accordionElementConfig);

        this.buildHtmlScaffolding();
        if (accordionElementConfig?.flexWeight) this.setFlexWeight(accordionElementConfig.flexWeight);

        if (this.treeviewAccordion) this.treeviewAccordion.addTreeview(this);

    }

    public getTargetVariableHeight(): number {
        return Math.max(this.accordionElementConfig.minHeight, 100, this._lastExpandedHeight - this.getFixedHeight(), this.getCurrentVariableHeight());
    }

    protected getCurrentVariableHeight(): number {
        if (this.isCollapsed()) return 0;
        return this._outerDiv.getBoundingClientRect().height - this.getFixedHeight();
    }

    public getMinHeight(): number {
        return this.accordionElementConfig.minHeight || 20;
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
        this._outerDiv = DOM.makeDiv(this.parentElement, 'jo_treeview_outer');

        this.ae_buildCaption();

        this._innerDiv = DOM.makeDiv(this._outerDiv, "jo_treeview_nodediv", "jo_scrollable");
        if (this.accordionElementConfig.initialExpandCollapseState == "collapsed") {
            // this._nodeDiv.style.display = "none";
            this.captionLineExpandCollapseComponent.setState("collapsed", false);
        }

    }

    private ae_buildCaption() {
        this.captionLineDiv = DOM.makeDiv(this._outerDiv, 'jo_treeview_caption');
        this.captionLineExpandCollapseDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treevew_caption_expandcollapse')
        this.captionLineButtonsLeftDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treeview_caption_buttons')
        this.captionLineTextDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treeview_caption_text')
        this.captionLineButtonsRightDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treeview_caption_buttons')
        this.captionLineDiv.style.display = this.accordionElementConfig.captionLine.enabled ? "flex" : "none";
        this.captionLineTextDiv.textContent = this.accordionElementConfig.captionLine.text || "";
        if (this.accordionElementConfig.captionLine.element) {
            this.captionLineTextDiv.appendChild(this.accordionElementConfig.captionLine.element);
        }


        this.captionLineExpandCollapseComponent = new ExpandCollapseComponent(this.captionLineExpandCollapseDiv, (newState: ExpandCollapseState) => {
            if (this.isCollapsed()) {
                this._lastExpandedHeight = this._outerDiv.getBoundingClientRect().height;
                this.innerDiv.style.display = 'none';
            } else {
                this.innerDiv.style.display = '';
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

    setCaption(text: string) {
        this.captionLineTextDiv.textContent = text;
    }


    isCollapsed(): boolean {
        return this.captionLineExpandCollapseComponent.state == "collapsed";
    }

    setFlexWeight(flex: string) {
        this._outerDiv.style.flexGrow = flex;
        if (this.accordionElementConfig.minHeight! > 0) {
            this._outerDiv.style.flexBasis = this.accordionElementConfig.minHeight + "px";
        }
    }

}