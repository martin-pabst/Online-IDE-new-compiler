import { lm } from "../../../tools/language/LanguageManager";

export class AssemblyDebuggerMessages {
    static AssemblyDebuggerRegistersCaption = () => lm({
        'de': `Register`,
        'en': `Registers`,
        'fr': `Registres`
    });

    static StatusRegisterCaption = () => lm({
        'de': `Statusregister`,
        'en': `Status Register`,
        'fr': `Registre de statut`
    });

    static FlagString = (flagName: string) => lm({
        'de': `${flagName}-flag:`,
        'en': `${flagName} flag:`,
        'fr': `${flagName}-flag:`
    });


    static AssemblyDebuggerCurrentInstructionCaption = () => lm({
        'de': `Aktuelle Anweisung`,
        'en': `Current Instruction`,
        'fr': `Instruction actuelle`
    });

    static NoInstructionAtCurrentPosition = () => lm({
        'de': `Keine Anweisung an aktueller Position`,
        'en': `No instruction at current position`,
        'fr': `Aucune instruction à la position actuelle`
    });

    static InMemory = () => lm({
        'de': `Im Speicher:`,
        'en': `In memory:`,
        'fr': `En mémoire:`
    });

    static Assembly = () => lm({
        'de': `Assembler:`,
        'en': `Assembly:`,
        'fr': `Assembleur:`
    });

    static Description = () => lm({
        'de': `Beschreibung:`,
        'en': `Description:`,
        'fr': `Description:`
    });

    /**
     * MemoryTab
     */

    static MemoryTabCaption = () => lm({
        'de': `Speicher`,
        'en': `Memory`,
        'fr': `Mémoire`
    });

    static MemoryTabFrom = () => lm({
        'de': `Von:`,
        'en': `From:`,
        'fr': `De:`
    });

    static MemoryTabTo = () => lm({
        'de': `Bis:`,
        'en': `To:`,
        'fr': `À:`
    });

    static MemoryTabDecimal = () => lm({
        'de': `Dezimal`,
        'en': `Decimal`,
        'fr': `Décimal`
    });

    static MemoryTabHexadecimal = () => lm({
        'de': `Hexadezimal`,
        'en': `Hexadecimal`,
        'fr': `Hexadécimal`
    });

    static MemoryTabShowProgramLocation = () => lm({
        'de': `Lage des Programms im Speicher  anzeigen`,
        'en': `Show program location in memory`,
        'fr': `Afficher l'emplacement du programme dans la mémoire`
    });

}
