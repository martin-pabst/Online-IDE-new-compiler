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
}
