import { lm } from "../../../../../tools/language/LanguageManager";

export class NiedersachsenLang {
    static StackClassComment  = () => lm({
        'de': `Klasse Stack zur Umsetzung des ADT Stapel entsprechend der Vorgaben des KC Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden Hinweisen (Stand: Juni 2025). Der Typparameter \`ContentType\` legt den Inhaltstyp der Elemente des Stapels fest. Intern wird der Stapel als einfach verkettete Liste umgesetzt. Abgelegt und entnommen wird immer vorne an der Liste, daher benötigen push, pop und top unabhängig von der Größe des Stapels stets gleich viel Zeit.` ,
        'en': `Class Stack implementing the ADT stack according to the requirements of the KC Informatik for the upper secondary level (gymnasiale Oberstufe) in Lower Saxony and the supplementary notes (as of June 2025). The type parameter \`ContentType\` defines the content type of the stack's elements. Internally the stack is implemented as a singly linked list. Elements are always added and removed at the front of the list, so push, pop and top always take the same amount of time regardless of the size of the stack.`
    });

    static stackClassConstructorComment = () => lm({
        'de': `Ein leerer Stapel wird angelegt.`,
        'en': `An empty stack is created.`
    });

    static ElementClassComment = () => lm({
        'de': `Die Klasse \`Element\` repräsentiert ein Element im Stapelspeicher, dem dynamischen Array (DynArray) oder der Warteschlange (Queue).`,
        'en': `The class \`Element\` represents an element in the stack storage, dynamic array (DynArray), or queue.`
    });

    static stackClassIsEmptyComment = () => lm({
        'de': `Wenn der Stapel kein Element enthält, wird der Wert wahr zurückgegeben, sonst der Wert falsch.`  ,
        'en': `If the stack contains no element, the value true is returned, otherwise the value false.`
    });

    static stackClassEmptyExceptionMessageTop = () => lm({
        'de': `Der Stapel ist leer. Es kann kein Wert ausgelesen werden.` ,
        'en': `The stack is empty. No value can be read.`
    });

    static stackClassEmptyExceptionMessagePop = () => lm({
        'de': `Der Stapel ist leer. Es kann kein Wert entnommen werden.` ,
        'en': `The stack is empty. No value can be popped.`
    });

    static mustNotPushNullExceptionMessage = () => lm({
        'de': `Der übergebene Inhalt darf nicht 'null' sein.` ,
        'en': `No null value may be pushed onto the stack.`
    });

    static stackClassPushComment = () => lm({
        'de': `Ein neues Element mit dem übergebenen Inhalt wird oben auf den Stapel gelegt. Löst eine IllegalArgumentException aus, wenn der übergebene Inhalt 'null' ist.` ,
        'en': `A new element with the given content is placed on top of the stack. Throws an IllegalArgumentException if the given content is 'null'.`
    });

    static stackClassPopComment = () => lm({
        'de': `Das oberste Element des Stapels wird entnommen. Der Inhalt dieses Elements wird zurückgegeben. Löst eine IllegalStateException aus, wenn der Stapel leer ist.` ,
        'en': `The top element of the stack is removed. The content of this element is returned. Throws an IllegalStateException if the stack is empty.`
    });

    static stackClassTopComment = () => lm({
        'de': `Der Inhalt des obersten Elements des Stapels wird zurückgegeben, das Element aber nicht entnommen. Löst eine IllegalStateException aus, wenn der Stapel leer ist.` ,
        'en': `The content of the top element of the stack is returned, but the element is not removed. Throws an IllegalStateException if the stack is empty.`
    });

    static queueClassComment = () => lm({
        'de': `Klasse Queue zur Umsetzung des ADT Schlange entsprechend der Vorgaben des KC Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden Hinweisen (Stand: Juni 2025). Der Typparameter \`ContentType\` legt den Inhaltstyp der Elemente der Schlange fest. Intern wird die Schlange als einfach verkettete Liste umgesetzt. Angehängt wird am Ende, entnommen wird vorne. Daher benötigen enqueue, dequeue und head unabhängig von der Größe der Schlange stets gleich viel Zeit.`,
        'en': `Class Queue implementing the ADT queue according to the requirements of the KC Informatik for the upper secondary level (gymnasiale Oberstufe) in Lower Saxony and the supplementary notes (as of June 2025). The type parameter \`ContentType\` defines the content type of the queue's elements. Internally the queue is implemented as a singly linked list. Elements are appended at the end and removed at the front, so enqueue, dequeue and head always take the same amount of time regardless of the size of the queue.`
    });

    static queueClassConstructorComment = () => lm({
        'de': `Eine leere Schlange wird angelegt.`,
        'en': `An empty queue is created.`
    });

    static queueClassIsEmptyComment = () => lm({
        'de': `Wenn die Schlange kein Element enthält, wird der Wert wahr zurückgegeben, sonst der Wert falsch.`,
        'en': `If the queue contains no element, the value true is returned, otherwise the value false.`
    });

    static queueClassHeadComment = () => lm({
        'de': `Der Inhalt des vordersten Elements der Schlange wird zurückgegeben, das Element aber nicht entnommen. Löst eine IllegalStateException aus, wenn die Schlange leer ist.`,
        'en': `The content of the front element of the queue is returned, but the element is not removed. Throws an IllegalStateException if the queue is empty.`
    });

    static queueClassEmptyExceptionMessageHead = () => lm({
        'de': `Die Schlange ist leer. Es kann kein Wert ausgelesen werden.` ,
        'en': `The queue is empty. No value can be read.`
    });

    static queueClassEnqueueComment = () => lm({
        'de': `Ein neues Element mit dem angegebenen Inhalt wird am Ende an die Schlange angehängt. Löst eine IllegalArgumentException aus, wenn der übergebene Inhalt 'null' ist.`,
        'en': `A new element with the given content is appended to the end of the queue. Throws an IllegalArgumentException if the given content is 'null'.`
    });

    static mustNotEnqueueNullExceptionMessage = () => lm({
        'de': `Der übergebene Inhalt darf nicht 'null' sein.` ,
        'en': `No null value may be enqueued into the queue.`
    });

    static queueClassDequeueComment = () => lm({
        'de': `Das vorderste Element der Schlange wird entnommen. Der Inhalt dieses Elements wird zurückgegeben. Löst eine IllegalStateException aus, wenn die Schlange leer ist.`,
        'en': `The front element of the queue is removed. The content of this element is returned. Throws an IllegalStateException if the queue is empty.`
    });

    static queueClassEmptyExceptionMessage = () => lm({
        'de': `Die Schlange ist leer. Es kann kein Wert entnommen werden.` ,
        'en': `The queue is empty. No value can be dequeued.`
    });

    static dynArrayClassComment = () => lm({
        'de': `Klasse DynArray zur Umsetzung des ADT Dynamische Reihung entsprechend der Vorgaben des KC Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden Hinweisen (Stand: Juni 2025). Der Typparameter \`ContentType\` legt den Inhaltstyp der Elemente der dynamischen Reihung fest. Die Nummerierung der Elemente beginnt mit dem Index 0. Dynamische Reihungen sind iterierbar, so dass die Verwendung einer for-each-Schleife zum elementweisen Auslesen einer dynamischen Reihung möglich ist.`,
        'en': `Class DynArray implementing the ADT dynamic array according to the requirements of the KC Informatik for the upper secondary level (gymnasiale Oberstufe) in Lower Saxony and the supplementary notes (as of June 2025). The type parameter \`ContentType\` defines the content type of the dynamic array's elements. The numbering of the elements starts with index 0. Dynamic arrays are iterable, so a for-each loop can be used to read a dynamic array element by element.`
    });

    static dynArrayConstructorComment = () => lm({
        'de': `Eine leere dynamische Reihung wird angelegt.`,
        'en': `An empty dynamic array is created.`
    });

    static dynArrayIsEmptyComment = () => lm({
        'de': `Wenn die dynamische Reihung kein Element enthält, wird der Wert wahr zurückgegeben, sonst der Wert falsch.`,
        'en': `If the dynamic array contains no element, the value true is returned, otherwise the value false.`
    });

    static dynArrayGetItemComment = () => lm({
        'de': `Der Inhalt des Elements an der Position index wird zurückgegeben. Löst eine IndexOutOfBoundsException aus, wenn index kleiner als 0 oder größer als getLength() - 1 ist.` ,
        'en': `The content of the element at position index is returned. Throws an IndexOutOfBoundsException if index is less than 0 or greater than getLength() - 1.`
    });

    static dynArrayAppendComment = () => lm({
        'de': `Ein neues Element mit dem übergebenen Inhalt wird am Ende der dynamischen Reihung angefügt. Löst eine IllegalArgumentException aus, wenn der übergebene Inhalt 'null' ist.` ,
        'en': `A new element with the given content is appended to the end of the dynamic array. Throws an IllegalArgumentException if the given content is 'null'.`
    });

    static mustNotAppendNullExceptionMessage = () => lm({
        'de': `Das Element darf nicht 'null' sein.` ,
        'en': `No null value may be appended to the dynamic array.`
    });

    static dynArrayInsertAtComment = () => lm({
        'de': `Ein neues Element mit dem übergebenen Inhalt wird an der Position index in die dynamische Reihung eingefügt. Das Element, das sich vorher an dieser Position befunden hat, und alle nachfolgenden werden nach hinten verschoben. Entspricht der Wert von index der Länge der dynamischen Reihung, so wird ein neues Element am Ende der dynamischen Reihung angefügt. Löst eine IndexOutOfBoundsException aus, wenn index kleiner als 0 oder größer als getLength() ist. Löst eine IllegalArgumentException aus, wenn der übergebene Inhalt 'null' ist.` ,
        'en': `A new element with the given content is inserted into the dynamic array at position index. The element previously at this position and all following elements are shifted back by one position. If index equals the length of the dynamic array, a new element is appended to the end of the dynamic array. Throws an IndexOutOfBoundsException if index is less than 0 or greater than getLength(). Throws an IllegalArgumentException if the given content is 'null'.`
    });

    static mustNotInsertNullExceptionMessage = () => lm({
        'de': `Das Element darf nicht 'null' sein.` ,
        'en': `No null value may be inserted into the dynamic array.`
    });

    static dynArraySetItemComment = () => lm({
        'de': `Der Inhalt des Elements an der Position index wird durch den übergebenen Inhalt ersetzt. Löst eine IndexOutOfBoundsException aus, wenn index kleiner als 0 oder größer als getLength() - 1 ist. Löst eine IllegalArgumentException aus, wenn der übergebene Inhalt 'null' ist.` ,
        'en': `The content of the element at position index is replaced by the given content. Throws an IndexOutOfBoundsException if index is less than 0 or greater than getLength() - 1. Throws an IllegalArgumentException if the given content is 'null'.`
    });
    static dynArrayDeleteComment = () => lm({
        'de': `Das Element an der Position index wird entfernt. Alle folgenden Elemente werden um eine Position nach vorne geschoben. Löst eine IndexOutOfBoundsException aus, wenn index kleiner als 0 oder größer als getLength() - 1 ist.` ,
        'en': `The element at position index is removed. All following elements are shifted forward by one position. Throws an IndexOutOfBoundsException if index is less than 0 or greater than getLength() - 1.`

    });
    static dynArrayGetLengthComment = () => lm({
        'de': `Die Anzahl der Elemente der dynamischen Reihung wird zurückgegeben.` ,
        'en': `The number of elements of the dynamic array is returned.`
    });

    static dynArrayIteratorComment = () => lm({
        'de': `Gibt einen Iterator zurück, der die Elemente der dynamischen Reihung der Reihe nach liefert. Diese Methode wird von der for-each-Schleife genutzt.` ,
        'en': `Returns an iterator that delivers the elements of the dynamic array one after another. This method is used by the for-each loop.`
    });

    static binTreeClassComment = () => lm({
        'de': `Klasse BinTree zur Umsetzung des ADT Binärbaum entsprechend der Vorgaben des KC Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden Hinweisen (Stand: Juni 2025). Der Typparameter \`ContentType\` legt den Inhaltstyp der Knoten des Binärbaums fest. Der Binärbaum ist rekursiv aufgebaut: Ein nicht leerer Baum besteht aus einem Inhalt (der Wurzel) sowie einem linken und einem rechten Teilbaum, die selbst wieder Binärbäume sind. Ein leerer Baum besitzt keinen Inhalt und keine Teilbäume. Bei einem leeren Baum lösen getItem, isLeaf, getLeft, getRight, setLeft und setRight eine Ausnahme aus.`,
        'en': `Class BinTree implementing the ADT binary tree according to the requirements of the KC Informatik for the upper secondary level (gymnasiale Oberstufe) in Lower Saxony and the supplementary notes (as of June 2025). The type parameter \`ContentType\` defines the content type of the binary tree's nodes. The binary tree has a recursive structure: a non-empty tree consists of a content (the root) and a left and a right subtree, which are binary trees themselves. An empty tree has no content and no subtrees. On an empty tree, getItem, isLeaf, getLeft, getRight, setLeft and setRight throw an exception.`
    });

    static binTreeConstructorComment = () => lm({
        'de': `Ein leerer Baum wird erzeugt. Er besitzt keinen Inhalt und keine Teilbäume.`,
        'en': `An empty tree is created. It has no content and no subtrees.`
    });

    static binTreeConstructorWithContentComment = () => lm({
        'de': `Ein Baum wird erzeugt. Die Wurzel erhält den übergebenen Inhalt als Wert. Der Baum besitzt jeweils einen leeren Baum als linken und rechten Teilbaum. Löst eine IllegalArgumentException aus, wenn der übergebene Inhalt 'null' ist.`,
        'en': `A tree is created. The root receives the given content as its value. The tree has an empty tree as its left and as its right subtree. Throws an IllegalArgumentException if the given content is 'null'.`
    });

    static noContentForBinTreeExceptionMessage = () => lm({
        'de': `Der Baum kann nicht erzeugt werden. Der übergebene Inhalt darf nicht 'null' sein.` ,
        'en': `The content for the binary tree must not be 'null'.`
    });

    static binTreeSetItemNullExceptionMessage = () => lm({
        'de': `Der Wert kann nicht gesetzt werden. Der übergebene Inhalt darf nicht 'null' sein.` ,
        'en': `The content for the binary tree must not be 'null'.`
    });

    static binTreeHasItemComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn der binäre Baum ein Element enthält.`,
        'en': `Returns true if the binary tree contains an element.`
    });

    static binTreeGetItemComment = () => lm({
        'de': `Die Operation gibt den Inhaltswert der Wurzel des Baumes zurück. Löst eine IllegalStateException aus, wenn der Baum leer ist.`,
        'en': `The operation returns the content value of the tree's root. Throws an IllegalStateException if the tree is empty.`
    });

    static binTreeSetItemComment = () => lm({
        'de': `Die Wurzel des Baums erhält den übergebenen Inhalt als Wert. Bei einem leeren Baum wird zusätzlich als linker und rechter Teilbaum jeweils ein leerer Baum gesetzt. Löst eine IllegalArgumentException aus, wenn der übergebene Inhalt 'null' ist.` ,
        'en': `The root of the tree receives the given content as its value. If the tree is empty, an empty tree is additionally set as its left and as its right subtree. Throws an IllegalArgumentException if the given content is 'null'.`
    });

    static binTreeDeleteItemComment = () => lm({
        'de': `Löscht das Element des binären Baums.`,
        'en': `Deletes the element of the binary tree.`
    });

    static binTreeIsLeafComment = () => lm({
        'de': `Wenn der Baum jeweils einen leeren Baum als linken und rechten Teilbaum besitzt, also ein Blatt ist, wird der Wert wahr zurückgegeben, sonst der Wert falsch. Löst eine IllegalStateException aus, wenn der Baum leer ist.`,
        'en': `If the tree has an empty tree as its left and as its right subtree, i.e. it is a leaf, the value true is returned, otherwise the value false. Throws an IllegalStateException if the tree is empty.`
    });

    static binTreeEmptyIsLeafExceptionMessage = () => lm({
        'de': `Der Baum ist leer. Überprüfung auf 'isLeaf' nicht möglich.` ,
        'en': `The tree is empty. Can't check 'isLeaf' on an empty tree.`
    });

    static binTreeHasLeftComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn der binäre Baum einen linken Teilbaum hat.`,
        'en': `Returns true if the binary tree has a left subtree.`
    });

    static binTreeHasRightComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn der binäre Baum einen rechten Teilbaum hat.`,
        'en': `Returns true if the binary tree has a right subtree.`
    });

    static getLeftOnEmptyTreeExceptionMessage = () => lm({
        'de': `Der Baum ist leer. Es ist kein linker Teilbaum vorhanden.` ,
        'en': `The tree is empty. No left subtree can be returned.`
    });

    static getRightOnEmptyTreeExceptionMessage = () => lm({
        'de': `Der Baum ist leer. Es ist kein rechter Teilbaum vorhanden.` ,
        'en': `The tree is empty. No right subtree can be returned.`
    });

    static binTreeGetLeftComment = () => lm({
        'de': `Die Operation gibt den linken Teilbaum zurück. Löst eine IllegalStateException aus, wenn der Baum leer ist.`,
        'en': `The operation returns the left subtree. Throws an IllegalStateException if the tree is empty.`
    });

    static binTreeGetRightComment = () => lm({
        'de': `Die Operation gibt den rechten Teilbaum zurück. Löst eine IllegalStateException aus, wenn der Baum leer ist.`,
        'en': `The operation returns the right subtree. Throws an IllegalStateException if the tree is empty.`
    });

    static binTreeSetLeftComment = () => lm({
        'de': `Der übergebene Baum wird als linker Teilbaum gesetzt. Löst eine IllegalStateException aus, wenn der Baum leer ist. Löst eine IllegalArgumentException aus, wenn der übergebene Baum 'null' ist.`,
        'en': `The given tree is set as the left subtree. Throws an IllegalStateException if the tree is empty. Throws an IllegalArgumentException if the given tree is 'null'.`
    });

    static setLeftOnEmptyTreeExceptionMessage = () => lm({
        'de': `Der Baum ist leer. Es kann kein linker Teilbaum gesetzt werden.` ,
        'en': `The tree is empty. No left subtree can be set.`
    });

    static setRightOnEmptyTreeExceptionMessage = () => lm({
        'de': `Der Baum ist leer. Es kann kein rechter Teilbaum gesetzt werden.` ,
        'en': `The tree is empty. No right subtree can be set.`
    });

    static setEmptyTreeAsChildExceptionMessage = () => lm({
        'de': `Der Wert kann nicht gesetzt werden. Der übergebene Baum darf nicht 'null' sein.` ,
        'en': `The value cannot be set. The passed tree must not be 'null'.`
    });

    static binTreeSetRightComment = () => lm({
        'de': `Der übergebene Baum wird als rechter Teilbaum gesetzt. Löst eine IllegalStateException aus, wenn der Baum leer ist. Löst eine IllegalArgumentException aus, wenn der übergebene Baum 'null' ist.`,
        'en': `The given tree is set as the right subtree. Throws an IllegalStateException if the tree is empty. Throws an IllegalArgumentException if the given tree is 'null'.`
    });

    static binTreeDeleteLeftComment = () => lm({
        'de': `Löscht den linken Teilbaum des binären Baums.`,
        'en': `Deletes the left subtree of the binary tree.`
    });

    static binTreeDeleteRightComment = () => lm({
        'de': `Löscht den rechten Teilbaum des binären Baums.`,
        'en': `Deletes the right subtree of the binary tree.`
    });

    static noContentInBinTreeExceptionMessage = () => lm({
        'de': `Es gibt keinen Wurzelinhalt im Binärbaum.`,
        'en': `There is no root content in the binary tree.`
    });

    static noLeftSubtreeToDeleteExceptionMessage = () => lm({
        'de': `Es gibt keinen linken Teilbaum zum Löschen.`,
        'en': `There is no left subtree to delete.`
    });

    static noRightSubtreeToDeleteExceptionMessage = () => lm({
        'de': `Es gibt keinen rechten Teilbaum zum Löschen.`,
        'en': `There is no right subtree to delete.`
    });

    static binTreeSetEmptyComment = () => lm({
        'de': `Der Baum wird zu einem leeren Baum, d. h. er besitzt keinen Inhalt und keine Teilbäume.`,
        'en': `The tree becomes an empty tree, i.e. it has no content and no subtrees.`
    });

    static binTreeIsEmptyComment = () => lm({
        'de': `Wenn der Baum ein leerer Baum ist, wird der Wert wahr zurückgegeben, sonst der Wert falsch.`,
        'en': `If the tree is an empty tree, the value true is returned, otherwise the value false.`
    });
}
