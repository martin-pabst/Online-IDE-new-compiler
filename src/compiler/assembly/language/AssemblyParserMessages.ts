import { lm } from "../../../tools/language/LanguageManager";
import { AssemblyTokenType } from "../AssemblyTokenType";

export class AssemblyParserMessages {

    static UnexpectedToken = (text: string) => lm({
        'de': `Unerwartetes Token: ${text}`,
        'en': `Unexpected token: ${text}`,
        'fr': `Token inattendu : ${text}`
    });

    static LabelAlreadyDefined = (labelName: string) => lm({
        'de': `Label "${labelName}" ist bereits definiert.`,
        'en': `Label "${labelName}" is already defined.`,
        'fr': `Le label "${labelName}" est déjà défini.`
    });

    static NumberExpected = () => lm({
        'de': `Hier wird eine Zahl erwartet.`,
        'en': `Number expected here.`,
        'fr': `Un nombre est attendu ici.`
    });

    static NumberOutOfRange = (number: number, min: number, max: number) => lm({
        'de': `Die Zahl ${number} liegt außerhalb des gültigen Bereichs von ${min} bis ${max}.`,
        'en': `The number ${number} is out of range. Valid range is from ${min} to ${max}.`,
        'fr': `Le nombre ${number} est hors de portée. La plage valide est de ${min} à ${max}.`
    });

    static LineBreakOrEndOfSourcecodeExpected = () => lm({
        'de': `Hier wird ein Zeilenumbruch oder das Ende des Quellcodes erwartet.`,
        'en': `Line break or end of source code expected here.`,
        'fr': `Un saut de ligne ou la fin du code source est attendu ici.`
    });

    static TokensExpected = (expectedTokens: string[]) => lm({
        'de': `Hier wird eines der folgenden Tokens erwartet: ${expectedTokens.join(", ")}`,
        'en': `Token expected here: ${expectedTokens.join(", ")}`,
        'fr': `Un des tokens suivants est attendu ici: ${expectedTokens.join(", ")}`
    });

    static UnresolvedLabel = (labelName: string) => lm({
        'de': `Das Label "${labelName}" ist nirgends definiert. Zur Definition schreiben Sie "${labelName}:" zu Beginn der Zeile, auf die das Label verweisen soll.`,
        'en': `The label "${labelName}" is not defined. To define it, write "${labelName}:" at the beginning of the line you want the label to point to.`,
        'fr': `Le label "${labelName}" n'est défini nulle part. Pour le définir, écrivez "${labelName}:" au début de la ligne à laquelle vous voulez que le label fasse référence.`
    });

    static StatementUnknown = (statement: string) => lm({
        'de': `Unbekannte Anweisung: ${statement}`,
        'en': `Unknown statement: ${statement}`,
        'fr': `Instruction inconnue : ${statement}`
    });

    static AddressExpectedAfterAssertion = () => lm({
        'de': `Nach .assert wird eine Adresse erwartet, auf die sich die Assertion bezieht. Syntax: .assert <address>: (expectedMemoryValue,[ ])*["message"], z.B. .assert 100: 42, 37, 58 "Falsche Sortierreihenfolge!"`,
        'en': `After an assertion, an address is expected that the assertion refers to. Syntax: .assert <address>: (expectedMemoryValue,[ ])*["message"], e.g. .assert 100: 42, 37, 58 "Wrong sorting order!"`,
        'fr': `Après une assertion, une adresse est attendue à laquelle l'assertion se réfère. Syntaxe : .assert <address>: (expectedMemoryValue,[ ])*["message"], ex. .assert 100: 42, 37, 58 "Mauvais ordre de tri!"`
    });

    static MemoryFrom = (address: number) => lm({
        'de': `Speicherbelegung ab ${address}: `,
        'en': `Memory from ${address}: `,
        'fr': `Mémoire à partir de ${address}: `
    });

    static DataOrErrorMessageExpected = () => lm({
        'de': `Hier werden entweder weitere Speicherwerte oder eine Fehlermeldung erwartet. Syntax: .assert <address>: (expectedMemoryValue,[ ])*["message"], z.B. .assert 100: 42, 37, 58 "Falsche Sortierreihenfolge!"`,
        'en': `Either more memory values or an error message is expected here. Syntax: .assert <address>: (expectedMemoryValue,[ ])*["message"], e.g. .assert 100: 42, 37, 58 "Wrong sorting order!"`,
        'fr': `Soit d'autres valeurs de mémoire soit un message d'erreur est attendu ici. Syntaxe : .assert <address>: (expectedMemoryValue,[ ])*["message"], ex. .assert 100: 42, 37, 58 "Mauvais ordre de tri!"`
    });

    static MemoryAssertionFailed = (expectedMemoryState: string, actualMemoryState: string, message: string) => lm({
        'de': `Speicher-Assertion fehlgeschlagen!\nErwarteter Speicherzustand: ${expectedMemoryState}, \naktueller Speicherzustand: ${actualMemoryState}.\nMeldung: ${message}`,
        'en': `Memory assertion failed!\nExpected memory state: ${expectedMemoryState}, \nactual memory state: ${actualMemoryState}.\nMessage: ${message}`,
        'fr': `Assertion de mémoire échouée!\nÉtat de mémoire attendu: ${expectedMemoryState}, \nétat de mémoire actuel: ${actualMemoryState}.\nMessage: ${message}`
    });

    static FlagValuesShouldBe0Or1 = () => lm({
        'de': `Die Werte von Flags sollten 0 oder 1 sein. Syntax in der Art: .assert Z1, N0, "message"`,
        'en': `Flag values should be 0 or 1. Syntax of kind: .assert Z1, N0, "message"`,
        'fr': `Les valeurs de drapeaux doivent être 0 ou 1. Syntaxe du genre : .assert Z1, N0, "message"`
    });
    
    static FlagAssertionFailed = (expectedFlagState: string, actualFlagState: string, message: string) => lm({
        'de': `Flag-Assertion fehlgeschlagen!\nErwarteter Flag-Zustand: ${expectedFlagState}, \naktueller Flag-Zustand: ${actualFlagState}.\nMeldung: ${message}`,
        'en': `Flag assertion failed!\nExpected flag state: ${expectedFlagState}, \nactual flag state: ${actualFlagState}.\nMessage: ${message}`,
        'fr': `Assertion de drapeau échouée!\nÉtat de drapeau attendu: ${expectedFlagState}, \nétat de drapeau actuel: ${actualFlagState}.\nMessage: ${message}`
    });

    static UnknownFlag = (flagName: string, validFlagNames: string[]) => lm({
        'de': `Unbekannter Flag-Name: ${flagName}. Gültige Flag-Namen sind: ${validFlagNames.join(", ")}. Syntax in der Art: .assert Z1, N0, "message"`,
        'en': `Unknown flag name: ${flagName}. Valid flag names are: ${validFlagNames.join(", ")}. Syntax of kind: .assert Z1, N0, "message"`,
        'fr': `Nom de drapeau inconnu : ${flagName}. Les noms de drapeaux valides sont : ${validFlagNames.join(", ")}. Syntaxe du genre : .assert Z1, N0, "message"`
    });

    static DataOrErrorMessageExpectedInFlagAssertion = () => lm({
        'de': `Hier werden entweder weitere Flag-Zuordnungen oder eine Fehlermeldung erwartet. Syntax: .assert Z1, N0, "message"`,
        'en': `Either more flag assignments or an error message is expected here. Syntax: .assert Z1, N0, "message"`,
        'fr': `Soit d'autres affectations de drapeaux soit un message d'erreur est attendu ici. Syntaxe : .assert Z1, N0, "message"`
    });

}