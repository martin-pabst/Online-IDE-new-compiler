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
}
