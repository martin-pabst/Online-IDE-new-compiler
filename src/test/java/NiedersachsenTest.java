/**::
 * Test Stack
 * { "libraries": ["niedersachsen"] }
 */

Stack s = new Stack();
assertTrue(s.isEmpty(), "Niedersachsen-Stack: isEmpty() returns false on empty stack.");

s.push("Eins");
assertFalse(s.isEmpty(), "Niedersachsen-Stack: isEmpty() returns true on non-empty stack.");

s.push("Zwei");
s.push("Drei");


assertEquals("Drei", s.top(), "Niedersachsen-Stack: top() doesn't return correct value");

assertEquals("Drei", s.pop(), "Niedersachsen-Stack: pop() doesn't return correct value");
assertEquals("Zwei", s.pop(), "Niedersachsen-Stack: pop() doesn't return correct value");
assertEquals("Eins", s.pop(), "Niedersachsen-Stack: pop() doesn't return correct value");


/**::
 * Test Queue
 * { "libraries": ["niedersachsen"] }
 */
Queue q = new Queue();
assertTrue(q.isEmpty(), "Niedersachsen-Queue: isEmpty() returns false on empty queue.");

q.enqueue("Eins");
assertFalse(q.isEmpty(), "Niedersachsen-Queue: isEmpty() returns true on non-empty queue.");

q.enqueue("Zwei");
q.enqueue("Drei");

assertEquals("Eins", q.head(), "Niedersachsen-Queue: head() doesn't return correct value");

assertEquals("Eins", q.dequeue(), "Niedersachsen-Queue: dequeue() doesn't return correct value");
assertEquals("Zwei", q.dequeue(), "Niedersachsen-Queue: dequeue() doesn't return correct value");
assertEquals("Drei", q.dequeue(), "Niedersachsen-Queue: dequeue() doesn't return correct value");

/**::
 * Test DynArray
 * { "libraries": ["niedersachsen"] }
 */
DynArray d = new DynArray();
assertTrue(d.isEmpty(), "Niedersachsen-DynArray: isEmpty() returns false on empty dynArray.");

d.append("Eins");
assertFalse(d.isEmpty(), "Niedersachsen-DynArray: isEmpty() returns true on non-empty dynArray.");

d.append("Zwei");
d.append("Drei");

assertEquals("Eins", d.getItem(0), "Niedersachsen-DynArray: getItem(0) doesn't return correct value");
assertEquals("Zwei", d.getItem(1), "Niedersachsen-DynArray: getItem(1) doesn't return correct value");
assertEquals("Drei", d.getItem(2), "Niedersachsen-DynArray: getItem(2) doesn't return correct value");

try {
    d.getItem(-1);
} catch(IndexOutOfBoundsException e){
    assertCodeReached("Niedersachsen-DynArray: getItem(-1) didn't throw IndexOutOfBoundsException.");
}

try {
    d.getItem(3);
} catch(IndexOutOfBoundsException e){
    assertCodeReached("Niedersachsen-DynArray: getItem(3) didn't throw IndexOutOfBoundsException.");
}

d.insertAt(0, "VorEins");
assertEquals("VorEins", d.getItem(0), "Niedersachsen-DynArray: getItem(0) doesn't return correct value");

d.insertAt(2, "ZwischenEinsUndZwei");
assertEquals("ZwischenEinsUndZwei", d.getItem(2), "Niedersachsen-DynArray: getItem(2) doesn't return correct value");

d.insertAt(5, "Ende");
assertEquals("Ende", d.getItem(5), "Niedersachsen-DynArray: getItem(5) doesn't return correct value");


try {
    d.insertAt(-1, "Invalid");
} catch(IndexOutOfBoundsException e){
    assertCodeReached("Niedersachsen-DynArray: insertAt(-1) didn't throw IndexOutOfBoundsException.");
}

try {
    d.insertAt(7, "Invalid");
} catch(IndexOutOfBoundsException e){
    assertCodeReached("Niedersachsen-DynArray: insertAt(7) didn't throw IndexOutOfBoundsException.");
}

d.setItem(1, "EinsNeu");
assertEquals("EinsNeu", d.getItem(1), "Niedersachsen-DynArray: getItem(1) doesn't return correct value after setItem().");
try {
    d.setItem(-1, "Invalid");
} catch(IndexOutOfBoundsException e){
    assertCodeReached("Niedersachsen-DynArray: setItem(-1) didn't throw IndexOutOfBoundsException.");
}

try {
    d.setItem(6, "Invalid");
} catch(IndexOutOfBoundsException e){
    assertCodeReached("Niedersachsen-DynArray: setItem(6) didn't throw IndexOutOfBoundsException.");
}   

d.delete(2);
assertEquals(5, d.getLength(), "Niedersachsen-DynArray: getLength() doesn't return correct value after delete().");
assertEquals("Zwei", d.getItem(2), "Niedersachsen-DynArray: getItem(2) doesn't return correct value");

try {
    d.delete(-1);
} catch(IndexOutOfBoundsException e){
    assertCodeReached("Niedersachsen-DynArray: delete(-1) didn't throw IndexOutOfBoundsException.");
}

try {
    d.delete(5);
} catch(IndexOutOfBoundsException e){
    assertCodeReached("Niedersachsen-DynArray: delete(5) didn't throw IndexOutOfBoundsException.");
}


/**::
 * Test BinTree
 * { "libraries": ["niedersachsen"] }
 */
BinTree bt = new BinTree();

bt.setItem("Wurzel");
assertEquals("Wurzel", bt.getItem(), "Niedersachsen-BinTree: getItem() doesn't return correct value.");

bt.setLeft(new BinTree("Links"));
bt.setRight(new BinTree("Rechts"));
assertEquals("Links", bt.getLeft().getItem(), "Niedersachsen-BinTree: getLeft().getItem() doesn't return correct value.");
assertEquals("Rechts", bt.getRight().getItem(), "Niedersachsen-BinTree: getRight().getItem() doesn't return correct value.");

assertTrue(bt.getLeft().isLeaf(), "Niedersachsen-BinTree: getLeft().isLeaf() returns false on leaf node.");
assertTrue(bt.getRight().isLeaf(), "Niedersachsen-BinTree: getRight().isLeaf() returns false on leaf node.");

assertFalse(bt.isLeaf(), "Niedersachsen-BinTree: isLeaf() returns true on non-leaf node.");

assertEquals("BinTree[inhalt=Wurzel, left=BinTree[inhalt=Links, left=null, right=null], right=BinTree[inhalt=Rechts, left=null, right=null]]",
   bt.toString(), "Niedersachsen-BinTree: toString() doesn't return correct value.");



