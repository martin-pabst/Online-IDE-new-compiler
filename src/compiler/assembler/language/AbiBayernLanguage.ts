import { lm } from "../../../tools/language/LanguageManager";

export class AbiBayernLanguage {
    static AbiBayernCPUName = () => lm({
        'de': `Bayern-CPU`,
        'en': `Bavaria-CPU`,
        'fr': `CPU de Bavière`
    });

    static AbiBayernCPUDescription = () => lm({
        'de': `Einfache CPU mit einem Akkumulator, einem Programmzähler und drei Flags (zero, negative, overflow) sowie vorzeichenbehafteter 16-Bit Speicherarchitektur. Diese CPU entspricht den Aufgaben im bayerischen Abitur.`,
        'en': `Simple CPU with an accumulator, a program counter, and three flags (zero, negative, overflow) as well as a signed 16-bit memory architecture. This CPU corresponds to the tasks in the Bavarian A-level examination.`,
        'fr': `CPU simple avec un accumulateur, un compteur de programme et trois drapeaux (zéro, négatif, dépassement) ainsi qu'une architecture mémoire 16 bits signée. Cette CPU correspond aux tâches du bac de Bavière.`
    });
    
}

