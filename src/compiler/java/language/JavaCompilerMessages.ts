import { le, lm } from "../../../tools/language/LanguageManager";
import { IRange } from "../../common/range/Range";

/**
 * Java compiler's messages
 */
export class JCM {

    /**
     * Messages for class BinopCastCodeGenerator
     */

    static typeLeftOperandNotFound = () => le({
        "de": "Der Typ des linken Operanden kann nicht bestimmt werden.",
        "en": "Couldn't compute type of left operand.",
        "fr": "Le type de l'opérande gauche ne peut pas être déterminé."
    });

    static typeRightOperandNotFound = () => le({
        "de": "Der Typ des rechten Operanden kann nicht bestimmt werden.",
        "en": "Couldn't compute type of right operand.",
        "fr": "Le type de l'opérande droite ne peut pas être déterminé."
    });

    static operatorNotFeasibleForOperands = (operatorIdentifier: string, lIdentifier: string, rIdentifier: string) => le({
        "de": "Der Operator " + operatorIdentifier + " ist für die Typen " + lIdentifier + " und " + rIdentifier + " nicht geeignet.",
        "en": "Operator " + operatorIdentifier + " is not defined for operands of type " + lIdentifier + " and " + rIdentifier + ".",
        "fr": `L'opérateur ${operatorIdentifier} n'est pas défini pour les opérandes de type ${lIdentifier} et ${rIdentifier}.`,
    });

    static rightSideOfInstanceofError = () => le({
        "de": "Rechts vom Operator instanceof muss eine Klasse/ein Interface/ein Enum-Typ stehen.",
        "en": "Class/interface/enum-type expected on righthand side of operator instanceof.",
        "fr": "Type classe/interface/enum attendu à droite de l'opérateur instanceof.",
    });

    static leftSideOfInstanceofError = () => le({
        "de": "Links vom Operator instanceof muss ein Objekt stehen.",
        "en": "Object expected on righthand side of operator instanceof.",
        "fr": "Objet attendu à gauche de l'opérateur instanceof.",
    });

    static cantAssignValueToTerm = () => le({
        "de": "Dem Term auf der linken Seite des Zuweisungsoperators kann nichts zugewiesen werden.",
        "en": "Can't assign value to expression on left side of assignment operator.",
        "fr": "Impossible d'affecter une valeur à l'expression à gauche de l'opérateur d'affectation.",
    });

    static cantCastRightSideToString = () => le({
        "de": "Der Term auf der rechten Seite des Zuweisungsoperators kann nicht in den Typ String umgewandelt werden.",
        "en": "Can't cast expression on right side of assignment operator to type String.",
        "fr": "Impossible de convertir l'expression à droite de l'opérateur d'affectation en type String.",
    })

    static leftOperatorNotFitForAttribute = (operator: string) => le({
        "de": "Mit dem Attribut/der Variablen auf der linken Seite des Zuweisungsoperators kann die Berechnung " + operator + " nicht durchgeführt werden.",
        "en": "Field/variable on left side of operator " + operator + " is not usable for this operation.",
        "fr": `Le champ/la variable à gauche de l'opérateur ${operator} ne peut pas être utilisé(e) pour cette opération.`,
    })

    static rightOperatorNotFitForAttribute = (operator: string) => le({
        "de": "Mit dem Attribut/der Variablen auf der rechten Seite des Zuweisungsoperators kann die Berechnung " + operator + " nicht durchgeführt werden.",
        "en": "Field/variable on right side of operator " + operator + " is not usable for this operation.",
        "fr": `Le champ/la variable à droite de l'opérateur ${operator} ne peut pas être utilisé(e) pour cette opération.`,
    })

    static cantUseOperatorForLeftRightTypes = (operator: string) => le({
        "de": "Der Wert des Datentyps auf der rechten Seite des Operators " + operator + " kann mit der Variablen/dem Attribut auf der linken Seite nicht verrechnet werden.",
        "en": "Can't use operator " + operator + " for types of given left/right side operands.",
        "fr": `Impossible d'utiliser l'opérateur ${operator} pour les types des opérandes gauche/droite donnés.`,
    })

    static cantCastType = (srcIdentifier: string, destIdentifier: string) => le({
        "de": "Der Typ " + srcIdentifier + " kann nicht in den Typ " + destIdentifier + " gecastet werden.",
        "en": `Can't cast ${srcIdentifier} to ${destIdentifier}.`,
        "fr": `Impossible de convertir ${srcIdentifier} en ${destIdentifier}.`,
    })

    static unneccessaryCast = () => le({
        "de": `Unnötiges Casten`,
        "en": `Unneccessary cast`,
        "fr": `Cast inutile`,
    })

    static leftExpressionHasNoType = (operator: string) => le({
        "de": "Der Term auf der linken Seite des '" + operator + "' - Operators hat keinen Datentyp. ",
        "en": `Expression on left side of operator '${operator}' has no type.`,
        "fr": `L'expression à gauche de l'opérateur '${operator}' n'a pas de type.`,
    })

    static rightExpressionHasNoType = (operator: string) => le({
        "de": "Der Term auf der rechten Seite des '" + operator + "' - Operators hat keinen Datentyp. ",
        "en": `Expression on right side of operator '${operator}' has no type.`,
        "fr": `L'expression à droite de l'opérateur '${operator}' n'a pas de type.`,
    })

    static cantGetTypeOfExpression = () => le({
        "de": "Der Typ des Terms kann nicht bestimmt werden.",
        "en": `Can't compute type of this expression.`,
        "fr": `Impossible de déterminer le type de cette expression.`,
    })

    static operatorNotUsableForOperands = (operator: string, type: string) => le({
        "de": "Der Operator " + operator + " ist nicht für den Operanden des Typs " + type + "geeignet.",
        "en": `Operator ${operator} is not usable for operands of type ${type}.`,
        "fr": `L'opérateur ${operator} ne peut pas être utilisé pour les opérandes de type ${type}.`,
    })

    static notOperatorNeedsBooleanOperands = (type: string) => le({
        "de": "Der Operator ! (not) ist nur für boolesche Operanden geeignet, nicht für Operanden des Typs " + type + ".",
        "en": `Operator ! (not) needs boolean operands, but given operands are of type ${type}.`,
        "fr": `L'opérateur ! (not) nécessite des opérandes booléens, mais les opérandes donnés sont de type ${type}.`,
    })

    static plusPlusMinusMinusOnlyForLeftyOperands = (operatorAsString: string) => le({
        "de": "Der Operator " + operatorAsString + " ist nur für Variablen/Attribute geeignet, deren Wert verändert werden kann.",
        "en": `Operator ${operatorAsString} can only be used for fields/variables which are writable.`,
        "fr": `L'opérateur ${operatorAsString} ne peut être utilisé que pour les champs/variables qui sont modifiables.`,
    })

    static badOperandTypesForBinaryOperator = (operatorAsString: string, firstType: string, secondType: string) => le({
        "de": "Der Operator " + operatorAsString + " ist für Operanden der Typen " + firstType + " und " + secondType + " nicht definiert.",
        "en": `Operator ${operatorAsString} is not defined for operands of type ${firstType} and ${secondType}.`,
        "fr": `L'opérateur ${operatorAsString} n'est pas défini pour les opérandes de type ${firstType} et ${secondType}.`,
    })

    /**
     * Messages for Java CodeGenerator
     */

    static interfaceOnlyDefaultMethodsHaveBody = () => le({
        "de": `In Interfaces können nur default-Methoden einen Methodenrumpf haben.`,
        "en": `In interfaces only default methods have a method body. `,
        "fr": `Dans les interfaces, seules les méthodes par défaut peuvent avoir un corps de méthode.`
    })

    static enumConstructorsMustBePrivate = () => le({
        "de": "Konstruktoren von enums müssen die Sichtbarkeit private haben.",
        "en": `Enum constructors must be private.`,
        "fr": `Les constructeurs d'enums doivent être privés.`,
    })

    static interfaceFieldsMustBeStatic = () => le({
        "de": "Interfaces können nur statische konstante (final) Attribute besitzen.",
        "en": "Interface fields must be static final.",
        "fr": "Les champs d'interface doivent être statiques et finaux.",
    })

    static cantFindConstructor = () => le({
        "de": "Es konnte kein passender Konstruktor mit dieser Signatur gefunden werden.",
        "en": `Cant find constructor.`,
        "fr": `Impossible de trouver un constructeur correspondant à cette signature.`,
    })

    static cantInstantiateFromAbstractClass = () => le({
        "de": `Von einer abstrakten Klasse kann man keine Objekte instanzieren.`,
        "en": `You can't create objects of an abstract class.`,
        "fr": `Vous ne pouvez pas instancier d'objets à partir d'une classe abstraite.`,
    })

    static interfacesDontHaveConstructors = () => le({
        "de": `Interfaces haben keinen Konstruktor.`,
        "en": `Interfaces don't have construtctors.`,
        "fr": `Les interfaces n'ont pas de constructeurs.`,
    })

    static methodImitatesConstructor = (identifier: string) => le({
        "de": "Die Methode " + identifier + " trägt denselben Bezeichner wie die Klasse, hat aber einen Rückgabewert und ist damit KEIN Konstruktor. Das ist irreführend.",
        "en": "Method " + identifier + " has same identifier as class and an return type. Therefore it is no constructor. This is irritating.",
        "fr": `La méthode ${identifier} a le même identifiant que la classe, mais elle a un type de retour. Ce n'est donc PAS un constructeur. C'est trompeur.`
    })

    static abstractMethodsDontHaveMethodBodies = () => le({
        "de": "Eine abstrakte Methode kann keinen Methodenrumpf besitzen.",
        "en": `Abstract methods don't have method bodies.`,
        "fr": `Les méthodes abstraites ne peuvent pas avoir de corps de méthode.`,
    })

    static superCallInConstructorMissing = (baseClass: string) => le({
        "de": `Da die Oberklasse ${baseClass} keinen parameterlosen Konstruktor hat, muss in jedem Konstruktor einer Unterklasse gleich zu Beginn der Aufruf eines Konstruktors der Oberklasse erfolgen (super(...)).`,
        "en": ``, // The English message is empty, so I will base the French translation on the German one.
        "fr": `Puisque la super-classe ${baseClass} n'a pas de constructeur sans paramètres, chaque constructeur d'une sous-classe doit commencer par un appel au constructeur de la super-classe (super(...)).`,
    })

    static lambdaFunctionHereNotPossible = () => le({
        "de": "Eine Lambda-Funktion darf nur an einer Stelle im Code stehen, an der ein functional interface (d.h. ein Interface mit genau einer Methode) erwartet wird.",
        "en": `Lambda functions are only usable in places where a functional interface (that is: a interface with only one method) is expected.`,
        "fr": `Les fonctions lambda ne peuvent être utilisées qu'aux endroits où une interface fonctionnelle (c'est-à-dire une interface avec une seule méthode) est attendue.`,
    })

    static lambdaFunctionWrongParameterCount = (actualCount: number, expectedCount: number, functionalInterface: string) => le({
        "de": `Die Anzahl der Parameter der Lambda-Funktion (${actualCount}) stimmt nicht mit der des functional interfaces ${functionalInterface} (${expectedCount}) überein.`,
        "en": `Number of parameters of lambda function (${actualCount}) doesn't match number of parameters of functional interfaces ${functionalInterface} (${expectedCount}).`,
        "fr": `Le nombre de paramètres de la fonction lambda (${actualCount}) ne correspond pas à celui de l'interface fonctionnelle ${functionalInterface} (${expectedCount}).`,
    })

    static lambdaFunctionWrongParameterType = (identifier: string, type: string) => le({
        "de": `Der Datentyp des Parameters ${identifier} passt nicht zum erwarteten Datentyp ${type}.`,
        "en": `Parameter ${identifier} has wrong type. Expected type: ${type}.`,
        "fr": `Le paramètre ${identifier} a un type incorrect. Type attendu : ${type}.`,
    })

    static arrayLiteralTypeUnknown = () => le({
        "de": `Der erwartete Datentyp der Array-Elemente kann nicht ermittelt werden.\n Tipp: Versuchen Sie es mit der Syntax 'new int[]{1, 2, 3}'`,
        "en": `Can't figure out exptected type of array elements.\nHint: Try syntax 'new int[]{1, 2, 3}'.`,
        "fr": `Impossible de déterminer le type attendu des éléments du tableau.\nIndice : Essayez la syntaxe 'new int[]{1, 2, 3}'.`,
    })


    /**
     * Messages for class CodePrinter:
     */

    static missingProgram = () => le({
        "de": `//Kein Programm vorhanden.`,
        "en": `//Missing program.`,
        "fr": `//Programme manquant.`,
    })

    /**
     * Messages for class MissingStatementsManager
     */

    static variableNotInitialized = (identifier: string) => le({
        "de": "Die Variable/der Parameter " + identifier + " is vor diesem lesenden Zugriff noch nicht initialisiert worden.",
        "en": `Variable/field ${identifier} had not been initialized before first read access.`,
        "fr": `La variable/le champ ${identifier} n'a pas été initialisé(e) avant le premier accès en lecture.`,
    })

    static noReadAccessForVariable = (identifier: string) => le({
        "de": "Auf die Variable/den Parameter " + identifier + " wird nie lesend zugegriffen.",
        "en": `No read access on variable/field ${identifier}.`,
        "fr": `Aucun accès en lecture sur la variable/le champ ${identifier}.`,
    })

    static returnStatementMissing = (identifier: string, type: string) => le({
        "de": "Die Methode " + identifier + " muss einen Wert vom Typ " + type + " zurückliefern. In einem der Ausführungszweige fehlt ein entsprechendes return-statement.",
        "en": `Method ${identifier} must return value of type ${type}. Return statement is missing in at least one program branch.`,
        "fr": `La méthode ${identifier} doit retourner une valeur de type ${type}. Une instruction return est manquante dans au moins une branche du programme.`,
    })


    /**
     * Messages for class StatementCodeGenerator
     */


    static cantRedeclareVariableError = (identifier: string) => le({
        "de": "Die Variable " + identifier + " wurde zweifach deklariert.",
        "en": "Variable " + identifier + " had been declared twice.",
        "fr": `La variable ${identifier} a été déclarée deux fois.`,
    })

    static shadowedVariableError = (identifier: string) => le({
        "de": "Die Variable " + identifier + " überdeckt eine gleichnamige Variable in einem äußeren Sichtbarkeitsbereich.",
        "en": "Variable " + identifier + " shadowes a variable with same identifier in outer scope.",
        "fr": `La variable ${identifier} masque une variable du même identifiant dans une portée externe.`,
    })

    static breakNotExpected = () => le({
        "de": "An dieser Stelle kann kein break stehen, da der Ausdruck nicht innerhalb einer Schleife (for, while, do) oder switch-case Anweisung steht.",
        "en": `break statement is only expected inside loops (for, while, do...while) and switch-statements.`,
        "fr": `L'instruction break n'est attendue qu'à l'intérieur des boucles (for, while, do...while) et des instructions switch.`,
    })

    static noVariableDeclarationWhileProgramIsRunning = () => le({
        "de": "Während ein Programm läuft (oder pausiert ist) kann keine Variable in der Konsole deklariert werden.",
        "en": `You can't declare a variable while a program is running (or paused).`,
        "fr": `Vous ne pouvez pas déclarer de variable pendant qu'un programme est en cours d'exécution (ou en pause).`,
    })

    static continueNotExpected = () => le({
        "de": "An dieser Stelle kann kein continue stehen, da der Ausdruck nicht innerhalb einer Schleife (for, while, do) oder switch-case Anweisung steht.",
        "en": `continue statement is only expected inside loops (for, while, do...while) and switch-statements.`,
        "fr": `L'instruction continue n'est attendue qu'à l'intérieur des boucles (for, while, do...while) et des instructions switch.`,
    })

    static returnNotExpected = () => le({
        "de": "Eine return-Anweisung ist nur innerhalb einer Methode sinnvoll.",
        "en": `return statement outside method context`,
        "fr": `Instruction return en dehors du contexte de la méthode.`,
    })

    static returnValueNotExpected = () => le({
        "de": "Die Methode erwartet keinen Rückgabewert, hier ist aber einer angegeben.",
        "en": `Method doesn't expect return value.`,
        "fr": `La méthode n'attend pas de valeur de retour, mais une est spécifiée ici.`,
    })

    static returnValueExpected = (type: string) => le({
        "de": "Die Methode erwartet einen Rückgabewert vom Typ " + type + ", hier wird aber keiner übergeben.",
        "en": `Missing return value of type ${type}.`,
        "fr": `Valeur de retour de type ${type} attendue.`,
    })

    static wrongReturnValueType = (expected: string, actual: string) => le({
        "de": "Die Methode erwartet einen Rückgabewert vom Typ " + expected + ", der Wert des Terms hat aber den Datentyp " + actual + ".",
        "en": `Expression of type ${actual} found, but return value of type ${expected} expected.`,
        "fr": `Expression de type ${actual} trouvée, mais valeur de retour de type ${expected} attendue.`,
    })

    static wrongArrayElementType = (elementType: string, elementIdentifier: string, arrayElementType: string) => le({
        "de": `Der Typ ${elementType} des Elements ${elementIdentifier} muss mit dem Elementtyp des Arrays (${arrayElementType}) übereinstimmen. Tipp: Verwende das var-Schlüsselwort, also for(var element: array){...}`,
        "en": `Type ${elementType} of element ${elementIdentifier} doesn't fit to element type of array (${arrayElementType}). Hint: use var-keyword (for(var element: array)){...}`,
        "fr": `Le type ${elementType} de l'élément ${elementIdentifier} ne correspond pas au type d'élément du tableau (${arrayElementType}). Astuce : utilisez le mot-clé var, par exemple for(var element: array){...}`,
    })

    static wrongCollectionElementType = (elementType: string, elementIdentifier: string, collectionElementType: string) => le({
        "de": `Der Typ ${elementType} des Elements ${elementIdentifier} muss mit dem Elementtyp des Collections (${collectionElementType}) übereinstimmen. Tipp: Verwende das var-Schlüsselwort, also for(var element: collection){...}`,
        "en": `Type ${elementType} of element ${elementIdentifier} doesn't fit to element type of collection (${collectionElementType}). Hint: use var-keyword (for(var element: collection)){...}`,
        "fr": `Le type ${elementType} de l'élément ${elementIdentifier} ne correspond pas au type d'élément de la collection (${collectionElementType}). Astuce : utilisez le mot-clé var, par exemple for(var element: collection){...}`,
    })

    static cantComputeArrayElementType = (collectionType: string) => le({
        "de": `Der Elementtyp des Arrays ${collectionType} kann nicht bestimmt werden.`,
        "en": `Can't compute element type of array ${collectionType}.`,
        "fr": `Impossible de déterminer le type d'élément du tableau ${collectionType}.`,
    })

    static cantComputeCollectionElementType = (collectionType: string) => le({
        "de": `Der Elementtyp der Collection ${collectionType} kann nicht bestimmt werden.`,
        "en": `Can't compute element type of collection ${collectionType}.`,
        "fr": `Impossible de déterminer le type d'élément de la collection ${collectionType}.`,
    })

    static elementTypeDoesntFitToIterable = (elementType: string, elementIdentifier: string, collectionElementType: string) => le({
        "de": `Der Typ ${elementType} des Elements ${elementIdentifier} muss mit dem Elementtyp des Iterables(${collectionElementType}) übereinstimmen. Tipp: Verwende das var-Schlüsselwort, also for(var element: array){...}`,
        "en": `Type ${elementType} of element ${elementIdentifier} must be identical to type of Iterable (${collectionElementType}). Hint: use var keyword, for example: for(var element: iterable){...}`,
        "fr": `Le type ${elementType} de l'élément ${elementIdentifier} doit être identique au type de l'Itérable (${collectionElementType}). Astuce : utilisez le mot-clé var, par exemple : for(var element: iterable){...}`,
    })

    static enhancedForLoopOnlyForArraysCollectionsIterables = () => le({
        "de": "Die vereinfachte for-loop kann nur über Arrays iterieren oder über Klassen, die das Interface Iterable implementieren.",
        "en": `Enhanced for-loops are only possible for arrays, collections and iterables.`,
        "fr": `Les boucles for améliorées ne sont possibles que pour les tableaux, les collections et les itérables.`,
    })

    static booleanTermExpected = (actualType: string) => le({
        "de": "Hier wird eine Bedingung erwartet, deren Wert true oder false ergibt. Der Datentyp dieses Terms ist " + actualType,
        "en": `Boolean value expected, but expression of type ${actualType} found.`,
        "fr": `Valeur booléenne attendue, mais expression de type ${actualType} trouvée.`,
    })

    static assignmentInsteadOfComparisonOperator = () => le({
        "de": "Hier wird ein boolescher Wert erwartet. Du musst statt des Zuweisungsoperators = den Vergleichsoperator == benutzen.",
        "en": `Boolean value expected. Use comparison operator == instead of assignment operator =.`,
        "fr": `Valeur booléenne attendue. Utilisez l'opérateur de comparaison == au lieu de l'opérateur d'affectation =.`,
    })

    static comparisonOperatorInsteadOfAssignment = () => le({
        "de": "Hier wird ein Zuweisungsoperator erwartet. Du musst statt des Vergleichsoperators == den Zuweisungsoperator == benutzen.",
        "en": `Assignment operator expected. Use assignment operator = instead of comparison operator ==.`,
        "fr": `Opérateur d'affectation attendu. Utilisez l'opérateur d'affectation = au lieu de l'opérateur de comparaison ==.`,
    })

    static enumIdentifierUnknown = (enumType: string, elementIdentifier: string) => le({
        "de": `Der Enum-Typ ${enumType} hat kein Element mit dem Bezeichner ${elementIdentifier}.`,
        "en": `Enum-type ${enumType} has no element with identifier ${elementIdentifier}.`,
        "fr": `Le type enum ${enumType} n'a pas d'élément avec l'identifiant ${elementIdentifier}.`,
    })

    static valueNotComputable = () => le({
        "de": "Der Wert des Ausdrucks ist nicht ermittelbar.",
        "en": `Can't compute value.`,
        "fr": `Impossible de calculer la valeur.`,
    })

    static constantValueExpectedAfterCase = () => le({
        "de": "Nach case dürfen nur konstante Ausdrücke stehen, z.B. eine feste Zahl oder Zeichenkette. Wenn du an dieser Stelle etwas anderes (einen Term oder eine Variable) verwenden möchtest, informiere dich über sogenannten constant expressions in Java.",
        "en": `Constant value expected.`,
        "fr": `Valeur constante attendue.`,
    })

    static caseValueDoesntFitToSwitchValue = (expected: string, actual: string) => le({
        "de": `Ich erwarte hier einen Ausdruck vom Typ ${expected} - dem Datentyp des Switch-Ausdrucks - bekomme aber einen Ausdruck vom Typ ${actual}.`,
        "en": `Value of type ${expected} expected (this is type inside switch()-expression), but found value of type ${actual}.`,
        "fr": `Valeur de type ${expected} attendue (c'est le type de l'expression switch()), mais valeur de type ${actual} trouvée.`,
    })

    static switchOnlyFeasibleForTypes = () => le({
        "de": "Die Anweisung switch(x) ist nur möglich, wenn x den Typ int, String, oder enum hat.",
        "en": `Switch statement (switch) is only feasible for expression x of type int, String or enum.`,
        "fr": `L'instruction switch(x) n'est possible que si x est de type int, String ou enum.`,
    })

    static cantAssignArrayLiteralToNonArrayVariable = () => le({
        "de": `Der Typ der deklarierten Variable ist kein Array, daher kann ihr auch kein Array-Literal zugewiesen werden.`,
        "en": `Declared variable has no array type, therefore you can't assign a array literal.`,
        "fr": `La variable déclarée n'est pas de type tableau, vous ne pouvez donc pas lui affecter un littéral de tableau.`,
    })

    static localVariableDeclarationWrongInitializerType = (actual: string, expected: string) => le({
        "id": "cantAssignValueToLocalVariable",
        "de": "Der Term auf der rechten Seite des Zuweisungsoperators hat den Datentyp " + actual + " und kann daher der Variablen auf der linken Seite (Datentyp " + expected + ") nicht zugewiesen werden.",
        "en": `Can't assign value of type ${actual} to local variable of type ${expected}.`,
        "fr": `Impossible d'affecter une valeur de type ${actual} à la variable locale de type ${expected}.`,
    })

    /**
     * Error messages in class TermCodeGenerator
     */

    static localVariableUsedBeforeDeclaration = (variable: string) => le({
        "de": `Die Variable ${variable} wurde vor ihrer Deklaration verwendet.`,
        "en": `Variable ${variable} is used before it's declaration.`,
        "fr": `La variable ${variable} est utilisée avant sa déclaration.`,
    })

    static superOnlyInClassesOrEnums = () => le({
        "de": `Das Schlüsselwort super ist nur innerhalb einer Klasse oder eines Enum sinnvoll.`,
        "en": `Keyword super is only usable in classes and enums.`,
        "fr": `Le mot-clé super n'est utilisable que dans les classes et les enums.`,
    })

    static thisOnlyInClassesOrEnums = () => le({
        "de": `Das Schlüsselwort this ist nur innerhalb einer Klasse oder eines Enum sinnvoll.`,
        "en": `Keyword this is only usable in classes and enums.`,
        "fr": `Le mot-clé this n'est utilisable que dans les classes et les enums.`,
    })

    static cantCastFromTo = (from: string, to: string) => le({
        "de": `Casten von ${from} nach ${to} ist nicht möglich.`,
        "en": `Can't cast from ${from} to ${to}.`,
        "fr": `Impossible de convertir de ${from} à ${to}.`,
    })

    static objectContextNeededForInstantiation = (klass: string, contextNeeded: string) => le({
        "de": `Zum Instanzieren eines Objekts der Klasse ${klass} wird ein Objektkontext der Klasse ${contextNeeded} benötigt.`,
        "en": `You need objectcontext ${contextNeeded} to instantiate a object of type ${klass}.`,
        "fr": `Vous avez besoin d'un contexte d'objet ${contextNeeded} pour instancier un objet de type ${klass}.`,
    })

    static noArrayBracketAfterType = (type: string) => le({
        "de": `Vor [ muss ein Array stehen. Dieser Term hat aber den Typ ${type}`,
        "en": `Type ${type} is no array type, therefore [ is not expected here.`,
        "fr": `Le type ${type} n'est pas un type tableau, par conséquent [ n'est pas attendu ici.`,
    })

    static wrongArrayDimensionCount = (expected: number, actual: number) => le({
        "de": `Das Array hat die Dimension ${expected}, hier stehen aber ${actual} Längenangaben in den eckigen Klammern.`,
        "en": `Array has dimension ${expected}, but ${actual} length-values found inside square brackets ([...]).`,
        "fr": `Le tableau a la dimension ${expected}, mais ${actual} valeurs de longueur ont été trouvées entre crochets ([...]).`,
    })

    static indexMustHaveIntegerValue = () => le({
        "de": "Als Array-Index wird ein ganzzahliger Wert erwartet.",
        "en": `Array-Index must have integer value.`,
        "fr": `L'indice de tableau doit avoir une valeur entière.`,
    })

    static integerValueExpected = (foundType: string) => le({
        "de": "Hier wird eine Ganzzahl erwartet (Datentypen byte, short, int, long). Gefunden wurde " + foundType + ".",
        "en": `Integer value expected (type byte, short, int or long), but found: ${foundType}`,
        "fr": `Valeur entière attendue (types byte, short, int ou long), mais trouvé : ${foundType}.`,
    })

    static declaredArrayDimensionDoesNotFitArrayLiteral = (typeDimension: number, literalDimension: number) => le({
        "de": `Die Dimension ${typeDimension} bei der Deklaration des Arrays stimmt nicht mit der des Array-Literals (${literalDimension} überein.)`,
        "en": `Dimension ${typeDimension} does not match dimension of array literal (${literalDimension}).`,
        "fr": `La dimension ${typeDimension} ne correspond pas à la dimension du littéral de tableau (${literalDimension}).`,
    })

    static arrayLiteralElementsNotSameDimension = () => le({
        "de": `Die Elemente des Array-Literals haben unterschiedliche Dimension.`,
        "en": `Elements of array literal don't have same dimension.`,
        "fr": `Les éléments du littéral de tableau n'ont pas la même dimension.`,
    })

    static arrayLiteralElementDimensionWrong = () => le({
        "de": `Dieses Element des Array-Literals sollte kein Array sein.`,
        "en": `This particular element of the array literal must be no array itself.`,
        "fr": `Cet élément particulier du littéral de tableau ne doit pas être un tableau lui-même.`,
    })

    static cantCastTermTo = (destType: string) => le({
        "de": `Der Term kann nicht in den Typ ${destType} umgewandelt werden.`,
        "en": `Can't cast expression to type ${destType}.`,
        "fr": `Impossible de convertir l'expression en type ${destType}.`,
    })

    static cantUseNonstaticFieldsToInitializeStaticOne = () => le({
        "de": "Zum Initialisieren eines statischen Attributs können keine nichtstatischen Attribute benutzt werden.",
        "en": `Can't use non-static fields to initialize static field.`,
        "fr": `Impossible d'utiliser des champs non statiques pour initialiser un champ statique.`,
    })

    static attributeHasWrongVisibility = (identifier: string, visibility: string) => le({
        "de": "Das Attribut " + identifier + " hat die Sichtbarkeit " + visibility + " und kann daher hier nicht verwendet werden.",
        "en": "Field " + identifier + " has Visibility " + visibility + ", therefore it is not visible here.",
        "fr": `Le champ ${identifier} a la visibilité ${visibility}, il n'est donc pas visible ici.`,
    })

    static identifierNotKnown = (identifier: string) => le({
        "de": "Der Bezeichner " + identifier + " ist an dieser Stelle nicht definiert.",
        "en": "Identifier " + identifier + " unknown.",
        "fr": `L'identifiant ${identifier} est inconnu.`,
    })

    static plusPlusMinusMinusOnlyForVariables = () => le({
        "de": "Die Operatoren ++ und -- können nur bei Variablen benutzt werden, die veränderbar sind.",
        "en": `Operators ++ and -- can only operate on variables.`,
        "fr": `Les opérateurs ++ et -- ne peuvent s'appliquer qu'aux variables.`,
    })

    static colonExpectedAfterTernaryOperator = () => le({
        "de": `Nach dem Fragezeichenoperator ? ('ternary operator') wird ein : erwartet. Beispiel: Der Term a < b ? 10 : 12 hat den Wert 10, wenn a < b ist und 12 andernfalls.`,
        "en": `Colon (:) expected after ternary operator (?). Example: The value of a < b ? 10 : 12 is 10 if a < b and 12 otherwise.`,
        "fr": `Deux-points (:) attendus après l'opérateur ternaire (?). Exemple : La valeur de a < b ? 10 : 12 est 10 si a < b et 12 sinon.`,
    })

    static booleanOperandOnTernaryOperatorLefthand = () => le({
        "de": `Der Term links vom Fragezeichenoperator ? (ternary operator) muss einen booleschen Wert besitzen.`,
        "en": `Boolean value expected on left side of ternary operator (?).`,
        "fr": `Valeur booléenne attendue à gauche de l'opérateur ternaire (?).`,
    })

    static ternaryOperatorTypesNotCompatible = () => le({
        "de": `Die Typen der Operanden b und c beim Ausdruck a ? b : c sind im gegebenen Fall zu unterschiedlich.`,
        "en": `Types b and c in expression a ? b : c are not compatible to each other.`,
        "fr": `Les types b et c dans l'expression a ? b : c ne sont pas compatibles entre eux.`,
    })

    static plusPlusMinusMinusOnlyForTypes = () => le({
        "de": "Die Operatoren ++ und -- können nur bei Variablen mit den Datentypen byte, short, int, long, float und double benutzt werden.",
        "en": `Operators ++ and -- can only operate on types byte, short, int, long, float and double.`,
        "fr": `Les opérateurs ++ et -- ne peuvent s'appliquer qu'aux variables de types byte, short, int, long, float et double.`,
    })

    static arraysOnlyHaveLengthField = (fieldIdentifier: string) => le({
        "de": "Arrays haben nur das Attribut length. Das Attribut " + fieldIdentifier + " ist bei Arrays nicht vorhanden.",
        "en": `Arrays don't have field ${fieldIdentifier}. They have field length ...`,
        "fr": `Les tableaux n'ont pas de champ ${fieldIdentifier}. Ils ont un champ length...`,
    })

    static typeHasNoFields = (type: string) => le({
        "de": `Der Datentyp ${type} hat keine Attribute.`,
        "en": `Type ${type} has no fields.`,
        "fr": `Le type de données ${type} n'a pas de champs.`,
    })

    static fieldUnknown = (identifier: string) => le({
        "de": `Das Objekt hat kein Attribut mit dem Bezeichner ${identifier}.`,
        "en": `Object has no field ${identifier}.`,
        "fr": `L'objet n'a pas de champ avec l'identifiant ${identifier}.`,
    })

    static methodCallOutsideClassNeedsDotSyntax = () => le({
        "de": "Außerhalb einer Klasse kann eine Methode nur mit Punktschreibweise (Object.Methode(...)) aufgerufen werden.",
        "en": `Method call outside class is only possible with dot syntax.`,
        "fr": `L'appel de méthode en dehors de la classe n'est possible qu'avec la syntaxe par points (Object.method(...)).`,
    })

    static methodHasWrongVisibility = (identifier: string, visibility: string) => le({
        "de": "Die Methode " + identifier + " hat die Sichtbarkeit " + visibility + " und kann daher hier nicht aufgerufen werden.",
        "en": "Method " + identifier + " has Visibility " + visibility + ", therefore it is not visible here.",
        "fr": `La méthode ${identifier} a la visibilité ${visibility}, elle n'est donc pas visible ici.`,
    })

    static cantFindMethod = () => le({
        "de": "Es konnte keine passende Methode mit diesem Bezeichner/mit dieser Signatur gefunden werden.",
        "en": `Can't find method with this identifier and signature.`,
        "fr": `Impossible de trouver une méthode correspondant à cet identifiant et à cette signature.`,
    })

    static assertCodeReachedNeedsStringParameter = () => le({
        "de": "Die Methode assertCodeReached benötigt genau einen konstanten Parameter vom Typ String.",
        "en": `Method assertCodeReached needs parameter of type String.`,
        "fr": `La méthode assertCodeReached nécessite exactement un paramètre constant de type String.`,
    })

    /**
     * class Lexer
     */

    static expectingEndOfCharConstant = () => le({
        "de": "Das Ende der char-Konstante wird erwartet (').",
        "en": `Expecting end of char literal (').`,
        "fr": `Fin du littéral de caractère (') attendue.`,
    })

    static endOfLineInsideStringLiteral = () => le({
        "de": 'Innerhalb einer String-Konstante wurde das Zeilenende erreicht.',
        "en": `End of line inside String literal.`,
        "fr": `Fin de ligne atteinte à l'intérieur du littéral de chaîne.`,
    })

    static endOfTextInsideStringLiteral = () => le({
        "de": 'Innerhalb einer String-Konstante wurde das Textende erreicht.',
        "en": `End of text inside String literal.`,
        "fr": `Fin du texte atteinte à l'intérieur du littéral de chaîne.`,
    })

    static endOfTextInsideJavadocComment = () => le({
        "de": "Innerhalb eines Mehrzeilenkommentars (/*... */) wurde das Dateiende erreicht.",
        "en": `End of text inside JavaDoc comment (/*... */).`,
        "fr": `Fin du texte atteinte à l'intérieur du commentaire JavaDoc (/*... */).`,
    })

    static charactersAfterMultilineStringLiteralStart = () => le({
        "de": 'Eine Java-Multiline-Stringkonstante beginnt immer mit """ und einem nachfolgenden Zeilenumbruch. Alle nach """ folgenden Zeichen werden überlesen!',
        "en": `A multiline String-literal starts with """ followed by a line braek. Characters in between """ and line break are discarded.`,
        "fr": `Un littéral de chaîne multiligne commence toujours par """ suivi d'un saut de ligne. Tous les caractères après """ et le saut de ligne sont ignorés !`,
    })

    static unknownEscapeSequence = (hex: string) => le({
        "de": 'Die Escape-Sequenz \\' + hex + ' gibt es nicht.',
        "en": `Unknown escape sequence \\${hex}`,
        "fr": `Séquence d'échappement inconnue \\${hex}.`,
    })

    static wrongFloatConstantBegin = () => le({
        "de": "Eine float/double-Konstante darf nicht mit 0, 0b oder 0x beginnen.",
        "en": `Float literals must not start with 0, 0b or 0x.`,
        "fr": `Les littéraux float ne doivent pas commencer par 0, 0b ou 0x.`,
    })

    /**
     * class Parser
     */

    static unexpectedToken = (token: string) => le({
        "de": "Mit dem Token " + token + " kann der Compiler nichts anfangen.",
        "en": `Unexpected token: ${token}`,
        "fr": `Jeton inattendu : ${token}.`,
    })

    static superCallInsideConstructorAfterFirstStatement = () => le({
        "de": "Der Aufruf des Konstruktors der Oberklasse mit super(...) kann nur als erste Anweisung im Konstruktor erfolgen.",
        "en": "Call to constructors base class via super(...) must be first statement in constructor.",
        "fr": "L'appel au constructeur de la classe de base via super(...) doit être la première instruction du constructeur."
    })

    static fieldDefinitionDoesntStartWithGenericParamter = () => le({
        "de": "Vor Attributen kann keine Definition generischer Parameter stehen.",
        "en": `Field definition mustn't start with generic parameter definition.`,
        "fr": `La définition de champ ne doit pas commencer par une définition de paramètre générique.`,
    })

    static methodDeclarationWithoutReturnType = (identifier: string) => le({
        "de": `Bei der Deklaration der methode ${identifier} fehlt der Rückgabedatentyp. Falls die Methode keinen Wert zurückgibt, muss vor dem Bezeichner ${identifier} der Typ void stehen.`,
        "en": `Declaration of method ${identifier} is missing a return type. If this method doesn't return a value then precede ${identifier} with type void.`,
        "fr": `La déclaration de la méthode ${identifier} manque un type de retour. Si cette méthode ne retourne pas de valeur, le type void doit précéder l'identifiant ${identifier}.`,
    })

    static multipleVisibilityModifiers = (modifiers: string) => le({
        "de": `Es ist nicht zulässig, mehrere visibility-modifiers gleichzeitig zu setzen (hier: ${modifiers}).`,
        "en": `More than one visibility modifier found: ${modifiers}`,
        "fr": `Plusieurs modificateurs de visibilité trouvés : ${modifiers}.`,
    })

    static noSemicolonAsMethodBody = () => le({
        "de": `Diese Methode ist nicht abstrakt, daher ist ein Strichpunkt hier nicht zulässig.`,
        "en": `This method is not abstract, therefore no semicolon is expected here.`,
        "fr": `Cette méthode n'est pas abstraite, par conséquent aucun point-virgule n'est attendu ici.`,
    })

    static abstractMethodOnlyInAbstractClass = () => le({
        "de": `Eine abstrakte Methode ist nur in einer abstrakten Klasse zulässig.`,
        "en": `You can't have abstract methods in non-abstract classes.`,
        "fr": `Vous ne pouvez pas avoir de méthodes abstraites dans des classes non abstraites.`,
    })



    /**
     * class StatementParser
     */

    static loopOverEmptyStatement = () => le({
        "de": "Hier wird eine leere Anweisung (; oder {  }) wiederholt.",
        "en": `Loop over empty statement (; or {  }).`,
        "fr": `Boucle sur une instruction vide (; ou {  }).`,
    })

    static noMethodDeclarationAllowedHere = () => le({
        "de": "Hier ist keine Methodendeklaration möglich.",
        "en": "No method declaration allowed here.",
        "fr": "Aucune déclaration de méthode n'est autorisée ici."
    })

    static constantMissingInCaseStatement = () => le({
        "de": "In diesem Case-Block fehlt zwischen case und dem Doppelpunkt die Konstante.",
        "en": `Constant missing between case and colon.`,
        "fr": `Constante manquante entre case et le deux-points.`,
    })

    static statementOrBlockExpected = () => le({
        "de": "Hier wird eine Anweisung oder ein Anweisungsblock (in geschweiften Klammern) erwartet.",
        "en": `Statement or block-Statement in curly braces { ... } expected.`,
        "fr": `Instruction ou bloc d'instructions entre accolades { ... } attendu.`,
    })

    static wrongSyntaxAfterKeywordNew = () => le({
        "de": "Es wird die Syntax new Klasse(Parameter...) oder new Typ[ArrayLänge]... erwartet.",
        "en": `Keyword new has syntax new Class(parameters...) or new ArrayType[length].`,
        "fr": `Le mot-clé new a la syntaxe new Classe(paramètres...) ou new TypeTableau[longueur].`,
    })

    static secondOperandExpected = (operator: string) => le({
        "de": "Rechts vom binären Operator " + operator + " wird ein zweiter Operand erwartet.",
        "en": `Expecting second Operand on right side of binary operator ${operator}.`,
        "fr": `Deuxième opérande attendue à droite de l'opérateur binaire ${operator}.`,
    })

    static dotOperatorNotExpected = () => le({
        "de": "Der Punkt-Operator wird hier nicht erwartet.",
        "en": `Dot operator (.) not expected`,
        "fr": `Opérateur point (.) non attendu.`,
    })

    static squareBracketExpected = () => le({
        "de": "[ oder [] erwartet.",
        "en": `[ or [] expected`,
        "fr": `[ ou [] attendu.`,
    })

    static firstArrayDimensionMustNotBeZero = () => le({
        "de": "Die Länge der ersten Array-Dimension darf nicht 0 sein.",
        "en": `Length of first array dimension must not be 0.`,
        "fr": `La longueur de la première dimension du tableau ne doit pas être 0.`,
    })

    /**
     * class TokenIterator
     */

    static expectedOtherToken = (expected: string, actual: string) => le({
        "de": `Erwartet wird: ${expected} - Gefunden wurde: ${actual}`,
        "en": `Expected token: ${expected} - Found: ${actual}`,
        "fr": `Jeton attendu : ${expected} - Trouvé : ${actual}`,
    })

    static expectedOtherTokens = (expected: string, actual: string) => le({
        "de": `Erwartet wird eines der Token: ${expected} - Gefunden wurde: ${actual}`,
        "en": `Expected tokens: ${expected} - Found: ${actual}`,
        "fr": `Jetons attendus : ${expected} - Trouvé : ${actual}`,
    })

    static insertSemicolonHere = () => lm({
        "de": `Strichpunkt hier einfügen`,
        "en": `Insert semicolon here`,
        "fr": `Insérer un point-virgule ici`,
    })

    static semicolonExpected = (found: string) => le({
        "de": `Erwartet wird ein Strichpunkt (Semicolon). Gefunden wurde: ${found}`,
        "en": `Semicolon (;) expected. Found: ${found}`,
        "fr": `Point-virgule (;) attendu. Trouvé : ${found}.`,
    })

    static typeExpected = (found: string) => le({
        "de": `Erwartet wird ein Datentyp. Gefunden wurde: ${found}`,
        "en": `Data type expected. Found: ${found}`,
        "fr": `Type de données attendu. Trouvé : ${found}.`,
    })

    static identifierExpected = (found: string) => le({
        "de": `Erwartet wird ein Bezeichner (engl.: 'identifier'), d.h. der Name einer Klasse, Variable, ... . Gefunden wurde: ${found}`,
        "en": `Identifier (that is: name of variable, class, ...) expected. Found: ${found}`,
        "fr": `Identifiant (c'est-à-dire : nom de variable, de classe, ...) attendu. Trouvé : ${found}.`,
    })

    /**
     * TypeResolver
    */

    static multipleFieldsWithSameIdentifier = (signature: string, otherLineNumber: number) => le({
        "de": `Es gibt in dieser Klasse/diesem enum ein weiteres Attribut mit dem Bezeichner ${signature} in Zeile ${otherLineNumber}.`,
        "en": `There's another field with signature ${signature} in this class/this enum (line ${otherLineNumber}).`,
        "fr": `Il existe un autre champ avec la signature ${signature} dans cette classe/cet enum (ligne ${otherLineNumber}).`,
    })

    static multipleMethodsWithSameSignature = (signature: string, otherLineNumber: number) => le({
        "de": `Es gibt in dieser Klasse/diesem Interface/diesem enum eine weitere Methode mit der Signatur ${signature} in Zeile ${otherLineNumber}.`,
        "en": `There's another method for this class/interface/enum with signature ${signature} in line ${otherLineNumber}.`,
        "fr": `Il existe une autre méthode pour cette classe/interface/enum avec la signature ${signature} à la ligne ${otherLineNumber}.`,
    })

    static typenameAlreadyInUse = (name: string, otherPosition: IRange, otherFilename: string) => le({
        "de": `Es gibt einen weiteren Datentyp mit Bezeichner ${name}. Er findet sich in der Datei ${otherFilename} in Zeile ${otherPosition.startLineNumber}.`,
        "en": `Identifier ${name} for this type is already in use. See File ${otherFilename}, line ${otherPosition.startLineNumber}.`,
        "fr": `L'identifiant ${name} pour ce type est déjà utilisé. Voir le fichier ${otherFilename}, ligne ${otherPosition.startLineNumber}.`,
    })

    static typenameUsedInLibrary = (name: string) => le({
        "de": `Es gibt in der API bereits einen Typ (Klasse/Interface/Enum) mit dem Bezeichner ${name}.`,
        "en": `Identifier ${name} is already used in the API.`,
        "fr": `L'identifiant ${name} est déjà utilisé dans l'API.`,
    })

    static typeIsNotGeneric = (type: string) => le({
        "de": `Der Datentyp ${type} ist nicht generisch, daher können keine Typparameter in <...> angegeben werden.`,
        "en": `Type ${type} is not generic, therefore type parameters in <...> are not possible.`,
        "fr": `Le type de données ${type} n'est pas générique, par conséquent, les paramètres de type entre <...> ne sont pas possibles.`,
    })

    static genericTypeWithNonGenericReference = (type: string) => le({
        "de": `Der Datentyp ${type} ist generisch, wird hier aber in nicht-generischer Art gebraucht. Es sollten die Werte der generischen Typparameter in <...> angegeben werden.`,
        "en": `Type ${type} is generic, but used in a non-generic way here. You should add type parameter values in <...>.`,
        "fr": `Le type ${type} est générique, mais il est utilisé de manière non générique ici. Vous devriez ajouter les valeurs des paramètres de type entre <...>.`,
    })

    static wrongNumberOfGenericParameters = (type: string, expected: number, actual: number) => le({
        "de": `Der Datentyp ${type} hat ${expected} generische Parameter, hier werden aber ${actual} konkrete Datentypen dafür angegeben.`,
        "en": `Type ${type} has ${expected} generic parameters. Found: ${actual} types.`,
        "fr": `Le type ${type} a ${expected} paramètres génériques, mais ${actual} types concrets sont spécifiés ici.`,
    })

    static noPrimitiveTypeForGenericParameter = (type: string) => le({
        "de": `Als konkreter Typ für einen generischen Typparameter kann kein primitiver Datentyp (hier: ${type}) verwendet werden.`
        ,
        "en": `Can't use primitive Type ${type} for generic parameter.`,
        "fr": `Un type de données primitif (ici : ${type}) ne peut pas être utilisé comme type concret pour un paramètre de type générique.`,
    })

    static actualGenericParameterNotSpecified = (typeIdentifier: string, genericParameterIdentifier: string) => le({
        "de": `Für den generischen Parameter ${genericParameterIdentifier} der Klasse/des Interfaces ${typeIdentifier} muss ein konkreter Typ angegeben werden.`,
        "en": `Actual Type missing for generic Parameter ${genericParameterIdentifier} of class/interface ${typeIdentifier}.`,
        "fr": `Le type réel est manquant pour le paramètre générique ${genericParameterIdentifier} de la classe/interface ${typeIdentifier}.`,
    })

    static cantReplaceGenericParamterBy = (genericParameter: string, replacedBy: string) => le({
        "de": `Der generische Typparameter ${genericParameter} kann nicht durch den Typ ${replacedBy} ersetzt werden.`,
        "en": `Can't replace generic typeparameter ${genericParameter} with type ${replacedBy}.`,
        "fr": `Impossible de remplacer le paramètre de type générique ${genericParameter} par le type ${replacedBy}.`,
    })


    static onlyClassesOrInterfacesAsUpperBounds = () => le({
        "de": `Nur Klassen und Interfaces können als upper bound für einen generischen Typparameter verwendet werden.`,
        "en": `Only classes and interfaces can be used as upper bound for generic parameter.`,
        "fr": `Seules les classes et les interfaces peuvent être utilisées comme borne supérieure pour un paramètre générique.`,
    })

    static onlyClassesOrInterfacesAsLowerBounds = () => le({
        "de": `Nur Klassen und Interfaces können als lower bound für einen generischen Typparameter verwendet werden.`
        ,
        "en": `Only classes and interfaces can be used as lower bound for generic parameter.`,
        "fr": `Seules les classes et les interfaces peuvent être utilisées comme borne inférieure pour un paramètre générique.`,
    })

    static afterExtendsClassNeeded = () => le({
        "de": `Hinter extends muss eine Klasse stehen.`,
        "en": `After extends a class identifier is needed.`,
        "fr": `Un identifiant de classe est nécessaire après extends.`,
    })

    static onlyInterfacesAfterImplements = () => le({
        "de": `Hinter implements können nur Interfaces stehen.`,
        "en": `Only interface identifiers are allowed after implements.`,
        "fr": `Seuls les identifiants d'interface sont autorisés après implements.`,
    })

    static onlyInterfacesAfterExtends = () => le({
        "de": `Hinter extends können nur Interfaces stehen.`,
        "en": `Only interface identifiers are allowed after extends.`,
        "fr": `Seuls les identifiants d'interface sont autorisés après extends.`,
    })

    static typeNotDefined = (type: string) => le({
        "de": `Der Datentyp ${type} ist hier nicht definiert.`,
        "en": `Type ${type} is not defined here.`,
        "fr": `Le type de données ${type} n'est pas défini ici.`,
    })

    static typeHasNoSubtype = (type: string, subtype: string) => le({
        "de": `Der Datentyp ${type} hat keinen Unterdatentyp ${subtype}.`,
        "en": `Type ${type} has no subtype ${subtype}.`,
        "fr": `Le type ${type} n'a pas de sous-type ${subtype}.`,
    })

    static typeIsNotVisible = (type: string) => le({
        "de": `Der Datentyp ${type} ist an dieser Stelle nicht sichtbar, da er nicht die Sichtbarkeit public besitzt.`,
        "en": `Type ${type} is not visible here.`,
        "fr": `Le type ${type} n'est pas visible ici.`,
    })

    static cantExtendFinalClass = () => le({
        "de": `Von einer final class können keine Unterklassen gebildet werden.`,
        "en": `You can't subclass a final class.`,
        "fr": `Vous ne pouvez pas créer de sous-classe à partir d'une classe finale.`,
    })

    /**
     * class JavaClass
     */
    static abstractMethodsNotImplemented = (identifier: string, methods: string) => le({
        "de": "Die Klasse " + identifier + " muss noch folgende Methoden ihrer abstrakten Oberklassen implementieren: " + methods,
        "en": "Class " + identifier + " has to implement methods of it's abstract base class: " + methods,
        "fr": `La classe ${identifier} doit encore implémenter les méthodes suivantes de ses classes de base abstraites : ${methods}.`,
    })

    static interfaceMethodsNotImplemented = (identifier: string, interf: string, methods: string) => le({
        "de": "Die Klasse " + identifier + " muss noch folgende Methoden des Interfaces " + interf + "implementieren: " + methods,
        "en": "Class " + identifier + " has to implement methods of interface " + interf + ": " + methods,
        "fr": `La classe ${identifier} doit encore implémenter les méthodes suivantes de l'interface ${interf} : ${methods}.`,
    })

    static methodOverridesFinalMethod = (identifier: string, baseClass: string) => le({
        "de": `Die Methode ${identifier} überschreibt eine als final gekennzeichnete Methode der Oberklasse ${baseClass}.`,
        "en": `Method ${identifier} overrides final method of base class ${baseClass}.`,
        "fr": `La méthode ${identifier} surcharge une méthode marquée comme finale de la classe de base ${baseClass}.`,
    })

    static overrideAnnotationNotNecessary = (identifier: string) => le({
        "de": `Die Methode ${identifier} überschreibt keine Methode mit gleicher Signatur einer Oberklasse, daher ist die @Override-Annotation unnötig.`,
        "en": `Method ${identifier} doesn't override a method with identical signature in base class, therefore @Override is not necessary here.`,
        "fr": `La méthode ${identifier} ne surcharge aucune méthode avec une signature identique dans une classe de base, par conséquent l'annotation @Override est inutile ici.`,
    })

    /**
     * class GenericTypeParameter
     */
    static parameterNotDefined = (identifier: string) => le({
        "de": `Der generische Parameter ${identifier} ist bei diesem Methodenaufruf unbestimmt.`,
        "en": `Generic parameter ${identifier} is not bound in this method invocation.`,
        "fr": `Le paramètre générique ${identifier} n'est pas lié dans cet appel de méthode.`,
    })

    static parameterContradictoryBound = (identifier: string, bounds: string) => le({
        "de": `Der generische Parameter ${identifier} hat bei diesem Methodenaufruf widersprüchliche Ausprägungen: ${bounds}`,
        "en": `Generic parameter ${identifier} is bound in a contradictory way in this method call.`,
        "fr": `Le paramètre générique ${identifier} est lié de manière contradictoire dans cet appel de méthode.`,
    })

    /**
     * class CycleFinder
     */
    static cycleInInheritenceHierarchy = (cycle: string) => le({
        "de": `In der Vererbungshierarchie gibt es einen Zyklus: ${cycle} + " Daher kann leider nicht weiterkompiliert werden.`,
        "en": `There's a inheritence-cycle: ${cycle}   ... => compilation had to be cancelled.`,
        "fr": `Il y a un cycle d'héritage : ${cycle} ... => la compilation a dû être annulée.`,
    })

    /**
     * Program
     */
    static internalError = () => le({
        "de": `Interner Fehler, siehe Konsolenausgabe des Browsers`,
        "en": `Internal error, see browser console output`,
        "fr": `Erreur interne, voir la sortie de la console du navigateur`,
    })



    /**
     * class Executable
     */

    static cyclicReferencesAmongStaticVariables = (variables: string) => le({
        "de": `Die Initialisierung mehrerer statischer Attribute aus verschiedenen Klassen ist zyklisch: ${variables}`,
        "en": `Initialization of several static fields is cyclic: ${variables}`,
        "fr": `L'initialisation de plusieurs champs statiques est cyclique : ${variables}.`,
    })

    /**
     * Exceptions
     */

    static charIndexOutOfBounds = () => lm({
        "de": `Zugriff auf Zeichen außerhalb des zulässingen Bereichs`,
        "en": `char index out of bounds`,
        "fr": `Index de caractère hors limites`,
    })

    static divideByZero = () => lm({
        "de": `Teilen durch 0 nicht möglich`,
        "en": `division by zero not allowed`,
        "fr": `Division par zéro non autorisée`,
    })

    static threadWantsToWaitAndHasNoLockOnObject = () => lm({
        "de": `Es wurde wait für ein Objekt aufgerufen, für das der aktuelle Thread kein Lock besitzt.`,
        "en": `Wait called on Object for which thread holds no lock.`,
        "fr": `Wait a été appelé sur un objet pour lequel le thread actuel ne possède aucun verrou.`,
    })

    static threadWantsToNotifyAndHasNoLockOnObject = () => lm({
        "de": `Es wurde notify für ein Objekt aufgerufen, für das der aktuelle Thread kein Lock besitzt.`,
        "en": `Notify called on Object for which thread holds no lock.`,
        "fr": `Notify a été appelé sur un objet pour lequel le thread actuel ne possède aucun verrou.`,
    })
    /**
     * TokenType
     */

    static identifier = () => lm({
        "de": `Bezeichner (engl.: identifier)`,
        "en": `identifier`,
        "fr": `identifiant`,
    })

    static floatingPointLiteral = () => lm({
        "de": `Fließkomma-Konstante`,
        "en": `floating point literal`,
        "fr": `littéral à virgule flottante`,
    })

    static booleanLiteral = () => lm({
        "de": `boolesche Konstante (d.h. true oder false)`,
        "en": `boolean literal (that is: true or false)`,
        "fr": `littéral booléen (c'est-à-dire : true ou false)`,
    })

    static stringLiteral = () => lm({
        "de": `Zeichenketten-Konstante`,
        "en": `String literal`,
        "fr": `littéral de chaîne`,
    })

    static charLiteral = () => lm({
        "de": `Char-Konstante`,
        "en": `char literal`,
        "fr": `littéral de caractère`,
    })

    static space = () => lm({
        "de": `ein Leerzeichen`,
        "en": `space character`,
        "fr": `un caractère d'espace`,
    })

    static tab = () => lm({
        "de": `ein Tabulatorzeichen`,
        "en": `tab character`,
        "fr": `un caractère de tabulation`,
    })

    static linebreak = () => lm({
        "de": `ein Zeilenumbruch`,
        "en": `line break`,
        "fr": `un saut de ligne`,
    })

    static aToZ = () => lm({
        "de": `eines der Zeichen a..z, A..Z, _`,
        "en": `one of a..z, A..Z, _`,
        "fr": `un des caractères a..z, A..Z, _`,
    })

    static comment = () => lm({
        "de": `eine Kommentar`,
        "en": `a comment`,
        "fr": `un commentaire`,
    })

    static endOfText = () => lm({
        "de": `das Ende des Programms`,
        "en": `end of sourcecode`,
        "fr": `fin du code source`,
    })

    static dd = () => lm({
        "de": ``,
        "en": ``,
        "fr": ``, // Leaving empty as per original
    })

    /**
     * JavaTypeStore
     */
    static primitiveType = () => lm({
        "de": "Primitiver Datentyp",
        "en": "primitive type",
        "fr": "type primitif"
    })

    static genericType = () => lm({
        "de": "Generischer Datentyp",
        "en": "generic type",
        "fr": "type générique"
    })

    static class = () => lm({
        "de": "Klass", // Original DE has typo "Klass" instead of "Klasse"
        "en": "class",
        "fr": "classe",
    })

    static enum = () => lm({
        "de": "Enum",
        "en": "enum",
        "fr": "enum",
    })

    static interface = () => lm({
        "de": "Interface",
        "en": "interface",
        "fr": "interface",
    })

    static nullType = () => lm({
        "de": "Der Wert null",
        "en": "null value",
        "fr": "valeur nulle",
    })

/**
 * Quickfixes
 */
    static ReplaceTokenQuickfixDefaultMessage = (toReplace: string, replaceBy: string) => lm({
        "de": `Ersetze ${toReplace} durch ${replaceBy}.`,
        "en": `Replace ${toReplace} by ${replaceBy}.`,
        "fr": `Remplacez ${toReplace} par ${replaceBy}.`,
    })

}