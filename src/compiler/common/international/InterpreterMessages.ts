import { lm } from "../../../tools/language/LanguageManager";

export class InterpreterMessages {

    static ArrayLengthNegative = () => lm({
    "de": "Negative Array-Längen sind nicht möglich.",
    "en": "Negative array length is not feasible.",
    })

    static SystemException = () => lm({
    "de": "Interner Fehler: ",
    "en": "System exception: ",
    })

    static NullPointerException = () => lm({
    "de": "Auf ein Attribut/eine Methode von null kann nicht zugegriffen werden.",
    "en": "Can't access field/method of null.",
    })

    static ClassCastException = (type: string, destType: string) => lm({
    "de": `Ein Objekt der Klasse ${type} ist kein Objekt der Klasse ${destType} und kann daher nicht in diesen Typ gecastet werden.`,
    "en": `An object of class ${type} is no object of class ${destType}, therefore casting ist not possible.`,
    })

    static SimpleArrayIndexOutOfBoundsException = () => lm({
    "de": `Zugriff auf ein Element außerhalb des Arrays (d.h. index < 0 oder >= Anzahl der Elemente)`,
    "en": `The index is out of bounds of this array.`,
    })

    static ArrayIndexOutOfBoundsException = (index: number, length: number, dimension: number) => lm({
    "de": `Der Index ${index}${dimension > 1 ? " (" + dimension + ". Dimension)" : ""} liegt außerhalb der Grenzen des Arrays. Mögliche Werte für den Index sind 0 ... ${length - 1}.`,
    "en": `Index ${index}${dimension > 1 ? " (dimension " + dimension + ")" : ""} is out of bounds of this array. Possible values for this index are 0 ... ${length - 1}.`,
    })

    static MethodOfDestroyedGraphicObjectCalled = () => lm({
    "de": `Es wurde eine Methode eines schon mittels destroy() zerstörten Grafikobjekts aufgerufen.`,
    "en": `A method of an already destroyed graphical object has been called.`,
    })

    static ExecutionTime = () => lm({
    "de": `Ausführungszeit`,
    "en": `Execution time`,
    })
}