import { lm } from "../../../../../tools/language/LanguageManager";


/**
 * Language file for NRW-Classes
 */
export class NRWLang {


    /**
     * List class
     */
    static listClassComment = () => lm({
        "de": `Generische Klasse List<ContentType> Objekt der generischen Klasse List verwalten beliebig viele linear angeordnete Objekte vom Typ ContentType. Auf höchstens ein Listenobjekt, aktuellesObjekt genannt, kann jeweils zugegriffen werden. Wenn eine Liste leer ist, vollständig durchlaufen wurde oder das aktuelle Objekt am Ende der Liste gelöscht wurde, gibt es kein aktuelles Objekt.<br /> Das erste oder das letzte Objekt einer Liste können durch einen Auftrag zum aktuellen Objekt gemacht werden. Ausserdem kann das dem aktuellen Objekt folgende Listenobjekt zum neuen aktuellen Objekt werden. <br /> Das aktuelle Objekt kann gelesen, verändert oder gelöscht werden. Ausserdem kann vor dem aktuellen Objekt ein Listenobjekt eingefügt werden.`,
        "en": "Generic class List<ContentType>",
    })

    static listClassConstructorComment = () => lm({
        "de": "Eine leere Liste wird erzeugt.",
        "en": "Creates an empty list.",
    })

    static listClassIsEmptyComment = () => lm({
        "de": "Die Anfrage liefert den Wert true, wenn die Liste keine Objekte enthält, sonst liefert sie den Wert false.",
        "en": "Returns true if and only if this list contains no objects.",
    })

    static listClassHasAccessComment = () => lm({
        "de": "Die Anfrage liefert den Wert true, wenn es ein aktuelles Objekt gibt, sonst liefert sie den Wert false.",
        "en": "Returns true if and only there is a 'current object'.",
    })

    static listClassNextComment = () => lm({
        "de": "Falls die Liste nicht leer ist, es ein aktuelles Objekt gibt und dieses nicht das letzte Objekt der Liste ist, wird das dem aktuellen Objekt in der Liste folgende Objekt zum aktuellen Objekt, andernfalls gibt es nach Ausführung des Auftrags kein aktuelles Objekt, d.h. hasAccess() liefert den Wert false.",
        "en": "Makes 'current object' point to next object in list. If end of list is reached then there's no current object anymore.",
    })

    static listClassToFirstComment = () => lm({
        "de": `Falls die Liste nicht leer ist, wird das erste Objekt der Liste aktuelles Objekt. Ist die Liste leer, geschieht nichts.`,
        "en": `If this list is not empty, then first object gets 'current object'. Otherwise nothing happens.`,
    })

    static listClassToLastComment = () => lm({
        "de": `Falls die Liste nicht leer ist, wird das letzte Objekt der Liste aktuelles Objekt. Ist die Liste leer, geschieht nichts.`,
        "en": `If this list is not empty, then last object gets 'current object'. Otherwise nothing happens.`,
    })

    static listClassGetContentComment = () => lm({
        "de": `Falls es ein aktuelles Objekt gibt (hasAccess() == true), wird das aktuelle Objekt zurückgegeben, andernfalls (hasAccess() == false) gibt die Anfrage den Wert null zurück.`,
        "en": `If there is a current object (that is: hasAccess() == true), then this object is returned, otherwise null is returned.`,
    })

    static listClassSetContentComment = () => lm({
        "de": `Falls es ein aktuelles Objekt gibt (hasAccess() == true) und pContent ungleich null ist, wird das aktuelle Objekt durch pContent ersetzt. Sonst geschieht nichts.`,
        "en": `If there is a current object (that is: hasAccess() == true) and pContent != null, then current object gets replaced by pContent.`,
    })

    static listClassInsertComment = () => lm({
        "de": `Falls es ein aktuelles Objekt gibt (hasAccess() == true), und pContent != null ist, wird ein neues Objekt vor dem aktuellen Objekt in die Liste eingefügt. Das aktuelle Objekt bleibt unverändert. <br /> Wenn die Liste leer ist, wird pContent in die Liste eingefügt und es gibt weiterhin kein aktuelles Objekt (hasAccess() == false). <br /> Falls es kein aktuelles Objekt gibt (hasAccess() == false) und die Liste nicht leer ist oder pContent gleich null ist, geschieht nichts.`,
        "en": `If there is a current object (that is: hasAccess() == true) and pContent != null then given pContent is inserted before current objecte.`,
    })

    static listClassAppendComment = () => lm({
        "de": `Falls pContent gleich null ist, geschieht nichts.<br /> Ansonsten wird ein neues Objekt pContent am Ende der Liste eingefügt. Das aktuelle Objekt bleibt unverändert. <br /> Wenn die Liste leer ist, wird das Objekt pContent in die Liste eingefügt und es gibt weiterhin kein aktuelles Objekt (hasAccess() == false).`,
        "en": `If pContent == null then nothing happens. Otherwise pContent is added at the end of the list. Current object is not changed.`,
    })

    static listClassConcatComment = () => lm({
        "de": `Falls es sich bei der Liste und pList um dasselbe Objekt handelt, pList null oder eine leere Liste ist, geschieht nichts.<br /> Ansonsten wird die Liste pList an die aktuelle Liste angehängt. Anschliessend wird pList eine leere Liste. Das aktuelle Objekt bleibt unverändert. Insbesondere bleibt hasAccess identisch.`,
        "en": `If pList == this list, pList == null or pList is empty then nothing happens. Otherwise pList is concatenated to this list and then emptied.`,
    })

    static listClassRemoveComment = () => lm({
        "de": `Wenn die Liste leer ist oder es kein aktuelles Objekt gibt (hasAccess() == false), geschieht nichts.<br /> Falls es ein aktuelles Objekt gibt (hasAccess() == true), wird das aktuelle Objekt gelöscht und das Objekt hinter dem gelöschten Objekt wird zum aktuellen Objekt. <br /> Wird das Objekt, das am Ende der Liste steht, gelöscht, gibt es kein aktuelles Objekt mehr.`,
        "en": `If list is empty or there is no 'current object' (hasAccess() == false), then nothing happens. Otherwise the current object gets removed and the next object is the new current object. If the object removed was last in the list, then there won't be any current object.`,
    })

    static listClassGetPreviousComment = () => lm({
        "de": `Liefert den Vorgängerknoten des Knotens pNode. Ist die Liste leer, pNode == null, pNode nicht in der Liste oder pNode der erste Knoten der Liste, wird null zurückgegeben.`,
        "en": ``,
    })

    static queueClassComment = () => lm({
        "de": `Objekte der generischen Klasse Queue (Warteschlange) verwalten beliebige Objekte vom Typ ContentType nach dem First-In-First-Out-Prinzip, d.h., das zuerst abgelegte Objekt wird als erstes wieder entnommen. Alle Methoden haben eine konstante Laufzeit, unabhängig von der Anzahl der verwalteten Objekte.`,
        "en": `Implementation of a queue. Elements can be accessed according to fifo systematic (first in - first out).`,
    })

    static queueClassConstructorComment = () => lm({
        "de": `Eine leere Schlange wird erzeugt.  Objekte, die in dieser Schlange verwaltet werden, müssen vom Typ ContentType sein.`,
        "en": `Creates an empty queue.`,
    })

    static queueClassIsEmptyComment = () => lm({
        "de": "Die Anfrage liefert den Wert true, wenn die Queue keine Objekte enthält, sonst liefert sie den Wert false.",
        "en": "Returns true if and only if this queue contains no objects.",
    })

    static queueClassEnqueueComment = () => lm({
        "de": `Das Objekt pContentType wird an die Schlange angehängt. Falls pContentType gleich null ist, bleibt die Schlange unverändert.`,
        "en": `Given object gets added to this queue's end. If given object is null, then queue remains unchanged.`,
    })

    static queueClassDequeueComment = () => lm({
        "de": `Das erste Objekt wird aus der Schlange entfernt. Falls die Schlange leer ist, wird sie nicht verändert.`,
        "en": `Remove the first element of this queue. If Queue is empty then nothing happens.`,
    })

    static queueClassFrontComment = () => lm({
        "de": `Die Anfrage liefert das erste Objekt der Schlange. Die Schlange bleibt unverändert. Falls die Schlange leer ist, wird null zurückgegeben.`,
        "en": `Returns the first element of this queue without removing it from the queue. If queue is empty then null is returned.`,
    })

    static stackClassComment = () => lm({
        "de": `bjekte der generischen Klasse Stack (Keller, Stapel) verwalten beliebige Objekte vom Typ ContentType nach dem Last-In-First-Out-Prinzip, d.h., das zuletzt abgelegte Objekt wird als erstes wieder entnommen. Alle Methoden haben eine konstante Laufzeit, unabhängig von der Anzahl der verwalteten Objekte.`,
        "en": `Implementation of a stack. Elements can be accessed according to Lifo systematic (last in - first out).`,
    })

    static stackClassConstructorComment = () => lm({
        "de": `Eine leerer Stack wird erzeugt.  Objekte, die in diesem Stack verwaltet werden, müssen vom Typ ContentType sein.`,
        "en": `Creates an empty stack.`,
    })

    static stackClassIsEmptyComment = () => lm({
        "de": "Die Anfrage liefert den Wert true, wenn die Stack keine Objekte enthält, sonst liefert sie den Wert false.",
        "en": "Returns true if and only if this stack contains no objects.",
    })

    static stackClassPushComment = () => lm({
        "de": `Das Objekt pContentType wird oben auf den Stapel gelegt. Falls pContentType gleich null ist, bleibt der Stapel unverändert.`,
        "en": `Given object gets pushed on top of this stack. If given object is null, then the stack remains unchanged.`,
    })

    static stackClassPopComment = () => lm({
        "de": `Das zuletzt eingefügte ("oberste") Objekt wird aus dem Stack entfernt. Falls der Stack leer ist, wird er nicht verändert.`,
        "en": `Remove the last inserted ("topmost") element of this stack. If this stack is empty then nothing happens.`,
    })

    static stackClassTopComment = () => lm({
        "de": `Die Anfrage liefert das oberste Objekt des Stacks. Der Stack bleibt unverändert. Falls der Stack leer ist, wird null zurückgegeben.`,
        "en": `Returns the topmost element of this stack without removing it from the stack. If this stack is empty then null is returned.`,
    })

    static comparableContentInterfaceComment = () => lm({
        "de": `Das generische Interface ComparableContent<ContentType> legt die Methoden fest, über die Objekte verfügen müssen, die in einen binären Suchbaum (BinarySearchTree) eingefügt werden sollen. Die Ordnungsrelation wird in Klassen, die ComparableContent implementieren durch überschreiben der drei implizit abstrakten Methoden isGreater, isEqual und isLess festgelegt. `,
        "en": `Generic Interface ComparableContent<ContentType> with methods isGreater, isEqual and isLess.`,
    })

    static comparableContentIsGreaterComment = () => lm({
        "de": `Wenn festgestellt wird, dass das Objekt, von dem die Methode aufgerufen wird, bzgl. der gewünschten Ordnungsrelation grösser als das Objekt pContent ist, wird true geliefert. Sonst wird false geliefert.`,
        "en": `Returns true if and only if this object is "greater" than given object pContent.`,
    })

    static comparableContentIsLessComment = () => lm({
        "de": `Wenn festgestellt wird, dass das Objekt, von dem die Methode aufgerufen wird, bzgl. der gewünschten Ordnungsrelation kleiner als das Objekt pContent ist, wird true geliefert. Sonst wird false geliefert.`,
        "en": `Returns true if and only if this object is "less" than given object pContent.`,
    })

    static comparableContentIsEqualComment = () => lm({
        "de": `Wenn festgestellt wird, dass das Objekt, von dem die Methode aufgerufen wird, bzgl. der gewünschten Ordnungsrelation gleich groß ist wie das Objekt pContent, wird true geliefert. Sonst wird false geliefert.`,
        "en": `Returns true if and only if this object is "equal" to given object pContent.`,
    })

    static binaryTreeClassComment = () => lm({
        "de": `Mithilfe der generischen Klasse BinaryTree können beliebig viele Inhaltsobjekte vom Typ ContentType in einem Binärbaum verwaltet werden. Ein Objekt der Klasse stellt entweder einen leeren Baum dar oder verwaltet ein Inhaltsobjekt sowie einen linken und einen rechten Teilbaum, die ebenfalls Objekte der generischen Klasse BinaryTree sind.`,
        "en": `Generic binary tree class`,
    })

    static binaryTreeConstructorComment1 = () => lm({
        "de": `Nach dem Aufruf des Konstruktors existiert ein leerer Binärbaum.`,
        "en": `Creates an empty binary tree.`,
    })

    static binaryTreeConstructorComment2 = () => lm({
        "de": `Wenn der Parameter pContent ungleich null ist, existiert nach dem Aufruf des Konstruktors der Binärbaum und hat pContent als Inhaltsobjekt und zwei leere Teilbäume. Falls der Parameter null ist, wird ein leerer Binärbaum erzeugt.`,
        "en": `Creates a binary tree. If pContent != null then the tree consists of one node holding given content and two empty binary trees beneath it.`,
    })

    static binaryTreeConstructorComment3 = () => lm({
        "de": `Wenn der Parameter pContent ungleich null ist, wird ein Binärbaum mit pContent als Inhalt und den beiden Teilbäumen pLeftTree und pRightTree erzeugt. Sind pLeftTree oder pRightTree gleich null, wird der entsprechende Teilbaum als leerer Binärbaum eingefügt. So kann es also nie passieren, dass linke oder rechte Teilbäume null sind. Wenn der Parameter pContent gleich null ist, wird ein leerer Binärbaum erzeugt.`,
        "en": `Creates a binary tree. If pContent != null then the root node holds given content. If pleftTree or pRightTree != null then theses are the subtrees beneath the root node.`,
    })

    static binaryTreeIsEmptyComment = () => lm({
        "de": `Diese Anfrage liefert den Wahrheitswert true, wenn der Binärbaum leer ist, sonst liefert sie den Wert false.`,
        "en": `Returns true if and only if this tree is empty.`,
    })

    static binaryTreeSetContentComment = () => lm({
        "de": `Wenn pContent null ist, geschieht nichts. <br /> Ansonsten: Wenn der Binärbaum leer ist, wird der Parameter pContent als Inhaltsobjekt sowie ein leerer linker und rechter Teilbaum eingefügt. Ist der Binärbaum nicht leer, wird das Inhaltsobjekt durch pContent ersetzt. Die Teilbäume werden nicht geändert.`,
        "en": `If pContent != null and this tree is not empty then it's root node content is set to pContent.`,
    })

    static binaryTreeGetContentComment = () => lm({
        "de": `Diese Anfrage liefert das Inhaltsobjekt des Binärbaums. Wenn der Binärbaum leer ist, wird null zurückgegeben.`,
        "en": `Returns content of this tree if it's not empty.`,
    })

    static binaryTreeSetLeftTreeComment = () => lm({
        "de": `Falls der Parameter null ist, geschieht nichts. Wenn der Binärbaum leer ist, wird pTree nicht angehängt. Andernfalls erhält der Binärbaum den übergebenen BinaryTree als linken Teilbaum.`,
        "en": `If this tree is not empty and pTree != null then pTree is attached to this node as left subtree.`,
    })

    static binaryTreeSetRightTreeComment = () => lm({
        "de": `Falls der Parameter null ist, geschieht nichts. Wenn der Binärbaum leer ist, wird pTree nicht angehängt. Andernfalls erhält der Binärbaum den übergebenen BinaryTree als rechten Teilbaum.`,
        "en": `If this tree is not empty and pTree != null then pTree is attached to this node as right subtree.`,
    })

    static binaryTreeGetLeftTreeComment = () => lm({
        "de": `Diese Anfrage liefert den linken Teilbaum des Binärbaumes. Wenn der Binärbaum leer ist, wird null zurückgegeben.`,
        "en": `If this tree is not empty then this method returns it's left subtree.`,
    })

    static binaryTreeGetRightTreeComment = () => lm({
        "de": `Diese Anfrage liefert den rechten Teilbaum des Binärbaumes. Wenn der Binärbaum leer ist, wird null zurückgegeben.`,
        "en": `If this tree is not empty then this method returns it's right subtree.`,
    })

    static binarySearchTreeClassComment = () => lm({
        "de": `Mithilfe der generischen Klasse BinarySearchTree können beliebig viele
 Objekte in einem Binärbaum (binärer Suchbaum) entsprechend einer
 Ordnungsrelation verwaltet werden. 
 Ein Objekt der Klasse stellt entweder einen leeren binären Suchbaum dar oder
 verwaltet ein Inhaltsobjekt sowie einen linken und einen rechten Teilbaum,
 die ebenfalls Objekte der Klasse BinarySearchTree sind.
 Die Klasse der Objekte, die in dem Suchbaum verwaltet werden sollen, muss
 das generische Interface ComparableContent implementieren. Dabei muss durch
 überschreiben der drei Vergleichsmethoden isLess, isEqual, isGreater (s.
 Dokumentation des Interfaces) eine eindeutige Ordnungsrelation festgelegt
 sein. 
 Alle Objekte im linken Teilbaum sind kleiner als das Inhaltsobjekt des
 binären Suchbaums. Alle Objekte im rechten Teilbaum sind grösser als das
 Inhaltsobjekt des binären Suchbaums. Diese Bedingung gilt (rekursiv) auch in
 beiden Teilbäumen. 
 Hinweis: In dieser Version wird die Klasse BinaryTree nicht benutzt.
`,
        "en": `Generic binary search tree class`,
    })

    static binarySearchTreeConstructorComment1 = () => lm({
        "de": `Nach dem Aufruf des Konstruktors existiert ein leerer Binärer Suchbaum.`,
        "en": `Creates an empty binary tree.`,
    })

    static binarySearchTreeIsEmptyComment = () => lm({
        "de": `Diese Anfrage liefert den Wahrheitswert true, wenn der Binärbaum leer ist, sonst liefert sie den Wert false.`,
        "en": `Returns true if and only if this tree is empty.`,
    })

    static binarySearchTreeGetContentComment = () => lm({
        "de": `Diese Anfrage liefert das Inhaltsobjekt des Binärbaums. Wenn der Binärbaum leer ist, wird null zurückgegeben.`,
        "en": `Returns content of this tree if it's not empty.`,
    })

    static binarySearchTreeGetLeftTreeComment = () => lm({
        "de": `Diese Anfrage liefert den linken Teilbaum des Binärbaumes. Wenn der Binärbaum leer ist, wird null zurückgegeben.`,
        "en": `If this tree is not empty then this method returns it's left subtree.`,
    })

    static binarySearchTreeGetRightTreeComment = () => lm({
        "de": `Diese Anfrage liefert den rechten Teilbaum des Binärbaumes. Wenn der Binärbaum leer ist, wird null zurückgegeben.`,
        "en": `If this tree is not empty then this method returns it's right subtree.`,
    })

    static binarySearchTreeInsertComment = () => lm({
        "de": `Falls der Parameter null ist, geschieht nichts. Falls ein bezüglich der verwendeten Vergleichsmethode isEqual mit pContent übereinstimmendes Objekt im geordneten binären Suchbau enthalten ist, passiert nichts.  Achtung: hier wird davon ausgegangen, dass isEqual genau dann true liefert, wenn isLess und isGreater false liefern.  Andernfalls (isLess oder isGreater) wird das Objekt pContent entsprechend der vorgegebenen Ordnungsrelation in den BinarySearchTree eingeordnet.`,
        "en": `If given pContent != null then it is inserted into this binary search tree.`,
    })

    static binarySearchTreeRemoveComment = () => lm({
        "de": `Falls ein bezüglich der verwendeten Vergleichsmethode mit pContent übereinstimmendes Objekt im binären Suchbaum enthalten ist, wird dieses entfernt. Falls der Parameter null ist, ändert sich nichts.`,
        "en": `Removes given pContent from this tree if present.`,
    })

    static binarySearchTreeSearchComment = () => lm({
        "de": `Falls ein bezüglich der verwendeten Vergleichsmethode isEqual mit pContent übereinstimmendes Objekt im binären Suchbaum enthalten ist, liefert die Anfrage dieses, ansonsten wird null zurückgegeben. <br /> Falls der Parameter null ist, wird null zurückgegeben.`,
        "en": `If this tree contains pContent, then pContent is returned, otherwise null is returned.`,
    })

    static vertexClassComment = () => lm({
        "de": `Die Klasse Vertex stellt einen einzelnen Knoten eines Graphen dar. Jedes Objekt  dieser Klasse verfügt über eine im Graphen eindeutige ID als String und kann diese  ID zurückliefern. Darüber hinaus kann eine Markierung gesetzt und abgefragt werden.`,
        "en": `Objects of this class represent a node in a graph. Each vertex has a (per graph) unique ID (type String). There's also a boolean field mark which you can set and get.`,
    })

    static vertexConstructorComment = () => lm({
        "de": `Ein neues Objekt vom Typ Vertex wird erstellt. Seine Markierung hat den Wert false.`,
        "en": `Creates a new vertex object with mark == false.`,
    })

    static vertexGetIDComment = () => lm({
        "de": `Die Anfrage liefert die ID des Knotens als String.`,
        "en": `Returns the id of this vertex.`,
    })

    static vertexSetMarkComment = () => lm({
        "de": `Der Auftrag setzt die Markierung des Knotens auf den Wert pMark.`,
        "en": `Sets value of field mark.`,
    })

    static vertexIsMarkedComment = () => lm({
        "de": `Die Anfrage liefert true, wenn die Markierung des Knotens den Wert true hat, ansonsten false.`,
        "en": `Returns the value of this vertex' mark.`,
    })

    static edgeClassComment = () => lm({
        "de": `Die Klasse Edge stellt eine einzelne, ungerichtete Kante eines Graphen dar.  Beim Erstellen werden die beiden durch sie zu verbindenden Knotenobjekte und eine  Gewichtung als double übergeben. Beide Knotenobjekte können abgefragt werden.  Des Weiteren können die Gewichtung und eine Markierung gesetzt und abgefragt werden.`,
        "en": `Objects of class edge represent an edge of a graph.`,
    })

    static edgeConstructorComment = () => lm({
        "de": `Ein neues Objekt vom Typ Edge wird erstellt. Die von diesem Objekt repräsentierte Kante verbindet die Knoten pVertex und pAnotherVertex mit der  Gewichtung pWeight. Ihre Markierung hat den Wert false.`,
        "en": `Creates a new edge-object connecting nodes pVertex and pAnotherVertex with given weight. Its mark has value false. `,
    })

    static edgeGetVerticesComment = () => lm({
        "de": `Die Anfrage gibt die beiden Knoten, die durch die Kante verbunden werden, als neues Feld vom Typ Vertex zurück. Das Feld hat genau zwei Einträge mit den Indexwerten 0 und 1.`,
        "en": `Returns an array containing the two nodes that are connected by this vertex.`,
    })

    static edgeSetWeightComment = () => lm({
        "de": `Der Auftrag setzt das Gewicht der Kante auf pWeight.`,
        "en": `Sets value of field weight.`,
    })

    static edgeGetWeightComment = () => lm({
        "de": `Die Anfrage liefert das Gewicht der Kante als double.`,
        "en": `Returns weight of this edge.`,
    })

    static edgeSetMarkComment = () => lm({
        "de": `Der Auftrag setzt die Markierung der Kante auf den Wert pMark.`,
        "en": `Sets value of field mark.`,
    })

    static edgeIsMarkedComment = () => lm({
        "de": `Die Anfrage liefert true, wenn die Markierung der Kante den Wert true hat, ansonsten false.`,
        "en": `Returns the value of this edges mark.`,
    })


    static graphClassComment = () => lm({
    "de": `Die Klasse Graph stellt einen ungerichteten, kantengewichteten Graphen dar. Es können  Knoten- und Kantenobjekte hinzugefügt und entfernt, flache Kopien der Knoten- und Kantenlisten  des Graphen angefragt und Markierungen von Knoten und Kanten gesetzt und überprüft werden. Des Weiteren kann eine Liste der Nachbarn eines bestimmten Knoten, eine Liste der inzidenten  Kanten eines bestimmten Knoten und die Kante von einem bestimmten Knoten zu einem  anderen bestimmten Knoten angefragt werden. Abgesehen davon kann abgefragt werden, welches  Knotenobjekt zu einer bestimmten ID gehört und ob der Graph leer ist.`,
    "en": `An object of class graph represents an undirected, weighted graph.`,
    })

    static graphConstructorComment = () => lm({
    "de": `Ein Objekt vom Typ Graph wird erstellt. Der von diesem Objekt repräsentierte Graph ist leer.`,
    "en": `Creates a new empty graph object.`,
    })

    static graphGetVerticesComment = () => lm({
    "de": `Die Anfrage liefert eine neue Liste aller Knotenobjekte vom Typ List<Vertex>.`,
    "en": `Returns a list containing all vertices of this graph.`,
    })

    static graphGetEdgesComment = () => lm({
    "de": `Die Anfrage liefert eine neue Liste aller Kantenobjekte vom Typ List<Edge>.`,
    "en": `Returns a list containing all edges of this graph.`,
    })

    static graphGetVertexComment = () => lm({
    "de": `Die Anfrage liefert das Knotenobjekt mit pID als ID. Ist ein solchen Knotenobjekt nicht im Graphen enthalten, wird null zurückgeliefert.`,
    "en": `Return vertex object with given id. Returns null if not found.`,
    })

    static graphAddVertexComment = () => lm({
    "de": `Der Auftrag fügt den Knoten pVertex in den Graphen ein, sofern es noch keinen Knoten mit demselben ID-Eintrag wie pVertex im Graphen gibt und pVertex eine ID ungleich null hat. Ansonsten passiert nichts.`,
    "en": `Adds given vertex to this graph. Does nothing if vertex with this vertex' id is already present.`,
    })

    static graphAddEdgeComment = () => lm({
    "de": `Der Auftrag fügt die Kante pEdge in den Graphen ein, sofern beide durch die Kante verbundenen Knoten im Graphen enthalten sind, nicht identisch sind und noch keine Kante zwischen den Knoten existiert. Ansonsten passiert nichts.`,
    "en": `Adds given edge if graph contains both it's vertices and no edge that connects them.`,
    })

    static graphRemoveVertexComment = () => lm({
    "de": `Der Auftrag entfernt den Knoten pVertex aus dem Graphen und löscht alle Kanten, die mit ihm inzident sind. Ist der Knoten pVertex nicht im Graphen enthalten, passiert nichts.`,
    "en": `Removes given Vertex and all edges adjacent to it.`,
    })

    static graphRemoveEdgeComment = () => lm({
    "de": `Der Auftrag entfernt die Kante pEdge aus dem Graphen. Ist die Kante pEdge nicht im Graphen enthalten, passiert nichts.`,
    "en": `Removes given Edge from graph.`,
    })

    static graphSetAllVertexMarksComment = () => lm({
    "de": `Der Auftrag setzt die Markierungen aller Knoten des Graphen auf pMark.`,
    "en": `Sets marks of all vertices to given value.`,
    })

    static graphSetAllEdgeMarksComment = () => lm({
    "de": `Der Auftrag setzt die Markierungen aller Kanten des Graphen auf pMark.`,
    "en": `Sets marks of all edges to given value.`,
    })

    static graphAllVerticesMarkedComment = () => lm({
    "de": `Die Anfrage liefert true, wenn alle Knoten des Graphen mit true markiert sind, ansonsten false.`,
    "en": `Returns true if and only if all vertices of this graph have mark == true.`,
    })

    static graphAllEdgesMarkedComment = () => lm({
    "de": `Die Anfrage liefert true, wenn alle Kanten des Graphen mit true markiert sind, ansonsten false.`,
    "en": `Returns true if and only if all edges of this graph have mark == true.`,
    })

    static graphGetNeighboursComment = () => lm({
    "de": `Die Anfrage liefert alle Nachbarn des Knotens pVertex als neue Liste vom Typ List<Vertex>. Hat der Knoten pVertex keine Nachbarn in diesem Graphen oder ist gar nicht in diesem Graphen enthalten, so wird eine leere Liste zurückgeliefert.`,
    "en": `Returns all vertices that are connected to pVertex.`,
    })

    static graphGetEdgesForVertexComment = () => lm({
    "de": `Die Anfrage liefert eine neue Liste alle inzidenten Kanten zum Knoten pVertex. Hat der Knoten pVertex keine inzidenten Kanten in diesem Graphen oder ist gar nicht in diesem Graphen enthalten, so  wird eine leere Liste zurückgeliefert.`,
    "en": `Returns all edges connected to given vertex.`,
    })

    static graphGetEdgeComment = () => lm({
    "de": `Die Anfrage liefert die Kante, welche die Knoten pVertex und pAnotherVertex verbindet,  als Objekt vom Typ Edge. Ist der Knoten pVertex oder der Knoten pAnotherVertex nicht  im Graphen enthalten oder gibt es keine Kante, die beide Knoten verbindet, so wird null  zurückgeliefert.`,
    "en": `Returns edge between given vertices. Returns null if vertices are not connected.`,
    })

    static graphIsEmptyComment = () => lm({
    "de": `Die Anfrage liefert true, wenn der Graph keine Knoten enthält, ansonsten false.`,
    "en": `Returns true if and only if this graph contains no vertices.`,
    })

    static queryResultClassComment = () => lm({
    "de": `Ein Objekt der Klasse queryResult stellt die Ergebnistabelle einer Datenbankanfrage mit Hilfe der Klasse DatabaseConnector dar. Objekte dieser Klasse werden nur von der Klasse DatabaseConnector erstellt. Die Klasse verfügt über keinen öffentlichen Konstruktor.`,
    "en": `An object of class queryResult represents the result talbe of a database query.`,
    })

    static queryResultGetDataComment = () => lm({
    "de": `Die Anfrage liefert die Einträge der Ergebnistabelle als zweidimensionales Feld vom Typ String. Der erste Index des Feldes stellt die Zeile und der zweite die  Spalte dar (d.h. Object[zeile][spalte]).`,
    "en": `Returns the entries of the result table as twodimensional String[][]. First index is line, second index is column.`,
    })

    static queryResultGetColumnNamesComment = () => lm({
    "de": `Die Anfrage liefert die Bezeichner der Spalten der Ergebnistabelle als Feld vom Typ String zurück.`,
    "en": `Returns column names of query result table.`,
    })

    static queryResultGetColumnTypesComment = () => lm({
    "de": `Die Anfrage liefert die Bezeichner der Datentypen der Spalten der Ergebnistabelle als Feld vom Typ String zurück.`,
    "en": `Returns column types of query result table.`,
    })

    static queryResultGetRowCountComment = () => lm({
    "de": `Die Anfrage liefert die Anzahl der Zeilen der Ergebnistabelle als Integer.`,
    "en": `Returns row count of result table.`,
    })

    static queryResultGetColumnCountComment = () => lm({
    "de": `Die Anfrage liefert die Anzahl der Spalten der Ergebnistabelle als Integer.`,
    "en": `Returns column count of result table.`,
    })

    static databaseConnectorClassComment = () => lm({
    "de": `Ein Objekt der Klasse DatabaseConnector ermöglicht die Abfrage und Manipulation  einer MySQL-Datenbank.  Beim Erzeugen des Objekts wird eine Datenbankverbindung aufgebaut, so dass  anschließend SQL-Anweisungen an diese Datenbank gerichtet werden können.`,
    "en": `With an object of class DatabaseConnector you can query and manipulate a database.`,
    })

    static databaseConnectorConstructorComment = () => lm({
    "de": `Erstellt ein neues DatabaseConnector-Objekt. code ist der Zugriffscode für eine Datenbank der SQL-IDE.`,
    "en": `Creates a new DatabaseConnector object. You get the access code from the SQL-IDE.`,
    })

    static databaseConnectorExecuteStatementComment = () => lm({
    "de": `Der Auftrag schickt den im Parameter pSQLStatement enthaltenen SQL-Befehl an die  Datenbank ab.  Handelt es sich bei pSQLStatement um einen SQL-Befehl, der eine Ergebnismenge  liefert, so kann dieses Ergebnis anschließend mit der Methode getCurrentqueryResult  abgerufen werden.`,
    "en": `Sends statement to database and executes it. You may retrieve an error message with getMessage() and result table with getCurrentqueryResult().`,
    })

    static databaseConnectorGetCurrentQueryResultComment = () => lm({
    "de": `Die Anfrage liefert das Ergebnis des letzten mit der Methode executeStatement an  die Datenbank geschickten SQL-Befehls als Ob-jekt vom Typ queryResult zurück. Wurde bisher kein SQL-Befehl abgeschickt oder ergab der letzte Aufruf von  executeStatement keine Ergebnismenge (z.B. bei einem INSERT-Befehl oder einem  Syntaxfehler), so wird null geliefert.  `,
    "en": `Returns the result table from last executed statement.`,
    })

    static databaseConnectorGetErrorMessageComment = () => lm({
    "de": `Die Anfrage liefert null oder eine Fehlermeldung, die sich jeweils auf die letzte zuvor ausgeführte  Datenbankoperation bezieht.`,
    "en": `Returns error message or null if last statement executed flawlessly.`,
    })

    static databaseConnectorCloseComment = () => lm({
    "de": `Die Datenbankverbindung wird geschlossen.`,
    "en": `Closes database connection`,
    })

    static databaseConnectorNotInEmbeddedVersionException = () => lm({
    "de": `Aus der Embedded-IDE heraus kann keine Datenbankverbindung aufgebaut werden.`,
    "en": `You can't connect a database from online-ide embedded version.`,
    })

    static connectionError = () => lm({
    "de": `Fehler beim Aufbau der Datenbankverbindung`,
    "en": `Error connecting database`,
    })

    // static listClassConcatComment = () => lm({
    // "de": ``,
    // "en": ``,
    // })



}