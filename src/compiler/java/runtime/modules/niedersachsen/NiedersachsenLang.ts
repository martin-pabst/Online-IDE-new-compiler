import { lm } from "../../../../../tools/language/LanguageManager";

export class NiedersachsenLang {
    static StackClassComment  = () => lm({
        'de': `Klasse Stack zur Umsetzung des ADT Stapel entsprechend der Vorgaben des KC Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden Hinweisen (Stand: Juni 2025)` ,
        'en': `The class \`Stack\` implements a stack storage (LIFO - Last In First Out).`
    });

    static stackClassConstructorComment = () => lm({
        'de': `Ein leerer Stapel wird angelegt.`,
        'en': `Constructor of the class \`Stack\` that creates an empty stack storage.`
    });

    static ElementClassComment = () => lm({
        'de': `Die Klasse \`Element\` repräsentiert ein Element im Stapelspeicher, dem dynamischen Array (DynArray) oder der Warteschlange (Queue).`,
        'en': `The class \`Element\` represents an element in the stack storage, dynamic array (DynArray), or queue.`
    });
    
    static stackClassIsEmptyComment = () => lm({
        'de': `Es wird geprüft, ob der Stapel leer ist. Gibt genau dann true zurück, wenn kein Element im Stapel enthalten ist.`  ,
        'en': `Returns true if there are no elements in the stack.`
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
        'de': `Ein neues Element mit dem übergebenen Inhalt wird auf dem Stapel abgelegt. Löst eine IllegalArgumentException aus, falls das übergebene Element 'null' ist.` ,
        'en': `Adds a new element on top of the stack storage.`
    });

    static stackClassPopComment = () => lm({
        'de': `Das oberste Element des Stapels wird entnommen und dessen Inhalt zurückgegeben. Löst eine IllegalStateException aus, falls der Stapel leer ist.` ,
        'en': `Removes the top element from the stack storage.`     
    });

    static stackClassTopComment = () => lm({
        'de': `Der Inhalt des obersten Elements des Stapels wird ausgelesen. Das Element wird dabei nicht aus dem Stapel entfernt. Löst eine IllegalStateException aus, falls der Stapel leer ist.` ,
        'en': `Returns the top element of the stack storage without removing it.`     
    });

    static queueClassComment = () => lm({
        'de': `Klasse Queue zur Umsetzung des ADT Schlange entsprechend der Vorgaben des KC Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden Hinweisen (Stand: Juni 2025)`,
        'en': `The class \`Queue\` implements a queue storage (FIFO - First In First Out).`
    });

    static queueClassConstructorComment = () => lm({
        'de': `Eine leere Schlange wird angelegt.`,
        'en': `Constructor of the class \`Queue\` that creates an empty queue.`
    });

    static queueClassIsEmptyComment = () => lm({
        'de': `Es wird geprüft, ob die Schlange leer ist. Gibt genau dann true zurück, wenn kein Element in der Schlange enthalten ist.`,
        'en': `Returns true if there are no elements in the queue.`
    });

    static queueClassHeadComment = () => lm({
        'de': `Der Inhalt des ersten Elements der Schlange wird ausgelesen. Das Element wird dabei aber nicht aus der Schlange entfernt. Löst eine IllegalStateException aus, falls die Queue leer ist.`,
        'en': `Returns the first element of the queue without removing it. Throws a IllegalStateException if the queue is empty.`
    });

    static queueClassEmptyExceptionMessageHead = () => lm({
        'de': `Die Schlange ist leer. Es kann kein Wert ausgelesen werden.` ,
        'en': `The queue is empty. No value can be read.`
    });

    static queueClassEnqueueComment = () => lm({
        'de': `Ein neues Element mit dem übergebenen Inhalt wird an die Schlange angehängt.`,
        'en': `Adds an element to the end of this queue.`
    });

    static mustNotEnqueueNullExceptionMessage = () => lm({
        'de': `Der übergebene Inhalt darf nicht 'null' sein.` ,
        'en': `No null value may be enqueued into the queue.`
    });

    static queueClassDequeueComment = () => lm({
        'de': `Das erste Element der Schlange wird entnommen und dessen Inhalt zurückgegeben. Löst eine IllegalStateException aus, falls die Schlange leer ist.`,
        'en': `Removes the first element from the queue. Throws a IllegalStateException if the queue is empty.`
    });

    static queueClassEmptyExceptionMessage = () => lm({
        'de': `Die Schlange ist leer. Es kann kein Wert entnommen werden.` ,
        'en': `The queue is empty. No value can be dequeued.`
    });
    
    static dynArrayClassComment = () => lm({
        'de': `Klasse DynArray zur Umsetzung des ADT Dynamische Reihung entsprechend der Vorgaben des KC Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden Hinweisen (Stand: Juni 2025)`,
        'en': `The class \`DynArray\` implements a dynamic array (DynArray) with an arbitrary number of elements.`
    });

    static dynArrayConstructorComment = () => lm({
        'de': `Eine leere dynamische Reihung wird angelegt.`,
        'en': `Constructor of the class \`DynArray\` that creates an empty dynamic array.`
    });

    static dynArrayIsEmptyComment = () => lm({
        'de': `Es wird geprüft, ob die dynamische Reihung leer ist. Gibt genau dann true zurück, wenn die dynamische Reihung keine Elemente enthält.`,
        'en': `Returns true if the dynamic array contains no elements.`
    });

    static dynArrayGetItemComment = () => lm({
        'de': `Der Inhalt des Elements an der Position index wird ausgelesen. Das Element wird dabei nicht aus der dynamischen Reihung entfernt. Löst eine IndexOutOfBoundsException aus, falls der Index außerhalb des gültigen Bereichs liegt.` ,
        'en': `Returns the element at the specified index in the dynamic array. Throws an IndexOutOfBoundsException if the index is invalid.`
    });

    static dynArrayAppendComment = () => lm({
        'de': `Ein neues Element mit dem übergebenen Inhalt wird am Ende an die dynamische Reihung angefügt. Löst eine IllegalArgumentException aus, falls das übergebene Element 'null' ist.` ,
        'en': `Appends a new element to the end of the dynamic array.`
    });

    static mustNotAppendNullExceptionMessage = () => lm({
        'de': `Das Element darf nicht 'null' sein.` ,
        'en': `No null value may be appended to the dynamic array.`
    });

    static dynArrayInsertAtComment = () => lm({
        'de': `Ein neues Element mit dem übergebenen Inhalt wird der Position index in die dynamische Reihung eingefügt. Das Element, das sich vorher an dieser befunden hat, und alle nachfolgenden Elemente werden nach hinten verschoben. Entspricht der Wert von index der Länge der dynamischen Reihung, so wird ein neues Element am Ende der dynamischen Reihung angefügt. Löst eine IndexOutOfBoundsException, falls der Index außerhalb des gültigen Bereichs liegt.` ,
        'en': `Inserts a new element at the specified index in the dynamic array. Throws an IndexOutOfBoundsException if the index is invalid.`
    });

    static mustNotInsertNullExceptionMessage = () => lm({
        'de': `Das Element darf nicht 'null' sein.` ,
        'en': `No null value may be inserted into the dynamic array.`
    });

    static dynArraySetItemComment = () => lm({
        'de': `Der Inhalt des Elements an der Position index wird durch den übergebenen Inhalt ersetzt. Löst eine IndexOutOfBoundsException aus, falls der Index außerhalb des gültigen Bereichs liegt.` ,
        'en': `Sets the element at the specified index in the dynamic array to the specified value. Throws an IndexOutOfBoundsException if the index is invalid.`   
    });
    static dynArrayDeleteComment = () => lm({
        'de': `Das Element an der Position index wird gelöscht. Alle folgenden Elemente werden um eine Position nach vorne geschoben. Löst eine IndexOutOfBoundsException aus, falls der Index außerhalb des gültigen Bereichs liegt.` ,
        'en': `Deletes the element at the specified index in the dynamic array. Throws an IndexOutOfBoundsException if the index is invalid.`

    });
    static dynArrayGetLengthComment = () => lm({
        'de': `Die Anzahl der Elemente der dynamischen Reihung wird zurückgegeben.` ,
        'en': `Returns the number of elements in the dynamic array.`   
    });

    static dynArrayIteratorComment = () => lm({
        'de': `Gibt einen Iterator über die Elemente der dynamischen Reihung zurück.` ,
        'en': `Returns an iterator over the elements in the dynamic array.`   
    });

    static binTreeClassComment = () => lm({ 
        'de': `Klasse BinTree zur Umsetzung des ADT Binärbaum entsprechend der Vorgaben des KC Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden Hinweisen (Stand: Juni 2025)`,
        'en': `The class \`NiedersachsenBinTree\` implements a binary tree.`
    });

    static binTreeConstructorComment = () => lm({
        'de': `Ein leerer Baum wird erzeugt. Er besitzt keinen Inhalt und keine Teilbäume.`,
        'en': `Constructor of the class \`NiedersachsenBinTree\` that creates an empty binary tree.`
    });

    static binTreeConstructorWithContentComment = () => lm({
        'de': `Ein Baum wird erzeugt. Die Wurzel erhält den übergebenen Inhalt als Wert. Der Baum besitzt jeweils einen leeren Baum als linken und rechten Teilbaum.`,
        'en': `Constructor of the class \`NiedersachsenBinTree\` that creates a binary tree with the specified content.`
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
        'de': `Gibt den Inhaltswert der Wurzel zurück. Löst eine IllegalStateException aus, falls der Baum leer ist.`,
        'en': `Returns the element of the binary tree. Throws a RuntimeException if the tree is empty.`
    });

    static binTreeSetItemComment = () => lm({
        'de': `Die Wurzel des Baums erhält den übergebenen Inhalt als Wert. Bei einem leeren Baum wird zusätzlich als linker und rechter Teilbaum jeweils ein leerer Baum gesetzt. LÖst eine IllegalArgumentException aus, falls der übergebene Inhalt 'null' ist.` ,
        'en': `Sets the content of the binary tree to the specified value. If the tree is empty, it also sets the left and right subtrees to empty trees. Throws an IllegalArgumentException if the value is 'null'.`
    });

    static binTreeDeleteItemComment = () => lm({
        'de': `Löscht das Element des binären Baums.`,
        'en': `Deletes the element of the binary tree.`
    });

    static binTreeIsLeafComment = () => lm({
        'de': `Prüft, ob der Baum ein Blatt ist. Wenn der Baum jeweils einen leeren Baum als linken und rechten Teilbaum besitzt, also ein Blatt ist, wird der Wert wahr zurückgegeben, sonst der Wert falsch.`,
        'en': `Returns true if the binary tree is a leaf (no left and no right subtree).`
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
        'de': `Gibt den linken Teilbaum zurück. Löst eine IllegalStateException aus, falls der Baum leer ist.`,
        'en': `Returns the left subtree of the binary tree. Throws a RuntimeException if no left subtree is present.`
    });

    static binTreeGetRightComment = () => lm({
        'de': `Gibt den rechten Teilbaum zurück. Löst eine IllegalStateException aus, falls der Baum leer ist.`,
        'en': `Returns the right subtree of the binary tree. Throws a RuntimeException if no right subtree is present.`
    });

    static binTreeSetLeftComment = () => lm({
        'de': `Setzt den linken Teilbaum. Löst eine IllegalStateException aus, falls der Baum leer ist. Löst eine IllegalArgumentException aus, falls der übergebene Wert 'null' ist.`,
        'en': `Sets the left subtree of the binary tree to the specified binary tree.`
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
        'de': `Setzt den rechten Teilbaum. Löst eine IllegalStateException aus, falls der Baum leer ist. Löst eine IllegalArgumentException aus, falls der übergebene Wert 'null' ist.`,
        'en': `Sets the right subtree of the binary tree to the specified binary tree.`
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
        'de': `Der Baum wird zu einem leeren Baum, d.h. er besitzt keinen Inhalt und keine Teilbäume.`,
        'en': `The tree becomes an empty tree, i.e., it has no content and no subtrees.`
    });

    static binTreeIsEmptyComment = () => lm({
        'de': `Prüft ob der Baum leer ist. Wenn der Baum ein leerer Baum ist, wird der Wert wahr zurückgegeben, sonst der Wert falsch.`,
        'en': `Returns true if the binary tree is empty (no content and no subtrees).`
    });
}
