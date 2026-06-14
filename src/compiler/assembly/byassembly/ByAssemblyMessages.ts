import { lm } from "../../../tools/language/LanguageManager";

export class ByAssemblyMessages {
    static CPUName = () => lm({
        'de': `Einfach CPU (wie im bayerischen Abitur)`,
        'en': `Simple CPU (as in the Bavarian A-level examination)`,
        'fr': `Simple CPU (comme dans le bac de Bavière)`
    });

    static CPUDescription = () => lm({
        'de': `Einfache CPU mit einem Akkumulator, einem Programmzähler und drei Flags (zero, negative, overflow) sowie vorzeichenbehafteter 16-Bit Speicherarchitektur. Diese CPU entspricht den Aufgaben im bayerischen Abitur.`,
        'en': `Simple CPU with an accumulator, a program counter, and three flags (zero, negative, overflow) as well as a signed 16-bit memory architecture. This CPU corresponds to the tasks in the Bavarian A-level examination.`,
        'fr': `CPU simple avec un accumulateur, un compteur de programme et trois drapeaux (zero, négatif, dépassement) ainsi qu'une architecture mémoire 16 bits signée. Cette CPU correspond aux tâches du bac de Bavière.`
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

    static NoArgumentAfterInstructionFound = (instruction: string) => lm({
        'de': `Nach dem Mnemonic "${instruction}" wird ein Argument erwartet, es wurde aber keines gefunden.`,
        'en': `An argument is expected after mnemonic "${instruction}", but no argument was found.`,
        'fr': `Un argument est attendu après le mnémonique "${instruction}", mais aucun argument n'a été trouvé.`
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

    static UnknownOpCode = (opcode: number, address: number) => lm({
        'de': `Unbekannter Opcode: ${opcode} an Adresse ${address}`,
        'en': `Unknown opcode: ${opcode} at address ${address}`,
        'fr': `Opcode inconnu: ${opcode} à l'adresse ${address}`
    });

    static OriginAddressOutOfBounds = (address: number, maxAddress: number) => lm({
        'de': `Die Origin-Adresse ${address} liegt außerhalb des gültigen Bereichs von 0 bis ${maxAddress}.`,
        'en': `The origin address ${address} is out of bounds. Valid range is from 0 to ${maxAddress}.`,
        'fr': `L'adresse d'origine ${address} est hors limites. La plage valide est de 0 à ${maxAddress}.`
    });

    static OriginNotAllowedAfterCodeGeneration = () => lm({
        'de': `Die Origin-Direktive darf nicht nach der Generierung von Code verwendet werden.`,
        'en': `The origin directive is not allowed after code generation.`,
        'fr': `La directive d'origine n'est pas autorisée après la génération de code.`
    });

    static UnknownPseudoDirective = (pseudoDirective: string) => lm({
        'de': `Unbekannte Pseudo-Direktive: ${pseudoDirective}`,
        'en': `Unknown pseudo directive: ${pseudoDirective}`,
        'fr': `Directive pseudo inconnue: ${pseudoDirective}`
    });

    static Assert = () => lm({
        'de': `.assert: Fügt eine Assertion ein, die überprüft, ob der Speicher zum Zeitpunkt der Ausführung der Assertion den erwarteten Wert hat. Syntax: .assert <address> (expectedMemoryValue,[ ])*["message"], z.B. .assert 100 42, 37, 58 "Falsche Sortierreihenfolge!"`,
        'en': `.assert: Adds an assertion that checks if the memory has the expected value at the time of assertion execution. Syntax: .assert <address> (expectedMemoryValue,[ ])*["message"], e.g., .assert 100 42, 37, 58 "Wrong sort order!"`,
        'fr': `.assert: Ajoute une assertion qui vérifie si la mémoire a la valeur attendue au moment de l'exécution de l'assertion. Syntaxe: .assert <address> (expectedMemoryValue,[ ])*["message"], par exemple .assert 100 42, 37, 58 "Mauvaise ordre de tri!"`
    });

    /**
     * Descriptions for assembly instructions and pseudo directives
     */

    static LoadAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `load ${parameterValue[0]}: Lädt den Wert an der Adresse ${parameterValue[0]} in den Akkumulator.`,
        'en': `load ${parameterValue[0]}: Loads the value at ${parameterValue[0]} into the accumulator.`,
        'fr': `load ${parameterValue[0]}: Charge la valeur à l'adresse ${parameterValue[0]} dans l'accumulateur.`
    });

    static StoreAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `store ${parameterValue[0]}: Speichert den Wert des Akkumulators an der Adresse ${parameterValue[0]}.`,
        'en': `store ${parameterValue[0]}: Stores the value of the accumulator at ${parameterValue[0]}.`,
        'fr': `store ${parameterValue[0]}: Stocke la valeur de l'accumulateur à l'adresse ${parameterValue[0]}.`
    });

    static AddAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `add ${parameterValue[0]}: Addiert den Wert an der Adresse ${parameterValue[0]} zum Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `add ${parameterValue[0]}: Adds the value at ${parameterValue[0]} to the accumulator and stores the result in the accumulator.`,
        'fr': `add ${parameterValue[0]}: Ajoute la valeur à l'adresse ${parameterValue[0]} à l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static SubAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `sub ${parameterValue[0]}: Subtrahiert den Wert an der Adresse ${parameterValue[0]} vom Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `sub ${parameterValue[0]}: Subtracts the value at ${parameterValue[0]} from the accumulator and stores the result in the accumulator.`,
        'fr': `sub ${parameterValue[0]}: Soustrait la valeur à l'adresse ${parameterValue[0]} de l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static MulAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `mul ${parameterValue[0]}: Multipliziert den Wert an der Adresse ${parameterValue[0]} mit dem Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `mul ${parameterValue[0]}: Multiplies the value at ${parameterValue[0]} with the accumulator and stores the result in the accumulator.`,
        'fr': `mul ${parameterValue[0]}: Multiplie la valeur à l'adresse ${parameterValue[0]} avec l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static DivAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `div ${parameterValue[0]}: Dividiert den Akkumulator durch den Wert an der Adresse ${parameterValue[0]} und speichert das Ergebnis im Akkumulator (ganzzahliger Quotient).`,
        'en': `div ${parameterValue[0]}: Divides the accumulator by the value at ${parameterValue[0]} and stores the result in the accumulator (integer quotient).`,
        'fr': `div ${parameterValue[0]}: Divise l'accumulateur par la valeur à l'adresse ${parameterValue[0]} et stocke le résultat dans l'accumulateur (quotient entier).`
    });

    static ModAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `mod ${parameterValue[0]}: Dividiert den Akkumulator durch den Wert an der Adresse ${parameterValue[0]} und speichert den Rest der Division im Akkumulator.`,
        'en': `mod ${parameterValue[0]}: Divides the accumulator by the value at ${parameterValue[0]} and stores the remainder of the division in the accumulator.`,
        'fr': `mod ${parameterValue[0]}: Divise l'accumulateur par la valeur à l'adresse ${parameterValue[0]} et stocke le reste de la division dans l'accumulateur.`
    });

    static AndAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `and ${parameterValue[0]}: Führt eine bitweise Und-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse ${parameterValue[0]} durch und speichert das Ergebnis im Akkumulator.`,
        'en': `and ${parameterValue[0]}: Performs a bitwise AND opération between the accumulator and the value at ${parameterValue[0]} and stores the result in the accumulator.`,
        'fr': `and ${parameterValue[0]}: Effectue une opération ET binaire entre l'accumulateur et la valeur à l'adresse ${parameterValue[0]} et stocke le résultat dans l'accumulateur.`
    });

    static OrAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `or ${parameterValue[0]}: Führt eine bitweise Oder-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse ${parameterValue[0]} durch und speichert das Ergebnis im Akkumulator.`,
        'en': `or ${parameterValue[0]}: Performs a bitwise OR opération between the accumulator and the value at ${parameterValue[0]} and stores the result in the accumulator.`,
        'fr': `or ${parameterValue[0]}: Effectue une opération OU binaire entre l'accumulateur et la valeur à l'adresse ${parameterValue[0]} et stocke le résultat dans l'accumulateur.`
    });

    static ShlAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `shl ${parameterValue[0]}: Führt eine bitweise Verschiebung nach links des Akkumulators um die Anzahl der Bits, die durch den Wert an der Adresse ${parameterValue[0]} angegeben ist, durch und speichert das Ergebnis im Akkumulator. Falls der Wert des Akkumulators negativ ist, werden nur die rechten 15 Bits verschoben, da die Architektur eine vorzeichenbehaftete 16-Bit-Architektur ist.`,
        'en': `shl ${parameterValue[0]}: Performs a bitwise left shift of the accumulator by the number of bits specified by ${parameterValue[0]} and stores the result in the accumulator. If the value of the accumulator is negative, only the rightmost 15 bits are shifted, since the architecture is a signed 16-bit architecture.`,
        'fr': `shl ${parameterValue[0]}: Effectue une opération de décalage vers la gauche de l'accumulateur du nombre de bits spécifié par ${parameterValue[0]} et stocke le résultat dans l'accumulateur. Si la valeur de l'accumulateur est négative, seuls les 15 bits les plus à droite sont décalés, car l'architecture est une architecture 16 bits signée.`
    });

    static ShrAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `shr ${parameterValue[0]}: Führt eine bitweise Verschiebung nach rechts des Akkumulators um die Anzahl der Bits, die durch den Wert an der Adresse ${parameterValue[0]} angegeben ist, durch und speichert das Ergebnis im Akkumulator. Falls der Wert des Akkumulators negativ ist, werden nur die rechten 15 Bits verschoben, da die Architektur eine vorzeichenbehaftete 16-Bit-Architektur ist.`,
        'en': `shr ${parameterValue[0]}: Performs a bitwise right shift of the accumulator by the number of bits specified by ${parameterValue[0]} and stores the result in the accumulator. If the value of the accumulator is negative, only the rightmost 15 bits are shifted, since the architecture is a signed 16-bit architecture.`,
        'fr': `shr ${parameterValue[0]}: Effectue une opération de décalage vers la droite de l'accumulateur du nombre de bits spécifié par ${parameterValue[0]} et stocke le résultat dans l'accumulateur. Si la valeur de l'accumulateur est négative, seuls les 15 bits les plus à droite sont décalés, car l'architecture est une architecture 16 bits signée.`
    });

    static XorAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `xor ${parameterValue[0]}: Führt eine bitweise Exklusiv-Oder-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse ${parameterValue[0]} durch und speichert das Ergebnis im Akkumulator.`,
        'en': `xor ${parameterValue[0]}: Performs a bitwise exclusive OR opération between the accumulator and the value at ${parameterValue[0]} and stores the result in the accumulator.`,
        'fr': `xor ${parameterValue[0]}: Effectue une opération OU exclusif binaire entre l'accumulateur et la valeur à l'adresse ${parameterValue[0]} et stocke le résultat dans l'accumulateur.`
    });

    static CmpAddress = (...parameterValue: (string | number)[]) => lm({
        'de': `cmp ${parameterValue[0]}: Subtrahiert den Wert an der Adresse ${parameterValue[0]} vom Akkumulator (ohne diesen zu verändern!) und setzt die Flags entsprechend (zero, negative, overflow).`,
        'en': `cmp ${parameterValue[0]}: Subtracts the value at ${parameterValue[0]} from the accumulator (without changing it!) and sets the flags accordingly (zero, negative, overflow).`,
        'fr': `cmp ${parameterValue[0]}: Soustrait la valeur à l'adresse ${parameterValue[0]} de l'accumulateur (sans le changer !) et définit les drapeaux en conséquence (zero, négatif, dépassement).`
    });

    static LoadIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `load (${parameterValue[0]}): Lädt den Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, in den Akkumulator.`,
        'en': `load (${parameterValue[0]}): Loads the value at the address stored at ${parameterValue[0]} into the accumulator.`,
        'fr': `load (${parameterValue[0]}): Charge la valeur à l'adresse stockée à ${parameterValue[0]} dans l'accumulateur.`
    });

    static StoreIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `store (${parameterValue[0]}): Speichert den Wert des Akkumulators an der Adresse, die an ${parameterValue[0]} gespeichert ist.`,
        'en': `store (${parameterValue[0]}): Stores the value of the accumulator at the address stored at ${parameterValue[0]}.`,
        'fr': `store (${parameterValue[0]}): Stocke la valeur de l'accumulateur à l'adresse stockée à ${parameterValue[0]}.`
    });

    static AddIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `add (${parameterValue[0]}): Addiert den Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, zum Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `add (${parameterValue[0]}): Adds the value at the address stored at ${parameterValue[0]} to the accumulator and stores the result in the accumulator.`,
        'fr': `add (${parameterValue[0]}): Ajoute la valeur à l'adresse stockée à ${parameterValue[0]} à l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static SubIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `sub (${parameterValue[0]}): Subtrahiert den Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, vom Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `sub (${parameterValue[0]}): Subtracts the value at the address stored at ${parameterValue[0]} from the accumulator and stores the result in the accumulator.`,
        'fr': `sub (${parameterValue[0]}): Soustrait la valeur à l'adresse stockée à ${parameterValue[0]} de l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static MulIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `mul (${parameterValue[0]}): Multipliziert den Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, mit dem Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `mul (${parameterValue[0]}): Multiplies the value at the address stored at ${parameterValue[0]} with the accumulator and stores the result in the accumulator.`,
        'fr': `mul (${parameterValue[0]}): Multiplie la valeur à l'adresse stockée à ${parameterValue[0]} avec l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static DivIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `div (${parameterValue[0]}): Dividiert den Akkumulator durch den Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, und speichert das Ergebnis im Akkumulator (ganzzahliger Quotient).`,
        'en': `div (${parameterValue[0]}): Divides the accumulator by the value at the address stored at ${parameterValue[0]} and stores the result in the accumulator (integer quotient).`,
        'fr': `div (${parameterValue[0]}): Divise l'accumulateur par la valeur à l'adresse stockée à ${parameterValue[0]} et stocke le résultat dans l'accumulateur (quotient entier).`
    });

    static ModIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `mod (${parameterValue[0]}): Dividiert den Akkumulator durch den Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, und speichert den Rest der Division im Akkumulator.`,
        'en': `mod (${parameterValue[0]}): Divides the accumulator by the value at the address stored at ${parameterValue[0]} and stores the remainder of the division in the accumulator.`,
        'fr': `mod (${parameterValue[0]}): Divise l'accumulateur par la valeur à l'adresse stockée à ${parameterValue[0]} et stocke le reste de la division dans l'accumulateur.`
    });

    static AndIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `and (${parameterValue[0]}): Führt eine bitweise Und-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, durch und speichert das Ergebnis im Akkumulator.`,
        'en': `and (${parameterValue[0]}): Performs a bitwise AND opération between the accumulator and the value at the address stored at ${parameterValue[0]} and stores the result in the accumulator.`,
        'fr': `and (${parameterValue[0]}): Effectue une opération ET binaire entre l'accumulateur et la valeur à l'adresse stockée à ${parameterValue[0]} et stocke le résultat dans l'accumulateur.`
    });

    static OrIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `or (${parameterValue[0]}): Führt eine bitweise Oder-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, durch und speichert das Ergebnis im Akkumulator.`,
        'en': `or (${parameterValue[0]}): Performs a bitwise OR opération between the accumulator and the value at the address stored at ${parameterValue[0]} and stores the result in the accumulator.`,
        'fr': `or (${parameterValue[0]}): Effectue une opération OU binaire entre l'accumulateur und la valeur à l'adresse stockée à ${parameterValue[0]} et stocke le résultat dans l'accumulateur.`
    });

    static XorIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `xor (${parameterValue[0]}): Führt eine bitweise Exklusiv-Oder-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, durch und speichert das Ergebnis im Akkumulator.`,
        'en': `xor (${parameterValue[0]}): Performs a bitwise exclusive OR opération between the accumulator and the value at the address stored at ${parameterValue[0]} and stores the result in the accumulator.`,
        'fr': `xor (${parameterValue[0]}): Effectue une opération OU exclusif binaire entre l'accumulateur et la valeur à l'adresse stockée à ${parameterValue[0]} et stocke le résultat dans l'accumulateur.`
    });

    static CmpIndirect = (...parameterValue: (string | number)[]) => lm({
        'de': `cmp (${parameterValue[0]}): Subtrahiert den Wert an der Adresse, die an ${parameterValue[0]} gespeichert ist, vom Akkumulator (ohne diesen zu verändern!) und setzt die Flags entsprechend (zero, negative, overflow).`,
        'en': `cmp (${parameterValue[0]}): Subtracts the value at the address stored at ${parameterValue[0]} from the accumulator (without changing it!) and sets the flags accordingly (zero, negative, overflow).`,
        'fr': `cmp (${parameterValue[0]}): Soustrait la valeur à l'adresse stockée à ${parameterValue[0]} de l'accumulateur (sans le changer !) et définit les drapeaux en conséquence (zero, négatif, dépassement).`
    });

    static Jmp = (...parameterValue: (string | number)[]) => lm({
        'de': `jmp ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}. Dies wird erreicht, indem die Adresse im Program Counter gespeichert wird.`,
        'en': `jmp ${parameterValue[0]}: Jumps to address ${parameterValue[0]}. This is achieved by storing the address in the program counter.`,
        'fr': `jmp ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]}. Cela est réalisé en stockant l'adresse dans le compteur de programme.`
    });

    static Jeq = (...parameterValue: (string | number)[]) => lm({
        'de': `jeq ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das zero-Flag gesetzt ist.\n// Bemerkung: Nach einem Vergleich (cmp-Befehl) wird das zero-Flag gesetzt, wenn die Werte gleich sind.`,
        'en': `jeq ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the zero flag is set.\n Remark: After a comparison (cmp command), the zero flag is set if the values are equal.`,
        'fr': `jeq ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau zero est defini. Après une comparaison (commande cmp), le drapeau zero est defini si les valeurs sont égales.`
    });

    static Jne = (...parameterValue: (string | number)[]) => lm({
        'de': `jne ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das zero-Flag nicht gesetzt ist.\n// Bemerkung: Nach einem Vergleich (cmp-Befehl) wird das zero-Flag gesetzt, wenn die Werte gleich sind.`,
        'en': `jne ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the zero flag is not set.\n Remark: After a comparison (cmp command), the zero flag is set if the values are equal.`,
        'fr': `jne ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau zero n'est pas defini. Après une comparaison (commande cmp), le drapeau zero est defini si les valeurs sont égales.`
    });

    static Jgt = (...parameterValue: (string | number)[]) => lm({
        'de': `jgt ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das negative-Flag nicht gesetzt ist und entweder das zero-Flag nicht gesetzt ist oder das overflow-Flag nicht gesetzt ist.\n// Bemerkung: Nach einem Vergleich (cmp-Befehl) wird das negative-Flag gesetzt, wenn der Wert im Akkumulator kleiner als der Wert an der Adresse ist, von der subtrahiert wird, und das overflow-Flag wird gesetzt, wenn es bei der Subtraktion zu einem Überlauf kommt.`,
        'en': `jgt ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the negative flag is not set and either the zero flag is not set or the overflow flag is not set.\n Remark: After a comparison (cmp command), the negative flag is set if the value in the accumulator is less than the value at the address being subtracted from, and the overflow flag is set if there is an overflow in the subtraction.`,
        'fr': `jgt ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau négatif n'est pas defini et que soit le drapeau zero n'est pas defini, soit le drapeau de dépassement n'est pas defini. Après une comparaison (commande cmp), le drapeau négatif est defini si la valeur dans l'accumulateur est inférieure a la valeur à l'adresse dont elle est soustraite, et le drapeau de dépassement est defini s'il y a un dépassement dans la soustraction.`
    });

    static Jge = (...parameterValue: (string | number)[]) => lm({
        'de': `jge ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das negative-Flag nicht gesetzt ist und entweder das zero-Flag gesetzt ist oder das overflow-Flag gesetzt ist.\n// Bemerkung: Nach einem Vergleich (cmp-Befehl) wird das negative-Flag gesetzt, wenn der Wert im Akkumulator kleiner als der Wert an der Adresse ist, von der subtrahiert wird, und das overflow-Flag wird gesetzt, wenn es bei der Subtraktion zu einem Überlauf kommt.`,
        'en': `jge ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the negative flag is not set and either the zero flag is set or the overflow flag is set.\n Remark: After a comparison (cmp command), the negative flag is set if the value in the accumulator is less than the value at the address being subtracted from, and the overflow flag is set if there is an overflow in the subtraction.`,
        'fr': `jge ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau négatif n'est pas defini et que soit le drapeau zero est defini, soit le drapeau de dépassement est defini. Après une comparaison (commande cmp), le drapeau négatif est defini si la valeur dans l'accumulateur est inférieure a la valeur à l'adresse dont elle est soustraite, et le drapeau de dépassement est defini s'il y a un dépassement dans la soustraction.`
    });

    static Jlt = (...parameterValue: (string | number)[]) => lm({
        'de': `jlt ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das negative-Flag gesetzt ist und entweder das zero-Flag nicht gesetzt ist oder das overflow-Flag nicht gesetzt ist.\n// Bemerkung: Nach einem Vergleich (cmp-Befehl) wird das negative-Flag gesetzt, wenn der Wert im Akkumulator kleiner als der Wert an der Adresse ist, von der subtrahiert wird, und das overflow-Flag wird gesetzt, wenn es bei der Subtraktion zu einem Überlauf kommt.`,
        'en': `jlt ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the negative flag is set and either the zero flag is not set or the overflow flag is not set.\n Remark: After a comparison (cmp command), the negative flag is set if the value in the accumulator is less than the value at the address being subtracted from, and the overflow flag is set if there is an overflow in the subtraction.`,
        'fr': `jlt ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau négatif est defini et que soit le drapeau zero n'est pas defini, soit le drapeau de dépassement n'est pas defini. Après une comparaison (commande cmp), le drapeau négatif est defini si la valeur dans l'accumulateur est inférieure a la valeur à l'adresse dont elle est soustraite, et le drapeau de dépassement est defini s'il y a un dépassement dans la soustraction.`
    });

    static Jle = (...parameterValue: (string | number)[]) => lm({
        'de': `jle ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das negative-Flag gesetzt ist und entweder das zero-Flag gesetzt ist oder das overflow-Flag gesetzt ist.\n// Bemerkung: Nach einem Vergleich (cmp-Befehl) wird das negative-Flag gesetzt, wenn der Wert im Akkumulator kleiner als der Wert an der Adresse ist, von der subtrahiert wird, und das overflow-Flag wird gesetzt, wenn es bei der Subtraktion zu einem Überlauf kommt.`,
        'en': `jle ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the negative flag is set and either the zero flag is set or the overflow flag is set.\n Remark: After a comparison (cmp command), the negative flag is set if the value in the accumulator is less than the value at the address being subtracted from, and the overflow flag is set if there is an overflow in the subtraction.`,
        'fr': `jle ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau négatif est defini et que soit le drapeau zero est defini, soit le drapeau de dépassement est defini. Après une comparaison (commande cmp), le drapeau négatif est defini si la valeur dans l'accumulateur est inférieure a la valeur à l'adresse dont elle est soustraite, et le drapeau de dépassement est defini s'il y a un dépassement dans la soustraction.`
    });

    static Jmpp = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpp ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das negative-Flag nicht gesetzt ist.`,
        'en': `jmpp ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the negative flag is not set.`,
        'fr': `jmpp ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau négatif n'est pas defini.`
    });

    static Jmpn = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpn ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das negative-Flag gesetzt ist.`,
        'en': `jmpn ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the negative flag is set.`,
        'fr': `jmpn ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau négatif est defini.`
    });

    static Jmpz = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpz ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das zero-Flag gesetzt ist.`,
        'en': `jmpz ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the zero flag is set.`,
        'fr': `jmpz ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau zero est defini.`
    });

    static Jmpv = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpv ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das overflow-Flag gesetzt ist.`,
        'en': `jmpv ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the overflow flag is set.`,
        'fr': `jmpv ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau de dépassement est defini.`
    });

    static Jmpc = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpc ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das carry-Flag gesetzt ist.`,
        'en': `jmpc ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the carry flag is set.`,
        'fr': `jmpc ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau de retenue est defini.`
    });

    static Jmpnp = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpnp ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn negative-Flag oder das zero-Flag gesetzt ist.`,
        'en': `jmpnp ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the negative flag or the zero flag is set.`,
        'fr': `jmpnp ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau négatif ou le drapeau zero est defini.`
    });

    static Jmpnn = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpnn ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn negative-Flag nicht gesetzt ist.`,
        'en': `jmpnn ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the negative flag is not set.`,
        'fr': `jmpnn ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau négatif n'est pas defini.`
    });

    static Jmpnz = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpnz ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das zero-Flag nicht gesetzt ist.`,
        'en': `jmpnz ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the zero flag is not set.`,
        'fr': `jmpnz ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau zero n'est pas defini.`
    });

    static Jmpnv = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpnv ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das overflow-Flag nicht gesetzt ist.`,
        'en': `jmpnv ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the overflow flag is not set.`,
        'fr': `jmpnv ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau de dépassement n'est pas defini.`
    });

    static Jmpnc = (...parameterValue: (string | number)[]) => lm({
        'de': `jmpnc ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]}, wenn das carry-Flag nicht gesetzt ist.`,
        'en': `jmpnc ${parameterValue[0]}: Jumps to address ${parameterValue[0]} if the carry flag is not set.`,
        'fr': `jmpnc ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} si le drapeau de retenue n'est pas defini.`
    });

    static LoadImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `loadi ${parameterValue[0]}: Lädt die Zahl ${parameterValue[0]} in den Akkumulator.`,
        'en': `loadi ${parameterValue[0]}: Loads the immédiate number ${parameterValue[0]} into the accumulator.`,
        'fr': `loadi ${parameterValue[0]}: Charge le nombre immédiat ${parameterValue[0]} dans l'accumulateur.`
    });

    static AddImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `addi ${parameterValue[0]}: Addiert die Zahl ${parameterValue[0]} zum Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `addi ${parameterValue[0]}: Adds the immédiate number ${parameterValue[0]} to the accumulator and stores the result in the accumulator.`,
        'fr': `addi ${parameterValue[0]}: Ajoute le nombre immédiat ${parameterValue[0]} à l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static SubImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `subi ${parameterValue[0]}: Subtrahiert die Zahl ${parameterValue[0]} vom Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `subi ${parameterValue[0]}: Subtracts the immédiate number ${parameterValue[0]} from the accumulator and stores the result in the accumulator.`,
        'fr': `subi ${parameterValue[0]}: Soustrait le nombre immédiat ${parameterValue[0]} de l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static MulImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `muli ${parameterValue[0]}: Multipliziert die Zahl ${parameterValue[0]} mit dem Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `muli ${parameterValue[0]}: Multiplies the immédiate number ${parameterValue[0]} with the accumulator and stores the result in the accumulator.`,
        'fr': `muli ${parameterValue[0]}: Multiplie le nombre immédiat ${parameterValue[0]} avec l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static DivImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `divi ${parameterValue[0]}: Dividiert den Akkumulator durch die Zahl ${parameterValue[0]} und speichert das Ergebnis im Akkumulator (ganzzahliger Quotient).`,
        'en': `divi ${parameterValue[0]}: Divides the accumulator by the immédiate number ${parameterValue[0]} and stores the result in the accumulator (integer quotient).`,
        'fr': `divi ${parameterValue[0]}: Divise l'accumulateur par le nombre immédiat ${parameterValue[0]} et stocke le résultat dans l'accumulateur (quotient entier).`
    });

    static ModImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `modi ${parameterValue[0]}: Dividiert den Akkumulator durch die Zahl ${parameterValue[0]} und speichert den Rest der Division im Akkumulator.`,
        'en': `modi ${parameterValue[0]}: Divides the accumulator by the immédiate number ${parameterValue[0]} and stores the remainder of the division in the accumulator.`,
        'fr': `modi ${parameterValue[0]}: Divise l'accumulateur par le nombre immédiat ${parameterValue[0]} et stocke le reste de la division dans l'accumulateur.`
    });

    static AndImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `andi ${parameterValue[0]}: Führt eine bitweise Und-Verknüpfung zwischen dem Akkumulator und der Zahl ${parameterValue[0]} durch und speichert das Ergebnis im Akkumulator.`,
        'en': `andi ${parameterValue[0]}: Performs a bitwise AND opération between the accumulator and the immédiate number ${parameterValue[0]} and stores the result in the accumulator.`,
        'fr': `andi ${parameterValue[0]}: Effectue une opération ET binaire entre l'accumulateur et le nombre immédiat ${parameterValue[0]} et stocke le résultat dans l'accumulateur.`
    });

    static OrImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `ori ${parameterValue[0]}: Führt eine bitweise Oder-Verknüpfung zwischen dem Akkumulator und der Zahl ${parameterValue[0]} durch und speichert das Ergebnis im Akkumulator.`,
        'en': `ori ${parameterValue[0]}: Performs a bitwise OR opération between the accumulator and the immédiate number ${parameterValue[0]} and stores the result in the accumulator.`,
        'fr': `ori ${parameterValue[0]}: Effectue une opération OU binaire entre l'accumulateur et le nombre immédiat ${parameterValue[0]} et stocke le résultat dans l'accumulateur.`
    });

    static XorImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `xori ${parameterValue[0]}: Führt eine bitweise Exklusiv-Oder-Verknüpfung zwischen dem Akkumulator und der Zahl ${parameterValue[0]} durch und speichert das Ergebnis im Akkumulator.`,
        'en': `xori ${parameterValue[0]}: Performs a bitwise exclusive OR opération between the accumulator and the immédiate number ${parameterValue[0]} and stores the result in the accumulator.`,
        'fr': `xori ${parameterValue[0]}: Effectue une opération OU exclusif binaire entre l'accumulateur et le nombre immédiat ${parameterValue[0]} et stocke le résultat dans l'accumulateur.`
    });

    static CmpImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `cmpi ${parameterValue[0]}: Subtrahiert die Zahl ${parameterValue[0]} vom Akkumulator (ohne diesen zu verändern!) und setzt die Flags entsprechend (zero, negative, overflow).`,
        'en': `cmpi ${parameterValue[0]}: Subtracts the immédiate number ${parameterValue[0]} from the accumulator (without changing it!) and sets the flags accordingly (zero, negative, overflow).`,
        'fr': `cmpi ${parameterValue[0]}: Soustrait le nombre immédiat ${parameterValue[0]} de l'accumulateur (sans le changer !) et définit les drapeaux en conséquence (zero, négatif, dépassement).`
    });

    static ShrImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `shri ${parameterValue[0]}: Führt eine logische Rechtsverschiebung des Akkumulators um die Anzahl der Bits, die durch ${parameterValue[0]} angegeben ist, durch und speichert das Ergebnis im Akkumulator. Es werden Nullen von links aufgefüllt. Falls der Wert im Akkumulator negativ ist, werden nur die rechten 15 Bit verschoben und das linke Bit (Vorzeichenbit) bleibt erhalten.`,
        'en': `shri ${parameterValue[0]}: Performs a logical right shift of the accumulator by the number of bits specified by ${parameterValue[0]} and stores the result in the accumulator. Zeros are filled in from the left. If the value in the accumulator is negative, only the rightmost 15 bits are shifted and the left bit (sign bit) remains unchanged.`,
        'fr': `shri ${parameterValue[0]}: Effectue un décalage logique à droite de l'accumulateur du nombre de bits spécifié par ${parameterValue[0]} et stocke le résultat dans l'accumulateur. Des zéros sont remplis à partir de la gauche. Si la valeur dans l'accumulateur est négative, seuls les 15 bits les plus à droite sont décalés et le bit de gauche (bit de signe) reste inchangé.`
    });

    static ShlImmediate = (...parameterValue: (string | number)[]) => lm({
        'de': `shli ${parameterValue[0]}: Führt eine logische Linksverschiebung des Akkumulators um die Anzahl der Bits, die durch ${parameterValue[0]} angegeben ist, durch und speichert das Ergebnis im Akkumulator. Es werden Nullen von rechts aufgefüllt. Falls der Wert im Akkumulator negativ ist, werden nur die rechten 15 Bit verschoben und das linke Bit (Vorzeichenbit) bleibt erhalten.`,
        'en': `shli ${parameterValue[0]}: Performs a logical left shift of the accumulator by the number of bits specified by ${parameterValue[0]} and stores the result in the accumulator. Zeros are filled in from the right. If the value in the accumulator is negative, only the rightmost 15 bits are shifted and the left bit (sign bit) remains unchanged.`,
        'fr': `shli ${parameterValue[0]}: Effectue un décalage logique à gauche de l'accumulateur du nombre de bits spécifié par ${parameterValue[0]} et stocke le résultat dans l'accumulateur. Des zéros sont remplis à partir de la droite. Si la valeur dans l'accumulateur est négative, seuls les 15 bits les plus à droite sont décalés et le bit de gauche (bit de signe) reste inchangé.`
    });

    static Not = () => lm({
        'de': `not: Führt eine bitweise Negation des Akkumulators durch und speichert das Ergebnis im Akkumulator. Falls der Wert im Akkumulator kleiner als 0 ist, werden nur die rechten 15 Bit negiert.`,
        'en': `not: Performs a bitwise negation of the accumulator and stores the result in the accumulator. If the value in the accumulator is less than 0, only the rightmost 15 bits are negated.`,
        'fr': `not: Effectue une négation binaire de l'accumulateur et stocke le résultat dans l'accumulateur. Si la valeur dans l'accumulateur est inférieure à 0, seuls les 15 bits les plus à droite sont négatifs.`
    });

    static Jsr = (...parameterValue: (string | number)[]) => lm({
        'de': `jsr ${parameterValue[0]}: Springt zu der Adresse ${parameterValue[0]} und speichert die Rücksprungadresse (die Adresse des nächsten Befehls) auf dem Stack.`,
        'en': `jsr ${parameterValue[0]}: Jumps to address ${parameterValue[0]} and stores the return address (the address of the next instruction) on the stack.`,
        'fr': `jsr ${parameterValue[0]}: Saute à l'adresse ${parameterValue[0]} et stocke l'adresse de retour (l'adresse de la prochaine instruction) sur la pile.`
    });

    static Rts = () => lm({
        'de': `rts: Holt eine Adresse vom Stack und springt zu ihr. In der Regel handelt es sich um eine Adresse, die zuvor mittels jsr auf den Stack gelegt wurde.`,
        'en': `rts: Retrieves an address from the stack and jumps to it. Typically, this is an address that was previously pushed onto the stack using jsr.`,
        'fr': `rts: Récupère une adresse de la pile et saute à celle-ci. En général, il s'agit d'une adresse qui a été précédemment poussée sur la pile à l'aide de jsr.`
    });

    static Rsv = (...parameterValue: (string | number)[]) => lm({
        'de': `rsv ${parameterValue[0]}: Reserviert ${parameterValue[0]} viele Plätze auf dem Stack, indem es den Stack Pointer um ${parameterValue[0]} erniedrigt.`,
        'en': `rsv ${parameterValue[0]}: Reserves ${parameterValue[0]} many slots on the stack by decrementing the stack pointer by ${parameterValue[0]}.`,
        'fr': `rsv ${parameterValue[0]}: Réserve ${parameterValue[0]} emplacements sur la pile en décrémentant le pointeur de pile de ${parameterValue[0]}.`
    });

    static Rel = (...parameterValue: (string | number)[]) => lm({
        'de': `rel ${parameterValue[0]}: Gibt ${parameterValue[0]} Plätze auf dem Stack frei, indem es den Stack Pointer um ${parameterValue[0]} erhöht.`,
        'en': `rel ${parameterValue[0]}: Frees ${parameterValue[0]} many slots on the stack by incrementing the stack pointer by ${parameterValue[0]}.`,
        'fr': `rel ${parameterValue[0]}: Libère ${parameterValue[0]} emplacements sur la pile en incrémentant le pointeur de pile de ${parameterValue[0]}.`
    });

    static Push = (...parameterValue: (string | number)[]) => lm({
        'de': `push ${parameterValue[0]}: Legt die Zahl ${parameterValue[0]} auf den Stack, indem es den Stack Pointer erniedrigt und die Zahl an der neuen Adresse des Stack Pointers speichert.`,
        'en': `push ${parameterValue[0]}: Pushes the number ${parameterValue[0]} onto the stack by decrementing the stack pointer and storing the number at the new address of the stack pointer.`,
        'fr': `push ${parameterValue[0]}: Pousse le nombre ${parameterValue[0]} sur la pile en décrémentant le pointeur de pile et en stockant le nombre à la nouvelle adresse du pointeur de pile.`
    });

    static Pop = (...parameterValue: (string | number)[]) => lm({
        'de': `pop ${parameterValue[0]}: Holt eine Zahl vom Stack, indem es die Zahl an der aktuellen Adresse des Stack Pointers in den Akkumulator lädt und den Stack Pointer erhöht.`,
        'en': `pop ${parameterValue[0]}: Pops a number from the stack by loading the number at the current address of the stack pointer into the accumulator and incrementing the stack pointer.`,
        'fr': `pop ${parameterValue[0]}: Récupère un nombre de la pile en chargeant le nombre à l'adresse actuelle du pointeur de pile dans l'accumulateur et en incrémentant le pointeur de pile.`
    });

    static LoadSpRelative = (...parameterValue: (string | number)[]) => lm({
        'de': `loadsp ${parameterValue[0]}: Lädt die Zahl an der Adresse, die durch die Summe aus dem Stack Pointer und ${parameterValue[0]} angegeben ist, in den Akkumulator.`,
        'en': `loadsp ${parameterValue[0]}: Loads the number at the address specified by the sum of the stack pointer and ${parameterValue[0]} into the accumulator.`,
        'fr': `loadsp ${parameterValue[0]}: Charge le nombre à l'adresse spécifiée par la somme du pointeur de pile et de ${parameterValue[0]} dans l'accumulateur.`
    });

    static StoreSpRelative = (...parameterValue: (string | number)[]) => lm({
        'de': `storesp ${parameterValue[0]}: Speichert die Zahl im Akkumulator an der Adresse, die durch die Summe aus dem Stack Pointer und ${parameterValue[0]} angegeben ist.`,
        'en': `storesp ${parameterValue[0]}: Stores the number in the accumulator at the address specified by the sum of the stack pointer and ${parameterValue[0]}.`,
        'fr': `storesp ${parameterValue[0]}: Stocke le nombre dans l'accumulateur à l'adresse spécifiée par la somme du pointeur de pile et de ${parameterValue[0]}.`
    });

    static Hold = () => lm({
        'de': `hold: hält die Ausführung des Programms an.`,
        'en': `hold: halts the exécution of the program.`,
        'fr': `hold: arrête l'exécution du programme.`
    });

    static OriginPseudoDirective = () => lm({
        'de': `origin address: setzt die Adresse, an der der nächste Befehl oder die nächste Zahl gespeichert wird, auf address. Diese Direktive darf nur einmal zu Beginn des Programms verwendet werden.`,
        'en': `origin address: sets the address where the next instruction or number will be stored to address. This directive may only be used once at the beginning of the program.`,
        'fr': `origin address: définit l'adresse où la prochaine instruction ou le prochain nombre sera stocké à address. Cette directive ne peut être utilisée qu'une seule fois au début du programme.`
    });

    static AssertPseudoDirective = () => lm({
        'de': `Mit .assert kann überprüft werden, ob der Zustand des Speichers, der Register oder der Flags den Erwartungen entspricht. Beispielsyntax: .assert { 100: [10, 200, 30], N: 1, Z: 0, A: 20, message: "Fehlermeldung" } überprüft, ob an Adresse 100 die Werte 10, 200 und 30 gespeichert sind, das negative-Flag gesetzt ist, das zero-Flag nicht gesetzt ist und der Wert im Akkumulator 20 ist.`,
        'en': `.assert can be used to check if the state of the memory, the registers or the flags meets the expectations. Example syntax: .assert { 100: [10, 200, 30], N: 1, Z: 0, A: 20, message: "Error message" } checks if the values 10, 200 and 30 are stored at address 100, the negative flag is set, the zero flag is not set and the value in the accumulator is 20.`,
        'fr': `Avec .assert, il est possible de vérifier si l'état de la mémoire, des registres ou des drapeaux correspond aux attentes. Syntaxe d'exemple : .assert { 100: [10, 200, 30], N: 1, Z: 0, A: 20, message: "Message d'erreur" } vérifie si les valeurs 10, 200 et 30 sont stockées à l'adresse 100, le drapeau négatif est défini, le drapeau zero n'est pas défini et la valeur dans l'accumulateur est 20.`
    });

    static AssertHoverComment = () => lm({
        'de': "```\n//Beispiel:\n" + `.assert { 100: [10, 200, 30], N: 1, Z: 0, A: 20, message: "Error message" }\n// Mit .assert kann überprüft werden, ob der Zustand des Speichers, der Register oder der Flags den Erwartungen entspricht. Beispielsyntax: .assert { 100: [10, 200, 30], N: 1, Z: 0, A: 20, message: "Fehlermeldung" } überprüft, ob an Adresse 100 die Werte 10, 200 und 30 gespeichert sind, das negative-Flag gesetzt ist, das zero-Flag nicht gesetzt ist und der Wert im Akkumulator 20 ist.`,
        'en': "```\n// Example:\n" + `.assert { 100: [10, 200, 30], N: 1, Z: 0, A: 20, message: "Error message" }\n// .assert can be used to check if the state of the memory, the registers or the flags meets the expectations. Example syntax: .assert { 100: [10, 200, 30], N: 1, Z: 0, A: 20, message: "Error message" } checks if the values 10, 200 and 30 are stored at address 100, the negative flag is set, the zero flag is not set and the value in the accumulator is 20.`,
        'fr': "```\n// Exemple:\n" + `.assert { 100: [10, 200, 30], N: 1, Z: 0, A: 20, message: "Message d'erreur" }\n// Avec .assert, il est possible de vérifier si l'état de la mémoire, des registres ou des drapeaux correspond aux attentes. Syntaxe d'exemple : .assert { 100: [10, 200, 30], N: 1, Z: 0, A: 20, message: "Message d'erreur" } vérifie si les valeurs 10, 200 et 30 sont stockées à l'adresse 100, le drapeau négatif est défini, le drapeau zero n'est pas défini et la valeur dans l'accumulateur est 20.`
    });

    static OriginHoverMessage = (address: number) => lm({
        'de': "```\n" + `origin ${address}\n// Setzt die Adresse, an der der nächste Befehl oder die nächste Zahl gespeichert wird, auf ${address}.`,
        'en': "```\n" + `origin ${address}\n// Sets the address where the next instruction or number will be stored to ${address}.`,
        'fr': "```\n" + `origin ${address}\n// Définit l'adresse où la prochaine instruction ou le prochain nombre sera stocké à ${address}.`
    });

    static WordDirectiveHoverMessage = (value: number) => lm({
        'de': "```\n" + `word ${value}\n// Speichert die Zahl ${value} an der aktuellen Adresse. Es ist auch möglich, mehrere Zahlen kommasepariert anzugeben.`,
        'en': "```\n" + `word ${value}\n// Stores the number ${value} at the current address. It is also possible to specify multiple numbers separated by commas.`,
        'fr': "```\n" + `word ${value}\n// Stocke le nombre ${value} à l'adresse actuelle. Il est également possible de spécifier plusieurs nombres séparés par des virgules.`
    });

    static LoadCompletionComment = () => lm({
        'de': `Lädt einen Wert in den Akkumulator.`,
        'en': `Loads a value into the accumulator.`,
        'fr': `Charge une valeur dans l'accumulateur.`
    });

    static StoreCompletionComment = () => lm({
        'de': `Schreibt den Wert des Akkumulators in den Speicher.`,
        'en': `Stores the value of the accumulator in the memory.`,
        'fr': `Stocke la valeur de l'accumulateur dans la mémoire.`
    });

    static AddCompletionComment = () => lm({
        'de': `Addiert einen Wert zum Akkumulator.`,
        'en': `Adds a value to the accumulator.`,
        'fr': `Ajoute une valeur à l'accumulateur.`
    });

    static SubCompletionComment = () => lm({
        'de': `Subtrahiert einen Wert vom Akkumulator.`,
        'en': `Subtracts a value from the accumulator.`,
        'fr': `Soustrait une valeur de l'accumulateur.`
    });

    static MulCompletionComment = () => lm({
        'de': `Multipliziert den Akkumulator mit einem Wert.`,
        'en': `Multiplies the accumulator with a value.`,
        'fr': `Multiplie l'accumulateur avec une valeur.`
    });

    static DivCompletionComment = () => lm({
        'de': `Dividiert den Akkumulator durch einen Wert.`,
        'en': `Divides the accumulator by a value.`,
        'fr': `Divise l'accumulateur par une valeur.`
    });

    static ModCompletionComment = () => lm({
        'de': `Dividiert den Akkumulator durch einen Wert und speichert den Rest der Division im Akkumulator.`,
        'en': `Divides the accumulator by a value and stores the remainder of the division in the accumulator.`,
        'fr': `Divise l'accumulateur par une valeur et stocke le reste de la division dans l'accumulateur.`
    });

    static AndCompletionComment = () => lm({
        'de': `Führt eine bitweise Und-Verknüpfung zwischen dem Akkumulator und einem Wert durch und speichert das Ergebnis im Akkumulator.`,
        'en': `Performs a bitwise AND opération between the accumulator and a value and stores the result in the accumulator.`,
        'fr': `Effectue une opération ET binaire entre l'accumulateur et une valeur et stocke le résultat dans l'accumulateur.`
    });

    static OrCompletionComment = () => lm({
        'de': `Führt eine bitweise Oder-Verknüpfung zwischen dem Akkumulator und einem Wert durch und speichert das Ergebnis im Akkumulator.`,
        'en': `Performs a bitwise OR opération between the accumulator and a value and stores the result in the accumulator.`,
        'fr': `Effectue une opération OU binaire entre l'accumulateur et une valeur et stocke le résultat dans l'accumulateur.`
    });

    static XorCompletionComment = () => lm({
        'de': `Führt eine bitweise Exklusiv-Oder-Verknüpfung zwischen dem Akkumulator und einem Wert durch und speichert das Ergebnis im Akkumulator.`,
        'en': `Performs a bitwise exclusive OR opération between the accumulator and a value and stores the result in the accumulator.`,
        'fr': `Effectue une opération OU exclusif binaire entre l'accumulateur et une valeur et stocke le résultat dans l'accumulateur.`
    });

    static CmpCompletionComment = () => lm({
        'de': `Subtrahiert einen Wert vom Akkumulator (ohne diesen zu verändern!) und setzt die Flags entsprechend (zero, negative, overflow).`,
        'en': `Subtracts a value from the accumulator (without changing it!) and sets the flags accordingly (zero, negative, overflow).`,
        'fr': `Soustrait une valeur de l'accumulateur (sans le changer !) et définit les drapeaux en conséquence (zero, négatif, dépassement).`
    });

    static Architecture16BitSigned = () => lm({
        'de': `Daten: 16 Bit mit Vorzeichen, Adressen: 16 Bit ohne Vorzeichen`,
        'en': `Data: 16-bit signed, addresses: 16-bit unsigned`,
        'fr': `Données: 16 bits avec signe, adresses: 16 bits sans signe`
    });

    static Architecture16BitUnsigned = () => lm({
        'de': `Daten und Adressen: 16 Bit ohne Vorzeichen`,
        'en': `Data and addresses: 16-bit unsigned`,
        'fr': `Données et adresses: 16 bits sans signe`
    });

    static Architecture8BitUnsigned = () => lm({
        'de': `Daten: 8 Bit ohne Vorzeichen, Adressen: 16 Bit ohne Vorzeichen`,
        'en': `Data: 8-bit unsigned, addresses: 16-bit unsigned`,
        'fr': `Données: 8 bits sans signe, adresses: 16 bits sans signe`
    });

    static Architecture8BitSigned = () => lm({
        'de': `Daten: 8 Bit mit Vorzeichen, Adressen: 16 Bit ohne Vorzeichen`,
        'en': `Data: 8-bit signed, addresses: 16-bit unsigned`,
        'fr': `Données: 8 bits avec signe, adresses: 16 bits sans signe`
    });

    static ArchitectureHeading = () => lm({
        'de': `Speicherarchitektur:`,
        'en': `Memory architecture:`,
        'fr': `Architecture de la mémoire:`
    });

    static SpExpectedInStackRelativeAddress = () => lm({
        'de': `Um Stack-relative Adressierung zu erhalten, wird hier in Klammern SP erwartet.`,
        'en': `To obtain stack-relative addressing, SP is expected here in parentheses.`,
        'fr': `Pour obtenir une adressage relative à la pile, SP est attendu ici entre parenthèses.`
    });

    static StackRelativeAddressingOnlySupportedForLoadAndStore = (tokenText: string) => lm({
        'de': `Stack-relative Adressierung wird nur für Load- und Store-Befehle unterstützt, nicht für ${tokenText}.`,
        'en': `Stack-relative addressing is only supported for load and store instructions, not for ${tokenText}.`,
        'fr': `L'adressage relative à la pile n'est pris en charge que pour les instructions de chargement et de stockage, et non pour ${tokenText}.`
    });
}





