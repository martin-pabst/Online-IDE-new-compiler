import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { Treeview } from '../tools/components/treeview/Treeview';
import { TreeviewNode } from '../tools/components/treeview/TreeviewNode';

/**
 * Tests where Treeview.addNewNode places new nodes (e.g. "new workspace" in the workspace treeview).
 */

type Item = {
    id: number,
    name: string,
    isFolder: boolean,
    parentId: number | null,
    order: number,
    readonly?: boolean
}

type Node = TreeviewNode<Item, number>;

let container: HTMLDivElement;
let nextId: number;
let orderChangedCalls: Item[][];

beforeEach(() => {
    // not implemented by jsdom
    Element.prototype.scrollIntoView = () => { };
    container = document.createElement('div');
    document.body.appendChild(container);
    nextId = 1000;
    orderChangedCalls = [];
});

afterEach(() => {
    container.remove();
});

function makeTreeview(orderBy: "user-defined" | "comparator"): Treeview<Item, number> {
    let tv = new Treeview<Item, number>(container, {
        captionLine: { enabled: true, text: "Test" },
        withSelection: true,
        selectMultiple: true,
        withFolders: true,
        buttonAddElements: true,
        buttonAddFolders: true,
        comparator: (a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0,
        keyExtractor: item => item.id,
        parentKeyExtractor: item => item.parentId,
        readOnlyExtractor: item => item.readonly ?? false,
        orderBy: orderBy,
        orderExtractor: item => item.order,
        orderSetter: (item, order) => item.order = order
    });

    tv.newNodeCallback = async (name, node) => {
        return {
            id: nextId++, name: name, isFolder: node.isFolder,
            parentId: node.getParent().externalObject?.id ?? null, order: -1
        };
    }

    tv.orderChangedCallback = async (nodes) => {
        orderChangedCalls.push(nodes.map(n => n.externalObject));
        return true;
    }

    return tv;
}

function addItem(tv: Treeview<Item, number>, id: number, name: string, isFolder: boolean, parentId: number | null, order: number, readonly: boolean = false): Node {
    return tv.addNode(isFolder, name, undefined, { id, name, isFolder, parentId, order, readonly });
}

/**
 * Folder F (A, B), folder R (read-only, contains X), workspace C
 */
function makeStandardTree(orderBy: "user-defined" | "comparator") {
    let tv = makeTreeview(orderBy);
    let F = addItem(tv, 1, "F", true, null, 0);
    let A = addItem(tv, 2, "A", false, 1, 0);
    let B = addItem(tv, 3, "B", false, 1, 1);
    let R = addItem(tv, 4, "R", true, null, 1, true);
    let X = addItem(tv, 5, "X", false, 4, 0, true);
    let C = addItem(tv, 6, "C", false, null, 2);
    tv.sort();
    return { tv, F, A, B, R, X, C };
}

/**
 * Calls addNewNode and enters the caption into the inplace editor.
 */
async function addNewNode(tv: Treeview<Item, number>, isFolder: boolean, caption: string, referenceNode?: Node): Promise<Node> {
    tv.addNewNode(isFolder, referenceNode);
    let input = <HTMLInputElement>container.querySelector('input.jo_inplaceeditor');
    expect(input, "Inplace editor for the new node expected").not.toBeNull();
    input.value = caption;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 0));
    let node = tv.nodes.find(n => n.caption == caption);
    expect(node, "New node " + caption + " expected").toBeDefined();
    return node;
}

/**
 * Simulates a click on the node. jsdom doesn't dispatch events to onpointerup properties, so the handler is called directly.
 */
function click(node: Node, ctrlKey: boolean = false) {
    let nodeLineDiv: HTMLElement = (<any>node).nodeLineDiv;
    let event = new MouseEvent('pointerup', { bubbles: true, button: 0, ctrlKey: ctrlKey });
    nodeLineDiv.onpointerup.call(nodeLineDiv, event);
}

/**
 * Returns captions of children; checks that order of DOM elements matches order of child nodes.
 */
function childCaptions(folder: Node): string[] {
    let children = folder.getChildren();
    for (let i = 0; i < children.length - 1; i++) {
        expect(children[i].getMainDiv().nextElementSibling, "DOM order must match order of child nodes in " + folder.caption)
            .toBe(children[i + 1].getMainDiv());
    }
    return children.map(c => c.caption);
}

describe('Position of new nodes in user-defined order', () => {

    test('Workspace selected: new node directly below it', async () => {
        let { tv, F, A } = makeStandardTree("user-defined");
        click(A);
        let N = await addNewNode(tv, false, "N");
        expect(childCaptions(F)).toEqual(["A", "N", "B"]);
        expect(N.externalObject.parentId).toBe(1);
        expect(F.getChildren().map(c => c.externalObject.order)).toEqual([0, 1, 2]);
        expect(orderChangedCalls.at(-1).map(item => item.name)).toEqual(["A", "N", "B"]);
        expect(tv.getCurrentlySelectedNodes()).toEqual([N]);
    });

    test('Consecutive new nodes are placed one below the other', async () => {
        let { tv, F, A } = makeStandardTree("user-defined");
        click(A);
        await addNewNode(tv, false, "N1");
        await addNewNode(tv, false, "N2");
        expect(childCaptions(F)).toEqual(["A", "N1", "N2", "B"]);
    });

    test('Folder selected: new node and new folder become first child', async () => {
        let { tv, F } = makeStandardTree("user-defined");
        click(F);
        await addNewNode(tv, false, "N");
        expect(childCaptions(F)).toEqual(["N", "A", "B"]);

        click(F);
        let G = await addNewNode(tv, true, "G");
        expect(G.isFolder).toBe(true);
        expect(childCaptions(F)).toEqual(["G", "N", "A", "B"]);
    });

    test('Collapsed folder selected: folder gets expanded', async () => {
        let { tv, F } = makeStandardTree("user-defined");
        click(F); // toggles F -> collapsed
        expect(F.expandCollapseComponent.state).toBe("collapsed");
        await addNewNode(tv, false, "N");
        expect(F.expandCollapseComponent.state).toBe("expanded");
        expect(childCaptions(F)).toEqual(["N", "A", "B"]);
    });

    test('Workspace on top level selected', async () => {
        let { tv, C } = makeStandardTree("user-defined");
        click(C);
        let N = await addNewNode(tv, false, "N");
        expect(childCaptions(tv.rootNode)).toEqual(["F", "R", "C", "N"]);
        expect(N.externalObject.parentId).toBeNull();
    });

    test('Nothing selected: new node at top of root', async () => {
        let { tv } = makeStandardTree("user-defined");
        await addNewNode(tv, false, "N");
        expect(childCaptions(tv.rootNode)).toEqual(["N", "F", "R", "C"]);
    });

    test('Explicit reference node (context menu) wins over selection', async () => {
        let { tv, F, A, C } = makeStandardTree("user-defined");
        click(C);
        await addNewNode(tv, false, "N1", A);
        expect(childCaptions(F)).toEqual(["A", "N1", "B"]);
        await addNewNode(tv, false, "N2", F);
        expect(childCaptions(F)).toEqual(["N2", "A", "N1", "B"]);
    });

    test('Ctrl-click: node clicked last is the reference', async () => {
        let { tv, F, A, C } = makeStandardTree("user-defined");
        click(C);
        click(A, true);
        await addNewNode(tv, false, "N");
        expect(childCaptions(F)).toEqual(["A", "N", "B"]);
    });

    test('Node clicked last was deselected (ctrl-click): first selected node is the reference', async () => {
        let { tv, F, A, C } = makeStandardTree("user-defined");
        click(C);
        click(A, true);
        click(A, true); // A has no focus -> gets deselected
        expect(tv.getCurrentlySelectedNodes()).toEqual([C]);
        await addNewNode(tv, false, "N");
        expect(childCaptions(tv.rootNode)).toEqual(["F", "R", "C", "N"]);
        expect(childCaptions(F)).toEqual(["A", "B"]);
    });

    test('Programmatic selection is the reference', async () => {
        let { tv, F, B } = makeStandardTree("user-defined");
        tv.selectElement(B.externalObject, false);
        await addNewNode(tv, false, "N");
        expect(childCaptions(F)).toEqual(["A", "B", "N"]);
    });

    test('Deleted reference node is ignored', async () => {
        let { tv, F, A } = makeStandardTree("user-defined");
        click(A);
        tv.removeNodeAndItsFolderContents(A);
        await addNewNode(tv, false, "N");
        expect(childCaptions(tv.rootNode)).toEqual(["N", "F", "R", "C"]);
        expect(childCaptions(F)).toEqual(["B"]);
    });

    test('No new nodes inside read-only folders', async () => {
        let { tv, R, X } = makeStandardTree("user-defined");
        click(X);
        await addNewNode(tv, false, "N1");
        expect(childCaptions(tv.rootNode)).toEqual(["F", "R", "N1", "C"]);

        click(R);
        await addNewNode(tv, false, "N2");
        expect(childCaptions(tv.rootNode)).toEqual(["F", "R", "N2", "N1", "C"]);
        expect(childCaptions(R)).toEqual(["X"]);
    });

    test('Empty caption: new node is removed', async () => {
        let { tv, F, A } = makeStandardTree("user-defined");
        click(A);
        tv.addNewNode(false);
        let input = <HTMLInputElement>container.querySelector('input.jo_inplaceeditor');
        input.value = "";
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(childCaptions(F)).toEqual(["A", "B"]);
        expect(tv.nodes.length).toBe(7);
        expect(orderChangedCalls.length).toBe(0);
    });

    test('Position is kept after re-rendering the tree from the stored order', async () => {
        let { tv, A } = makeStandardTree("user-defined");
        click(A);
        await addNewNode(tv, false, "N");
        let items = tv.getAllExternalObjects();

        container.innerHTML = "";
        let tv2 = makeTreeview("user-defined");
        for (let item of items) tv2.addNode(item.isFolder, item.name, undefined, item);
        tv2.sort();
        let F2 = tv2.nodes.find(n => n.caption == "F");
        expect(childCaptions(F2)).toEqual(["A", "N", "B"]);
    });

    test('moveNodeBelow (duplicate workspace)', async () => {
        let { tv, F, A } = makeStandardTree("user-defined");
        let copy = addItem(tv, 7, "A - copy", false, 1, 0);
        await tv.moveNodeBelow(copy, A);
        expect(childCaptions(F)).toEqual(["A", "A - copy", "B"]);
        expect(F.getChildren().map(c => c.externalObject.order)).toEqual([0, 1, 2]);

        let B = F.getChildren()[2];
        await tv.moveNodeBelow(A, B);
        expect(childCaptions(F)).toEqual(["A - copy", "B", "A"]);
    });

});

describe('Position of new nodes in comparator order', () => {

    test('New node is placed in the folder of the selected node and sorted by name', async () => {
        let { tv, F, B } = makeStandardTree("comparator");
        click(B);
        await addNewNode(tv, false, "AA");
        expect(childCaptions(F)).toEqual(["A", "AA", "B"]);
        expect(orderChangedCalls.length).toBe(0);
    });

    test('New node on top level gets sorted, too', async () => {
        let { tv } = makeStandardTree("comparator");
        await addNewNode(tv, false, "D");
        expect(childCaptions(tv.rootNode)).toEqual(["C", "D", "F", "R"]);
    });

});

describe('DOM order of nodes added by addNode', () => {

    test('Nodes added into a sorted folder appear at their sorted position', () => {
        let tv = makeTreeview("comparator");
        let F = addItem(tv, 1, "F", true, null, 0);
        addItem(tv, 2, "B", false, 1, 0);
        addItem(tv, 3, "D", false, 1, 0);
        // sort() moves the folder's childrenLineDiv in front of the children's divs:
        tv.sort();
        addItem(tv, 4, "C", false, 1, 0);
        addItem(tv, 5, "A", false, 1, 0);
        addItem(tv, 6, "E", false, 1, 0);
        expect(childCaptions(F)).toEqual(["A", "B", "C", "D", "E"]);
    });

});
