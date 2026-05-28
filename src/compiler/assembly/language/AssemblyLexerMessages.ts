import { lm } from "../../../tools/language/LanguageManager";

export class AssemblyLexerMessages {
    static invalidNumberLiteral = () => lm({
        'de': `Ungültiges Zahlenliteral`,
        'en': `Invalid number literal`,
        'fr': `Littéral numérique invalide`
    });

    static invalidCharacter = (token: string) => lm({
        'de': `Ungültige/s Zeichen: ${token}`,
        'en': `Invalid character/s: ${token}`,
        'fr': `Caractère invalide: ${token}`
    });
    
}