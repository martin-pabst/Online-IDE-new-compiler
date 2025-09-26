import { lInterval, lm } from "../../../tools/language/LanguageManager";

export class SignatureHelpMessages {

    static whileLabel = () => lm({
        'de': `while(Bedingung){ Anweisungen }`,
        'en': ``
    });
    
    static whileDocumentation = () => lm({
        'de': `Wiederholung mit Anfangsbedingung (while-loop)`,
        'en': ``
    });
    
    static whileParameter1 = () => lm({
        'de': `Bedingung der while-loop`,
        'en': ``
    });
        
    static whileParameter1Documentation = () => lm({
        'de': `Die Bedingung wird vor jeder Wiederholung ausgewertet. Ist sie erfüllt ist (d.h. hat sie den Wert true), so werden die Anweisungen in {} erneut ausgeführt, ansonsten wird mit der nächsten Anweisung nach { } fortgefahren.`,
        'en': ``
    });
    
    static ifLabel = () => lm({
        'de': `if(Bedingung){ Anweisungen1 } else { Anweisungen2 }`,
        'en': ``
    });
 
    static ifDocumentation = () => lm({
        'de': `Bedingung (else... ist optional)`,
        'en': ``
    });

    static ifParameter1 = () => lm({
        'de': `Bedingung im if-statement`,
        'en': ``
    });
    
    static ifParameter1Documentation = () => lm({
        'de': `Ist die Bedingung erfüllt (d.h. hat sie den Wert true), so werden die Anweisungen1 ausgeführt. Trifft die Bedingung nicht zu (d.h. hat sie den Wert false), so werden die Anweisungen2 ausgeführt.`,
        'en': ``
    });
    
    static switchLabel = () => lm({
        'de': `switch(Selektor){case Wert_1: Anweisungen1; break; case Wert_2 Anweisungen2; break; default: Defaultanweisungen; break;}`,
        'en': ``
    });
    
    static switchDocumentation = () => lm({
        'de': `Mehrfachauswahl (switch-case)`,
        'en': ``
    });
    
    static switchParameter1 = () => lm({
        'de': `Selektor des switch-statements`,
        'en': ``
    });

    static switchParameter1Documentation = () => lm({
        'de': `Der Wert des Selektor-Terms wird ausgewertet. Hat er den Wert Wert_1, so werden die Anweisungen1 ausgeführt. Hat er den Wert Wert_2, so werden die Anweisungen2 ausgeführt usw. Hat er keinen der bei case... aufgeführten Werte, so werden die Defaultanweisungen ausgeführt.`,
        'en': ``
    });
    
    static forLabel = () => lm({
        'de': `for(Startanweisung; Bedingung; Anweisung am Ende jeder Wiederholung){ Anweisungen }`,
        'en': `for(Start statement; Condition; Statement at the end of each iteration){ Instructions }`
    });

    static forDocumentation = () => lm({
        'de': `Wiederholung mit for (for-loop)`,
        'en': `for-loop`
    });
    
    static forParameter1Interval = () => lInterval({
        'de': [4, 18],
        'en': [4, 19]
    });
    
    static forParameter1Documentation = () => lm({
        'de': `Startanweisung der for-loop: Anweisung wird vor der ersten Wiederholung einmal ausgeführt.`,
        'en': `Initialization statement of the for-loop: Statement is executed once before the first iteration.`
    });
    
    static forParameter2Interval = () => lInterval({
        'de': [20, 29],
        'en': [21, 30]
    });
    
    static forParameter2Documentation = () => lm({
        'de': `Die Bedingung der for-loop wird vor jeder Wiederholung ausgewertet. Ist sie erfüllt ist (d.h. hat sie den Wert true), so werden die Anweisungen in {} erneut ausgeführt, ansonsten wird mit der nächsten Anweisung nach { } fortgefahren.`,
        'en': `The condition of the for-loop is evaluated before each iteration. If it is fulfilled (i.e. has the value true), the instructions in {} are executed again, otherwise the next instruction after { } is executed.`
    });
    
    static forParameter3Interval = () => lInterval({
        'de': [31, 67],
        'en': [32, 70]
    });
    
    static forParameter3Documentation = () => lm({
        'de': `Diese Anweisung wird stets am Ende jeder Wiederholung der for-loop ausgeführt.`,
        'en': `This statement is always executed at the end of each iteration of the for-loop.`
    });
    
    static printALabel = () => lm({
        'de': `print(text: String, color: String)`,
        'en': ``
    });
    
    static printADocumentation = () => lm({
        'de': `Gibt Text farbig in der Ausgabe aus`,
        'en': ``
    });
    
    static printAParameter1Label = () => lm({
        'de': `text: String`,
        'en': ``
    });
    
    static printAParameter1Documentation = () => lm({
        'de': `text: Text, der ausgegeben werden soll`,
        'en': ``
    });
    
    static printAParameter2Label = () => lm({
        'de': `color: String`,
        'en': ``
    });

    static printAParameter2Documentation = () => lm({
        'de': `Farbe (englischer Name oder #ffffff oder rgb(255,255,255)) oder statisches Attribut der Klasse Color, z.B. Color.red`,
        'en': `Color (English name or #ffffff or rgb(255,255,255)) or static attribute of the Color class, e.g. Color.red`
    });


    static printBLabel = () => lm({
        'de': `print(text: String, color: int)`,
        'en': ``
    });
    
    static printBDocumentation = () => lm({
        'de': `Gibt Text farbig in der Ausgabe aus`,
        'en': ``
    });
    
    static printBParameter1Label = () => lm({
        'de': `text: String`,
        'en': ``
    });
    
    static printBParameter1Documentation = () => lm({
        'de': `text: Text, der ausgegeben werden soll`,
        'en': ``
    });
    
    static printBParameter2Label = () => lm({
        'de': `color: int`,
        'en': ``
    });

    static printBParameter2Documentation = () => lm({
        'de': `Farbe als int-Wert kodiert, z.B. 0xff00ff`,
        'en': `Color encoded as an int value, e.g. 0xff00ff`
    });

    static printCLabel = () => lm({
        'de': `print(text: String)`,
        'en': ``
    });
    
    static printCDocumentation = () => lm({
        'de': `Gibt Text in der Ausgabe aus`,
        'en': ``
    });
    
    static printCParameter1Label = () => lm({
        'de': `text: String`,
        'en': ``
    });
    
    static printCParameter1Documentation = () => lm({
        'de': `text: Text, der ausgegeben werden soll`,
        'en': ``
    });
    

    static printlnALabel = () => lm({
        'de': `print(text: String, color: String)`,
        'en': ``
    });
    
    static printlnADocumentation = () => lm({
        'de': `Gibt Text farbig in der Ausgabe aus. Der nächste Text landet eine Zeile tiefer.`,
        'en': ``
    });
    
    static printlnAParameter1Label = () => lm({
        'de': `text: String`,
        'en': ``
    });
    
    static printlnAParameter1Documentation = () => lm({
        'de': `text: Text, der ausgegeben werden soll`,
        'en': ``
    });
    
    static printlnAParameter2Label = () => lm({
        'de': `color: String`,
        'en': ``
    });

    static printlnAParameter2Documentation = () => lm({
        'de': `Farbe (englischer Name oder #ffffff oder rgb(255,255,255)) oder statisches Attribut der Klasse Color, z.B. Color.red`,
        'en': `Color (English name or #ffffff or rgb(255,255,255)) or static attribute of the Color class, e.g. Color.red`
    });


    static printlnBLabel = () => lm({
        'de': `print(text: String, color: int)`,
        'en': ``
    });
    
    static printlnBDocumentation = () => lm({
        'de': `Gibt Text farbig in der Ausgabe aus. Der nächste Text landet eine Zeile tiefer.`,
        'en': ``
    });
    
    static printlnBParameter1Label = () => lm({
        'de': `text: String`,
        'en': ``
    });
    
    static printlnBParameter1Documentation = () => lm({
        'de': `text: Text, der ausgegeben werden soll`,
        'en': ``
    });
    
    static printlnBParameter2Label = () => lm({
        'de': `color: int`,
        'en': ``
    });

    static printlnBParameter2Documentation = () => lm({
        'de': `Farbe als int-Wert kodiert, z.B. 0xff00ff`,
        'en': `Color encoded as an int value, e.g. 0xff00ff`
    });

    static printlnCLabel = () => lm({
        'de': `print(text: String)`,
        'en': ``
    });
    
    static printlnCDocumentation = () => lm({
        'de': `Gibt Text in der Ausgabe aus. Der nächste Text landet eine Zeile tiefer.`,
        'en': ``
    });
    
    static printlnCParameter1Label = () => lm({
        'de': `text: String`,
        'en': ``
    });
    
    static printlnCParameter1Documentation = () => lm({
        'de': `text: Text, der ausgegeben werden soll`,
        'en': ``
    });
    


}