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

    static AddressOutOfRange = (address: number, from: number, to: number) => lm({
        'de': `Die Adresse ${address} liegt außerhalb des gültigen Bereichs von ${from} bis ${to}.`,
        'en': `The address ${address} is out of range. Valid range is from ${from} to ${to}.`,
        'fr': `L'adresse ${address} est hors de portée. La plage valide est de ${from} à ${to}.`
    });

    static ValueOutOfRange = (value: number, from: number, to: number) => lm({
        'de': `Der Wert ${value} liegt außerhalb des gültigen Bereichs von ${from} bis ${to}.`,
        'en': `The value ${value} is out of range. Valid range is from ${from} to ${to}.`,
        'fr': `La valeur ${value} est hors de portée. La plage valide est de ${from} à ${to}.`
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

    static MemoryFrom = (address: number) => lm({
        'de': `Speicherbelegung ab ${address}: `,
        'en': `Memory from ${address}: `,
        'fr': `Mémoire à partir de ${address}: `
    });

    static AssertionExample = () => lm({
        'de': `Hier ein Beispiel für die Syntax einer Assertion: .assert { 100: [42, 38], 110: 20, N: 1, Z: 0, A: 120, message: "incorrect cpu state after some instruction" }`,
        'en': `Here is an example of the syntax of an assertion: .assert { 100: [42, 38], 110: 20, N: 1, Z: 0, A: 120, message: "incorrect cpu state after some instruction" }`,
        'fr': `Voici un exemple de la syntaxe d'une assertion : .assert { 100: [42, 38], 110: 20, N: 1, Z: 0, A: 120, message: "incorrect cpu state after some instruction" }`
    });

    static TokenExpectedInAssertion = (token: string) => lm({
        'de': `An dieser Stelle in einer Assertion wird das Zeichen ${token} erwartet. ${this.AssertionExample()}`,
        'en': `At this position in an assertion, the character ${token} is expected. ${this.AssertionExample()}`,
        'fr': `À cette position dans une assertion, le caractère ${token} est attendu. ${this.AssertionExample()}`
    });

    static UnknownFlagInAssertion = (flagName: string, validFlagNames: string[]) => lm({
        'de': `Unbekannte Flagge in Assertion: ${flagName}. Gültige Flaggen sind: ${validFlagNames.join(", ")}. ${this.AssertionExample()}`,
        'en': `Unknown flag in assertion: ${flagName}. Valid flags are: ${validFlagNames.join(", ")}. ${this.AssertionExample()}`,
        'fr': `Drapeau inconnu dans l'assertion : ${flagName}. Les drapeaux valides sont : ${validFlagNames.join(", ")}. ${this.AssertionExample()}`
    });

    static UnknownRegisterInAssertion = (registerName: string, validRegisterNames: string[]) => lm({
        'de': `Unbekanntes Register in Assertion: ${registerName}. Gültige Register sind: ${validRegisterNames.join(", ")}. ${this.AssertionExample()}`,
        'en': `Unknown register in assertion: ${registerName}. Valid registers are: ${validRegisterNames.join(", ")}. ${this.AssertionExample()}`,
        'fr': `Registre inconnu dans l'assertion : ${registerName}. Les registres valides sont : ${validRegisterNames.join(", ")}. ${this.AssertionExample()}`
    });

    static ZeroOrOneExpectedInAssertion = (flagName: string) => lm({
        'de': `Nach der Flagge ${flagName} in einer Assertion wird eine 0 oder 1 erwartet. ${this.AssertionExample()}`,
        'en': `After the flag ${flagName} in an assertion, a 0 or 1 is expected. ${this.AssertionExample()}`,
        'fr': `Après le drapeau ${flagName} dans une assertion, un 0 ou un 1 est attendu. ${this.AssertionExample()}`
    });

    static NumberExpectedAfterRegisterInAssertion = (registerName: string) => lm({
        'de': `Nach dem Register ${registerName} in einer Assertion wird eine Zahl erwartet. ${this.AssertionExample()}`,
        'en': `After the register ${registerName} in an assertion, a number is expected. ${this.AssertionExample()}`,
        'fr': `Après le registre ${registerName} dans une assertion, un nombre est attendu. ${this.AssertionExample()}`
    });

    static AssertionFailed = (message: string) => lm({
        'de': `Assertion fehlgeschlagen: ${message}`,
        'en': `Assertion failed: ${message}`,
        'fr': `Assertion échouée : ${message}`
    });

    static at = () => lm({
        'de': `bei: `,
        'en': `at `,
        'fr': `à `
    });

    static Expected = () => lm({
        'de': `Erwartet: `,
        'en': `Expected: `,
        'fr': `Attendu : `
    });

    static Actual = () => lm({
        'de': `Tatsächlich: `,
        'en': `Actual: `,
        'fr': `Réel : `
    });
}