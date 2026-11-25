import { lm } from "./language/LanguageManager";

export class DateHelperMessages {

    static unknownPatternLetter = (letter: string, pattern: string) => lm({
        'de': `Der Buchstabe '${letter}' ist im Datumsformat "${pattern}" nicht erlaubt. Text muss in einfache Anführungszeichen gesetzt werden, z.B. "dd.MM.yyyy 'um' HH:mm".`,
        'en': `Unknown pattern letter '${letter}' in date pattern "${pattern}". Text has to be enclosed in single quotes, e.g. "MM/dd/yyyy 'at' HH:mm".`
    });

    static unterminatedQuote = (pattern: string) => lm({
        'de': `Im Datumsformat "${pattern}" fehlt das schließende einfache Anführungszeichen (').`,
        'en': `Date pattern "${pattern}" ends with an unterminated quote (').`
    });

    static tooManyPatternLetters = (letter: string, pattern: string) => lm({
        'de': `Der Buchstabe '${letter}' steht im Datumsformat "${pattern}" zu oft hintereinander.`,
        'en': `Too many pattern letters '${letter}' in date pattern "${pattern}".`
    });

    static invalidPattern = (letters: string, pattern: string) => lm({
        'de': `"${letters}" ist im Datumsformat "${pattern}" nicht erlaubt.`,
        'en': `"${letters}" is not allowed in date pattern "${pattern}".`
    });

    static timeZoneNotSupported = (letter: string, pattern: string) => lm({
        'de': `Der Buchstabe '${letter}' im Datumsformat "${pattern}" steht für eine Zeitzone. Ein LocalDateTime-Objekt hat keine Zeitzone.`,
        'en': `Pattern letter '${letter}' in date pattern "${pattern}" denotes a time zone. A LocalDateTime object has no time zone.`
    });

    static dayPeriodNotSupported = (pattern: string) => lm({
        'de': `Der Buchstabe 'B' (Tagesabschnitt, z.B. "nachmittags") im Datumsformat "${pattern}" wird nicht unterstützt.`,
        'en': `Pattern letter 'B' (day period, e.g. "in the afternoon") in date pattern "${pattern}" is not supported.`
    });

    static reservedCharacter = (character: string, pattern: string) => lm({
        'de': `Das Zeichen '${character}' ist im Datumsformat "${pattern}" reserviert. Setze es in einfache Anführungszeichen: '${character}'`,
        'en': `Date pattern "${pattern}" contains reserved character '${character}'. Enclose it in single quotes: '${character}'`
    });

    static closingBracketWithoutOpeningBracket = (pattern: string) => lm({
        'de': `Das Datumsformat "${pattern}" enthält ] ohne vorhergehendes [.`,
        'en': `Date pattern "${pattern}" contains ] without previous [.`
    });

    static padLetterWithoutPattern = (pattern: string) => lm({
        'de': `Im Datumsformat "${pattern}" muss auf den Füllbuchstaben 'p' ein Musterbuchstabe folgen (z.B. "ppH").`,
        'en': `Pad letter 'p' in date pattern "${pattern}" must be followed by a pattern letter (e.g. "ppH").`
    });

    static padWidthExceeded = (text: string, padWidth: number) => lm({
        'de': `Die Ausgabe "${text}" ist länger als die Füllbreite ${padWidth}.`,
        'en': `Output "${text}" exceeds pad width of ${padWidth}.`
    });

}
