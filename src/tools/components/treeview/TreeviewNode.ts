import { AccordionMessages } from "../../../client/main/gui/language/GUILanguage.ts";
import { DOM } from "../../DOM.ts";
import { ContextMenuItem, makeEditable, openContextMenu } from "../../HtmlTools.ts";
import { ExpandCollapseComponent, ExpandCollapseListener, ExpandCollapseState } from "../ExpandCollapseComponent.ts";
import { IconButtonComponent } from "../IconButtonComponent.ts";
import { DragKind, Treeview } from "./Treeview.ts";

export type TreeviewNodeOnClickHandler<E> = (element: E | undefined) => void;

export type IconButtonListener<E, K> = (object: E, treeviewNode: TreeviewNode<E, K>, event: PointerEvent) => void;

export class TreeviewNode<E, K> {

    private _hasFocus: boolean = false;

    public get hasFocus(): boolean {
        return this._hasFocus;
    }
    public setFocus(value: boolean) {
        if (value) this.treeview.unfocusAllNodes();
        this._hasFocus = value;
        if (this.nodeLineDiv) {
            this.nodeLineDiv.classList.toggle('jo_treeview_focus', value);
        }
    }

    private _isSelected: boolean = false;
    public get isSelected(): boolean {
        return this._isSelected;
    }

    public setSelected(value: boolean) {
        this._isSelected = value;
        if (this.nodeLineDiv) {
            this.nodeLineDiv.classList.toggle('jo_treeview_selected', value);
        }
    }

    public scrollIntoView() {
        let parent = this.parent;
        while (parent) {
            parent.expandCollapseComponent.setState('expanded');
            parent = parent.parent;
        }
        this.getMainDiv().scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    protected children: TreeviewNode<E, K>[] = [];

    private parent?: TreeviewNode<E, K>;

    protected childrenDiv!: HTMLDivElement;

    /* whole line */
    private nodeWithChildrenDiv!: HTMLElement;

    private dragAndDropDestinationDiv!: HTMLElement;
    private dropzoneDiv!: HTMLElement;


    private nodeLineDiv!: HTMLElement;
    private marginLeftDiv!: HTMLDivElement;
    private expandCollapseDiv!: HTMLDivElement;
    private iconDiv!: HTMLDivElement;
    public captionDiv!: HTMLDivElement;
    private rightPartOfCaptionDiv!: HTMLDivElement;
    private buttonsDiv!: HTMLDivElement;
    private alwaysVisibleButtonsDiv!: HTMLDivElement;

    private buttons: IconButtonComponent[] = [];

    //@ts-ignore
    public expandCollapseComponent!: ExpandCollapseComponent;
    private childrenLineDiv!: HTMLDivElement;

    private tooltip: string;
    private _iconClass: string | undefined;

    public get parentKey(): K {
        return this._parentKey;
    }

    public get ownKey(): K {
        if(!this._externalObject){
            return undefined;
        } 
        
        return this._treeview.config.keyExtractor(this._externalObject);
    }

    private _onClickHandler?: TreeviewNodeOnClickHandler<E>;
    set onClickHandler(och: TreeviewNodeOnClickHandler<E>) {
        this._onClickHandler = och;
    }

    private _iconOnClickHandler?: TreeviewNodeOnClickHandler<E>;
    set onIconClicked(ich: TreeviewNodeOnClickHandler<E>) {
        this._iconOnClickHandler = ich;
        this.iconDiv.classList.add('jo_iconButton');
    }

    private _onExpandListener: { listener: ExpandCollapseListener, once: boolean }[] = [];

    constructor(private _treeview: Treeview<E, K>,
        private _isFolder: boolean, private _caption: string,
        _iconClass: string | undefined,
        private _externalObject: E | null,
        private _parentKey?: K,
        private _renderCaptionAsHtml: boolean = false) {

        let parentKeyExtractor = this._treeview.config.parentKeyExtractor;
        if (typeof this._parentKey == "undefined" && parentKeyExtractor) {
            if(this._externalObject){
                this._parentKey = parentKeyExtractor(_externalObject);
            }
        }

        _treeview.addNodeInternal(this);

        this.render();
        this.iconClass = _iconClass;   // renders the icon
    }

    set renderCaptionAsHtml(value: boolean) {
        this._renderCaptionAsHtml = value;
    }

    findAndCorrectParent() {
        let parent = this.treeview.findParent(this);
        if (this.parent != parent) {
            this.parent?.remove(this);
            this.parent = parent;
            parent?.add(this);
            this.adjustLeftMarginToDepth()
        }
    }

    getMainDiv(): HTMLElement {
        return this.nodeWithChildrenDiv;
    }

    public getParent() {
        return this.parent;
    }

    private render() {
        if (!this.nodeWithChildrenDiv) {
            this.buildHtmlScaffolding();
        }

        if (!this.parent && !this.isRootNode()) {
            this.findAndCorrectParent();
        }

        if (this.isRootNode()) {
            this.treeview.getNodeDiv().appendChild(this.nodeWithChildrenDiv);
            this.nodeWithChildrenDiv.style.flex = "1";
        }

        if (this.tooltip) this.nodeLineDiv.title = this.tooltip;

        if (this.isRootNode()) return;

        if (this._renderCaptionAsHtml) {
            this.captionDiv.innerHTML = this.caption;
        } else {
            this.captionDiv.textContent = this.caption;
        }

        this.adjustLeftMarginToDepth();

    }

    public get externalObject(): E | null {
        return this._externalObject;
    }

    public set externalObject(o: E) {
        this._externalObject = o;
    }

    public get iconClass(): string | undefined {
        return this._iconClass;
    }

    public set iconClass(value: string) {

        if (this._iconClass != value && this.iconDiv) {
            if (this._iconClass) {
                this.iconDiv.classList.remove(this._iconClass);
            }
            this.iconDiv.classList.add(value);
        }

        this._iconClass = value;
    }

    public set iconTooltip(tooltip: string) {
        this.iconDiv.title = tooltip;
    }

    public get caption(): string {
        return this._caption;
    }
    public set caption(value: string) {
        this._caption = value;
        if (this._renderCaptionAsHtml) {
            this.captionDiv.innerHTML = value;
        } else {
            this.captionDiv.textContent = value;
        }
    }

    public get isFolder(): boolean {
        return this._isFolder;
    }
    public set isFolder(value: boolean) {
        this._isFolder = value;
        if (value) {
            this.expandCollapseComponent.show();
        } else {
            this.expandCollapseComponent.hide();
        }

    }
    public get treeview(): Treeview<E, K> {
        return this._treeview;
    }
    public set treeview(value: Treeview<E, K>) {
        this._treeview = value;
    }

    isRootNode(): boolean {
        return this.externalObject == null;
    }

    private buildHtmlScaffolding() {

        this.nodeWithChildrenDiv = DOM.makeDiv(undefined, 'jo_treeviewNodeWithChildren');

        if (this.isFolder) {
            this.dropzoneDiv = DOM.makeDiv(this.nodeWithChildrenDiv, this._isFolder ? 'jo_treeviewNode_dropzone' : 'jo');
        }

        this.dragAndDropDestinationDiv = DOM.makeDiv(this.nodeWithChildrenDiv, 'jo_treeviewNode_dragAndDropDestinationLine');
        this.dragAndDropDestinationDiv.style.display = "none";

        if (!this.isRootNode()) {
            this.nodeLineDiv = DOM.makeDiv(this.nodeWithChildrenDiv, 'jo_treeviewNode');
            this.marginLeftDiv = DOM.makeDiv(this.nodeLineDiv, 'jo_treeviewNode_marginLeft');
            this.expandCollapseDiv = DOM.makeDiv(this.nodeLineDiv, 'jo_treeviewNode_expandCollapse');
            this.iconDiv = DOM.makeDiv(this.nodeLineDiv, 'jo_treeviewNode_icon');

            this.iconDiv.onclick = (event) => {
                if (this._iconOnClickHandler) {
                    this._iconOnClickHandler(this.externalObject);
                    event.stopPropagation();
                }
            }

            this.captionDiv = DOM.makeDiv(this.nodeLineDiv, 'jo_treeviewNode_caption');
            this.rightPartOfCaptionDiv = DOM.makeDiv(this.nodeLineDiv, 'jo_treeviewNode_errors');
            this.buttonsDiv = DOM.makeDiv(this.nodeLineDiv, 'jo_treeviewNode_buttons');
            this.alwaysVisibleButtonsDiv = DOM.makeDiv(this.nodeLineDiv, 'jo_treeviewNode_buttons', 'jo_treeviewNode_buttons_always_visible');

            this.nodeLineDiv.onpointerup = (ev) => {
                if (ev.button == 2) return;

                if (this.treeview.config.withSelection) {
                    ev.stopPropagation();
                    
                    if ((ev.shiftKey || ev.ctrlKey) && this.treeview.config.selectMultiple && this.treeview.getCurrentlySelectedNodes().length > 0) {
                        if(ev.shiftKey){
                            this.treeview.expandSelectionTo(this);
                        } else {
                            if(!this.hasFocus){
                                if(this.isSelected){
                                    this.treeview.removeFromSelection(this);
                                } else {
                                    this.treeview.addToSelection(this);
                                }
                            }
                        }
                    } else {
                        this.treeview.unselectAllNodes(true);
                        this.setSelected(true);
                        this.treeview.addToSelection(this);
                        this.setFocus(true);
                        this.treeview.setLastSelectedElement(this);
                        if (this._onClickHandler) this._onClickHandler(this._externalObject!);
                        if (this.treeview.onNodeClickedHandler) this.treeview.onNodeClickedHandler(this._externalObject!);
                    }

                }

            }

        }

        this.childrenDiv = DOM.makeDiv(this.nodeWithChildrenDiv, 'jo_treeviewChildren');
        this.childrenLineDiv = DOM.makeDiv(this.childrenDiv, 'jo_treeviewChildrenLineDiv');

        this.expandCollapseComponent =
            new ExpandCollapseComponent(this.expandCollapseDiv, (state: ExpandCollapseState) => {
                if (state == "expanded") {
                    this._onExpandListener.slice().forEach(handler => {
                        handler.listener(state);
                        if (handler.once) this._onExpandListener.splice(this._onExpandListener.indexOf(handler), 1);
                    });
                }
                this.toggleChildrenDiv(state);
            }, "expanded")
        if (!this.isRootNode()) {
            this.captionDiv.onpointerup = () => {
                // this.expandCollapseComponent.toggleState();
            }
        }
        if (!this._isFolder) {
            this.expandCollapseComponent.hide();
        }

        if (this.treeview.config.withDeleteButtons && !this.isRootNode()) {
            this.addIconButton("img_delete", (_object, _node, ev) => {

                let deleteAction = async () => {
                    if (this.treeview.deleteCallback) {
                        if(await this.treeview.deleteCallback(this.externalObject)){
                            this.treeview.removeNode(this);
                        }
                    } else {
                        this.treeview.removeNode(this);
                    }
                }

                if(this._treeview.config.confirmDelete){
                    openContextMenu([{
                        caption: AccordionMessages.cancel(),
                        callback: () => {
                            // nothing to do.
                        }
                    }, {
                        caption: AccordionMessages.sureDelete(),
                        color: "#ff6060",
                        callback: () => {
                            deleteAction();
                        }
                    }], ev.pageX + 2, ev.pageY + 2);
                } else {
                    deleteAction();
                }

            }, "Löschen");
        }

        this.adjustLeftMarginToDepth();

        if (this.treeview.config.withDragAndDrop) this.initDragAndDrop();
        this.initContextMenu();

    }

    select(invokeCallback: boolean = true) {
        this.treeview.unselectAllNodes(true);
        this.setSelected(true);
        this.treeview.addToSelection(this);
        if (invokeCallback) {
            if (this._onClickHandler) this._onClickHandler(this._externalObject!);
            if (this.treeview.onNodeClickedHandler) this.treeview.onNodeClickedHandler(this._externalObject!);
        }
    }

    initContextMenu() {
        if (this.isRootNode()) return;
        let contextmenuHandler = (event: MouseEvent) => {

            let contextMenuItems: ContextMenuItem[] = [];
            if (this.treeview.renameCallback != null) {
                contextMenuItems.push({
                    caption: "Umbenennen",
                    callback: () => {
                        this.renameNode();
                    }
                })
            }

            if (this.isFolder && this.treeview.config.buttonAddFolders) {
                contextMenuItems = contextMenuItems.concat([
                    {
                        caption: "Neuen Unterordner anlegen (unterhalb '" + this.caption + "')...",
                        callback: () => {
                            // TODO
                        }
                    }
                ])
            }

            if (this.treeview.contextMenuProvider != null) {

                for (let cmi of this.treeview.contextMenuProvider(this._externalObject!, this)) {
                    contextMenuItems.push({
                        caption: cmi.caption,
                        callback: () => {
                            cmi.callback(this._externalObject!, this);
                        },
                        color: cmi.color,
                        subMenu: cmi.subMenu == null ? undefined : cmi.subMenu.map((mi) => {
                            return {
                                caption: mi.caption,
                                callback: () => {
                                    mi.callback(this._externalObject!, this);
                                },
                                color: mi.color
                            }
                        })
                    })
                }
            }

            if (contextMenuItems.length > 0) {
                event.preventDefault();
                event.stopPropagation();
                openContextMenu(contextMenuItems, event.pageX, event.pageY);
            }
        };

        this.nodeLineDiv.addEventListener("contextmenu", (event) => {
            contextmenuHandler(event);
        }, false);
    }


    renameNode() {
        makeEditable(this.captionDiv, undefined, async (newText: string) => {

            if (newText != this._caption) {
                if (this.treeview.renameCallback) {
                    let callbackResponse = await this.treeview.renameCallback(this._externalObject!, newText, this);
                    if (callbackResponse.success) {
                        this.caption = callbackResponse.correctedName ?? newText;
                        if (this.treeview.config.comparator) {
                            this.parent?.sort(this.treeview.config.comparator);
                        }
                    } else {
                        this.caption = this._caption;
                    }
                    return;
                }

                this.caption = newText;
                if (this.treeview.config.comparator) {
                    this.parent?.sort(this.treeview.config.comparator);
                }

            }

        }, { start: 0, end: this._caption.length });
    }

    /**
     * Return
     *  -1 if mouse cursor is above mid-line of caption
     *  0 if insert-position is between caption and first child
     *  1 if insert-position is between first child and second child
     *  ...
     * @param _mouseX
     * @param mouseY
     */
    getDragAndDropIndex(_mouseX: number, mouseY: number): { index: number, insertPosY: number } {
        let boundingRect = this.nodeWithChildrenDiv.getBoundingClientRect();
        let top = boundingRect.top;

        if (!this.isRootNode()) {
            let nodeLineRect = this.nodeLineDiv.getBoundingClientRect();
            if (mouseY <= nodeLineRect.top + nodeLineRect.height / 2) {
                return { index: -1, insertPosY: nodeLineRect.top - top };
            }
        }

        for (let i = 0; i < this.children.length; i++) {
            let tvn = <TreeviewNode<E, K>>this.children[i];
            let boundingRect = tvn.nodeLineDiv.getBoundingClientRect();
            if (mouseY < boundingRect.top + boundingRect.height / 2)
                return { index: i, insertPosY: boundingRect.top - top };
        }

        let endPos = this.nodeWithChildrenDiv.getBoundingClientRect().bottom - top;
        if (this.children.length > 0) endPos = this.children[this.children.length - 1].nodeWithChildrenDiv.getBoundingClientRect().bottom - top;

        return { index: this.children.length, insertPosY: endPos }
    }

    containsNode(node: TreeviewNode<E, K>): boolean {
        if (this == node) return true;
        for (let c of this.children) {
            if (c.containsNode(node)) return true;
        }
        return false;
    }

    selectionContainsThisNode(): boolean {
        for (let node of this.treeview.getCurrentlySelectedNodes()) {
            if (node.containsNode(this)) {
                return true;
            }
        }
        return false;
    }

    initDragAndDrop() {
        this.nodeWithChildrenDiv.setAttribute("draggable", "true");

        this.nodeWithChildrenDiv.ondragstart = (event) => {

            if (!this.treeview.isSelected(this)) {
                this.treeview.unselectAllNodes(true);
                this.treeview.addToSelection(this);
                this.setFocus(true);
            }


            if (event.dataTransfer) {
                // event.dataTransfer.dropEffect = "move";
                event.dataTransfer.effectAllowed = "copyMove";
                event.dataTransfer.setDragImage(this.treeview.getDragGhost(), -10, 10);
            }

            event.stopPropagation();
            setTimeout(() => {
                this.treeview.startStopDragDrop(true);
            }, 100);
        }

        this.nodeWithChildrenDiv.ondragend = () => {

            this.treeview.startStopDragDrop(false);
            this.treeview.removeDragGhost();
        }

        if (this.isFolder) {
            this.dropzoneDiv.ondragover = (event) => {

                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = (event.ctrlKey && this.treeview.config.allowDragAndDropCopy)
                        ? "copy" : "move";
                }

                let ddi = this.getDragAndDropIndex(event.pageX, event.pageY);
                if (ddi.index < 0) {
                    if (this.parent?.dropzoneDiv.ondragover) {
                        this.parent.dropzoneDiv.ondragover(event);
                        this.dropzoneDiv.ondragleave!(event);
                    }
                    return; // event bubbles up to parent div's handler
                }

                if (this.parent?.dropzoneDiv.ondragleave) {
                    this.parent.dropzoneDiv.ondragleave(event);
                }

                this.dragAndDropDestinationDiv.style.top = (ddi.insertPosY - 1) + "px";
                this.dragAndDropDestinationDiv.style.display = "block";

                let selectionContainsThisNode = this.selectionContainsThisNode();
                this.dragAndDropDestinationDiv.classList.toggle('jo_treeview_invald_dragdestination', selectionContainsThisNode);

                this.nodeWithChildrenDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', true);

                if (!selectionContainsThisNode) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            this.dropzoneDiv.ondragleave = (event) => {
                if ((<HTMLElement>event.target).classList.contains("jo_treeviewNode_caption")) {
                    event.stopPropagation();
                    return;
                }

                this.dragAndDropDestinationDiv.style.display = "none";

                this.nodeWithChildrenDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', false);
                event.stopPropagation();

            }

            this.dropzoneDiv.onclick = () => { this.stopDragAndDrop(); }
            this.nodeWithChildrenDiv.onclick = () => { this.stopDragAndDrop(); }

            this.dropzoneDiv.ondrop = async (event) => {
                this.dragAndDropDestinationDiv.style.display = "none";

                this.nodeWithChildrenDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', false);

                if (this.selectionContainsThisNode()) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }

                let ddi = this.getDragAndDropIndex(event.pageX, event.pageY);
                if (ddi.index < 0) {
                    if (this.parent?.dropzoneDiv?.ondrop) {
                        this.parent.dropzoneDiv.ondrop(event);
                        return;
                    }
                }
                event.preventDefault();
                event.stopPropagation();

                // console.log("OnDrop: " + this.caption + ", pos: " + ddi.index);

                let movedElements: E[] = this.treeview.getCurrentlySelectedNodes().map(n => n.externalObject!);
                let folder: E | null = this.externalObject;

                let nodeBefore: TreeviewNode<E, K> | null = null;
                let index = ddi.index;
                while (nodeBefore == null && index > 0) {
                    nodeBefore = index > 0 ? this.children[ddi.index - 1] : null;
                    if (nodeBefore?.selectionContainsThisNode()) {
                        nodeBefore = null;
                        index--;
                    }
                }

                let elementBefore: E | null = nodeBefore == null ? null : nodeBefore._externalObject;

                let elementAfter: E | null = ddi.index < this.children.length ? this.children[ddi.index].externalObject : null;

                let dragKind: DragKind = (event.ctrlKey && this.treeview.config.allowDragAndDropCopy) ? "copy" : "move";

                switch (dragKind) {
                    case "move":

                        if (await this.treeview.invokeMoveNodesCallback(movedElements, folder,
                            { order: ddi.index, elementBefore: elementBefore, elementAfter: elementAfter },
                            dragKind)) {

                            let nodesToInsert: TreeviewNode<E, K>[] = [];
                            // iterate over selected nodes in order from top to bottom of tree:
                            for (let node of this.treeview.getOrderedNodeListRecursively()) {
                                if (this.treeview.getCurrentlySelectedNodes().indexOf(node) >= 0) {
                                    node.parent?.children.splice(node.parent.children.indexOf(node), 1);
                                    node.parent = this;
                                    nodesToInsert.push(node);
                                }
                            }

                            let insertIndex: number = nodeBefore == null ? 0 : this.children.indexOf(nodeBefore) + 1;
                            this.children.splice(insertIndex, 0, ...nodesToInsert);

                            DOM.clearAllButGivenClasses(this.childrenDiv, 'jo_treeviewChildrenLineDiv');

                            this.children.forEach(c => {
                                this.childrenDiv.appendChild(c.nodeWithChildrenDiv);
                            });

                            this._treeview.adjustAllLeftMarginsToDepth();

                        }
                        break;
                    case "copy":
                        break;
                }


            }

        }



    }

    stopDragAndDrop() {
        this.dragAndDropDestinationDiv.style.display = "none";

        this.nodeWithChildrenDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', false);
        this.dragAndDropDestinationDiv.style.display = "none";

    }

    higlightReoderPosition(isAbove: boolean, doHighlight: boolean) {
        let klassEnable = 'jo_treeviewNode_highlightReorder' + (isAbove ? 'Above' : 'Below');
        let klassDisable = 'jo_treeviewNode_highlightReorder' + (!isAbove ? 'Above' : 'Below');
        this.nodeLineDiv.classList.toggle(klassEnable, doHighlight);
        this.nodeLineDiv.classList.toggle(klassDisable, false);
    }


    toggleChildrenDiv(state: ExpandCollapseState) {
        switch (state) {
            case "collapsed":
                this.childrenDiv.style.display = "none";
                break;
            case "expanded":
                this.childrenDiv.style.display = "flex";
                break;
        }
    }

    adjustLeftMarginToDepth() {
        if (this.isRootNode()) {
            this.childrenLineDiv.style.marginLeft = "0";
        } else {
            let depth = this.getDepth() + 1;
            this.childrenLineDiv.style.marginLeft = (5 + depth * 7) + "px";

            this.marginLeftDiv.style.width = (2 + depth * 7) + "px";
        }
    }

    setRightPartOfCaptionErrors(errors: string) {
        this.rightPartOfCaptionDiv.textContent = errors;
    }

    setRightPartOfCaptionHtml(html: string) {
        this.rightPartOfCaptionDiv.innerHTML = html;
    }

    addIconButton(iconClass: string, listener: IconButtonListener<E, K>, tooltip?: string, alwaysVisible: boolean = false): IconButtonComponent {

        let parent: HTMLDivElement = alwaysVisible ? this.alwaysVisibleButtonsDiv : this.buttonsDiv;

        let button = new IconButtonComponent(parent, iconClass,
            (event: PointerEvent) => {
                listener(this._externalObject, this, event);
            }, tooltip);

        this.buttons.push(button);

        return button;
    }

    getIconButtonByTag(tag: string) {
        return this.buttons.find(b => b.tag == tag);
    }

    destroy(removeFromTreeviewNodeList: boolean = true) {
        this.parent?.remove(this);
        this.nodeWithChildrenDiv.remove();
        if (removeFromTreeviewNodeList) this.treeview.removeNode(this);
    }

    private add(child: TreeviewNode<E, K>) {
        let comparator = this.treeview.config.comparator;

        if (this.children.indexOf(child) < 0) {
            let index = this.children.length;
            if (comparator) {
                while (index > 0 && comparator(child.externalObject, this.children[index - 1].externalObject) < 0) {
                    index--;
                }
                this.children.splice(index, 0, child);
            }

            if (this.childrenDiv) {
                if (child.getMainDiv()) {
                    if (index < this.childrenDiv.childNodes.length) {
                        let successorChild = this.childrenDiv.childNodes[index];
                        this.childrenDiv.insertBefore(child.getMainDiv(), successorChild);
                    } else {
                        this.childrenDiv.appendChild(child.getMainDiv());
                    }
                }
            }

        }

    }

    public remove(child: TreeviewNode<E, K>) {
        let index = this.children.indexOf(child);
        if (index >= 0) this.children.splice(index, 1);
        child.getMainDiv().remove();
    }

    public sort(comparator?: (e1: E, e2: E) => number) {
        comparator = comparator || this.treeview.config.comparator;
        if (!comparator) return;
        this.children = this.children.sort((node1, node2) => comparator(node1.externalObject!, node2.externalObject!));

        DOM.clearAllButGivenClasses(this.childrenDiv, 'jo_treeviewChildrenLineDiv');

        this.children.forEach(node => {
            this.childrenDiv.appendChild(node.getMainDiv());
            node.sort(comparator);
        }
        );
    }

    public getDepth(): number {
        if (this.parent) return this.parent.getDepth() + 1;
        return 0;
    }

    public getOrderedNodeListRecursively(): TreeviewNode<E, K>[] {

        let list: TreeviewNode<E, K>[] = [];

        this.children.forEach(c => {
            list.push(c);
            list = list.concat(c.getOrderedNodeListRecursively())
        })

        return list;

    }

    removeChildren() {
        this.children = [];
        DOM.clear(this.childrenDiv);
    }

    detach() {
        if (this.parent == this.treeview.rootNode) {
            this.treeview.rootNode.childrenDiv.removeChild(this.nodeWithChildrenDiv);
        }
        this.treeview.nodes.splice(this.treeview.nodes.indexOf(this), 1);
    }

    attachAfterDetaching() {
        if (this.treeview.nodes.indexOf(this) < 0) {
            this.treeview.nodes.push(this);
            this.parent?.add(this);
        }
        // if(this.parent == this.treeview.rootNode){
        //     this.treeview.rootNode.childrenDiv.appendChild(this.nodeWithChildrenDiv);
        // }
    }

    addExpandListener(listener: ExpandCollapseListener, once: boolean = false) {
        this._onExpandListener.push({ listener: listener, once: once });
    }

    removeAllExpandListeners() {
        this._onExpandListener = [];
    }

    setTooltip(tooltip: string) {
        this.tooltip = tooltip;
        if (this.nodeLineDiv) this.nodeLineDiv.title = tooltip;
    }

    getChildren(): TreeviewNode<E, K>[] {
        return this.children;
    }


}