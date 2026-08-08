import { JCM } from "./language/JavaCompilerMessages";

export enum TokenType {
    identifier,
    // constants
    shortConstant,
    integerLiteral,
    longConstant,
    floatLiteral,
    doubleConstant,
    booleanLiteral,
    stringLiteral,
    charLiteral,
    true,
    false,
    // keywords
    keywordImport,
    keywordPrint,
    keywordPrintln,
    keywordClass,
    keywordThis,
    keywordSuper,
    keywordNew,
    keywordInterface,
    keywordEnum,
    keywordVoid,
    keywordAbstract,
    keywordPublic,
    keywordProtected,
    keywordPrivate,
    keywordTransient,
    keywordStatic,
    keywordSynchronized,
    keywordExtends,
    keywordImplements,
    keywordWhile,
    keywordDo,
    keywordFor,
    keywordSwitch,
    keywordCase,
    keywordDefault,
    keywordIf,
    keywordThen,
    keywordElse,
    keywordReturn,
    keywordBreak,
    keywordContinue,
    keywordNull,
    keywordFinal,
    keywordInstanceof,
    keywordThrow,
    keywordTry,
    keywordCatch,
    keywordFinally,
    keywordVar,
    // keywordInt,
    // keywordBoolean,
    // keywordString,
    // keywordFloat,
    // keywordChar,

    // brackets
    leftBracket, // ()
    rightBracket,
    leftSquareBracket, // []
    rightSquareBracket,
    leftCurlyBracket, // {}
    rightCurlyBracket,
    leftRightSquareBracket, // []

    // operators -- ++
    minusMinus, plusPlus,

    // binary operators
    dot, //.
    modulo,
    minus, plus, multiplication, division,
    lower, greater, lowerOrEqual, greaterOrEqual,
    equal, // ==
    notEqual, // !=
    assignment, // =
    plusAssignment, // +=
    minusAssignment, // -=
    multiplicationAssignment, // *=
    divisionAssignment, // /=
    moduloAssignment, // /%=
    and, or,   // &&, ||
    ampersand, // &
    lambdaOperator, // ->

    singleQuote, doubleQuote, // ', "

    ANDAssigment,
    XORAssigment,
    ORAssigment,
    shiftLeftAssigment,
    shiftRightAssigment,
    shiftRightUnsignedAssigment,
    OR, // |
    XOR, // ^
    // AND, // & see TokenType.ampersand above
    tilde, // ~
    shiftRightUnsigned, // >>>
    shiftRight, // >>
    shiftLeft, // <<

    ternaryOperator,  // ?-Operator
    colon, //:
    ellipsis, // ...

    not,    // !

    // semicolon
    semicolon, // ;

    // comma
    comma, // ,

    // backslash
    backslash,

    // @
    at,

    // whitespace
    space,

    tab,

    // newline
    newline,

    // line feed
    linefeed,

    // only lexer-internal
    identifierChar,  // none of the special chars above a..zA..Z_Äö...

    // Comment
    comment,

    endofSourcecode, // will be generated after sourcecode end

    // Program statement types:
    binaryOp, // +, -, *, <=, ...
    unaryPrefixOp, // ! and -
    localVariableDeclaration,
    localVariableDeclarations,
    dereferenceAttribute, // dot-operator
    literal, // literal
    arrayLiteral, // array literal like {12, 10, 4 - 5}
    castValue, // cast value on top of stack to other type
    selectArrayElement, // select Element from Array (e.g. a[20])
    methodCall,
    newObject,
    initialFieldAssignementInMainProgram,
    firstMainProgramStatement,

    // additional AST node types
    global,
    program,
    block,    // block of statements
    synchronizedBlock,
    multiNode,  // used for debugging output
    plusPlusMinusMinusSuffix,
    genericParameterDefinition,
    symbol,
    annotation,
    enhancedForLoop,
    astProgram,
    instanceInitializerBlock,
    staticInitializerBlock,
    anonymousClass,

    fieldDeclaration,
    methodDeclaration,
    parameterDeclaration,
    newArray,
    print,
    println,
    initializeEnumValue,

    type, // e.g. int[][]
    baseType,  // type described only by an identifier, e.g. "ArrayList" or "int"
    wildcardType,
    voidType,
    varType,
    arrayType,
    genericTypeInstantiation, // instantiation of a generic type with actual type arguments

}

export var TokenTypeReadable: { [tt: number]: string } = {
    [TokenType.identifier]: "Bezeichner",
    // constants
    [TokenType.integerLiteral]: JCM.identifier(),
    [TokenType.floatLiteral]: JCM.floatingPointLiteral(),
    [TokenType.booleanLiteral]: JCM.booleanLiteral(),
    [TokenType.stringLiteral]: JCM.stringLiteral(),
    [TokenType.charLiteral]: JCM.charLiteral(),
    [TokenType.true]: "true",
    [TokenType.false]: "false",
    // keywords
    [TokenType.keywordClass]: "class",
    [TokenType.keywordThis]: "this",
    [TokenType.keywordSuper]: "super",
    [TokenType.keywordNew]: "new",
    [TokenType.keywordInterface]: "interface",
    [TokenType.keywordEnum]: "enum",
    [TokenType.keywordVoid]: "void",
    [TokenType.keywordAbstract]: "abstract",
    [TokenType.keywordPublic]: "public",
    [TokenType.keywordProtected]: "protected",
    [TokenType.keywordPrivate]: "private",
    [TokenType.keywordTransient]: "transient",
    [TokenType.keywordStatic]: "static",
    [TokenType.keywordSynchronized]: "synchronized",
    [TokenType.keywordExtends]: "extends",
    [TokenType.keywordImplements]: "implements",
    [TokenType.keywordWhile]: "while",
    [TokenType.keywordDo]: "do",
    [TokenType.keywordFor]: "for",
    [TokenType.keywordSwitch]: "switch",
    [TokenType.keywordCase]: "case",
    [TokenType.keywordDefault]: "default",
    [TokenType.keywordIf]: "if",
    [TokenType.keywordThen]: "then",
    [TokenType.keywordElse]: "else",
    [TokenType.keywordReturn]: "return",
    [TokenType.keywordBreak]: "break",
    [TokenType.keywordContinue]: "continue",
    [TokenType.keywordNull]: "null",
    [TokenType.keywordFinal]: "final",
    [TokenType.keywordInstanceof]: "instanceof",
    [TokenType.keywordThrow]: "throw",
    [TokenType.keywordTry]: "try",
    [TokenType.keywordCatch]: "catch",
    [TokenType.keywordFinally]: "finally",
    [TokenType.keywordVar]: "var",
    [TokenType.keywordImport]: "import",
    [TokenType.keywordPrint]: "print",
    [TokenType.keywordPrintln]: "println",
    // keywordInt,
    // keywordBoolean,
    // keywordString,
    // keywordFloat,
    // keywordChar,

    // brackets
    [TokenType.leftBracket]: "(", // ()
    [TokenType.rightBracket]: ")",
    [TokenType.leftSquareBracket]: "[", // []
    [TokenType.rightSquareBracket]: "]",
    [TokenType.leftCurlyBracket]: "{", // {}
    [TokenType.rightCurlyBracket]: "}",
    [TokenType.leftRightSquareBracket]: "[]",

    // operators
    [TokenType.dot]: ".", //.
    [TokenType.minus]: "-",
    [TokenType.modulo]: "%",
    [TokenType.plus]: "+",
    [TokenType.multiplication]: "*",
    [TokenType.division]: "/",
    [TokenType.singleQuote]: "'",
    [TokenType.doubleQuote]: "\"", // ']: "", "
    [TokenType.minusMinus]: "--",
    [TokenType.plusPlus]: "++",
    [TokenType.lower]: "<",
    [TokenType.greater]: ">",
    [TokenType.lowerOrEqual]: "<=",
    [TokenType.greaterOrEqual]: ">=",
    [TokenType.equal]: "==", // ==
    [TokenType.notEqual]: "!=", // !=
    [TokenType.assignment]: "=", // =
    [TokenType.plusAssignment]: "+=", // +=
    [TokenType.minusAssignment]: "-=", // -=
    [TokenType.multiplicationAssignment]: "*=", // *=
    [TokenType.divisionAssignment]: "/=", // /=
    [TokenType.moduloAssignment]: "%=",
    [TokenType.ampersand]: "&",
    [TokenType.lambdaOperator]: "->",
    [TokenType.and]: "&&",
    [TokenType.or]: "||",
    [TokenType.not]: "!",

    [TokenType.ANDAssigment]: "&=",
    [TokenType.XORAssigment]: "^=",
    [TokenType.ORAssigment]: "|=",
    [TokenType.shiftLeftAssigment]: "<<=",
    [TokenType.shiftRightAssigment]: ">>=",
    [TokenType.shiftRightUnsignedAssigment]: ">>>=",
    // [TokenType.AND]: "&",
    [TokenType.OR]: "|",
    [TokenType.XOR]: "^",
    [TokenType.tilde]: "~",
    [TokenType.shiftLeft]: "<<",
    [TokenType.shiftRight]: ">>",
    [TokenType.shiftRightUnsigned]: ">>>",


    [TokenType.ternaryOperator]: "?",

    // semicolon
    [TokenType.semicolon]: ";", // ;

    [TokenType.colon]: ":", // ;
    [TokenType.ellipsis]: "...", // ;

    // comma
    [TokenType.comma]: ",",

    // backslash
    [TokenType.backslash]: "\\",

    // at
    [TokenType.at]: "@",

    // whitespace
    [TokenType.space]: JCM.space(),
    [TokenType.tab]: JCM.tab(),

    // newline
    [TokenType.newline]: JCM.linebreak(),

    // only lexer-internal
    [TokenType.identifierChar]: JCM.aToZ(),  // none of the special chars above a..zA..Z_Äö...

    // Comment
    [TokenType.comment]: JCM.comment(),

    [TokenType.endofSourcecode]: JCM.endOfText(),

}

export var specialCharList: { [keyword: string]: TokenType } = {
    '(': TokenType.leftBracket, // ()
    ')': TokenType.rightBracket,
    '[': TokenType.leftSquareBracket, // []
    ']': TokenType.rightSquareBracket,
    '{': TokenType.leftCurlyBracket, // {}
    '}': TokenType.rightCurlyBracket,

    // operators
    '.': TokenType.dot, //.
    ',': TokenType.comma, //.
    '-': TokenType.minus,
    '%': TokenType.modulo,
    '+': TokenType.plus,
    '*': TokenType.multiplication,
    '/': TokenType.division,
    '\\': TokenType.backslash,
    '@': TokenType.at,
    '\'': TokenType.singleQuote,
    '"': TokenType.doubleQuote, // ', "
    "<": TokenType.lower,
    ">": TokenType.greater,
    "=": TokenType.assignment,
    "&": TokenType.and,
    "|": TokenType.or,
    "!": TokenType.not,
    "?": TokenType.ternaryOperator,

    "^": TokenType.XOR,
    "~": TokenType.tilde,

    ';': TokenType.semicolon, // ;
    ':': TokenType.colon, // ;

    '...': TokenType.ellipsis,

    // whitespace
    ' ': TokenType.space,
    '\uc2a0': TokenType.space,
    '\u00a0': TokenType.space,
    '\t': TokenType.tab,
    // newline
    '\n': TokenType.newline,
    '\r': TokenType.linefeed
}

export var keywordList: { [keyword: string]: TokenType } = {
    "class": TokenType.keywordClass,
    "this": TokenType.keywordThis,
    "super": TokenType.keywordSuper,
    "new": TokenType.keywordNew,
    "interface": TokenType.keywordInterface,
    "enum": TokenType.keywordEnum,
    "void": TokenType.keywordVoid,
    "abstract": TokenType.keywordAbstract,
    "public": TokenType.keywordPublic,
    "protected": TokenType.keywordProtected,
    "private": TokenType.keywordPrivate,
    "transient": TokenType.keywordTransient,
    "static": TokenType.keywordStatic,
    "synchronized": TokenType.keywordSynchronized,
    "extends": TokenType.keywordExtends,
    "implements": TokenType.keywordImplements,
    "while": TokenType.keywordWhile,
    "do": TokenType.keywordDo,
    "for": TokenType.keywordFor,
    "switch": TokenType.keywordSwitch,
    "case": TokenType.keywordCase,
    "default": TokenType.keywordDefault,
    "if": TokenType.keywordIf,
    "then": TokenType.keywordThen,
    "else": TokenType.keywordElse,
    "return": TokenType.keywordReturn,
    "break": TokenType.keywordBreak,
    "continue": TokenType.keywordContinue,
    "null": TokenType.keywordNull,
    "final": TokenType.keywordFinal,
    "instanceof": TokenType.keywordInstanceof,
    "throw": TokenType.keywordThrow,
    "try": TokenType.keywordTry,
    "catch": TokenType.keywordCatch,
    "finally": TokenType.keywordFinally,
    "var": TokenType.keywordVar,
    "true": TokenType.true,
    "false": TokenType.false,
    "import": TokenType.keywordImport,
    "print": TokenType.keywordPrint,
    "println": TokenType.keywordPrintln,
    // "int": TokenType.keywordInt,
    // "boolean": TokenType.keywordBoolean,
    // "String": TokenType.keywordString,
    // "float": TokenType.keywordFloat,
    // "char": TokenType.keywordChar
};

export var EscapeSequenceList: { [keyword: string]: string } = {
    "n": "\n",
    "r": "\r",
    "t": "\t",
    "\"": "\"",
    "'": "'",
    "\\": "\\"
}