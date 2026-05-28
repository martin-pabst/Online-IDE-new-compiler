import { lm } from "../../../tools/language/LanguageManager";

export class AbiBayernAssemblyMessages {
    static CPUName = () => lm({
        'de': `Bayern-CPU`,
        'en': `Bavaria-CPU`,
        'fr': `CPU de Bavière`
    });

    static CPUDescription = () => lm({
        'de': `Einfache CPU mit einem Akkumulator, einem Programmzähler und drei Flags (zero, negative, overflow) sowie vorzeichenbehafteter 16-Bit Speicherarchitektur. Diese CPU entspricht den Aufgaben im bayerischen Abitur.`,
        'en': `Simple CPU with an accumulator, a program counter, and three flags (zero, negative, overflow) as well as a signed 16-bit memory architecture. This CPU corresponds to the tasks in the Bavarian A-level examination.`,
        'fr': `CPU simple avec un accumulateur, un compteur de programme et trois drapeaux (zéro, négatif, dépassement) ainsi qu'une architecture mémoire 16 bits signée. Cette CPU correspond aux tâches du bac de Bavière.`
    });

    static NumberAfterInstructionNotExpected = (instruction: string) => lm({
        'de': `Nach dem Mnemonic "${instruction}" wird keine Zahl erwartet.`,
        'en': `No number expected after mnemonic "${instruction}".`,
        'fr': `Aucun nombre n'est attendu après le mnémonique "${instruction}".`
    });

    static LabelAfterInstructionNotExpected = (instruction: string) => lm({
        'de': `Nach dem Mnemonic "${instruction}" wird kein Label erwartet.`,
        'en': `No label expected after mnemonic "${instruction}".`,
        'fr': `Aucun label n'est attendu après le mnémonique "${instruction}".`
    });

    static NoArgumentAfterInstructionExpected = (instruction: string) => lm({
        'de': `Nach dem Mnemonic "${instruction}" wird kein Argument erwartet.`,
        'en': `No argument expected after mnemonic "${instruction}".`,
        'fr': `Aucun argument n'est attendu après le mnémonique "${instruction}".`
    });

    static IndirectArgumentAfterInstructionNotExpected = (instruction: string) => lm({
        'de': `Nach dem Mnemonic "${instruction}" wird kein indirektes Argument (in Klammern) erwartet.`,
        'en': `No indirect argument (in brackets) expected after mnemonic "${instruction}".`,
        'fr': `Aucun argument indirect (entre parenthèses) n'est attendu après le mnémonique "${instruction}".`
    });

    static NumberOrLabelExpectedInIndirectAdress = (instruction: string) => lm({
        'de': `In der indirekten Adressierung (in Klammern) nach dem Mnemonic "${instruction}" wird eine Zahl oder ein Label erwartet.`,
        'en': `In indirect addressing (in brackets) after mnemonic "${instruction}", a number or label is expected.`,
        'fr': `Dans l'adressage indirect (entre parenthèses) après le mnémonique "${instruction}", un nombre ou un label est attendu.`
    });
}
