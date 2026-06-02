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
}





