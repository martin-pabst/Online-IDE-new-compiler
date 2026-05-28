export enum AssemblyTokenType {
    load,
    store,
    add,
    sub,
    mul,
    div,
    mod,
    
    loadi,
    storei,
    addi,
    subi,
    muli,
    divi,
    modi,

    jmp,
    jeq,
    jne,
    jgt,
    jge,
    jlt,
    jle,
    hold,
    word,

    identifier,
    number,
    whitespace,
    comment, 
    invalid,
    endOfSourcecode,

    leftBracket,
    rightBracket,
    colon,          // :
    comma,           // ,
    hash,            // #
}

export var AssemblyKeywordList: { [keyword: string]: AssemblyTokenType } = {
    'load': AssemblyTokenType.load,
    'store': AssemblyTokenType.store,
    'add': AssemblyTokenType.add,
    'sub': AssemblyTokenType.sub,
    'mul': AssemblyTokenType.mul,
    'div': AssemblyTokenType.div,
    'mod': AssemblyTokenType.mod,
    'jmp': AssemblyTokenType.jmp,
    'jeq': AssemblyTokenType.jeq,
    'jne': AssemblyTokenType.jne,
    'jgt': AssemblyTokenType.jgt,
    'jge': AssemblyTokenType.jge,
    'jlt': AssemblyTokenType.jlt,
    'jle': AssemblyTokenType.jle,
    'hold': AssemblyTokenType.hold,
    'word': AssemblyTokenType.word
}