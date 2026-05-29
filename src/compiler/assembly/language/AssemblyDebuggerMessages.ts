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
        'de': `${flagName}-Flag:`,
        'en': `${flagName} Flag:`,
        'fr': `${flagName}-Flag:`
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

}
