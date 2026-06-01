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

    static LoadAddress = () => lm({
        'de': `load address: lädt den Wert an der Adresse address in den Akkumulator.`,
        'en': `load address: loads the value at address into the accumulator.`,
        'fr': `load address: charge la valeur à l'adresse dans l'accumulateur.`
    });

    static StoreAddress = () => lm({
        'de': `store address: speichert den Wert des Akkumulators an der Adresse address.`,
        'en': `store address: stores the value of the accumulator at address.`,
        'fr': `store address: stocke la valeur de l'accumulateur à l'adresse.`
    });

    static AddAddress = () => lm({
        'de': `add address: addiert den Wert an der Adresse address zum Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `add address: adds the value at address to the accumulator and stores the result in the accumulator.`,
        'fr': `add address: ajoute la valeur à l'adresse à l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static SubAddress = () => lm({
        'de': `sub address: subtrahiert den Wert an der Adresse address vom Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `sub address: subtracts the value at address from the accumulator and stores the result in the accumulator.`,
        'fr': `sub address: soustrait la valeur à l'adresse de l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

        static MulAddress = () => lm({  
        'de': `mul address: multipliziert den Wert an der Adresse address mit dem Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `mul address: multiplies the value at address with the accumulator and stores the result in the accumulator.`,
        'fr': `mul address: multiplie la valeur à l'adresse avec l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

        static DivAddress = () => lm({
        'de': `div address: dividiert den Akkumulator durch den Wert an der Adresse address und speichert das Ergebnis im Akkumulator (ganzzahliger Quotient).`,
        'en': `div address: divides the accumulator by the value at address and stores the result in the accumulator (integer quotient).`,
        'fr': `div address: divise l'accumulateur par la valeur à l'adresse et stocke le résultat dans l'accumulateur (quotient entier).`
    });

        static ModAddress = () => lm({
        'de': `mod address: dividiert den Akkumulator durch den Wert an der Adresse address und speichert den Rest der Division im Akkumulator.`,
        'en': `mod address: divides the accumulator by the value at address and stores the remainder of the division in the accumulator.`,
        'fr': `mod address: divise l'accumulateur par la valeur à l'adresse et stocke le reste de la division dans l'accumulateur.`
    });

        static AndAddress = () => lm({
        'de': `and address: führt eine bitweise Und-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse address durch und speichert das Ergebnis im Akkumulator.`,
        'en': `and address: performs a bitwise AND operation between the accumulator and the value at address and stores the result in the accumulator.`,
        'fr': `and address: effectue une opération ET binaire entre l'accumulateur et la valeur à l'adresse et stocke le résultat dans l'accumulateur.`
    });

        static OrAddress = () => lm({
        'de': `or address: führt eine bitweise Oder-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse address durch und speichert das Ergebnis im Akkumulator.`,
        'en': `or address: performs a bitwise OR operation between the accumulator and the value at address and stores the result in the accumulator.`,
        'fr': `or address: effectue une opération OU binaire entre l'accumulateur et la valeur à l'adresse et stocke le résultat dans l'accumulateur.`
    });

        static XorAddress = () => lm({
        'de': `xor address: führt eine bitweise Exklusiv-Oder-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse address durch und speichert das Ergebnis im Akkumulator.`,
        'en': `xor address: performs a bitwise exclusive OR operation between the accumulator and the value at address and stores the result in the accumulator.`,
        'fr': `xor address: effectue une opération OU exclusif binaire entre l'accumulateur et la valeur à l'adresse et stocke le résultat dans l'accumulateur.`
    });

        static CmpAddress = () => lm({
        'de': `cmp address: subtrahiert den Wert an der Adresse address vom Akkumulator (ohne diesen zu verändern!) und setzt die Flags entsprechend (zero, negative, overflow).`,
        'en': `cmp address: subtracts the value at address from the accumulator (without changing it!) and sets the flags accordingly (zero, negative, overflow).`,
        'fr': `cmp address: soustrait la valeur à l'adresse de l'accumulateur (sans le changer !) et définit les drapeaux en conséquence (zéro, négatif, dépassement).`
    });

    static LoadIndirect = () => lm({
        'de': `load (address): lädt den Wert an der Adresse, die an address gespeichert ist, in den Akkumulator.`,
        'en': `load (address): loads the value at the address stored at address into the accumulator.`,
        'fr': `load (address): charge la valeur à l'adresse stockée à l'adresse dans l'accumulateur.`
    });

    static StoreIndirect = () => lm({
        'de': `store (address): speichert den Wert des Akkumulators an der Adresse, die an address gespeichert ist.`,
        'en': `store (address): stores the value of the accumulator at the address stored at address.`,
        'fr': `store (address): stocke la valeur de l'accumulateur à l'adresse stockée à l'adresse.`
    });

    static AddIndirect = () => lm({
        'de': `add (address): addiert den Wert an der Adresse, die an address gespeichert ist, zum Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `add (address): adds the value at the address stored at address to the accumulator and stores the result in the accumulator.`,
        'fr': `add (address): ajoute la valeur à l'adresse stockée à l'adresse à l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

        static SubIndirect = () => lm({
        'de': `sub (address): subtrahiert den Wert an der Adresse, die an address gespeichert ist, vom Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `sub (address): subtracts the value at the address stored at address from the accumulator and stores the result in the accumulator.`,
        'fr': `sub (address): soustrait la valeur à l'adresse stockée à l'adresse de l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static MulIndirect = () => lm({
        'de': `mul (address): multipliziert den Wert an der Adresse, die an address gespeichert ist, mit dem Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `mul (address): multiplies the value at the address stored at address with the accumulator and stores the result in the accumulator.`,
        'fr': `mul (address): multiplie la valeur à l'adresse stockée à l'adresse avec l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static DivIndirect = () => lm({
        'de': `div (address): dividiert den Akkumulator durch den Wert an der Adresse, die an address gespeichert ist, und speichert das Ergebnis im Akkumulator (ganzzahliger Quotient).`,
        'en': `div (address): divides the accumulator by the value at the address stored at address and stores the result in the accumulator (integer quotient).`,
        'fr': `div (address): divise l'accumulateur par la valeur à l'adresse stockée à l'adresse et stocke le résultat dans l'accumulateur (quotient entier).`
    });

    static ModIndirect = () => lm({
        'de': `mod (address): dividiert den Akkumulator durch den Wert an der Adresse, die an address gespeichert ist, und speichert den Rest der Division im Akkumulator.`,
        'en': `mod (address): divides the accumulator by the value at the address stored at address and stores the remainder of the division in the accumulator.`,
        'fr': `mod (address): divise l'accumulateur par la valeur à l'adresse stockée à l'adresse et stocke le reste de la division dans l'accumulateur.`
    });

    static AndIndirect = () => lm({
        'de': `and (address): führt eine bitweise Und-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse, die an address gespeichert ist, durch und speichert das Ergebnis im Akkumulator.`,
        'en': `and (address): performs a bitwise AND operation between the accumulator and the value at the address stored at address and stores the result in the accumulator.`,
        'fr': `and (address): effectue une opération ET binaire entre l'accumulateur et la valeur à l'adresse stockée à l'adresse et stocke le résultat dans l'accumulateur.`
    });

    static OrIndirect = () => lm({
        'de': `or (address): führt eine bitweise Oder-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse, die an address gespeichert ist, durch und speichert das Ergebnis im Akkumulator.`,
        'en': `or (address): performs a bitwise OR operation between the accumulator and the value at the address stored at address and stores the result in the accumulator.`,
        'fr': `or (address): effectue une opération OU binaire entre l'accumulateur et la valeur à l'adresse stockée à l'adresse et stocke le résultat dans l'accumulateur.`
    });

    static XorIndirect = () => lm({
        'de': `xor (address): führt eine bitweise Exklusiv-Oder-Verknüpfung zwischen dem Akkumulator und dem Wert an der Adresse, die an address gespeichert ist, durch und speichert das Ergebnis im Akkumulator.`,
        'en': `xor (address): performs a bitwise exclusive OR operation between the accumulator and the value at the address stored at address and stores the result in the accumulator.`,
        'fr': `xor (address): effectue une opération OU exclusif binaire entre l'accumulateur et la valeur à l'adresse stockée à l'adresse et stocke le résultat dans l'accumulateur.`
    });

    static CmpIndirect = () => lm({
        'de': `cmp (address): subtrahiert den Wert an der Adresse, die an address gespeichert ist, vom Akkumulator (ohne diesen zu verändern!) und setzt die Flags entsprechend (zero, negative, overflow).`,
        'en': `cmp (address): subtracts the value at the address stored at address from the accumulator (without changing it!) and sets the flags accordingly (zero, negative, overflow).`,
        'fr': `cmp (address): soustrait la valeur à l'adresse stockée à l'adresse de l'accumulateur (sans le changer !) et définit les drapeaux en conséquence (zéro, négatif, dépassement).`
    });

    static Jmp = () => lm({
        'de': `jmp label: springt zu der Adresse, die durch label angegeben ist. Dies wird erreichte, indem die Adresse im Program Counter gespeichert wird.`,
        'en': `jmp label: jumps to the address specified by label. This is achieved by storing the address in the program counter.`,
        'fr': `jmp label: saute à l'adresse spécifiée par le label. Cela est réalisé en stockant l'adresse dans le compteur de programme.`
    });

        static Jeq = () => lm({
        'de': `jeq label: springt zu der Adresse, die durch label angegeben ist, wenn das zero-Flag gesetzt ist. Nach einem Vergleich (cmp-Befehl) wird das zero-Flag gesetzt, wenn die Werte gleich sind.`,
        'en': `jeq label: jumps to the address specified by label if the zero flag is set. After a comparison (cmp command), the zero flag is set if the values are equal.`,
        'fr': `jeq label: saute à l'adresse spécifiée par le label si le drapeau zéro est défini. Après une comparaison (commande cmp), le drapeau zéro est défini si les valeurs sont égales.`
    });

        static Jne = () => lm({
        'de': `jne label: springt zu der Adresse, die durch label angegeben ist, wenn das zero-Flag nicht gesetzt ist. Nach einem Vergleich (cmp-Befehl) wird das zero-Flag gesetzt, wenn die Werte gleich sind.`,
        'en': `jne label: jumps to the address specified by label if the zero flag is not set. After a comparison (cmp command), the zero flag is set if the values are equal.`,
        'fr': `jne label: saute à l'adresse spécifiée par le label si le drapeau zéro n'est pas défini. Après une comparaison (commande cmp), le drapeau zéro est défini si les valeurs sont égales.`
    });

    static Jgt = () => lm({
        'de': `jgt label: springt zu der Adresse, die durch label angegeben ist, wenn das negative-Flag nicht gesetzt ist und entweder das zero-Flag nicht gesetzt ist oder das overflow-Flag nicht gesetzt ist. Nach einem Vergleich (cmp-Befehl) wird das negative-Flag gesetzt, wenn der Wert im Akkumulator kleiner als der Wert an der Adresse ist, von der subtrahiert wird, und das overflow-Flag wird gesetzt, wenn es bei der Subtraktion zu einem Überlauf kommt.`,
        'en': `jgt label: jumps to the address specified by label if the negative flag is not set and either the zero flag is not set or the overflow flag is not set. After a comparison (cmp command), the negative flag is set if the value in the accumulator is less than the value at the address being subtracted from, and the overflow flag is set if there is an overflow in the subtraction.`,
        'fr': `jgt label: saute à l'adresse spécifiée par le label si le drapeau négatif n'est pas défini et que soit le drapeau zéro n'est pas défini, soit le drapeau de dépassement n'est pas défini. Après une comparaison (commande cmp), le drapeau négatif est défini si la valeur dans l'accumulateur est inférieure à la valeur à l'adresse dont elle est soustraite, et le drapeau de dépassement est défini s'il y a un dépassement dans la soustraction.`
    });

    static Jge = () => lm({
        'de': `jge label: springt zu der Adresse, die durch label angegeben ist, wenn das negative-Flag nicht gesetzt ist und entweder das zero-Flag gesetzt ist oder das overflow-Flag gesetzt ist. Nach einem Vergleich (cmp-Befehl) wird das negative-Flag gesetzt, wenn der Wert im Akkumulator kleiner als der Wert an der Adresse ist, von der subtrahiert wird, und das overflow-Flag wird gesetzt, wenn es bei der Subtraktion zu einem Überlauf kommt.`,
        'en': `jge label: jumps to the address specified by label if the negative flag is not set and either the zero flag is set or the overflow flag is set. After a comparison (cmp command), the negative flag is set if the value in the accumulator is less than the value at the address being subtracted from, and the overflow flag is set if there is an overflow in the subtraction.`,
        'fr': `jge label: saute à l'adresse spécifiée par le label si le drapeau négatif n'est pas défini et que soit le drapeau zéro est défini, soit le drapeau de dépassement est défini. Après une comparaison (commande cmp), le drapeau négatif est défini si la valeur dans l'accumulateur est inférieure à la valeur à l'adresse dont elle est soustraite, et le drapeau de dépassement est défini s'il y a un dépassement dans la soustraction.`
    });

        static Jlt = () => lm({
        'de': `jlt label: springt zu der Adresse, die durch label angegeben ist, wenn das negative-Flag gesetzt ist und entweder das zero-Flag nicht gesetzt ist oder das overflow-Flag nicht gesetzt ist. Nach einem Vergleich (cmp-Befehl) wird das negative-Flag gesetzt, wenn der Wert im Akkumulator kleiner als der Wert an der Adresse ist, von der subtrahiert wird, und das overflow-Flag wird gesetzt, wenn es bei der Subtraktion zu einem Überlauf kommt.`,
        'en': `jlt label: jumps to the address specified by label if the negative flag is set and either the zero flag is not set or the overflow flag is not set. After a comparison (cmp command), the negative flag is set if the value in the accumulator is less than the value at the address being subtracted from, and the overflow flag is set if there is an overflow in the subtraction.`,
        'fr': `jlt label: saute à l'adresse spécifiée par le label si le drapeau négatif est défini et que soit le drapeau zéro n'est pas défini, soit le drapeau de dépassement n'est pas défini. Après une comparaison (commande cmp), le drapeau négatif est défini si la valeur dans l'accumulateur est inférieure à la valeur à l'adresse dont elle est soustraite, et le drapeau de dépassement est défini s'il y a un dépassement dans la soustraction.`
    });

        static Jle = () => lm({
        'de': `jle label: springt zu der Adresse, die durch label angegeben ist, wenn das negative-Flag gesetzt ist und entweder das zero-Flag gesetzt ist oder das overflow-Flag gesetzt ist. Nach einem Vergleich (cmp-Befehl) wird das negative-Flag gesetzt, wenn der Wert im Akkumulator kleiner als der Wert an der Adresse ist, von der subtrahiert wird, und das overflow-Flag wird gesetzt, wenn es bei der Subtraktion zu einem Überlauf kommt.`,
        'en': `jle label: jumps to the address specified by label if the negative flag is set and either the zero flag is set or the overflow flag is set. After a comparison (cmp command), the negative flag is set if the value in the accumulator is less than the value at the address being subtracted from, and the overflow flag is set if there is an overflow in the subtraction.`,
        'fr': `jle label: saute à l'adresse spécifiée par le label si le drapeau négatif est défini et que soit le drapeau zéro est défini, soit le drapeau de dépassement est défini. Après une comparaison (commande cmp), le drapeau négatif est défini si la valeur dans l'accumulateur est inférieure à la valeur à l'adresse dont elle est soustraite, et le drapeau de dépassement est défini s'il y a un dépassement dans la soustraction.`
    });

    static Jmpp = () => lm({
        'de': `jmpp label: springt zu der Adresse, die durch label angegeben ist, wenn das negative-Flag nicht gesetzt ist.`,
        'en': `jmpp label: jumps to the address specified by label if the negative flag is not set.`,
        'fr': `jmpp label: saute à l'adresse spécifiée par le label si le drapeau négatif n'est pas défini.`
    });

    static Jmpn = () => lm({
        'de': `jmpn label: springt zu der Adresse, die durch label angegeben ist, wenn das negative-Flag gesetzt ist.`,
        'en': `jmpn label: jumps to the address specified by label if the negative flag is set.`,
        'fr': `jmpn label: saute à l'adresse spécifiée par le label si le drapeau négatif est défini.`
    });

    static Jmpz = () => lm({
        'de': `jmpz label: springt zu der Adresse, die durch label angegeben ist, wenn das zero-Flag gesetzt ist.`,
        'en': `jmpz label: jumps to the address specified by label if the zero flag is set.`,
        'fr': `jmpz label: saute à l'adresse spécifiée par le label si le drapeau zéro est défini.`
    });

    static Jmpv = () => lm({
        'de': `jmpv label: springt zu der Adresse, die durch label angegeben ist, wenn das overflow-Flag gesetzt ist.`,
        'en': `jmpv label: jumps to the address specified by label if the overflow flag is set.`,
        'fr': `jmpv label: saute à l'adresse spécifiée par le label si le drapeau de dépassement est défini.`
    });

    static Jmpc = () => lm({
        'de': `jmpc label: springt zu der Adresse, die durch label angegeben ist, wenn das carry-Flag gesetzt ist.`,
        'en': `jmpc label: jumps to the address specified by label if the carry flag is set.`,
        'fr': `jmpc label: saute à l'adresse spécifiée par le label si le drapeau de retenue est défini.`
    });

    static Jmpnp = () => lm({
        'de': `jmpnp label: springt zu der Adresse, die durch label angegeben ist, wenn negative-Flag oder das zero-Flag gesetzt ist.`,
        'en': `jmpnp label: jumps to the address specified by label if the negative flag or the zero flag is set.`,
        'fr': `jmpnp label: saute à l'adresse spécifiée par le label si le drapeau négatif ou le drapeau zéro est défini.` 
    });

    static Jmpnn = () => lm({
        'de': `jmpnn label: springt zu der Adresse, die durch label angegeben ist, wenn negative-Flag nicht gesetzt ist.`,
        'en': `jmpnn label: jumps to the address specified by label if the negative flag is not set.`,
        'fr': `jmpnn label: saute à l'adresse spécifiée par le label si le drapeau négatif n'est pas défini.`
    });

    static Jmpnz = () => lm({
        'de': `jmpnz label: springt zu der Adresse, die durch label angegeben ist, wenn das zero-Flag nicht gesetzt ist.`,
        'en': `jmpnz label: jumps to the address specified by label if the zero flag is not set.`,
        'fr': `jmpnz label: saute à l'adresse spécifiée par le label si le drapeau zéro n'est pas défini.`
    });

        static Jmpnv = () => lm({
        'de': `jmpnv label: springt zu der Adresse, die durch label angegeben ist, wenn das overflow-Flag nicht gesetzt ist.`,
        'en': `jmpnv label: jumps to the address specified by label if the overflow flag is not set.`,
        'fr': `jmpnv label: saute à l'adresse spécifiée par le label si le drapeau de dépassement n'est pas défini.`
    });

    static Jmpnc = () => lm({
        'de': `jmpnc label: springt zu der Adresse, die durch label angegeben ist, wenn das carry-Flag nicht gesetzt ist.`,
        'en': `jmpnc label: jumps to the address specified by label if the carry flag is not set.`,
        'fr': `jmpnc label: saute à l'adresse spécifiée par le label si le drapeau de retenue n'est pas défini.`
    });

    static LoadImmediate = () => lm({
        'de': `loadi 70: lädt die Zahl 70 in den Akkumulator.`,
        'en': `loadi number: loads the immediate number into the accumulator.`,
        'fr': `loadi nombre: charge le nombre immédiat dans l'accumulateur.`
    });

    static AddImmediate = () => lm({
        'de': `addi 70: addiert die Zahl 70 zum Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `addi number: adds the immediate number to the accumulator and stores the result in the accumulator.`,
        'fr': `addi nombre: ajoute le nombre immédiat à l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static SubImmediate = () => lm({
        'de': `subi 70: subtrahiert die Zahl 70 vom Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `subi number: subtracts the immediate number from the accumulator and stores the result in the accumulator.`,
        'fr': `subi nombre: soustrait le nombre immédiat de l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static MulImmediate = () => lm({
        'de': `muli 70: multipliziert die Zahl 70 mit dem Akkumulator und speichert das Ergebnis im Akkumulator.`,
        'en': `muli number: multiplies the immediate number with the accumulator and stores the result in the accumulator.`,
        'fr': `muli nombre: multiplie le nombre immédiat avec l'accumulateur et stocke le résultat dans l'accumulateur.`
    });

    static DivImmediate = () => lm({
        'de': `divi 70: dividiert den Akkumulator durch die Zahl 70 und speichert das Ergebnis im Akkumulator (ganzzahliger Quotient).`,
        'en': `divi number: divides the accumulator by the immediate number and stores the result in the accumulator (integer quotient).`,
        'fr': `divi nombre: divise l'accumulateur par le nombre immédiat et stocke le résultat dans l'accumulateur (quotient entier).`
    });

    static ModImmediate = () => lm({
        'de': `modi 70: dividiert den Akkumulator durch die Zahl 70 und speichert den Rest der Division im Akkumulator.`,
        'en': `modi number: divides the accumulator by the immediate number and stores the remainder of the division in the accumulator.`,
        'fr': `modi nombre: divise l'accumulateur par le nombre immédiat et stocke le reste de la division dans l'accumulateur.`
    });

    static AndImmediate = () => lm({
        'de': `andi 70: führt eine bitweise Und-Verknüpfung zwischen dem Akkumulator und der Zahl number durch und speichert das Ergebnis im Akkumulator.`,
        'en': `andi number: performs a bitwise AND operation between the accumulator and the immediate number and stores the result in the accumulator.`,
        'fr': `andi nombre: effectue une opération ET binaire entre l'accumulateur et le nombre immédiat et stocke le résultat dans l'accumulateur.`
    });

    static OrImmediate = () => lm({
        'de': `ori 70: führt eine bitweise Oder-Verknüpfung zwischen dem Akkumulator und der Zahl number durch und speichert das Ergebnis im Akkumulator.`,
        'en': `ori number: performs a bitwise OR operation between the accumulator and the immediate number and stores the result in the accumulator.`,
        'fr': `ori nombre: effectue une opération OU binaire entre l'accumulateur et le nombre immédiat et stocke le résultat dans l'accumulateur.`
    });

    static XorImmediate = () => lm({
        'de': `xori 70: führt eine bitweise Exklusiv-Oder-Verknüpfung zwischen dem Akkumulator und der Zahl number durch und speichert das Ergebnis im Akkumulator.`,
        'en': `xori number: performs a bitwise exclusive OR operation between the accumulator and the immediate number and stores the result in the accumulator.`,
        'fr': `xori nombre: effectue une opération OU exclusif binaire entre l'accumulateur et le nombre immédiat et stocke le résultat dans l'accumulateur.`
    });

    static CmpImmediate = () => lm({
        'de': `cmpi 70: subtrahiert die Zahl 70 vom Akkumulator (ohne diesen zu verändern!) und setzt die Flags entsprechend (zero, negative, overflow).`,
        'en': `cmpi number: subtracts the immediate number from the accumulator (without changing it!) and sets the flags accordingly (zero, negative, overflow).`,
        'fr': `cmpi nombre: soustrait le nombre immédiat de l'accumulateur (sans le changer !) et définit les drapeaux en conséquence (zéro, négatif, dépassement).`
    });

    static Hold = () => lm({
        'de': `hold: hält die Ausführung des Programms an.`,
        'en': `hold: halts the execution of the program.`,
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

}
