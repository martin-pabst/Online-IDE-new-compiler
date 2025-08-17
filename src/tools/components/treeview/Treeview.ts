import { DOM } from '../../DOM.ts';
import { TreeviewAccordion } from './TreeviewAccordion.ts';
import '/assets/css/treeview.css';
import '/assets/css/icons.css';
import { ExpandCollapseComponent, ExpandCollapseState } from '../ExpandCollapseComponent.ts';
import { IconButtonComponent } from '../IconButtonComponent.ts';
import { TreeviewNode, TreeviewNodeOnClickHandler } from './TreeviewNode.ts';
import { makeEditable } from '../../HtmlTools.ts';


export type TreeviewConfig<E> = {
    captionLine: {
        enabled: boolean,
        text?: string
    },
    contextMenu?: {
        messageNewNode?: string,
        messageNewFolder?: (parentFolder: string) => string,
        messageRename?: string
    },
    flexWeight?: string,
    withFolders?: boolean,
    withDeleteButtons?: boolean,
    withDragAndDrop?: boolean,
    allowDragAndDropCopy?: boolean,
    comparator?: (externalElement1: E, externalElement2: E) => number,
    minHeight?: number,
    buttonAddFolders?: boolean,

    buttonAddElements?: boolean,
    buttonAddElementsCaption?: string,
    defaultIconClass?: string,

    initialExpandCollapseState?: ExpandCollapseState,
    withSelection: boolean,
    selectMultiple?: boolean
}


export type TreeviewContextMenuItem<E> = {
    caption: string;
    color?: string;
    callback: (element: E, node: TreeviewNode<E>) => void;
    subMenu?: TreeviewContextMenuItem<E>[]
}


export type DragKind = "copy" | "move";
// Callback functions return true if changes shall be executed on treeview, false if action should get cancelled

export type TreeviewMoveNodesCallback<E> = (movedElements: E[], destinationFolder: E | null,
    position: { order: number, elementBefore: E | null, elementAfter: E | null },
    dragKind: DragKind) => boolean;
export type TreeviewRenameCallback<E> = (element: E, newName: string, node: TreeviewNode<E>) => boolean;
export type TreeviewDeleteCallback<E> = (element: E | null) => void;
export type TreeviewNewNodeCallback<E> = (name: string, node: TreeviewNode<E>) => E;
export type TreeviewContextMenuProvider<E> = (element: E, node: TreeviewNode<E>) => TreeviewContextMenuItem<E>[];


export class Treeview<E> {

    private treeviewAccordion?: TreeviewAccordion;
    private parentElement: HTMLElement;

    public nodes: TreeviewNode<E>[] = [];

    public rootNode: TreeviewNode<E>;

    private currentSelection: TreeviewNode<E>[] = [];

    private lastSelectedElement?: TreeviewNode<E>;

    private _lastExpandedHeight: number;

    private _outerDiv!: HTMLDivElement;
    get outerDiv(): HTMLElement {
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
    private captionLineButtonsDiv!: HTMLDivElement;

    captionLineExpandCollapseComponent!: ExpandCollapseComponent;

    config: TreeviewConfig<E>;

    //callbacks
    private _moveNodesCallback?: TreeviewMoveNodesCallback<E>;
    public get moveNodesCallback(): TreeviewMoveNodesCallback<E> | undefined {
        return this._moveNodesCallback;
    }
    public set moveNodesCallback(value: TreeviewMoveNodesCallback<E> | undefined) {
        this._moveNodesCallback = value;
    }

    private _renameCallback?: TreeviewRenameCallback<E> | undefined;
    public get renameCallback(): TreeviewRenameCallback<E> | undefined {
        return this._renameCallback;
    }
    public set renameCallback(value: TreeviewRenameCallback<E> | undefined) {
        this._renameCallback = value;
    }

    private _newNodeCallback?: TreeviewNewNodeCallback<E> | undefined;
    public get newNodeCallback(): TreeviewNewNodeCallback<E> | undefined {
        return this._newNodeCallback;
    }
    public set newNodeCallback(value: TreeviewNewNodeCallback<E> | undefined) {
        this._newNodeCallback = value;
    }

    private _deleteCallback?: TreeviewDeleteCallback<E> | undefined;
    public get deleteCallback(): TreeviewDeleteCallback<E> | undefined {
        return this._deleteCallback;
    }
    public set deleteCallback(value: TreeviewDeleteCallback<E> | undefined) {
        this._deleteCallback = value;
    }

    private _contextMenuProvider?: TreeviewContextMenuProvider<E> | undefined;
    public get contextMenuProvider(): TreeviewContextMenuProvider<E> | undefined {
        return this._contextMenuProvider;
    }
    public set contextMenuProvider(value: TreeviewContextMenuProvider<E> | undefined) {
        this._contextMenuProvider = value;
    }

    private _onNodeClickedHandler?: TreeviewNodeOnClickHandler<E>;
    set onNodeClickedHandler(och: TreeviewNodeOnClickHandler<E>) {
        this._onNodeClickedHandler = och;
    }
    get onNodeClickedHandler(): TreeviewNodeOnClickHandler<E> | undefined {
        return this._onNodeClickedHandler;
    }


    constructor(parent: HTMLElement | TreeviewAccordion, config?: TreeviewConfig<E>) {

        if (parent instanceof TreeviewAccordion) {
            this.treeviewAccordion = parent;
            this.parentElement = this.treeviewAccordion.mainDiv;
        } else {
            this.parentElement = parent;
        }

        let standardConfig: TreeviewConfig<E> = {
            captionLine: {
                enabled: true,
                text: "Überschrift"
            },
            withFolders: true,
            withDeleteButtons: true,
            withDragAndDrop: true,
            allowDragAndDropCopy: false,
            contextMenu: {
                messageNewNode: "Neues Element anlegen...",
                messageNewFolder: (parentFolder: string) => (
                    "Neuen Ordner anlegen (unterhalb " + parentFolder + ")"
                ),
                messageRename: "Umbenennen"

            },
            minHeight: 150,
            initialExpandCollapseState: "expanded",
            buttonAddFolders: true,
            buttonAddElements: true,
            buttonAddElementsCaption: "Elemente hinzufügen",
            withSelection: true,
            selectMultiple: true
        }

        this._lastExpandedHeight = config?.minHeight ?? 100;

        if (config) {
            if (config.contextMenu) {
                config.contextMenu = Object.assign(standardConfig.contextMenu, config.contextMenu);
            }
            this.config = Object.assign(standardConfig, config);
        } else {
            this.config = standardConfig;
        }

        this.buildHtmlScaffolding();

        if (config?.flexWeight) this.setFlexWeight(config.flexWeight);

        this.rootNode = new TreeviewNode<E>(this, true, 'Root', undefined, null, null, null);

        if (this.treeviewAccordion) this.treeviewAccordion.addTreeview(this);

        if (this.config.initialExpandCollapseState == "expanded") {
            this._lastExpandedHeight = this.outerDiv.getBoundingClientRect().height;
        }

    }

    setFlexWeight(flex: string) {
        this._outerDiv.style.flexGrow = flex;
        if (this.config.minHeight! > 0) {
            this._outerDiv.style.flexBasis = this.config.minHeight + "px";
        }
    }

    invokeMoveNodesCallback(movedElements: E[], destinationFolder: E | null,
        position: { order: number, elementBefore: E | null, elementAfter: E | null },
        dragKind: DragKind): boolean {
        if (this._moveNodesCallback) return this._moveNodesCallback(movedElements, destinationFolder, position, dragKind);
        return true;
    }

    buildHtmlScaffolding() {
        this._outerDiv = DOM.makeDiv(this.parentElement, 'jo_treeview_outer');

        this.buildCaption();
        this._nodeDiv = DOM.makeDiv(this._outerDiv, "jo_treeview_nodediv", "jo_scrollable");
        if (this.config.initialExpandCollapseState! == "collapsed") {
            this._nodeDiv.style.display = "none";
        }

    }

    getNodeDiv(): HTMLDivElement {
        return this._nodeDiv;
    }

    buildCaption() {
        this.captionLineDiv = DOM.makeDiv(this._outerDiv, 'jo_treeview_caption');
        this.captionLineExpandCollapseDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treevew_caption_expandcollapse')
        this.captionLineTextDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treeview_caption_text')
        this.captionLineButtonsDiv = DOM.makeDiv(this.captionLineDiv, 'jo_treeview_caption_buttons')
        this.captionLineDiv.style.display = this.config.captionLine.enabled ? "flex" : "none";
        this.captionLineTextDiv.textContent = this.config.captionLine.text!;

        this.captionLineExpandCollapseComponent = new ExpandCollapseComponent(this.captionLineExpandCollapseDiv, (newState: ExpandCollapseState) => {
            if (this.isCollapsed()) {
                this._lastExpandedHeight = this._outerDiv.getBoundingClientRect().height;
                let deltaHeight: number = this._lastExpandedHeight - this.getCaptionHeight();
                this._outerDiv.style.flexBasis = "";
                this._outerDiv.style.flexGrow = "";
                this._outerDiv.style.height = this.getCaptionHeight() + "px";
                if (this.treeviewAccordion) this.treeviewAccordion.onExpandCollapseTreeview(this, newState, deltaHeight);
            } else {
                let deltaHeight: number = this.getCaptionHeight() - this._lastExpandedHeight;
                if (this.treeviewAccordion) this.treeviewAccordion.onExpandCollapseTreeview(this, newState, deltaHeight);
                this._outerDiv.style.flexBasis = "";
                this._outerDiv.style.flexGrow = "";
                this._outerDiv.style.height = this._lastExpandedHeight + "px";
            }

        }, "expanded")

        if (this.config.buttonAddFolders) {
            this.captionLineAddIconButton("img_add-folder-dark", () => {
                this.addNewNode(true);
            }, "Ordner hinzufügen");
        }

        if (this.config.buttonAddElements) {
            this.captionLineAddIconButton("img_add-dark", () => {
                this.addNewNode(false);
            }, this.config.buttonAddElementsCaption);
        }

    }

    addNewNode(isFolder: boolean) {
        let selectedNodes = this.getCurrentlySelectedNodes();

        let folder: TreeviewNode<E> | undefined;
        if (selectedNodes.length == 1 && selectedNodes[0].isFolder) folder = selectedNodes[0];

        let node = this.addNode(isFolder, "", this.config.defaultIconClass, {} as E,
            folder?.externalObject);
        makeEditable(node.captionDiv, node.captionDiv, (newContent: string) => {
            node.caption = newContent;
            if (this.newNodeCallback) {
                node.externalObject = this.newNodeCallback(newContent, node);
            }
        })

    }


    captionLineAddIconButton(iconClass: string, callback: () => void, tooltip?: string): IconButtonComponent {
        return new IconButtonComponent(this.captionLineButtonsDiv, iconClass, callback, tooltip);
    }

    captionLineAddElementToButtonDiv(element: HTMLElement) {
        this.captionLineButtonsDiv.prepend(element);
    }

    captionLineSetText(text: string) {
        this.captionLineTextDiv.textContent = text;
    }

    /**
     * Convenience method to create new nodes
     * @returns 
     */
    addNode(isFolder: boolean, caption: string, iconClass: string | undefined,
        externalElement: E,
        parentExternalReference: any): TreeviewNode<E> {

        let node = new TreeviewNode(this, isFolder, caption, iconClass,
            externalElement, parentExternalReference);

        return node;
    }

    addNodeInternal(node: TreeviewNode<E>) {
        if (this.nodes.indexOf(node) < 0) this.nodes.push(node);
    }


    // public initialRenderAll() {
    //     let renderedExternalReferences: Map<any, boolean> = new Map();

    //     // the following algorithm ensures that parents are rendered before their children:
    //     let elementsToRender = this.nodes.slice();
    //     let done: boolean = false;

    //     while (!done) {

    //         done = true;

    //         for (let i = 0; i < elementsToRender.length; i++) {
    //             let e = elementsToRender[i];
    //             if (e.parentExternalReference == null || renderedExternalReferences.get(e.parentExternalReference) != null) {
    //                 e.render();
    //                 e.findAndCorrectParent();
    //                 renderedExternalReferences.set(e.externalReference, true);
    //                 elementsToRender.splice(i, 1);
    //                 i--;
    //                 done = false;
    //             }
    //         }
    //     }

    //     this.nodes.forEach(node => node.adjustLeftMarginToDepth());

    //     if (this.config.comparator) {
    //         this.rootNode.sort(this.config.comparator);
    //     }

    // }

    findParent(node: TreeviewNode<E>): TreeviewNode<E> | undefined {
        let parent = node.parentExternalObject == null ? this.rootNode : <TreeviewNode<E> | undefined>this.nodes.find(e => e.externalObject == node.parentExternalObject);

        // Don't accept cycles in parent-child-graph:
        if (parent == node) parent = null;
        if (parent != null) {
            if (parent.isRootNode()) return parent;
            let p: TreeviewNode<E> | undefined = parent;
            do {
                p = p.getParent();
            } while (p != null && p != parent && p != node && !p.isRootNode());

            if (p != null && !p.isRootNode()) {
                parent = undefined;     // cyclic reference found!
            }
        }

        return parent;
    }


    unfocusAllNodes() {
        this.nodes.forEach(el => el.setFocus(false));
    }

    unselectAllNodes() {
        this.nodes.forEach(el => {
            el.setSelected(false);
            el.setFocus(false);
        });
        this.currentSelection = [];
    }

    addToSelection(node: TreeviewNode<E>) {
        if (this.currentSelection.indexOf(node) < 0) this.currentSelection.push(node);
    }

    setLastSelectedElement(el: TreeviewNode<E>) {
        this.lastSelectedElement = el;
    }

    getOrderedNodeListRecursively(): TreeviewNode<E>[] {
        return this.rootNode.getOrderedNodeListRecursively();
    }

    expandSelectionTo(selectedElement: TreeviewNode<E>) {
        if (this.lastSelectedElement) {
            let list = this.rootNode.getOrderedNodeListRecursively();
            let index1 = list.indexOf(this.lastSelectedElement);
            let index2 = list.indexOf(selectedElement);
            if (index1 >= 0 && index2 >= 0) {
                if (index2 < index1) {
                    let z = index1;
                    index1 = index2;
                    index2 = z;
                }
                this.unselectAllNodes();
                for (let i = index1; i <= index2; i++) {
                    list[i].setSelected(true);
                    this.currentSelection.push(list[i]);
                }
            }
        }
    }

    removeNode(node: TreeviewNode<E>) {
        let index = this.nodes.indexOf(node);
        if (index >= 0) this.nodes.splice(index, 1);
        node.destroy(false);
    }

    getCurrentlySelectedNodes(): TreeviewNode<E>[] {
        return this.currentSelection;
    }

    startStopDragDrop(start: boolean) {
        this._outerDiv.classList.toggle("jo_dragdrop", start);
    }

    getDragGhost(): HTMLElement {
        let element = document.createElement("div");
        element.classList.add('jo_treeview_drag_ghost');
        element.style.top = "-10000px";
        if (this.currentSelection.length == 1) {
            element.textContent = this.currentSelection[0].caption;
        } else {
            element.textContent = this.currentSelection.length + " Dateien/Ordner";
        }
        document.body.appendChild(element);
        return element;
    }

    removeDragGhost() {
        let ghosts = document.getElementsByClassName('jo_treeview_drag_ghost');
        for (let index = 0; index < ghosts.length; index++) {
            let ghost = ghosts.item(index);
            ghost?.remove();
        }
    }

    isSelected(node: TreeviewNode<E>) {
        return this.currentSelection.indexOf(node) >= 0;
    }

    isCollapsed(): boolean {
        return this.captionLineExpandCollapseComponent.state == "collapsed";
    }

    getCaptionHeight(): number {
        return this.captionLineDiv.getBoundingClientRect().height;
    }

    clear() {
        this.nodes = [];
        this.rootNode.removeChildren();
    }

    detachAllNodes() {
        for (let node of this.nodes.slice()) {
            if (node !== this.rootNode) node.detach();
        }
    }

}