import { lm } from "../../../tools/language/LanguageManager";

export class InterpreterMessages {
    static CantJumpToLine = () => lm({
    "de": `Das Programm kann die Ausführung nicht in dieser Zeile fortsetzen, da sie nicht innerhalb der aktuellen Methode liegt.`,
    "en": `You can't continue program execution in this line as it's outside scope of the current method.`,
    })

    static runProgram = () => lm({
        'de': 'Programm starten',
        'en': 'Run program'
    });

    static pause = () => lm({
        'de': 'Pause',
        'en': 'Pause'
    });
    
    static stop = () => lm({
        'de': 'Programm anhalten',
        'en': 'Stop program'
    });
    
    static toggleBreakpoint = () => lm({
        'de': 'Haltepunkt ein/aus',
        'en': 'Toggle breakpoint'
    });
    
    static stepOver = () => lm({
        'de': 'Einzelschritt (step over)',
        'en': 'Step over'
    });
    
    static stepInto = () => lm({
        'de': 'Einzelschritt (step into)',
        'en': 'Step into'
    });
     
    static stepOut = () => lm({
        'de': 'Step out',
        'en': 'Step out'
    });
    
    static restart = () => lm({
        'de': 'Neu starten',
        'en': 'Restart'
    });

    static goto = () => lm({
        'de': 'Goto',
        'en': 'Goto'
    });
    
    
}