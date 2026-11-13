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
 * Test casting
 * { "libraries": ["niedersachsen"] }
 */

Stack s = new Stack();

s.push(new Integer(12));
s.push(new Integer(23));

int i = (int) s.pop();
assertEquals(23, i, "Niedersachsen-Stack: pop() doesn't return correct value after casting.");
Integer j = (Integer) s.pop();
assertEquals(12, j.intValue(), "Niedersachsen-Stack: pop() doesn't return correct value after casting.");

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

assertEquals("BinTree[inhalt=Wurzel, left=BinTree[inhalt=Links, left=BinTree[inhalt=null, left=null, right=null], right=BinTree[inhalt=null, left=null, right=null]], right=BinTree[inhalt=Rechts, left=BinTree[inhalt=null, left=null, right=null], right=BinTree[inhalt=null, left=null, right=null]]]",
   bt.toString(), "Niedersachsen-BinTree: toString() doesn't return correct value.");



/**::
 * Test generic Stack
 * { "libraries": ["niedersachsen"] }
 */
Stack<String> s = new Stack<>();
s.push("Eins");
s.push("Zwei");
String t = s.top();
assertEquals("Zwei", t, "Niedersachsen-Stack<String>: top() doesn't return correct value");
assertEquals(4, s.pop().length(), "Niedersachsen-Stack<String>: pop() doesn't return typed value");
assertEquals("Eins", s.pop(), "Niedersachsen-Stack<String>: pop() doesn't return correct value");
assertTrue(s.isEmpty(), "Niedersachsen-Stack<String>: isEmpty() returns false on empty stack.");

/**::
 * Test generic Queue
 * { "libraries": ["niedersachsen"] }
 */
Queue<Integer> q = new Queue<Integer>();
q.enqueue(1);
q.enqueue(2);
q.enqueue(3);
int h = q.head();
assertEquals(1, h, "Niedersachsen-Queue<Integer>: head() doesn't return correct value");
int sum = 0;
while(!q.isEmpty()){
    sum += q.dequeue();
}
assertEquals(6, sum, "Niedersachsen-Queue<Integer>: dequeue() doesn't return correct values");

/**::
 * Test generic DynArray with for-each loop
 * { "libraries": ["niedersachsen"] }
 */
DynArray<String> d = new DynArray<>();
d.append("a");
d.append("c");
d.insertAt(1, "b");
d.setItem(2, "d");
String all = "";
for(String str : d){
    all += str.toUpperCase();
}
assertEquals("ABD", all, "Niedersachsen-DynArray<String>: for-each loop doesn't iterate correctly");
assertEquals("a", d.getItem(0), "Niedersachsen-DynArray<String>: getItem(0) doesn't return correct value");

/**::
 * Test generic BinTree
 * { "libraries": ["niedersachsen"] }
 */
BinTree<String> bt = new BinTree<>("Wurzel");
bt.setLeft(new BinTree<String>("Links"));
bt.setRight(new BinTree<>("Rechts"));
BinTree<String> left = bt.getLeft();
assertEquals(5, left.getItem().length(), "Niedersachsen-BinTree<String>: getLeft().getItem() doesn't return typed value");
assertEquals("Rechts", bt.getRight().getItem(), "Niedersachsen-BinTree<String>: getRight().getItem() doesn't return correct value");
assertTrue(bt.getRight().getLeft().isEmpty(), "Niedersachsen-BinTree<String>: subtree of leaf isn't empty");
assertFalse(bt.isLeaf(), "Niedersachsen-BinTree<String>: isLeaf() returns true on non-leaf node.");

/**::
 * Test generic Stack: wrong content type
 * { "libraries": ["niedersachsen"], "expectedCompilationError": {"id": "cantAssignValueToLocalVariable"} }
 */
Stack<String> s = new Stack<>();
s.push("Eins");
int x = s.pop();
