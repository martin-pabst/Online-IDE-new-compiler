import { lm } from "../../../tools/language/LanguageManager";
import { AssemblyTokenType } from "../AssemblyTokens";

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

}