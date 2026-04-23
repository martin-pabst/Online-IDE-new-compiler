import { lm } from "../../../tools/language/LanguageManager";

/**
 * Debugger messages
 */
export class DebM {

    /**
     * Messages for class BinopCastCodeGenerator
     */

    static watch = () => lm({
        "de": "BEOBACHTEN",
        "en": "WATCH"
    });

    static files = () => lm({
        "de": "DATEIEN",
        "en": "FILES"
    })

    static threads = () => lm({
        "de": "THREADS",
        "en": "THREADS"
    });

    static callStack = () => lm({
    "de": "CALL STACK",
    "en": "CALL STACK",
    })

    static variables = () => lm({
    "de": "VARIABLEN",
    "en": "VARIABLES",
    })

    static more = () => lm({
    "de": "weitere ...",
    "en": "more ...",
    })

    static object = () => lm({
    "de": "Objekt",
    "en": "object",
    })

    static mainProgram = () => lm({
    "de": "Hauptprogramm",
    "en": "main program",
    })

}
