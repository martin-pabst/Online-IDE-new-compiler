import { lm } from "../../../../../tools/language/LanguageManager";

export class NiedersachsenLang {
    static StackClassComment  = () => lm({
        'de': `Die Klasse \`Stack\` implementiert einen Stapelspeicher (LIFO - Last In First Out).` ,
        'en': `The class \`Stack\` implements a stack storage (LIFO - Last In First Out).`
    });

    static stackClassConstructorComment = () => lm({
        'de': `Konstruktor der Klasse \`Stack\`, der einen leeren Stapelspeicher erstellt.`,
        'en': `Constructor of the class \`Stack\` that creates an empty stack storage.`
    });

    static ElementClassComment = () => lm({
        'de': `Die Klasse \`Element\` repräsentiert ein Element im Stapelspeicher, dem dynamischen Array (DynArray) oder der Warteschlange (Queue).`,
        'en': `The class \`Element\` represents an element in the stack storage, dynamic array (DynArray), or queue.`
    });
    
    static stackClassIsEmptyComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn kein Element im Stack enthalten ist.`  ,
        'en': `Returns true if there are no elements in the stack.`
    });

    static stackClassPushComment = () => lm({
        'de': `Fügt ein neues Element oben auf den Stapelspeicher hinzu.` ,
        'en': `Adds a new element on top of the stack storage.`
    });

    static stackClassPopComment = () => lm({
        'de': `Entfernt das oberste Element vom Stapelspeicher.` ,
        'en': `Removes the top element from the stack storage.`     
    });

    static stackClassTopComment = () => lm({
        'de': `Gibt das oberste Element des Stapelspeichers zurück, ohne es zu entfernen.` ,
        'en': `Returns the top element of the stack storage without removing it.`     
    });

    static queueClassComment = () => lm({   
        'de': `Die Klasse \`Queue\` implementiert einen Warteschlangen-Speicher (FIFO - First In First Out).`,
        'en': `The class \`Queue\` implements a queue storage (FIFO - First In First Out).`
    });

    static queueClassConstructorComment = () => lm({
        'de': `Konstruktor der Klasse \`Queue\`, der eine leere Warteschlange erstellt.`,
        'en': `Constructor of the class \`Queue\` that creates an empty queue.`
    });
    static queueClassIsEmptyComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn kein Element in der Warteschlange enthalten ist.`  ,
        'en': `Returns true if there are no elements in the queue.`
    });

    static queueClassHeadComment = () => lm({
        'de': `Gibt das erste Element der Queue zurück, ohne es aus der Queue zu entfernen. Wirft eine RuntimeException, falls die Queue leer ist.`,
        'en': `Returns the first element of the queue without removing it. Throws a RuntimeException if the queue is empty.`
    });
    
    static queueClassEnqueueComment = () => lm({
        'de': `Fügt ein Element am Ende der Warteschlange hinzu.`,
        'en': `Adds an element to the end of this queue.`
    });

    static queueClassDequeueComment = () => lm({
        'de': `Entfernt das erste Element aus der Warteschlange. Wirft eine RuntimeException, falls die Queue leer ist.`,
        'en': `Removes the first element from the queue. Throws a RuntimeException if the queue is empty.`
    });
    
    static dynArrayClassComment = () => lm({
        'de': `Die Klasse \`DynArray\` implementiert ein dynamisches Array (DynArray) mit beliebig vielen Elementen.`,
        'en': `The class \`DynArray\` implements a dynamic array (DynArray) with an arbitrary number of elements.`
    });

    static dynArrayConstructorComment = () => lm({
        'de': `Konstruktor der Klasse \`DynArray\`, der ein leeres dynamisches Array erstellt.`,
        'en': `Constructor of the class \`DynArray\` that creates an empty dynamic array.`
    });

    static dynArrayIsEmptyComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn das dynamische Array keine Elemente enthält.`  ,
        'en': `Returns true if the dynamic array contains no elements.`
    });

    static dynArrayGetItemComment = () => lm({
        'de': `Gibt das Element am angegebenen Index im dynamischen Array zurück. Wirft eine IndexOutOfBoundsException, falls der Index ungültig ist.` ,
        'en': `Returns the element at the specified index in the dynamic array. Throws an IndexOutOfBoundsException if the index is invalid.`
    });
    static dynArrayAppendComment = () => lm({
        'de': `Fügt ein neues Element am Ende des dynamischen Arrays hinzu.` ,
        'en': `Appends a new element to the end of the dynamic array.`
    });
    static dynArrayInsertAtComment = () => lm({ 
        'de': `Fügt ein neues Element am angegebenen Index im dynamischen Array ein. Wirft eine IndexOutOfBoundsException, falls der Index ungültig ist.` ,
        'en': `Inserts a new element at the specified index in the dynamic array. Throws an IndexOutOfBoundsException if the index is invalid.`
    });
    static dynArraySetItemComment = () => lm({
        'de': `Setzt das Element am angegebenen Index im dynamischen Array auf den angegebenen Wert. Wirft eine IndexOutOfBoundsException, falls der Index ungültig ist.` ,
        'en': `Sets the element at the specified index in the dynamic array to the specified value. Throws an IndexOutOfBoundsException if the index is invalid.`   
    });
    static dynArrayDeleteComment = () => lm({
        'de': `Löscht das Element am angegebenen Index im dynamischen Array. Wirft eine IndexOutOfBoundsException, falls der Index ungültig ist.` ,
        'en': `Deletes the element at the specified index in the dynamic array. Throws an IndexOutOfBoundsException if the index is invalid.`

    });
    static dynArrayGetLengthComment = () => lm({
        'de': `Gibt die Anzahl der Elemente im dynamischen Array zurück.` ,
        'en': `Returns the number of elements in the dynamic array.`   
    });

    static binTreeClassComment = () => lm({ 
        'de': `Die Klasse \`NiedersachsenBinTree\` implementiert einen binären Baum.`,
        'en': `The class \`NiedersachsenBinTree\` implements a binary tree.`
    });

    static binTreeConstructorComment = () => lm({
        'de': `Konstruktor der Klasse \`NiedersachsenBinTree\`, der einen leeren binären Baum erstellt.`,
        'en': `Constructor of the class \`NiedersachsenBinTree\` that creates an empty binary tree.`
    });

    static binTreeConstructorWithContentComment = () => lm({
        'de': `Konstruktor der Klasse \`NiedersachsenBinTree\`, der einen binären Baum mit dem angegebenen Inhalt erstellt.`,
        'en': `Constructor of the class \`NiedersachsenBinTree\` that creates a binary tree with the specified content.`
    });

    static binTreeHasItemComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn der binäre Baum ein Element enthält.`,
        'en': `Returns true if the binary tree contains an element.`
    });

    static binTreeGetItemComment = () => lm({
        'de': `Gibt das Element des binären Baums zurück. Wirft eine RuntimeException, falls der Baum leer ist.`,
        'en': `Returns the element of the binary tree. Throws a RuntimeException if the tree is empty.`
    });

    static binTreeSetItemComment = () => lm({
        'de': `Setzt das Element des binären Baums auf den angegebenen Wert.`,
        'en': `Sets the element of the binary tree to the specified value.`
    });

    static binTreeDeleteItemComment = () => lm({
        'de': `Löscht das Element des binären Baums.`,
        'en': `Deletes the element of the binary tree.`
    });

    static binTreeIsLeafComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn der binäre Baum ein Blatt ist (kein linker und kein rechter Teilbaum).`,
        'en': `Returns true if the binary tree is a leaf (no left and no right subtree).`
    });

    static binTreeHasLeftComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn der binäre Baum einen linken Teilbaum hat.`,
        'en': `Returns true if the binary tree has a left subtree.`
    });

    static binTreeHasRightComment = () => lm({
        'de': `Gibt genau dann true zurück, wenn der binäre Baum einen rechten Teilbaum hat.`,
        'en': `Returns true if the binary tree has a right subtree.`
    });

    static binTreeGetLeftComment = () => lm({
        'de': `Gibt den linken Teilbaum des binären Baums zurück. Wirft eine RuntimeException, falls kein linken Teilbaum vorhanden ist.`,
        'en': `Returns the left subtree of the binary tree. Throws a RuntimeException if no left subtree is present.`
    });

    static binTreeGetRightComment = () => lm({
        'de': `Gibt den rechten Teilbaum des binären Baums zurück. Wirft eine RuntimeException, falls kein rechter Teilbaum vorhanden ist.`,
        'en': `Returns the right subtree of the binary tree. Throws a RuntimeException if no right subtree is present.`
    });

    static binTreeSetLeftComment = () => lm({
        'de': `Setzt den linken Teilbaum des binären Baums auf den angegebenen Binärbaum.`,
        'en': `Sets the left subtree of the binary tree to the specified binary tree.`
    });

    static binTreeSetRightComment = () => lm({
        'de': `Setzt den rechten Teilbaum des binären Baums auf den angegebenen Binärbaum.`,
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
        'de': `Der Baum wird zu einem leeren Baum, d. h. er besitzt keinen Inhalt und keine Teilbäume.`,
        'en': `The tree becomes an empty tree, i.e., it has no content and no subtrees.`
    });
}
