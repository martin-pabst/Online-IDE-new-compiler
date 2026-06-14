export enum AssemblyTokenType {
    load,
    store,
    add,
    sub,
    mul,
    div,
    mod,
    cmp,
    and,
    or,
    xor,

    shr,
    shl,
    
    loadi,
    storei,
    addi,
    subi,
    muli,
    divi,
    modi,
    andi,
    ori,
    xori,
    cmpi,

    not,

    shri,
    shli,

    jmp,
    jeq,
    jne,
    jgt,
    jge,
    jlt,
    jle,
    
    jmpp,
    jmpn,
    jmpz,
    jmpv,
    jmpc,

    jmpnp,
    jmpnn,
    jmpnz,
    jmpnv,
    jmpnc,

    jsr,
    rts,
    rsv,
    rel,
    push,
    pop,
    call,
    return,


    hold,
    halt,
    word,
    assert,

    identifier,
    number,
    whitespace,
    comment, 
    invalid,
    endOfSourcecode,

    lineBreak,      // \n
    leftBracket,
    rightBracket,
    leftCurlyBracket,  // {
    rightCurlyBracket,  // }
    leftSquareBracket, // [
    rightSquareBracket, // ]
    colon,          // :
    comma,           // ,
    hash,            // #
    dot,             // .
    stringLiteral,   // "abc"
}

export var AssemblyTokenTypeReadable: { [key in AssemblyTokenType]?: string } = {
    [AssemblyTokenType.colon]: ":",
    [AssemblyTokenType.comma]: ",",
    [AssemblyTokenType.hash]: "#",
    [AssemblyTokenType.dot]: ".",
    [AssemblyTokenType.lineBreak]: "\\n",
    [AssemblyTokenType.leftBracket]: "(",
    [AssemblyTokenType.rightBracket]: ")",
    [AssemblyTokenType.leftCurlyBracket]: "{",
    [AssemblyTokenType.rightCurlyBracket]: "}",
    [AssemblyTokenType.leftSquareBracket]: "[",
    [AssemblyTokenType.rightSquareBracket]: "]",
}
