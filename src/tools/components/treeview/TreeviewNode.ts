import { AccordionMessages } from "../../../client/main/gui/language/GUILanguage.ts";
import { DOM } from "../../DOM.ts";
import { ContextMenuItem, isIPad, makeEditable, openContextMenu, preventTouchDefault } from "../../HtmlTools.ts";
import { TabletConsoleLog } from "../../TabletConsoleLog.ts";
import { ExpandCollapseComponent, ExpandCollapseListener, ExpandCollapseState } from "../ExpandCollapseComponent.ts";
import { IconButtonComponent } from "../IconButtonComponent.ts";
import { DragKind, Treeview } from "./Treeview.ts";
import { TreeviewMessages } from "./TreeviewMessages.ts";

export type TreeviewNodeOnClickHandler<E> = (element: E | undefined) => void;

export type IconButtonListener<E, K> = (object: E, treeviewNode: TreeviewNode<E, K>, event: PointerEvent) => void;

export class TreeviewNode<E, K> {

    private _hasFocus: boolean = false;

    private _isRootNode: boolean = false;

    contextmenuHandler: (event: MouseEvent) => void;

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

    private _readOnly: boolean = false;

    public get readOnly(): boolean {
        if (this._treeview.config.readOnlyExtractor && this._externalObject) {
            return this._treeview.config.readOnlyExtractor(this._externalObject);
        }
        if (this._readOnly) return true;
        if (this.isRootNode()) return false;
        if (this.parent) return this.parent.readOnly;
        return false;
    }

    public set readOnly(value: boolean) {
        this._readOnly = value;
    }


    public scrollIntoView() {
        let parent = this.parent;
        while (parent) {
            parent.expandCollapseComponent.setState('expanded');
            parent = parent.parent;
        }
        this.getMainDiv().scrollIntoView({
            behavior: "instant",
            block: "center"
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

    public get ownKey(): K | null {
        if (!this._externalObject) {
            return null;
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
        private _renderCaptionAsHtml: boolean = false,
        isRootNode: boolean = false) {

        this._isRootNode = isRootNode;
        let parentKeyExtractor = this._treeview.config.parentKeyExtractor;
        if (typeof this._parentKey == "undefined" && parentKeyExtractor) {
            if (this._externalObject) {
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
            this.captionDiv.classList.toggle('jo_treeview_caption_bold', false);
        } else {
            this.captionDiv.textContent = this.caption;
            this.captionDiv.classList.toggle('jo_treeview_caption_bold', this.isFolder);
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
        return this._isRootNode;
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
                this.treeview.startStopDragDrop(false);
                this.treeview.removeDragGhost();

                if (ev.button == 2) return;

                if (this.treeview.config.withSelection) {
                    ev.stopPropagation();

                    if ((ev.shiftKey || ev.ctrlKey) && this.treeview.config.selectMultiple && this.treeview.getCurrentlySelectedNodes().length > 0) {
                        if (ev.shiftKey) {
                            this.treeview.expandSelectionTo(this);
                        } else {
                            if (!this.hasFocus) {
                                if (this.isSelected) {
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

                        if (this.isFolder) {
                            this.expandCollapseComponent.toggleState();
                        }

                        if (this.treeview.config.selectWholeFolders && this.isFolder) {
                            for (let child of this.getOrderedNodeListRecursively()) {
                                child.setSelected(true);
                                this.treeview.addToSelection(child);
                            }
                        }

                        if (this._onClickHandler) this._onClickHandler(this._externalObject!);
                        if (this.treeview.nodeClickedCallback) this.treeview.nodeClickedCallback(this._externalObject!);
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

        if (this.treeview.config.withDeleteButtons && !this.isRootNode() && !this.readOnly) {
            this.addIconButton("img_delete", (_object, _node, ev) => {

                let deleteAction = async () => {
                    if (this.treeview.deleteCallback) {
                        if (await this.treeview.deleteCallback(this.externalObject, this)) {
                            this.treeview.removeNodeAndItsFolderContents(this);
                        }
                    } else {
                        this.treeview.removeNodeAndItsFolderContents(this);
                    }
                }

                if (this._treeview.config.confirmDelete) {
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

        this.initDragAndDrop();
        this.initContextMenu();

        if (isIPad() && !this.isRootNode()) {
            this.addIconButton("img_ellipsis-dark", (object, node, event) => {
                this.contextmenuHandler(event);
            }, "Kontextmenü aufrufen", true)
        }

    }

    select(invokeCallback: boolean = true) {
        this.treeview.unselectAllNodes(true);
        this.setSelected(true);
        this.treeview.addToSelection(this);
        if (invokeCallback) {
            if (this._onClickHandler) this._onClickHandler(this._externalObject!);
            if (this.treeview.nodeClickedCallback) this.treeview.nodeClickedCallback(this._externalObject!);
        }
    }

    initContextMenu() {
        if (this.isRootNode()) return;
        this.contextmenuHandler = (event: MouseEvent) => {
            let contextMenuItems: ContextMenuItem[] = [];
            if (!this.readOnly) {
                if (this.treeview.renameCallback != null) {
                    contextMenuItems.push({
                        caption: TreeviewMessages.rename(),
                        callback: () => {
                            this.renameNode();
                        }
                    })
                }

                if (isIPad()) {
                    contextMenuItems.push({
                        caption: TreeviewMessages.delete(),
                        callback: () => {
                            if (this.treeview.config.confirmDelete) {
                                if (confirm(TreeviewMessages.confirmDelete())) {
                                    this.treeview.removeNodeAndItsFolderContents(this);
                                }
                            } else {
                                this.treeview.removeNodeAndItsFolderContents(this);
                            }
                        }
                    })
                }

                if (this.isFolder && this.treeview.config.buttonAddFolders) {
                    contextMenuItems = contextMenuItems.concat([
                        {
                            caption: TreeviewMessages.newFolder(this.caption),
                            callback: () => {
                                // TODO
                            }
                        }
                    ])
                }

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

            event.preventDefault();
            event.stopPropagation();
            if (contextMenuItems.length > 0) {
                this._treeview.contextMenu = openContextMenu(contextMenuItems, event.pageX, event.pageY);
            }
        };

        this.nodeLineDiv.addEventListener("contextmenu", (event) => {
            this.contextmenuHandler(event);
        }, false);


        let posXStart: number = 0;
        let posYStart: number = 0;
        if (isIPad()) {
            this.nodeLineDiv.addEventListener("touchstart", (event) => {
                if (this._treeview.contextMenuTimer) clearTimeout(this._treeview.contextMenuTimer);
                this._treeview.contextMenuTimer = undefined;

                if (event.touches.length > 1) return;
                let touch = event.touches[0];
                posXStart = touch.clientX;
                posYStart = touch.clientY;

                this._treeview.contextMenuTimer = setTimeout(() => {
                    let event1 = {
                        pageX: touch.pageX,
                        pageY: touch.pageY,
                        preventDefault: () => { },
                        stopPropagation: () => { }
                    }
                    this.contextmenuHandler(<any>event1);
                }, 900);
            })
            this.nodeLineDiv.addEventListener("touchend", (event) => {
                if (this._treeview.contextMenuTimer) clearTimeout(this._treeview.contextMenuTimer);
                this._treeview.contextMenuTimer = undefined;
            })
            this.nodeLineDiv.addEventListener("touchmove", (event) => {
                let touch = event.touches[0];
                if (Math.abs(touch.clientX - posXStart) > 10 || Math.abs(touch.clientY - posYStart) > 10) {
                    if (this._treeview.contextMenuTimer) clearTimeout(this._treeview.contextMenuTimer);
                }
            })
        }
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


    findNonFolderElementContainingPoint(y: number): TreeviewNode<E, K> | null {
        let childFound: TreeviewNode<E, K> | null = null;
        for (let child of this.children.filter(c => !c.isFolder)) {
            let boundingRect = child.nodeLineDiv.getBoundingClientRect();
            if (y >= boundingRect.top && y <= boundingRect.top + boundingRect.height) {
                childFound = child;
                break;
            }
        }
        return childFound;
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
    getDragAndDropIndexForInsertKindAsElement(_mouseX: number, mouseY: number): { index: number, insertPosY: number } {
        let boundingRect = this.nodeWithChildrenDiv.getBoundingClientRect();
        let top = boundingRect.top;

        if (!this.isRootNode()) {
            let nodeLineRect = this.nodeLineDiv.getBoundingClientRect();
            if (!this.isFolder && mouseY <= nodeLineRect.top + nodeLineRect.height / 2) {
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

        if (isIPad()) {
            // return;
        }

        if (this.treeview.config.isDragAndDropSource) {
            this.nodeWithChildrenDiv.setAttribute("draggable", "true");
        }

        this.nodeWithChildrenDiv.ondragstart = (event) => {

            event.stopPropagation();
            this._treeview.contextMenu?.hide();

            if (!this.treeview.isSelected(this)) {
                this.treeview.unselectAllNodes(true);
                this.treeview.addToSelection(this);

                this.setFocus(true);
            }

            if (this.treeview.config.selectWholeFolders && this.isFolder) {
                for (let child of this.getOrderedNodeListRecursively()) {
                    child.setSelected(true);
                    this.treeview.addToSelection(child);
                }
            }

            Treeview.currentDragSource = this._treeview;

            if (event.dataTransfer) {
                // event.dataTransfer.dropEffect = "move";
                event.dataTransfer.effectAllowed = "copyMove";
                event.dataTransfer.setDragImage(this.treeview.getDragGhost(), -10, 10);
            }

            // event.stopPropagation();
            setTimeout(() => {
                this.treeview.startStopDragDrop(true);
            }, 100);
        }

        this.nodeWithChildrenDiv.ondragend = () => {

            this.treeview.startStopDragDrop(false);
            this.treeview.removeDragGhost();
        }

        if (this.isFolder || this.isRootNode()) {
            this.dropzoneDiv.ondragover = (event) => {
                this._treeview.contextMenu?.hide();

                let dragSourceTreeview = this._treeview.getCurrentDragAndDropSource();

                if (!dragSourceTreeview) return;

                if (event.dataTransfer) {
                    if (dragSourceTreeview) {
                        let dragKind: DragKind = dragSourceTreeview.defaultDragKind;
                        if (event.shiftKey && dragSourceTreeview.dragKindWithShift) dragKind = dragSourceTreeview.dragKindWithShift;
                        if (event.ctrlKey && dragSourceTreeview.dragKindWithCtrl) dragKind = dragSourceTreeview.dragKindWithCtrl;
                        event.dataTransfer.dropEffect = dragKind;
                    } else {
                        return;
                    }
                }

                switch (dragSourceTreeview.dropInsertKind) {
                    case "asElement":
                        this.dragAndDropDestinationDiv.classList.toggle('jo_treeview_invald_dragdestination', false);

                        let ddi = this.getDragAndDropIndexForInsertKindAsElement(event.pageX, event.pageY);
                        if (ddi.index < 0) {
                            if (this.parent?.dropzoneDiv.ondragover) {
                                this.parent.dropzoneDiv.ondragover(event);
                                this.dropzoneDiv.ondragleave!(event);
                            }
                            return; // event bubbles up to parent div's handler
                        }
                        this.dragAndDropDestinationDiv.style.top = (ddi.insertPosY - 1) + "px";
                        this.dragAndDropDestinationDiv.style.display = "block";

                        let selectionContainsThisNode = this.selectionContainsThisNode();
                        if (selectionContainsThisNode && dragSourceTreeview.treeview == this.treeview) {
                            this.dragAndDropDestinationDiv.classList.toggle('jo_treeview_invald_dragdestination', true);
                            // this.dropzoneDiv.ondragleave(event);
                            return;
                        }

                        this.nodeWithChildrenDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', true);
                        break;
                    case "intoElement":
                        let childFound = this.findNonFolderElementContainingPoint(event.pageY);

                        if (!childFound) return;

                        for (let child of this.children) {
                            child.nodeLineDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', child == childFound);
                        }
                        break;
                }

                event.stopPropagation();
                event.preventDefault();

                // if (this.parent?.dropzoneDiv.ondragleave) {
                //     this.parent.dropzoneDiv.ondragleave(event);
                // }


            }

            this.dropzoneDiv.ondragleave = (event) => {
                if ((<HTMLElement>event.target).classList.contains("jo_treeviewNode_caption")) {
                    event.stopPropagation();
                    return;
                }

                this.dragAndDropDestinationDiv.style.display = "none";

                this.nodeWithChildrenDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', false);

                for (let child of this.children) {
                    child.nodeLineDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', false);
                }

                event.stopPropagation();

            }

            this.dropzoneDiv.onclick = () => { this.stopDragAndDrop(); }
            this.nodeWithChildrenDiv.onclick = () => { this.stopDragAndDrop(); }

            this.dropzoneDiv.ondrop = async (event) => {
                this.dragAndDropDestinationDiv.style.display = "none";

                this.nodeWithChildrenDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', false);

                for (let child of this.children) {
                    child.nodeLineDiv.classList.toggle('jo_treeviewNode_highlightDragDropDestination', false);
                }

                // DOM.clearAllButGivenClasses(this.childrenDiv, 'jo_treeviewChildrenLineDiv');
                event.preventDefault();
                event.stopPropagation();

                let dragSourceTreeview = this._treeview.getCurrentDragAndDropSource();
                if (!dragSourceTreeview) return;

                let dragKind: DragKind = dragSourceTreeview.defaultDragKind;
                if (event.shiftKey && dragSourceTreeview.dragKindWithShift) dragKind = dragSourceTreeview.dragKindWithShift;
                if (event.ctrlKey && dragSourceTreeview.dragKindWithCtrl) dragKind = dragSourceTreeview.dragKindWithCtrl;

                switch (dragSourceTreeview.dropInsertKind) {
                    case "asElement":
                        let childIndexToDropInto = this.getDragAndDropIndexForInsertKindAsElement(event.pageX, event.pageY).index;
                        if (childIndexToDropInto < 0) {
                            if (this.parent?.dropzoneDiv?.ondrop) {
                                this.parent.dropzoneDiv.ondrop(event);
                                return;
                            }
                        }
                        this._treeview.notifyDropEvent(dragSourceTreeview.treeview, this, childIndexToDropInto, dragKind);
                        break;
                    case "intoElement":
                        let destChild = this.findNonFolderElementContainingPoint(event.pageY);
                        if (destChild) this._treeview.notifyDropEvent(dragSourceTreeview.treeview, destChild, 0, dragKind);
                        break;
                }


            }

        }



    }

    insertNodes(childIndexToDropInto: number, nodesToInsert: TreeviewNode<E, K>[]) {
        if (!this.isFolder) return;

        nodesToInsert.forEach(nti => {

            if (nti.parent) {
                nti.parent.remove(nti);
            }

            nti.parent = this;
        })

        this.children.splice(childIndexToDropInto, 0, ...nodesToInsert);


        this.children.forEach(c => {
            this.childrenDiv.appendChild(c.nodeWithChildrenDiv);
        });

        this._treeview.adjustAllLeftMarginsToDepth();
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
            let depth = this.getDepth();
            this.childrenLineDiv.style.marginLeft = (6 + depth * 7) + "px";

            this.marginLeftDiv.style.width = (-1 + depth * 7) + "px";
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
        if (removeFromTreeviewNodeList) this.treeview.removeNodeAndItsFolderContents(this);
    }

    private add(child: TreeviewNode<E, K>) {
        let comparator = this.treeview.config.comparator;

        if (this.children.indexOf(child) < 0) {
            let index = this.children.length;
            if (comparator && child.externalObject) {
                while (index > 0 && comparator(child.externalObject, this.children[index - 1].externalObject) < 0) {
                    index--;
                }
                this.children.splice(index, 0, child);
            } else {
                this.children.push(child);
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
        if (this.parent == this.treeview.rootNode && this.nodeWithChildrenDiv.parentNode) {
            this.treeview.rootNode.childrenDiv.removeChild(this.nodeWithChildrenDiv);
        }

        let index = this.parent.children.indexOf(this);
        if (index >= 0) this.parent.children.splice(index, 1);

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

    pulse(): void {
        this.nodeLineDiv.classList.toggle('jo_treeview_pulse', true);
    }

    setCaptionColor(color: string) {
        this.captionDiv.style.color = color;
    }


    expand() {
        if (this.parent) this.parent.expand();
        this.expandCollapseComponent.setState("expanded");
    }

    collapse() {
        this.expandCollapseComponent.setState("collapsed");
    }

}