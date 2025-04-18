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
        "en": "Couldn't compute type of left operand."
    });

    static typeRightOperandNotFound = () => le({
        "de": "Der Typ des rechten Operanden kann nicht bestimmt werden.",
        "en": "Couldn't compute type of right operand."
    });

    static operatorNotFeasibleForOperands = (operatorIdentifier: string, lIdentifier: string, rIdentifier: string) => le({
        "de": "Der Operator " + operatorIdentifier + " ist für die Typen " + lIdentifier + " und " + rIdentifier + " nicht geeignet.",
        "en": "Operator " + operatorIdentifier + " is not defined for operands of type " + lIdentifier + " and " + rIdentifier + ".",
    });

    static rightSideOfInstanceofError = () => le({
        "de": "Rechts vom Operator instanceof muss eine Klasse/ein Interface/ein Enum-Typ stehen.",
        "en": "Class/interface/enum-type expected on righthand side of operator instanceof.",
    });

    static leftSideOfInstanceofError = () => le({
        "de": "Links vom Operator instanceof muss ein Objekt stehen.",
        "en": "Object expected on righthand side of operator instanceof.",
    });

    static cantAssignValueToTerm = () => le({
        "de": "Dem Term auf der linken Seite des Zuweisungsoperators kann nichts zugewiesen werden.",
        "en": "Can't assign value to expression on left side of assignment operator.",
    });

    static cantCastRightSideToString = () => le({
        "de": "Der Term auf der rechten Seite des Zuweisungsoperators kann nicht in den Typ String umgewandelt werden.",
        "en": "Can't cast expression on right side of assignment operator to type String.",
    })

    static leftOperatorNotFitForAttribute = (operator: string) => le({
        "de": "Mit dem Attribut/der Variablen auf der linken Seite des Zuweisungsoperators kann die Berechnung " + operator + " nicht durchgeführt werden.",
        "en": "Field/variable on left side of operator " + operator + " is not usable for this operation.",
    })

    static rightOperatorNotFitForAttribute = (operator: string) => le({
        "de": "Mit dem Attribut/der Variablen auf der rechten Seite des Zuweisungsoperators kann die Berechnung " + operator + " nicht durchgeführt werden.",
        "en": "Field/variable on right side of operator " + operator + " is not usable for this operation.",
    })

    static cantUseOperatorForLeftRightTypes = (operator: string) => le({
        "de": "Der Wert des Datentyps auf der rechten Seite des Operators " + operator + " kann mit der Variablen/dem Attribut auf der linken Seite nicht verrechnet werden.",
        "en": "Can't use operator " + operator + " for types of given left/right side operands.",
    })

    static cantCastType = (srcIdentifier: string, destIdentifier: string) => le({
        "de": "Der Typ " + srcIdentifier + " kann nicht in den Typ " + destIdentifier + " gecastet werden.",
        "en": `Can't cast ${srcIdentifier} to ${destIdentifier}.`,
    })

    static unneccessaryCast = () => le({
        "de": `Unnötiges Casten`,
        "en": `Unneccessary cast`,
    })

    static leftExpressionHasNoType = (operator: string) => le({
        "de": "Der Term auf der linken Seite des '" + operator + "' - Operators hat keinen Datentyp. ",
        "en": `Expression on left side of operator '${operator}' has no type.`,
    })

    static rightExpressionHasNoType = (operator: string) => le({
        "de": "Der Term auf der rechten Seite des '" + operator + "' - Operators hat keinen Datentyp. ",
        "en": `Expression on right side of operator '${operator}' has no type.`,
    })

    static cantGetTypeOfExpression = () => le({
        "de": "Der Typ des Terms kann nicht bestimmt werden.",
        "en": `Can't compute type of this expression.`,
    })

    static operatorNotUsableForOperands = (operator: string, type: string) => le({
        "de": "Der Operator " + operator + " ist nicht für den Operanden des Typs " + type + "geeignet.",
        "en": `Operator ${operator} is not usable for operands of type ${type}.`,
    })

    static notOperatorNeedsBooleanOperands = (type: string) => le({
        "de": "Der Operator ! (not) ist nur für boolesche Operanden geeignet, nicht für Operanden des Typs " + type + ".",
        "en": `Operator ! (not) needs boolean operands, but given operands are of type ${type}.`,
    })

    static plusPlusMinusMinusOnlyForLeftyOperands = (operatorAsString: string) => le({
        "de": "Der Operator " + operatorAsString + " ist nur für Variablen/Attribute geeignet, deren Wert verändert werden kann.",
        "en": `Operator ${operatorAsString} can only be used for fields/variables which are writable.`,
    })

    static badOperandTypesForBinaryOperator = (operatorAsString: string, firstType: string, secondType: string) => le({
        "de": "Der Operator " + operatorAsString + " ist für Operanden der Typen " + firstType + " und " + secondType + " nicht definiert.",
        "en": `Operator ${operatorAsString} is not defined for operands of type ${firstType} and ${secondType}.`,
    })

    /**
     * Messages for Java CodeGenerator
     */

    static interfaceOnlyDefaultMethodsHaveBody = () => le({
        "de": `In Interfaces können nur default-Methoden einen Methodenrumpf haben.`,
        "en": `In interfaces only default methods have a method body. `
    })

    static enumConstructorsMustBePrivate = () => le({
        "de": "Konstruktoren von enums müssen die Sichtbarkeit private haben.",
        "en": `Enum constructors must be private.`,
    })

    static interfaceFieldsMustBeStatic = () => le({
        "de": "Interfaces können nur statische konstante (final) Attribute besitzen.",
        "en": "Interface fields must be static final.",
    })

    static cantFindConstructor = () => le({
        "de": "Es konnte kein passender Konstruktor mit dieser Signatur gefunden werden.",
        "en": `Cant find constructor.`,
    })

    static cantInstantiateFromAbstractClass = () => le({
    "de": `Von einer abstrakten Klasse kann man keine Objekte instanzieren.`,
    "en": `You can't create objects of an abstract class.`,
    })

    static interfacesDontHaveConstructors = () => le({
        "de": `Interfaces haben keinen Konstruktor.`,
        "en": `Interfaces don't have construtctors.`,
    })

    static methodImitatesConstructor = (identifier: string) => le({
        "de": "Die Methode " + identifier + " trägt denselben Bezeichner wie die Klasse, hat aber einen Rückgabewert und ist damit KEIN Konstruktor. Das ist irreführend.",
        "en": "Method " + identifier + " has same identifier as class and an return type. Therefore it is no constructor. This is irritating."

    })

    static abstractMethodsDontHaveMethodBodies = () => le({
        "de": "Eine abstrakte Methode kann keinen Methodenrumpf besitzen.",
        "en": `Abstract methods don't have method bodies.`,
    })

    static superCallInConstructorMissing = (baseClass: string) => le({
        "de": `Da die Oberklasse ${baseClass} keinen parameterlosen Konstruktor hat, muss in jedem Konstruktor einer Unterklasse gleich zu Beginn der Aufruf eines Konstruktors der Oberklasse erfolgen (super(...)).`,
        "en": ``,
    })

    static lambdaFunctionHereNotPossible = () => le({
        "de": "Eine Lambda-Funktion darf nur an einer Stelle im Code stehen, an der ein functional interface (d.h. ein Interface mit genau einer Methode) erwartet wird.",
        "en": `Lambda functions are only usable in places where a functional interface (that is: a interface with only one method) is expected.`,
    })

    static lambdaFunctionWrongParameterCount = (actualCount: number, expectedCount: number, functionalInterface: string) => le({
        "de": `Die Anzahl der Parameter der Lambda-Funktion (${actualCount}) stimmt nicht mit der des functional interfaces ${functionalInterface} (${expectedCount}) überein.`,
        "en": `Number of parameters of lambda function (${actualCount}) doesn't match number of parameters of functional interfaces ${functionalInterface} (${expectedCount}).`,
    })

    static lambdaFunctionWrongParameterType = (identifier: string, type: string) => le({
        "de": `Der Datentyp des Parameters ${identifier} passt nicht zum erwarteten Datentyp ${type}.`,
        "en": `Parameter ${identifier} has wrong type. Expected type: ${type}.`,
    })

    static arrayLiteralTypeUnknown = () => le({
        "de": `Der erwartete Datentyp der Array-Elemente kann nicht ermittelt werden.\n Tipp: Versuchen Sie es mit der Syntax 'new int[]{1, 2, 3}'`,
        "en": `Can't figure out exptected type of array elements.\nHint: Try syntax 'new int[]{1, 2, 3}'.`,
    })


    /**
     * Messages for class CodePrinter:
     */

    static missingProgram = () => le({
        "de": `//Kein Programm vorhanden.`,
        "en": `//Missing program.`,
    })

    /**
     * Messages for class MissingStatementsManager
     */

    static variableNotInitialized = (identifier: string) => le({
        "de": "Die Variable/der Parameter " + identifier + " is vor diesem lesenden Zugriff noch nicht initialisiert worden.",
        "en": `Variable/field ${identifier} had not been initialized before first read access.`,
    })

    static noReadAccessForVariable = (identifier: string) => le({
        "de": "Auf die Variable/den Parameter " + identifier + " wird nie lesend zugegriffen.",
        "en": `No read access on variable/field ${identifier}.`,
    })

    static returnStatementMissing = (identifier: string, type: string) => le({
        "de": "Die Methode " + identifier + " muss einen Wert vom Typ " + type + " zurückliefern. In einem der Ausführungszweige fehlt ein entsprechendes return-statement.",
        "en": `Method ${identifier} must return value of type ${type}. Return statement is missing in at least one program branch.`,
    })


    /**
     * Messages for class StatementCodeGenerator
     */


    static cantRedeclareVariableError = (identifier: string) => le({
    "de": "Die Variable " + identifier + " wurde zweifach deklariert.",
    "en": "Variable " + identifier + " had been declared twice.",
    })

    static breakNotExpected = () => le({
        "de": "An dieser Stelle kann kein break stehen, da der Ausdruck nicht innerhalb einer Schleife (for, while, do) oder switch-case Anweisung steht.",
        "en": `break statement is only expected inside loops (for, while, do...while) and switch-statements.`,
    })

    static noVariableDeclarationWhileProgramIsRunning = () => le({
        "de": "Während ein Programm läuft (oder pausiert ist) kann keine Variable in der Konsole deklariert werden.",
        "en": `You can't declare a variable while a program is running (or paused).`,
    })

    static continueNotExpected = () => le({
        "de": "An dieser Stelle kann kein continue stehen, da der Ausdruck nicht innerhalb einer Schleife (for, while, do) oder switch-case Anweisung steht.",
        "en": `continue statement is only expected inside loops (for, while, do...while) and switch-statements.`,
    })

    static returnNotExpected = () => le({
        "de": "Eine return-Anweisung ist nur innerhalb einer Methode sinnvoll.",
        "en": `return statement outside method context`,
    })

    static returnValueNotExpected = () => le({
        "de": "Die Methode erwartet keinen Rückgabewert, hier ist aber einer angegeben.",
        "en": `Method doesn't expect return value.`,
    })

    static returnValueExpected = (type: string) => le({
        "de": "Die Methode erwartet einen Rückgabewert vom Typ " + type + ", hier wird aber keiner übergeben.",
        "en": `Missing return value of type ${type}.`,
    })

    static wrongReturnValueType = (expected: string, actual: string) => le({
        "de": "Die Methode erwartet einen Rückgabewert vom Typ " + expected + ", der Wert des Terms hat aber den Datentyp " + actual + ".",
        "en": `Expression of type ${actual} found, but return value of type ${expected} expected.`,
    })

    static wrongArrayElementType = (elementType: string, elementIdentifier: string, arrayElementType: string) => le({
        "de": `Der Typ ${elementType} des Elements ${elementIdentifier} muss mit dem Elementtyp des Arrays (${arrayElementType}) übereinstimmen. Tipp: Verwende das var-Schlüsselwort, also for(var element: array){...}`,
        "en": `Type ${elementType} of element ${elementIdentifier} doesn't fit to element type of array (${arrayElementType}). Hint: use var-keyword (for(var element: array)){...}`,
    })

    static wrongCollectionElementType = (elementType: string, elementIdentifier: string, collectionElementType: string) => le({
        "de": `Der Typ ${elementType} des Elements ${elementIdentifier} muss mit dem Elementtyp des Collections (${collectionElementType}) übereinstimmen. Tipp: Verwende das var-Schlüsselwort, also for(var element: collection){...}`,
        "en": `Type ${elementType} of element ${elementIdentifier} doesn't fit to element type of collection (${collectionElementType}). Hint: use var-keyword (for(var element: collection)){...}`,
    })

    static cantComputeArrayElementType = (collectionType: string) => le({
        "de": `Der Elementtyp des Arrays ${collectionType} kann nicht bestimmt werden.`,
        "en": `Can't compute element type of array ${collectionType}.`,
    })

    static cantComputeCollectionElementType = (collectionType: string) => le({
        "de": `Der Elementtyp der Collection ${collectionType} kann nicht bestimmt werden.`,
        "en": `Can't compute element type of collection ${collectionType}.`,
    })

    static elementTypeDoesntFitToIterable = (elementType: string, elementIdentifier: string, collectionElementType: string) => le({
        "de": `Der Typ ${elementType} des Elements ${elementIdentifier} muss mit dem Elementtyp des Iterables(${collectionElementType}) übereinstimmen. Tipp: Verwende das var-Schlüsselwort, also for(var element: array){...}`,
        "en": `Type ${elementType} of element ${elementIdentifier} must be identical to type of Iterable (${collectionElementType}). Hint: use var keyword, for example: for(var element: iterable){...}`,
    })

    static enhancedForLoopOnlyForArraysCollectionsIterables = () => le({
        "de": "Die vereinfachte for-loop kann nur über Arrays iterieren oder über Klassen, die das Interface Iterable implementieren.",
        "en": `Enhanced for-loops are only possible for arrays, collections and iterables.`,
    })

    static booleanTermExpected = (actualType: string) => le({
        "de": "Hier wird eine Bedingung erwartet, deren Wert true oder false ergibt. Der Datentyp dieses Terms ist " + actualType,
        "en": `Boolean value expected, but expression of type ${actualType} found.`,
    })

    static enumIdentifierUnknown = (enumType: string, elementIdentifier: string) => le({
        "de": `Der Enum-Typ ${enumType} hat kein Element mit dem Bezeichner ${elementIdentifier}.`,
        "en": `Enum-type ${enumType} has no element with identifier ${elementIdentifier}.`,
    })

    static valueNotComputable = () => le({
        "de": "Der Wert des Ausdrucks ist nicht ermittelbar.",
        "en": `Can't compute value.`,
    })

    static constantValueExpectedAfterCase = () => le({
        "de": "Nach case dürfen nur konstante Ausdrücke stehen, z.B. eine feste Zahl oder Zeichenkette. Wenn du an dieser Stelle etwas anderes (einen Term oder eine Variable) verwenden möchtest, informiere dich über sogenannten constant expressions in Java.",
        "en": `Constant value expected.`,
    })

    static caseValueDoesntFitToSwitchValue = (expected: string, actual: string) => le({
        "de": `Ich erwarte hier einen Ausdruck vom Typ ${expected} - dem Datentyp des Switch-Ausdrucks - bekomme aber einen Ausdruck vom Typ ${actual}.`,
        "en": `Value of type ${expected} expected (this is type inside switch()-expression), but found value of type ${actual}.`,
    })

    static switchOnlyFeasibleForTypes = () => le({
        "de": "Die Anweisung switch(x) ist nur möglich, wenn x den Typ int, String, oder enum hat.",
        "en": `Switch statement (switch) is only feasible for expression x of type int, String or enum.`,
    })

    static cantAssignArrayLiteralToNonArrayVariable = () => le({
        "de": `Der Typ der deklarierten Variable ist kein Array, daher kann ihr auch kein Array-Literal zugewiesen werden.`,
        "en": `Declared variable has no array type, therefore you can't assign a array literal.`,
    })

    static localVariableDeclarationWrongInitializerType = (actual: string, expected: string) => le({
        "id": "cantAssignValueToLocalVariable",
        "de": "Der Term auf der rechten Seite des Zuweisungsoperators hat den Datentyp " + actual + " und kann daher der Variablen auf der linken Seite (Datentyp " + expected + ") nicht zugewiesen werden.",
        "en": `Can't assign value of type ${actual} to local variable of type ${expected}.`,

    })

    /**
     * Error messages in class TermCodeGenerator
     */

    static localVariableUsedBeforeDeclaration = (variable: string) => le({
        "de": `Die Variable ${variable} wurde vor ihrer Deklaration verwendet.`,
        "en": `Variable ${variable} is used before it's declaration.`,
    })

    static superOnlyInClassesOrEnums = () => le({
        "de": `Das Schlüsselwort super ist nur innerhalb einer Klasse oder eines Enum sinnvoll.`,
        "en": `Keyword super is only usable in classes and enums.`,
    })

    static thisOnlyInClassesOrEnums = () => le({
        "de": `Das Schlüsselwort this ist nur innerhalb einer Klasse oder eines Enum sinnvoll.`,
        "en": `Keyword this is only usable in classes and enums.`,
    })

    static cantCastFromTo = (from: string, to: string) => le({
        "de": `Casten von ${from} nach ${to} ist nicht möglich.`,
        "en": `Can't cast from ${from} to ${to}.`,
    })

    static objectContextNeededForInstantiation = (klass: string, contextNeeded: string) => le({
        "de": `Zum Instanzieren eines Objekts der Klasse ${klass} wird ein Objektkontext der Klasse ${contextNeeded} benötigt.`,
        "en": `You need objectcontext ${contextNeeded} to instantiate a object of type ${klass}.`,
    })

    static noArrayBracketAfterType = (type: string) => le({
        "de": `Vor [ muss ein Array stehen. Dieser Term hat aber den Typ ${type}`,
        "en": `Type ${type} is no array type, therefore [ is not expected here.`,
    })

    static wrongArrayDimensionCount = (expected: number, actual: number) => le({
        "de": `Das Array hat die Dimension ${expected}, hier stehen aber ${actual} Längenangaben in den eckigen Klammern.`,
        "en": `Array has dimension ${expected}, but ${actual} length-values found inside square brackets ([...]).`,
    })

    static indexMustHaveIntegerValue = () => le({
        "de": "Als Array-Index wird ein ganzzahliger Wert erwartet.",
        "en": `Array-Index must have integer value.`,
    })

    static integerValueExpected = (foundType: string) => le({
        "de": "Hier wird eine Ganzzahl erwartet (Datentypen byte, short, int, long). Gefunden wurde " + foundType + ".",
        "en": `Integer value expected (type byte, short, int or long), but found: ${foundType}`,
    })

    static declaredArrayDimensionDoesNotFitArrayLiteral = (typeDimension: number, literalDimension: number) => le({
        "de": `Die Dimension ${typeDimension} bei der Deklaration des Arrays stimmt nicht mit der des Array-Literals (${literalDimension} überein.)`,
        "en": `Dimension ${typeDimension} does not match dimension of array literal (${literalDimension}).`,
    })

    static arrayLiteralElementsNotSameDimension = () => le({
        "de": `Die Elemente des Array-Literals haben unterschiedliche Dimension.`,
        "en": `Elements of array literal don't have same dimension.`,
    })

    static arrayLiteralElementDimensionWrong = () => le({
        "de": `Dieses Element des Array-Literals sollte kein Array sein.`,
        "en": `This particular element of the array literal must be no array itself.`,
    })

    static cantCastTermTo = (destType: string) => le({
        "de": `Der Term kann nicht in den Typ ${destType} umgewandelt werden.`,
        "en": `Can't cast expression to type ${destType}.`,
    })

    static cantUseNonstaticFieldsToInitializeStaticOne = () => le({
        "de": "Zum Initialisieren eines statischen Attributs können keine nichtstatischen Attribute benutzt werden.",
        "en": `Can't use non-static fields to initialize static field.`,
    })

    static attributeHasWrongVisibility = (identifier: string, visibility: string) => le({
        "de": "Das Attribut " + identifier + " hat die Sichtbarkeit " + visibility + " und kann daher hier nicht verwendet werden.",
        "en": "Field " + identifier + " has Visibility " + visibility + ", therefore it is not visible here.",
    })

    static identifierNotKnown = (identifier: string) => le({
        "de": "Der Bezeichner " + identifier + " ist an dieser Stelle nicht definiert.",
        "en": "Identifier " + identifier + " unknown.",
    })

    static plusPlusMinusMinusOnlyForVariables = () => le({
        "de": "Die Operatoren ++ und -- können nur bei Variablen benutzt werden, die veränderbar sind.",
        "en": `Operators ++ and -- can only operate on variables.`,
    })

    static colonExpectedAfterTernaryOperator = () => le({
        "de": `Nach dem Fragezeichenoperator ? ('ternary operator') wird ein : erwartet. Beispiel: Der Term a < b ? 10 : 12 hat den Wert 10, wenn a < b ist und 12 andernfalls.`,
        "en": `Colon (:) expected after ternary operator (?). Example: The value of a < b ? 10 : 12 is 10 if a < b and 12 otherwise.`,
    })

    static booleanOperandOnTernaryOperatorLefthand = () => le({
        "de": `Der Term links vom Fragezeichenoperator ? (ternary operator) muss einen booleschen Wert besitzen.`,
        "en": `Boolean value expected on left side of ternary operator (?).`,
    })

    static ternaryOperatorTypesNotCompatible = () => le({
        "de": `Die Typen der Operanden b und c beim Ausdruck a ? b : c sind im gegebenen Fall zu unterschiedlich.`,
        "en": `Types b and c in expression a ? b : c are not compatible to each other.`,
    })

    static plusPlusMinusMinusOnlyForTypes = () => le({
        "de": "Die Operatoren ++ und -- können nur bei Variablen mit den Datentypen byte, short, int, long, float und double benutzt werden.",
        "en": `Operators ++ and -- can only operate on types byte, short, int, long, float and double.`,
    })

    static arraysOnlyHaveLengthField = (fieldIdentifier: string) => le({
        "de": "Arrays haben nur das Attribut length. Das Attribut " + fieldIdentifier + " ist bei Arrays nicht vorhanden.",
        "en": `Arrays don't have field ${fieldIdentifier}. They have field length ...`,
    })

    static typeHasNoFields = (type: string) => le({
        "de": `Der Datentyp ${type} hat keine Attribute.`,
        "en": `Type ${type} has no fields.`,
    })

    static fieldUnknown = (identifier: string) => le({
        "de": `Das Objekt hat kein Attribut mit dem Bezeichner ${identifier}.`,
        "en": `Object has no field ${identifier}.`,
    })

    static methodCallOutsideClassNeedsDotSyntax = () => le({
        "de": "Außerhalb einer Klasse kann eine Methode nur mit Punktschreibweise (Object.Methode(...)) aufgerufen werden.",
        "en": `Method call outside class is only possible with dot syntax.`,
    })

    static methodHasWrongVisibility = (identifier: string, visibility: string) => le({
        "de": "Die Methode " + identifier + " hat die Sichtbarkeit " + visibility + " und kann daher hier nicht aufgerufen werden.",
        "en": "Method " + identifier + " has Visibility " + visibility + ", therefore it is not visible here.",
    })

    static cantFindMethod = () => le({
        "de": "Es konnte keine passende Methode mit diesem Bezeichner/mit dieser Signatur gefunden werden.",
        "en": `Can't find method with this identifier and signature.`,
    })

    static assertCodeReachedNeedsStringParameter = () => le({
        "de": "Die Methode assertCodeReached benötigt genau einen konstanten Parameter vom Typ String.",
        "en": `Method assertCodeReached needs parameter of type String.`,
    })

    /**
     * class Lexer
     */

    static expectingEndOfCharConstant = () => le({
        "de": "Das Ende der char-Konstante wird erwartet (').",
        "en": `Expecting end of char literal (').`,
    })

    static endOfLineInsideStringLiteral = () => le({
        "de": 'Innerhalb einer String-Konstante wurde das Zeilenende erreicht.',
        "en": `End of line inside String literal.`,
    })

    static endOfTextInsideStringLiteral = () => le({
        "de": 'Innerhalb einer String-Konstante wurde das Textende erreicht.',
        "en": `End of text inside String literal.`,
    })

    static endOfTextInsideJavadocComment = () => le({
        "de": "Innerhalb eines Mehrzeilenkommentars (/*... */) wurde das Dateiende erreicht.",
        "en": `End of text inside JavaDoc comment (/*... */).`,
    })

    static charactersAfterMultilineStringLiteralStart = () => le({
        "de": 'Eine Java-Multiline-Stringkonstante beginnt immer mit """ und einem nachfolgenden Zeilenumbruch. Alle nach """ folgenden Zeichen werden überlesen!',
        "en": `A multiline String-literal starts with """ followed by a line braek. Characters in between """ and line break are discarded.`,
    })

    static unknownEscapeSequence = (hex: string) => le({
        "de": 'Die Escape-Sequenz \\' + hex + ' gibt es nicht.',
        "en": `Unknown escape sequence \\${hex}`,
    })

    static wrongFloatConstantBegin = () => le({
        "de": "Eine float/double-Konstante darf nicht mit 0, 0b oder 0x beginnen.",
        "en": `Float literals must not start with 0, 0b or 0x.`,
    })

    /**
     * class Parser
     */

    static unexpectedToken = (token: string) => le({
        "de": "Mit dem Token " + token + " kann der Compiler nichts anfangen.",
        "en": `Unexpected token: ${token}`,
    })

    static fieldDefinitionDoesntStartWithGenericParamter = () => le({
        "de": "Vor Attributen kann keine Definition generischer Parameter stehen.",
        "en": `Field definition mustn't start with generic parameter definition.`,
    })

    static multipleVisibilityModifiers = (modifiers: string) => le({
        "de": `Es ist nicht zulässig, mehrere visibility-modifiers gleichzeitig zu setzen (hier: ${modifiers}).`,
        "en": `More than one visibility modifier found: ${modifiers}`,
    })

    /**
     * class StatementParser
     */

    static loopOverEmptyStatement = () => le({
        "de": "Hier wird eine leere Anweisung (; oder {  }) wiederholt.",
        "en": `Loop over empty statement (; or {  }).`,
    })

    static noMethodDeclarationAllowedHere = () => le({
        "de": "Hier ist keine Methodendeklaration möglich.",
        "en": "No method declaration allowed here."
    })

    static constantMissingInCaseStatement = () => le({
        "de": "In diesem Case-Block fehlt zwischen case und dem Doppelpunkt die Konstante.",
        "en": `Constant missing between case and colon.`,
    })

    static statementOrBlockExpected = () => le({
        "de": "Hier wird eine Anweisung oder ein Anweisungsblock (in geschweiften Klammern) erwartet.",
        "en": `Statement or block-Statement in curly braces { ... } expected.`,
    })

    static wrongSyntaxAfterKeywordNew = () => le({
        "de": "Es wird die Syntax new Klasse(Parameter...) oder new Typ[ArrayLänge]... erwartet.",
        "en": `Keyword new has syntax new Class(parameters...) or new ArrayType[length].`,
    })

    static secondOperandExpected = (operator: string) => le({
        "de": "Rechts vom binären Operator " + operator + " wird ein zweiter Operand erwartet.",
        "en": `Expecting second Operand on right side of binary operator ${operator}.`,
    })

    static dotOperatorNotExpected = () => le({
        "de": "Der Punkt-Operator wird hier nicht erwartet.",
        "en": `Dot operator (.) not expected`,
    })

    static squareBracketExpected = () => le({
        "de": "[ oder [] erwartet.",
        "en": `[ or [] expected`,
    })

    static firstArrayDimensionMustNotBeZero = () => le({
        "de": "Die Länge der ersten Array-Dimension darf nicht 0 sein.",
        "en": `Length of first array dimension must not be 0.`,
    })

    /**
     * class TokenIterator
     */

    static expectedOtherToken = (expected: string, actual: string) => le({
        "de": `Erwartet wird: ${expected} - Gefunden wurde: ${actual}`,
        "en": `Expected token: ${expected} - Found: ${actual}`,
    })

    static expectedOtherTokens = (expected: string, actual: string) => le({
        "de": `Erwartet wird eines der Token: ${expected} - Gefunden wurde: ${actual}`,
        "en": `Expected tokens: ${expected} - Found: ${actual}`,
    })

    static insertSemicolonHere = () => lm({
        "de": `Strichpunkt hier einfügen`,
        "en": `Insert semicolon here`,
    })

    static semicolonExpected = (found: string) => le({
        "de": `Erwartet wird ein Strichpunkt (Semicolon). Gefunden wurde: ${found}`,
        "en": `Semicolon (;) expected. Found: ${found}`,
    })

    static identifierExpected = (found: string) => le({
        "de": `Erwartet wird ein Bezeichner (engl.: 'identifier'), d.h. der Name einer Klasse, Variable, ... . Gefunden wurde: ${found}`,
        "en": `Identifier (that is: name of variable, class, ...) expected. Found: ${found}`,
    })

    /**
     * TypeResolver
    */

    static multipleFieldsWithSameIdentifier = (signature: string, otherLineNumber: number) => le({
        "de": `Es gibt in dieser Klasse/diesem enum ein weiteres Attribut mit dem Bezeichner ${signature} in Zeile ${otherLineNumber}.`,
        "en": `There's another field with signature ${signature} in this class/this enum (line ${otherLineNumber}).`,
    })

    static multipleMethodsWithSameSignature = (signature: string, otherLineNumber: number) => le({
        "de": `Es gibt in dieser Klasse/diesem Interface/diesem enum eine weitere Methode mit der Signatur ${signature} in Zeile ${otherLineNumber}.`,
        "en": `There's another method for this class/interface/enum with signature ${signature} in line ${otherLineNumber}.`,
    })

    static typenameAlreadyInUse = (name: string, otherPosition: IRange, otherFilename: string) => le({
        "de": `Es gibt einen weiteren Datentyp mit Bezeichner ${name}. Er findet sich in der Datei ${otherFilename} in Zeile ${otherPosition.startLineNumber}.`,
        "en": `Identifier ${name} for this type is already in use. See File ${otherFilename}, line ${otherPosition.startLineNumber}.`,
    })

    static typenameUsedInLibrary = (name: string) => le({
        "de": `Es gibt in der API bereits einen Typ (Klasse/Interface/Enum) mit dem Bezeichner ${name}.`,
        "en": `Identifier ${name} is already used in the API.`,
    })

    static typeIsNotGeneric = (type: string) => le({
        "de": `Der Datentyp ${type} ist nicht generisch, daher können keine Typparameter in <...> angegeben werden.`,
        "en": `Type ${type} is not generic, therefore type parameters in <...> are not possible.`,
    })

    static genericTypeWithNonGenericReference = (type: string) => le({
        "de": `Der Datentyp ${type} ist generisch, wird hier aber in nicht-generischer Art gebraucht. Es sollten die Werte der generischen Typparameter in <...> angegeben werden.`,
        "en": `Type ${type} is generic, but used in a non-generic way here. You should add type parameter values in <...>.`,
    })

    static wrongNumberOfGenericParameters = (type: string, expected: number, actual: number) => le({
        "de": `Der Datentyp ${type} hat ${expected} generische Parameter, hier werden aber ${actual} konkrete Datentypen dafür angegeben.`,
        "en": `Type ${type} has ${expected} generic parameters. Found: ${actual} types.`,
    })

    static noPrimitiveTypeForGenericParameter = (type: string) => le({
        "de": `Als konkreter Typ für einen generischen Typparameter kann kein primitiver Datentyp (hier: ${type}) verwendet werden.`,
        "en": `Can't use primitive Type ${type} for generic parameter.`,
    })

    static actualGenericParameterNotSpecified = (typeIdentifier: string, genericParameterIdentifier: string) => le({
        "de": `Für den generischen Parameter ${genericParameterIdentifier} der Klasse/des Interfaces ${typeIdentifier} muss ein konkreter Typ angegeben werden.`,
        "en": `Actual Type missing for generic Parameter ${genericParameterIdentifier} of class/interface ${typeIdentifier}.`,
    })

    static cantReplaceGenericParamterBy = (genericParameter: string, replacedBy: string) => le({
        "de": `Der generische Typparameter ${genericParameter} kann nicht durch den Typ ${replacedBy} ersetzt werden.`,
        "en": `Can't replace generic typeparameter ${genericParameter} with type ${replacedBy}.`,
    })


    static onlyClassesOrInterfacesAsUpperBounds = () => le({
        "de": `Nur Klassen und Interfaces können als upper bound für einen generischen Typparameter verwendet werden.`,
        "en": `Only classes and interfaces can be used as upper bound for generic parameter.`,
    })

    static onlyClassesOrInterfacesAsLowerBounds = () => le({
        "de": `Nur Klassen und Interfaces können als lower bound für einen generischen Typparameter verwendet werden.`,
        "en": `Only classes and interfaces can be used as lower bound for generic parameter.`,
    })

    static afterExtendsClassNeeded = () => le({
        "de": `Hinter extends muss eine Klasse stehen.`,
        "en": `After extends a class identifier is needed.`,
    })

    static onlyInterfacesAfterImplements = () => le({
        "de": `Hinter implements können nur Interfaces stehen.`,
        "en": `Only interface identifiers are allowed after implements.`,
    })

    static onlyInterfacesAfterExtends = () => le({
        "de": `Hinter extends können nur Interfaces stehen.`,
        "en": `Only interface identifiers are allowed after extends.`,
    })

    static typeNotDefined = (type: string) => le({
        "de": `Der Datentyp ${type} ist hier nicht definiert.`,
        "en": `Type ${type} is not defined here.`,
    })

    static typeHasNoSubtype = (type: string, subtype: string) => le({
        "de": `Der Datentyp ${type} hat keinen Unterdatentyp ${subtype}.`,
        "en": `Type ${type} has no subtype ${subtype}.`
    })

    static typeIsNotVisible = (type: string) => le({
        "de": `Der Datentyp ${type} ist an dieser Stelle nicht sichtbar, da er nicht die Sichtbarkeit public besitzt.`,
        "en": `Type ${type} is not visible here.`
    })

    static cantExtendFinalClass = () => le({
    "de": `Von einer final class können keine Unterklassen gebildet werden.`,
    "en": `You can't subclass a final class.`,
    })

    /**
     * class JavaClass
     */
    static abstractMethodsNotImplemented = (identifier: string, methods: string) => le({
        "de": "Die Klasse " + identifier + " muss noch folgende Methoden ihrer abstrakten Oberklassen implementieren: " + methods,
        "en": "Class " + identifier + " has to implement methods of it's abstract base class: " + methods,
    })

    static interfaceMethodsNotImplemented = (identifier: string, interf: string, methods: string) => le({
        "de": "Die Klasse " + identifier + " muss noch folgende Methoden des Interfaces " + interf + "implementieren: " + methods,
        "en": "Class " + identifier + " has to implement methods of interface " + interf + ": " + methods,
    })

    static methodOverridesFinalMethod = (identifier: string, baseClass: string) => le({
        "de": `Die Methode ${identifier} überschreibt eine als final gekennzeichnete Methode der Oberklasse ${baseClass}.`,
        "en": `Method ${identifier} overrides final method of base class ${baseClass}.`
    })

    static overrideAnnotationNotNecessary = (identifier: string) => le({
        "de": `Die Methode ${identifier} überschreibt keine Methode mit gleicher Signatur einer Oberklasse, daher ist die @Override-Annotation unnötig.`,
        "en": `Method ${identifier} doesn't override a method with identical signature in base class, therefore @Override is not necessary here.`
    })

    /**
     * class GenericTypeParameter
     */
    static parameterNotDefined = (identifier: string) => le({
        "de": `Der generische Parameter ${identifier} ist bei diesem Methodenaufruf unbestimmt.`,
        "en": `Generic parameter ${identifier} is not bound in this method invocation.`
    })

    static parameterContradictoryBound = (identifier: string, bounds: string) => le({
        "de": `Der generische Parameter ${identifier} hat bei diesem Methodenaufruf widersprüchliche Ausprägungen: ${bounds}`,
        "en": `Generic parameter ${identifier} is bound in a contradictory way in this method call.`
    })

    /**
     * class CycleFinder
     */
    static cycleInInheritenceHierarchy = (cycle: string) => le({
        "de": `In der Vererbungshierarchie gibt es einen Zyklus: ${cycle} + " Daher kann leider nicht weiterkompiliert werden.`,
        "en": `There's a inheritence-cycle: ${cycle}   ... => compilation had to be cancelled.`
    })

    /**
     * Program
     */
    static internalError = () => le({
        "de": `Interner Fehler, siehe Konsolenausgabe des Browsers`,
        "en": `Internal error, see browser console output`
    })



    /**
     * class Executable
     */

    static cyclicReferencesAmongStaticVariables = (variables: string) => le({
        "de": `Die Initialisierung mehrerer statischer Attribute aus verschiedenen Klassen ist zyklisch: ${variables}`,
        "en": `Initialization of several static fields is cyclic: ${variables}`
    })

    /**
     * Exceptions
     */

    static charIndexOutOfBounds = () => lm({
        "de": `Zugriff auf Zeichen außerhalb des zulässingen Bereichs`,
        "en": `char index out of bounds`,
    })

    static divideByZero = () => lm({
        "de": `Teilen durch 0 nicht möglich`,
        "en": `division by zero not allowed`,
    })

    static threadWantsToWaitAndHasNoLockOnObject = () => lm({
        "de": `Es wurde wait für ein Objekt aufgerufen, für das der aktuelle Thread kein Lock besitzt.`,
        "en": `Wait called on Object for which thread holds no lock.`
    })

    static threadWantsToNotifyAndHasNoLockOnObject = () => lm({
        "de": `Es wurde notify für ein Objekt aufgerufen, für das der aktuelle Thread kein Lock besitzt.`,
        "en": `Notify called on Object for which thread holds no lock.`
    })
    /**
     * TokenType
     */

    static identifier = () => lm({
        "de": `Bezeichner (engl.: identifier)`,
        "en": `identifier`,
    })

    static floatingPointLiteral = () => lm({
        "de": `Fließkomma-Konstante`,
        "en": `floating point literal`,
    })

    static booleanLiteral = () => lm({
        "de": `boolesche Konstante (d.h. true oder false)`,
        "en": `boolean literal (that is: true or false)`,
    })

    static stringLiteral = () => lm({
        "de": `Zeichenketten-Konstante`,
        "en": `String literal`,
    })

    static charLiteral = () => lm({
        "de": `Char-Konstante`,
        "en": `char literal`,
    })

    static space = () => lm({
        "de": `ein Leerzeichen`,
        "en": `space character`,
    })

    static tab = () => lm({
        "de": `ein Tabulatorzeichen`,
        "en": `tab character`,
    })

    static linebreak = () => lm({
        "de": `ein Zeilenumbruch`,
        "en": `line break`,
    })

    static aToZ = () => lm({
        "de": `eines der Zeichen a..z, A..Z, _`,
        "en": `one of a..z, A..Z, _`,
    })

    static comment = () => lm({
        "de": `eine Kommentar`,
        "en": `a comment`,
    })

    static endOfText = () => lm({
        "de": `das Ende des Programms`,
        "en": `end of sourcecode`,
    })

    static dd = () => lm({
        "de": ``,
        "en": ``,
    })

    /**
     * JavaTypeStore
     */
    static primitiveType = () => lm({
        "de": "Primitiver Datentyp",
        "en": "primitive type"
    })

    static genericType = () => lm({
        "de": "Generischer Datentyp",
        "en": "generic type"
    })

    static class = () => lm({
    "de": "Klass",
    "en": "class",
    })

    static enum = () => lm({
    "de": "Enum",
    "en": "enum",
    })

    static interface = () => lm({
    "de": "Interface",
    "en": "interface",
    })

    static nullType = () => lm({
    "de": "Der Wert null",
    "en": "null value",
    })
}
