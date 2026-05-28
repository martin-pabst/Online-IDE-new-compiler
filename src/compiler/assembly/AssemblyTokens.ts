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

    lineBreak,      // \n
    leftBracket,
    rightBracket,
    colon,          // :
    comma,           // ,
    hash,            // #
}

export var AssemblyTokenTypeReadable: { [key in AssemblyTokenType]?: string } = {
    [AssemblyTokenType.colon]: ":",
    [AssemblyTokenType.comma]: ",",
    [AssemblyTokenType.hash]: "#",
    [AssemblyTokenType.lineBreak]: "\\n",
    [AssemblyTokenType.leftBracket]: "(",
    [AssemblyTokenType.rightBracket]: ")",
}
