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

/**::
 * Stack and Queue: NoSuchElementException when empty, messages as in reference implementation 3.0
 * { "libraries": ["niedersachsen"] }
 */
Stack<String> s = new Stack<>();
String message = "";
try {
    s.top();
} catch(NoSuchElementException e) {
    message = e.getMessage();
}
assertEquals("Der Stapel ist leer. Es kann kein Inhalt ausgelesen werden.", message, "Niedersachsen-Stack: top() on empty stack");

message = "";
try {
    s.pop();
} catch(NoSuchElementException e) {
    message = e.getMessage();
}
assertEquals("Der Stapel ist leer. Es kann kein Element entnommen werden.", message, "Niedersachsen-Stack: pop() on empty stack");

message = "";
try {
    s.push(null);
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Der übergebene Inhalt darf nicht 'null' sein.", message, "Niedersachsen-Stack: push(null)");

Queue<String> q = new Queue<>();
message = "";
try {
    q.head();
} catch(NoSuchElementException e) {
    message = e.getMessage();
}
assertEquals("Die Schlange ist leer. Es kann kein Inhalt ausgelesen werden.", message, "Niedersachsen-Queue: head() on empty queue");

message = "";
try {
    q.dequeue();
} catch(NoSuchElementException e) {
    message = e.getMessage();
}
assertEquals("Die Schlange ist leer. Es kann kein Element entnommen werden.", message, "Niedersachsen-Queue: dequeue() on empty queue");

message = "";
try {
    q.enqueue(null);
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Der übergebene Inhalt darf nicht 'null' sein.", message, "Niedersachsen-Queue: enqueue(null)");

/**::
 * BinTree: exceptions and messages as in reference implementation 3.0
 * { "libraries": ["niedersachsen"] }
 */
BinTree<String> b = new BinTree<>();
String message = "";
try {
    b.getItem();
} catch(NoSuchElementException e) {
    message = e.getMessage();
}
assertEquals("Der Baum ist leer. Es kann kein Inhalt ausgelesen werden.", message, "Niedersachsen-BinTree: getItem() on empty tree");

message = "";
try {
    b.isLeaf();
} catch(NoSuchElementException e) {
    message = e.getMessage();
}
assertEquals("Der Baum ist leer. Es kann nicht geprüft werden, ob er ein Blatt ist.", message, "Niedersachsen-BinTree: isLeaf() on empty tree");

message = "";
try {
    b.getLeft();
} catch(NoSuchElementException e) {
    message = e.getMessage();
}
assertEquals("Der Baum ist leer. Es ist kein linker Teilbaum vorhanden.", message, "Niedersachsen-BinTree: getLeft() on empty tree");

message = "";
try {
    b.getRight();
} catch(NoSuchElementException e) {
    message = e.getMessage();
}
assertEquals("Der Baum ist leer. Es ist kein rechter Teilbaum vorhanden.", message, "Niedersachsen-BinTree: getRight() on empty tree");

message = "";
try {
    b.setLeft(new BinTree<String>("A"));
} catch(IllegalStateException e) {
    message = e.getMessage();
}
assertEquals("Der Baum ist leer. Es kann kein linker Teilbaum gesetzt werden.", message, "Niedersachsen-BinTree: setLeft() on empty tree");

message = "";
try {
    b.setRight(new BinTree<String>("A"));
} catch(IllegalStateException e) {
    message = e.getMessage();
}
assertEquals("Der Baum ist leer. Es kann kein rechter Teilbaum gesetzt werden.", message, "Niedersachsen-BinTree: setRight() on empty tree");

message = "";
try {
    b.setItem(null);
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Der Inhalt kann nicht gesetzt werden. Der übergebene Inhalt darf nicht 'null' sein.", message, "Niedersachsen-BinTree: setItem(null)");

message = "";
try {
    BinTree<String> b2 = new BinTree<String>(null);
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Der Baum kann nicht erzeugt werden. Der übergebene Inhalt darf nicht 'null' sein.", message, "Niedersachsen-BinTree: new BinTree(null)");

b.setItem("Wurzel");
message = "";
try {
    b.setLeft(null);
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Der Teilbaum kann nicht gesetzt werden. Der übergebene Baum darf nicht 'null' sein.", message, "Niedersachsen-BinTree: setLeft(null)");

/**::
 * DynArray: null content rejected with message of reference implementation 3.0
 * { "libraries": ["niedersachsen"] }
 */
DynArray<String> d = new DynArray<>();
String message = "";
try {
    d.append(null);
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Der übergebene Inhalt darf nicht 'null' sein.", message, "Niedersachsen-DynArray: append(null)");

d.append("A");
message = "";
try {
    d.insertAt(0, null);
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Der übergebene Inhalt darf nicht 'null' sein.", message, "Niedersachsen-DynArray: insertAt(0, null)");

message = "";
try {
    d.setItem(0, null);
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Der übergebene Inhalt darf nicht 'null' sein.", message, "Niedersachsen-DynArray: setItem(0, null)");

/**::
 * DynArray: structural change during for-each throws ConcurrentModificationException in every pass (reference implementation 3.0.1)
 * { "libraries": ["niedersachsen"] }
 */
for (int pass = 0; pass < 3; pass++) {
    for (int kind = 0; kind < 3; kind++) {
        assertTrue(CmeProbe.throwsCme(pass, kind), "Niedersachsen-DynArray: no ConcurrentModificationException for change kind " + kind + " in pass " + pass);
    }
}

String message = "";
DynArray<String> d = new DynArray<>();
d.append("A");
d.append("B");
d.append("C");
String visited = "";
try {
    for (String item : d) {
        visited += item;
        if (item.equals("C")) {
            d.delete(2);
        }
    }
} catch (ConcurrentModificationException e) {
    message = e.getMessage();
}
assertEquals("ABC", visited, "Niedersachsen-DynArray: for-each visited wrong elements before delete in last pass");
assertEquals("Die dynamische Reihung wurde während des Durchlaufens durch Anhängen, Einfügen oder Löschen verändert.", message, "Niedersachsen-DynArray: delete in last pass of for-each");

class CmeProbe {
    // kind: 0 = delete(0), 1 = append("X"), 2 = insertAt(0, "X")
    static boolean throwsCme(int changeInPass, int kind) {
        DynArray<String> d = new DynArray<>();
        d.append("A");
        d.append("B");
        d.append("C");
        int pass = 0;
        try {
            for (String s : d) {
                if (pass == changeInPass) {
                    if (kind == 0) {
                        d.delete(0);
                    } else if (kind == 1) {
                        d.append("X");
                    } else {
                        d.insertAt(0, "X");
                    }
                }
                pass++;
            }
        } catch (ConcurrentModificationException e) {
            return true;
        }
        return false;
    }
}

/**::
 * DynArray: setItem during for-each is allowed
 * { "libraries": ["niedersachsen"] }
 */
DynArray<String> d = new DynArray<>();
d.append("a");
d.append("b");
d.append("c");
int i = 0;
String visited = "";
for (String item : d) {
    visited += item;
    d.setItem(i, item.toUpperCase());
    i++;
}
assertEquals("abc", visited, "Niedersachsen-DynArray: for-each with setItem visited wrong elements");
assertEquals("A", d.getItem(0), "Niedersachsen-DynArray: setItem during for-each didn't replace element 0");
assertEquals("C", d.getItem(2), "Niedersachsen-DynArray: setItem during for-each didn't replace element 2");

/**::
 * DynArray: explicit iterator
 * { "libraries": ["niedersachsen"] }
 */
DynArray<String> d = new DynArray<>();
d.append("A");
d.append("B");
Iterator<String> it = d.iterator();
assertTrue(it.hasNext(), "Niedersachsen-DynArray: hasNext() returns false at start");
assertEquals("A", it.next(), "Niedersachsen-DynArray: next() returns wrong element");
assertEquals("B", it.next(), "Niedersachsen-DynArray: next() returns wrong element");
assertFalse(it.hasNext(), "Niedersachsen-DynArray: hasNext() returns true at end");
String message = "";
try {
    it.next();
} catch (NoSuchElementException e) {
    message = e.getMessage();
}
assertEquals("Es ist kein weiteres Element vorhanden.", message, "Niedersachsen-DynArray: next() at end");

Iterator<String> it2 = d.iterator();
it2.next();
d.delete(0);
boolean cme = false;
try {
    it2.hasNext();
} catch (ConcurrentModificationException e) {
    cme = true;
}
assertTrue(cme, "Niedersachsen-DynArray: hasNext() after delete doesn't throw ConcurrentModificationException");

/**::
 * DynArray: for-each over raw type and over empty DynArray
 * { "libraries": ["niedersachsen"], "expectedOutput": "a2" }
 */
DynArray d = new DynArray();
d.append("a");
d.append(new Integer(2));
for (Object o : d) {
    print(o);
}

DynArray<String> empty = new DynArray<>();
int passes = 0;
for (String s : empty) {
    passes++;
}
assertEquals(0, passes, "Niedersachsen-DynArray: for-each over empty DynArray executes body");

/**::
 * DynArray<Integer>: for-each with primitive loop variable (README of reference implementation 3.0.1)
 * { "libraries": ["niedersachsen"] }
 */
DynArray<Integer> zahlen = new DynArray<>();
zahlen.append(1);
zahlen.append(2);
zahlen.append(3);
int sum = 0;
for (int z : zahlen) {
    sum += z;
}
assertEquals(6, sum, "Niedersachsen-DynArray<Integer>: for (int z : zahlen)");

/**::
 * DynArray<Long>: int loop variable is an error (no narrowing)
 * { "libraries": ["niedersachsen"], "expectedCompilationError": {"id": "elementTypeDoesntFitToIterable", "line": 7} }
 */
DynArray<Long> d = new DynArray<>();
d.append(1L);
for (int i : d) {
    print(i);
}

/**::
 * Stack is not Iterable: for-each is not allowed
 * { "libraries": ["niedersachsen"], "expectedCompilationError": {"id": "enhancedForLoopOnlyForArraysCollectionsIterables", "line": 7} }
 */
Stack<String> s = new Stack<>();
s.push("A");
for (String x : s) {
    print(x);
}

/**::
 * Queue is not Iterable: for-each is not allowed
 * { "libraries": ["niedersachsen"], "expectedCompilationError": {"id": "enhancedForLoopOnlyForArraysCollectionsIterables", "line": 7} }
 */
Queue<String> q = new Queue<>();
q.enqueue("A");
for (String x : q) {
    print(x);
}
