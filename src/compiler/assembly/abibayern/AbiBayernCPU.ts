import { CPU } from "../CPU";
import { Memory } from "../Memory";
import { AbiBayernMemory } from "./AbiBayernMemory";
import { AssemblyTokenType } from "../AssemblyTokenType";
import { AssemblyInstruction, AssemblyParser, AssemblyParserResult } from "../AssemblyParser";
import { AssemblyToken } from "../AssemblyLexer";
import { AssemblyParserMessages } from "../language/AssemblyParserMessages";
import { IMain } from "../../common/IMain";
import { ExceptionPrinter } from "../../common/interpreter/ExceptionPrinter";
import { IRange } from "monaco-editor";
import { CompilerFile } from "../../common/module/CompilerFile";
import { Thread } from "../../common/interpreter/Thread";
import { Range } from "../../common/range/Range";
import { AbiBayernAssemblyMessages } from "./AbiBayernAssemblyMessages";

enum AddressingMode {
    None = 0b00000000,
    Address = 0b01000000,
    Immediate = 0b10000000,
    Indirect = 0b11000000,
}

enum BaseOpCode {
    load = 0x01,
    store = 0x02,
    add = 0x03,
    sub = 0x04,
    mul = 0x05,
    div = 0x06,
    mod = 0x07,
    and = 0x08,
    or = 0x09,
    xor = 0x0A,

    not = 0x0B,
    shr = 0x0C,
    shl = 0x0D,


    jmp = 0x10,
    jeq = 0x11,
    jne = 0x12,
    jgt = 0x13,
    jge = 0x14,
    jlt = 0x15,
    jle = 0x16,

    jmpp = 0x17,
    jmpn = 0x18,
    jmpz = 0x19,
    jmpv = 0x1A,
    jmpc = 0x1B,

    jmpnp = 0x1C,
    jmpnn = 0x1D,
    jmpnz = 0x1E,
    jmpnv = 0x1F,
    jmpnc = 0x20,

    cmp = 0x30,
    hold = 0x31,

    assertion = 0x40
}

enum OpCode {
    load = BaseOpCode.load | AddressingMode.Address,
    store = BaseOpCode.store | AddressingMode.Address,
    add = BaseOpCode.add | AddressingMode.Address,
    sub = BaseOpCode.sub | AddressingMode.Address,
    mul = BaseOpCode.mul | AddressingMode.Address,
    div = BaseOpCode.div | AddressingMode.Address,
    mod = BaseOpCode.mod | AddressingMode.Address,

    and = BaseOpCode.and | AddressingMode.Address,
    or = BaseOpCode.or | AddressingMode.Address,
    xor = BaseOpCode.xor | AddressingMode.Address,

    shr = BaseOpCode.shr | AddressingMode.Address,
    shl = BaseOpCode.shl | AddressingMode.Address,

    cmp = BaseOpCode.cmp | AddressingMode.Address,

    loadIndirect = BaseOpCode.load | AddressingMode.Indirect,
    storeIndirect = BaseOpCode.store | AddressingMode.Indirect,
    cmpIndirect = BaseOpCode.cmp | AddressingMode.Indirect,
    addIndirect = BaseOpCode.add | AddressingMode.Indirect,
    subIndirect = BaseOpCode.sub | AddressingMode.Indirect,
    mulIndirect = BaseOpCode.mul | AddressingMode.Indirect,
    divIndirect = BaseOpCode.div | AddressingMode.Indirect,
    modIndirect = BaseOpCode.mod | AddressingMode.Indirect,

    andIndirect = BaseOpCode.and | AddressingMode.Indirect,
    orIndirect = BaseOpCode.or | AddressingMode.Indirect,
    xorIndirect = BaseOpCode.xor | AddressingMode.Indirect,

    loadi = BaseOpCode.load | AddressingMode.Immediate,
    addi = BaseOpCode.add | AddressingMode.Immediate,
    subi = BaseOpCode.sub | AddressingMode.Immediate,
    muli = BaseOpCode.mul | AddressingMode.Immediate,
    divi = BaseOpCode.div | AddressingMode.Immediate,
    modi = BaseOpCode.mod | AddressingMode.Immediate,

    andi = BaseOpCode.and | AddressingMode.Immediate,
    ori = BaseOpCode.or | AddressingMode.Immediate,
    xori = BaseOpCode.xor | AddressingMode.Immediate,

    not = BaseOpCode.not | AddressingMode.None,

    shri = BaseOpCode.shr | AddressingMode.None,
    shli = BaseOpCode.shl | AddressingMode.None,

    cmpi = BaseOpCode.cmp | AddressingMode.Immediate,
    jeq = BaseOpCode.jeq | AddressingMode.Address,
    jne = BaseOpCode.jne | AddressingMode.Address,
    jgt = BaseOpCode.jgt | AddressingMode.Address,
    jge = BaseOpCode.jge | AddressingMode.Address,
    jlt = BaseOpCode.jlt | AddressingMode.Address,
    jle = BaseOpCode.jle | AddressingMode.Address,
    jmp = BaseOpCode.jmp | AddressingMode.Address,

    jmpp = BaseOpCode.jmpp | AddressingMode.Address,
    jmpn = BaseOpCode.jmpn | AddressingMode.Address,
    jmpz = BaseOpCode.jmpz | AddressingMode.Address,
    jmpv = BaseOpCode.jmpv | AddressingMode.Address,
    jmpc = BaseOpCode.jmpc | AddressingMode.Address,
    jmpnp = BaseOpCode.jmpnp | AddressingMode.Address,
    jmpnn = BaseOpCode.jmpnn | AddressingMode.Address,
    jmpnz = BaseOpCode.jmpnz | AddressingMode.Address,
    jmpnv = BaseOpCode.jmpnv | AddressingMode.Address,
    jmpnc = BaseOpCode.jmpnc | AddressingMode.Address,

    hold = BaseOpCode.hold | AddressingMode.None,
    assertion = BaseOpCode.assertion | AddressingMode.None
}
type Instruction = {
    tokenType: AssemblyTokenType, jumpType: "branch" | "jump" | "nojump",
    adressMode: "Address" | "Immediate" | "Indirect" | "None",
    OpCode: OpCode,
    description: (...parameterValues: (string | number)[]) => string,
    parameterCount: number,
    exec: (cpu: AbiBayernCPU) => boolean // returns true on program end
};

var instructions: Instruction[] = [
    {
        tokenType: AssemblyTokenType.load, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.load, description: AbiBayernAssemblyMessages.LoadAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.accumulator = cpu.memory.read(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.store, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.store, description: AbiBayernAssemblyMessages.StoreAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.memory.write(cpu.readOperand(), cpu.accumulator); return false; }
    },
    {
        tokenType: AssemblyTokenType.add, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.add, description: AbiBayernAssemblyMessages.AddAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator + cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.sub, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.sub, description: AbiBayernAssemblyMessages.SubAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator - cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.mul, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.mul, description: AbiBayernAssemblyMessages.MulAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator * cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.div, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.div, description: AbiBayernAssemblyMessages.DivAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator / cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.mod, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.mod, description: AbiBayernAssemblyMessages.ModAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator % cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.and, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.and, description: AbiBayernAssemblyMessages.AndAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator & cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.or, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.or, description: AbiBayernAssemblyMessages.OrAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator | cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.xor, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.xor, description: AbiBayernAssemblyMessages.XorAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator ^ cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.shr, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.shr, description: AbiBayernAssemblyMessages.ShrAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.shr(cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.shl, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.shl, description: AbiBayernAssemblyMessages.ShlAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.shl(cpu.accumulator << cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.cmp, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.cmp, description: AbiBayernAssemblyMessages.CmpAddress, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.cmp(cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.load, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.loadIndirect, description: AbiBayernAssemblyMessages.LoadIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.accumulator = cpu.memory.readIndirect(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.store, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.storeIndirect, description: AbiBayernAssemblyMessages.StoreIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.memory.writeIndirect(cpu.readOperand(), cpu.accumulator); return false; }
    },
    {
        tokenType: AssemblyTokenType.add, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.addIndirect, description: AbiBayernAssemblyMessages.AddIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator + cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.sub, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.subIndirect, description: AbiBayernAssemblyMessages.SubIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator - cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.mul, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.mulIndirect, description: AbiBayernAssemblyMessages.MulIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator * cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.div, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.divIndirect, description: AbiBayernAssemblyMessages.DivIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator / cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.mod, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.modIndirect, description: AbiBayernAssemblyMessages.ModIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator % cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.and, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.andIndirect, description: AbiBayernAssemblyMessages.AndIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator & cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.or, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.orIndirect, description: AbiBayernAssemblyMessages.OrIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator | cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.xor, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.xorIndirect, description: AbiBayernAssemblyMessages.XorIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator ^ cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.cmp, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.cmpIndirect, description: AbiBayernAssemblyMessages.CmpIndirect, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.cmp(cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },

    {
        tokenType: AssemblyTokenType.jmp, jumpType: "jump", adressMode: "Address", OpCode: OpCode.jmp, description: AbiBayernAssemblyMessages.Jmp, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setProgramCounter(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jeq, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jeq, description: AbiBayernAssemblyMessages.Jeq, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jeq(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jne, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jne, description: AbiBayernAssemblyMessages.Jne, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jne(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jgt, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jgt, description: AbiBayernAssemblyMessages.Jgt, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jgt(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jge, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jge, description: AbiBayernAssemblyMessages.Jge, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jge(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jlt, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jlt, description: AbiBayernAssemblyMessages.Jlt, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jlt(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jle, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jle, description: AbiBayernAssemblyMessages.Jle, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jle(cpu.readOperand()); return false; }
    },

    {
        tokenType: AssemblyTokenType.jmpp, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpp, description: AbiBayernAssemblyMessages.Jmpp, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jmpp(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpn, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpn, description: AbiBayernAssemblyMessages.Jmpn, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jmpn(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpz, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpz, description: AbiBayernAssemblyMessages.Jmpz, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jmpz(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpv, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpv, description: AbiBayernAssemblyMessages.Jmpv, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jmpv(cpu.readOperand()); return false; }
    },
    // {
    //     tokenType: AssemblyTokenType.jmpc, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpc, description: AbiBayernAssemblyMessages.Jmpc, parameterCount: 1,
    //     exec: (cpu: AbiBayernCPU) => { cpu.jmpc(cpu.readOperand()); return false; }
    // },
    {
        tokenType: AssemblyTokenType.jmpnp, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnp, description: AbiBayernAssemblyMessages.Jmpnp, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jmpnp(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpnn, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnn, description: AbiBayernAssemblyMessages.Jmpnn, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jmpnn(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpnz, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnz, description: AbiBayernAssemblyMessages.Jmpnz, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jmpnz(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpnv, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnv, description: AbiBayernAssemblyMessages.Jmpnv, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.jmpnv(cpu.readOperand()); return false; }
    },
    // {
    //     tokenType: AssemblyTokenType.jmpnc, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnc, description: AbiBayernAssemblyMessages.Jmpnc, parameterCount: 1,
    //     exec: (cpu: AbiBayernCPU) => { cpu.jmpnc(cpu.readOperand()); return false; }
    // },
    {
        tokenType: AssemblyTokenType.loadi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.loadi, description: AbiBayernAssemblyMessages.LoadImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.addi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.addi, description: AbiBayernAssemblyMessages.AddImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator + cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.subi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.subi, description: AbiBayernAssemblyMessages.SubImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator - cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.muli, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.muli, description: AbiBayernAssemblyMessages.MulImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator * cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.divi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.divi, description: AbiBayernAssemblyMessages.DivImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(Math.floor(cpu.accumulator / cpu.readOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.modi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.modi, description: AbiBayernAssemblyMessages.ModImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator % cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.andi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.andi, description: AbiBayernAssemblyMessages.AndImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator & cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.ori, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.ori, description: AbiBayernAssemblyMessages.OrImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator | cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.xori, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.xori, description: AbiBayernAssemblyMessages.XorImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator ^ cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.shri, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.shri, description: AbiBayernAssemblyMessages.ShrImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.shr(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.shli, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.shli, description: AbiBayernAssemblyMessages.ShlImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.shl(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.cmpi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.cmpi, description: AbiBayernAssemblyMessages.CmpImmediate, parameterCount: 1,
        exec: (cpu: AbiBayernCPU) => { cpu.cmp(cpu.readOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.not, jumpType: "nojump", adressMode: "None", OpCode: OpCode.not, description: AbiBayernAssemblyMessages.Not, parameterCount: 0,
        exec: (cpu: AbiBayernCPU) => { cpu.not(); return false; }
    },
    {
        tokenType: AssemblyTokenType.hold, jumpType: "nojump", adressMode: "None", OpCode: OpCode.hold, description: AbiBayernAssemblyMessages.Hold, parameterCount: 0,
        exec: (cpu: AbiBayernCPU) => { return true; }
    },
    {
        tokenType: AssemblyTokenType.halt, jumpType: "nojump", adressMode: "None", OpCode: OpCode.hold, description: AbiBayernAssemblyMessages.Hold, parameterCount: 0,
        exec: (cpu: AbiBayernCPU) => { return true; }
    },
    // {
    //     tokenType: AssemblyTokenType.assert, jumpType: "nojump", adressMode: "None", OpCode: OpCode.assertion, description: AbiBayernAssemblyMessages.Assert, parameterCount: 0,
    //     exec: (cpu: AbiBayernCPU) => { cpu.assertMemory(); return true; }
    // },

];

var specialCompletionComments: { tokenType: AssemblyTokenType, description: () => string }[] = [
    { tokenType: AssemblyTokenType.load, description: AbiBayernAssemblyMessages.LoadCompletionComment },
    { tokenType: AssemblyTokenType.store, description: AbiBayernAssemblyMessages.StoreCompletionComment },
    { tokenType: AssemblyTokenType.add, description: AbiBayernAssemblyMessages.AddCompletionComment },
    { tokenType: AssemblyTokenType.sub, description: AbiBayernAssemblyMessages.SubCompletionComment },
    { tokenType: AssemblyTokenType.mul, description: AbiBayernAssemblyMessages.MulCompletionComment },
    { tokenType: AssemblyTokenType.div, description: AbiBayernAssemblyMessages.DivCompletionComment },
    { tokenType: AssemblyTokenType.mod, description: AbiBayernAssemblyMessages.ModCompletionComment },
    { tokenType: AssemblyTokenType.and, description: AbiBayernAssemblyMessages.AndCompletionComment },
    { tokenType: AssemblyTokenType.or, description: AbiBayernAssemblyMessages.OrCompletionComment },
    { tokenType: AssemblyTokenType.xor, description: AbiBayernAssemblyMessages.XorCompletionComment },
    { tokenType: AssemblyTokenType.cmp, description: AbiBayernAssemblyMessages.CmpCompletionComment }
];



export class AbiBayernCPU extends CPU {

    name = AbiBayernAssemblyMessages.CPUName();
    description = AbiBayernAssemblyMessages.CPUDescription();

    accumulator: number = 0;
    programCounter: number = 0;

    flagNames = ['zero', 'negative', 'overflow', 'carry'];
    flagNamesShort = ['Z', 'N', 'V', 'C'];

    registerNames = ['Accumulator', 'Program Counter'];
    registerNamesShort = ['A', 'PC'];

    flags: {
        zero: boolean;
        negative: boolean;
        overflow: boolean;
        carry: boolean;
    }

    memory: AbiBayernMemory;

    opcodeToInstructionMap: { [opcode: number]: Instruction } = {};
    specialCompletionCommentTokens: Set<AssemblyTokenType>;

    constructor(assemblyParserResult: AssemblyParserResult, main: IMain) {
        super(assemblyParserResult, main);
        this.memory = new AbiBayernMemory(0x1000); // 64 * 4 KB of memory
        this.initOpcodeToInstructionMap();
        this.specialCompletionCommentTokens = new Set<AssemblyTokenType>();
        for (let item of specialCompletionComments) {
            this.specialCompletionCommentTokens.add(item.tokenType);
        }
        this.reset();
    }

    getTokensWithDescription(): { tokenIdentifier: string; description: () => string; }[] {
        const getPlaceholderOperands = (instruction: Instruction): (string | number)[] => {
            if (instruction.parameterCount === 0) {
                return [];
            }

            if (instruction.adressMode === "Immediate") {
                return [70];
            }

            if (instruction.jumpType !== "nojump") {
                return ["label"];
            }

            return ["address"];
        };

        return instructions.filter(instr => !this.specialCompletionCommentTokens.has(instr.tokenType))
            .map(instr => ({
                tokenIdentifier: AssemblyTokenType[instr.tokenType],
                description: () => instr.description(...getPlaceholderOperands(instr))
            }))
            .concat(specialCompletionComments.map(item => ({ tokenIdentifier: AssemblyTokenType[item.tokenType], description: item.description })));
    }

    getDescriptionForCurrentInstruction(): string | undefined {
        let mem = this.memory.dump();
        let opcode = mem[this.programCounter];
        let instruction = this.opcodeToInstructionMap[opcode];
        if (instruction) {
            let operandValues: (string | number)[] = [];
            for (let i = 1; i < instruction.parameterCount + 1; i++) {
                operandValues.push(mem[this.programCounter + i]);
            }
            return instruction.description(...operandValues);
        }
    }


    getPseudoDirectivesWithDescription(): { directiveIdentifier: string; description: () => string; }[] {
        return [
            { directiveIdentifier: ".origin", description: AbiBayernAssemblyMessages.OriginPseudoDirective }];
    }

    getInstructions(): AssemblyInstruction[] {
        return instructions;
    }

    initOpcodeToInstructionMap(): void {
        for (let instruction of instructions) {
            this.opcodeToInstructionMap[instruction.OpCode] = instruction;
        }
    }

    getMemory(): Memory {
        return this.memory;
    }

    getFlags(): { [flagName: string]: boolean; } {
        return this.flags;
    }

    getRegisterValues(): { [registerName: string]: number; } {
        return {
            'Accumulator': this.accumulator,
            'Program Counter': this.programCounter
        };
    }

    getProgramCounter(): number {
        return this.programCounter;
    }

    getStatementLengthAtProgramCounter(): number {
        let opcode = this.memory.dump()[this.programCounter];
        let instruction = this.opcodeToInstructionMap[opcode];
        if (instruction) {
            switch (instruction.adressMode) {
                case "None": return 1;
                case "Immediate":
                case "Address":
                case "Indirect": return 2;
            }
        }
        return 1; // In case of invalid opcode
    }

    getAddressOperandLocationOfCurrentStatement(): { location: number | undefined; indirectLocation: number | undefined; } {
        let opcode = this.memory.dump()[this.programCounter];
        let instruction = this.opcodeToInstructionMap[opcode];
        if (!instruction) return { location: undefined, indirectLocation: undefined };
        if (instruction.adressMode === "None" || instruction.adressMode === "Immediate") {
            return { location: undefined, indirectLocation: undefined };
        }
        let mem = this.memory.dump();
        let operandAddress = mem[this.programCounter + 1];
        if (operandAddress < 0 || operandAddress >= mem.length) return { location: undefined, indirectLocation: undefined };
        if (instruction.adressMode === "Address") {
            return { location: operandAddress, indirectLocation: undefined };
        } else { // Indirect
            let indirectLocation = mem[operandAddress];
            if (indirectLocation < 0 || indirectLocation >= mem.length) return { location: undefined, indirectLocation: undefined };
            return { location: operandAddress, indirectLocation: indirectLocation };
        }
    }


    reset(): void {
        this.accumulator = 0;
        this.programCounter = 0;
        this.flags = {
            'zero': false,
            'negative': false,
            'overflow': false,
            'carry': false
        };
        if (this.assemblyParserResult) {
            this.programCounter = this.assemblyParserResult.startAddress ?? this.assemblyParserResult.codeParts[0].offset;
            this.memory.loadProgram(this.assemblyParserResult.codeParts);
        }
    }

    executeNextStep(thread: Thread): boolean {
        let breakpoint = this.breakpointAddresses.get(this.programCounter);
        if (breakpoint) {
            if (!this.breakpointReachedShouldIExecute(breakpoint, thread)) {
                return false;
            }
        }

        try {
            let opcode = this.memory.read(this.programCounter++);
            let instruction = this.opcodeToInstructionMap[opcode];
            if (instruction) {
                return instruction.exec(this);
            } else {
                switch (opcode) {
                    case OpCode.assertion:
                        this.assert(thread.scheduler.interpreter);
                        return false;
                    default:
                        throw new Error(AbiBayernAssemblyMessages.UnknownOpCode(opcode, --this.programCounter));
                }
            }
        } catch (error) {
            let range = this.assemblyParserResult.sourceMap.get(this.programCounter);
            let irange: IRange | undefined = range ? { startLineNumber: range.lineNumber, startColumn: range.column, endLineNumber: range.lineNumber, endColumn: range.column } : undefined;
            let errorMessage = error instanceof Error ? error.message : String(error);
            if (this.main) {
                let html = ExceptionPrinter.getHTMLWithLinksForMessage(errorMessage, irange, this.assemblyParserResult.file, this.main);
                this.main.getInterpreter().printManager?.printHtmlElement(html);
                if (irange) {
                    this.main.showProgramPosition(this.assemblyParserResult.file, irange, false);
                    this.main.getInterpreter().exceptionMarker?.markExceptionByFileAndRange(this.assemblyParserResult.file, irange);
                }
                alert(errorMessage + "\n\n Details siehe Reiter 'Ausgabe'.");
            }
            return true; // Stop execution on error
        }

    }

    readOperand(): number {
        return this.memory.read(this.programCounter++);
    }

    setAccu(value: number): void {
        if (value > 0x7FFF || value < -0x8000) {
            this.flags.overflow = true;
            value = (value + 0x8000) & 0xffff - 0x8000; // Ensure value is a signed 16-bit integer
        } else {
            this.flags.overflow = false;
        }
        this.flags.zero = value === 0;
        this.flags.negative = value < 0;
        this.accumulator = value;
    }

    cmp(value: number): void {
        let result = this.accumulator - value;
        this.flags.zero = result === 0;
        this.flags.negative = result < 0;
    }

    setProgramCounter(address: number): void {
        if (address < 0 || address >= this.memory.size()) {
            throw new Error(`Program Counter set error: Address ${address} out of bounds (valid adresses: 0-${this.memory.size() - 1})`);
        }
        this.programCounter = address;
    }

    jeq(address: number): void {
        if (this.flags.zero) {
            this.setProgramCounter(address);
        }
    }

    jne(address: number): void {
        if (!this.flags.zero) {
            this.setProgramCounter(address);
        }
    }

    jgt(address: number): void {
        if (!this.flags.negative && !this.flags.zero) {
            this.setProgramCounter(address);
        }
    }

    jge(address: number): void {
        if (!this.flags.negative) {
            this.setProgramCounter(address);
        }
    }

    jlt(address: number): void {
        if (this.flags.negative) {
            this.setProgramCounter(address);
        }
    }

    jle(address: number): void {
        if (this.flags.negative || this.flags.zero) {
            this.setProgramCounter(address);
        }
    }

    jmpp(address: number): void {
        if (!this.flags.negative && !this.flags.zero) {
            this.setProgramCounter(address);
        }
    }

    jmpn(address: number): void {
        if (this.flags.negative) {
            this.setProgramCounter(address);
        }
    }

    jmpz(address: number): void {
        if (this.flags.zero) {
            this.setProgramCounter(address);
        }
    }

    jmpv(address: number): void {
        if (this.flags.overflow) {
            this.setProgramCounter(address);
        }
    }

    jmpc(address: number): void {
        if (this.flags.carry) {
            this.setProgramCounter(address);
        }
    }

    jmpnp(address: number): void {
        if (this.flags.negative || this.flags.zero) {
            this.setProgramCounter(address);
        }
    }

    jmpnn(address: number): void {
        if (!this.flags.negative) {
            this.setProgramCounter(address);
        }
    }

    jmpnz(address: number): void {
        if (!this.flags.zero) {
            this.setProgramCounter(address);
        }
    }

    jmpnv(address: number): void {
        if (!this.flags.overflow) {
            this.setProgramCounter(address);
        }
    }

    jmpnc(address: number): void {
        if (!this.flags.carry) {
            this.setProgramCounter(address);
        }
    }

    not(): void {
        if (this.accumulator < 0) {
            this.setAccu(-(~(-this.accumulator)));
        } else {
            this.setAccu(~this.accumulator);
        }
    }

    shr(shiftAmount: number): void {
        if (shiftAmount == 0) return;
        if (shiftAmount < 0) {
            this.shl(-shiftAmount);
            return;
        }
        let sign = this.accumulator < 0 ? -1 : 1;
        let absoluteValue = Math.abs(this.accumulator);
        let shiftedValue = absoluteValue >> shiftAmount;
        this.flags.carry = (absoluteValue & (1 << (shiftAmount - 1))) !== 0; // Capture the last bit shifted out for carry flag
        this.flags.zero = shiftedValue === 0;
        this.flags.negative = sign === -1 && shiftedValue !== 0;
        this.setAccu(shiftedValue * sign);
    }

    shl(shiftAmount: number): void {
        if (shiftAmount == 0) return;
        if (shiftAmount < 0) {
            this.shr(-shiftAmount);
            return;
        }
        let sign = this.accumulator < 0 ? -1 : 1;
        let absoluteValue = Math.abs(this.accumulator);
        let shiftedValue = (absoluteValue << shiftAmount) & 0x8000;
        this.flags.carry = (absoluteValue & (0x8000 >> (shiftAmount - 1))) !== 0; // Capture the last bit shifted out for carry flag
        this.flags.zero = shiftedValue === 0;
        this.flags.negative = sign === -1 && shiftedValue !== 0;
        this.setAccu(shiftedValue * sign);
    }


}

export class AbiBayernParser extends AssemblyParser {

    tokenToInstructionMap: { [type: number]: Instruction[] } = {};
    tokenSet: Set<AssemblyTokenType> = new Set();

    constructor() {
        super();
        this.initTokenSet();
        this.initTokenToInstructionMap();
    }

    parse(tokens: AssemblyToken[], file: CompilerFile): AssemblyParserResult {
        this.initBeforeParsing(tokens);

        this.skip(AssemblyTokenType.lineBreak);

        while (!this.isProgramEndReached()) this.parseInstructionOrData();

        this.checkForUnresolvedLabelsAtEndOfParsing();

        return this.makeParserResult(file);
    }

    parseInstructionOrData(): void {
        let token = this.currentToken();
        let instructionsForToken = this.tokenToInstructionMap[token.type];

        if (instructionsForToken) {
            this.next();
            this.parseInstruction(token, instructionsForToken);
        } else {
            switch (token.type) {
                case AssemblyTokenType.identifier:
                    this.next();
                    this.resolveLabel(token);
                    break;
                case AssemblyTokenType.word:
                    this.next();
                    this.parseWord(token);
                    break;
                case AssemblyTokenType.dot:
                    this.parsePseudodirective()
                    break;
                default:
                    this.pushError(AssemblyParserMessages.UnexpectedToken(token.text), "error", token.range);
                    this.next();
            }

        }
    }

    parseInstruction(token: AssemblyToken, instructionsForToken: Instruction[]) {
        if (typeof this.startAddress === "undefined") {
            this.startAddress = this.getProgramCounterAbsolute();
        }

        switch (this.currentToken().type) {
            case AssemblyTokenType.number:
                this.parseInstructionWithNumberArgument(token, instructionsForToken);
                break;
            case AssemblyTokenType.identifier:
                this.parseInstructionWithLabelArgument(token, instructionsForToken);
                break;
            case AssemblyTokenType.leftBracket:
                this.parseInstructionWithIndirectArgument(token, instructionsForToken);
                break;
            default:
                this.parseInstructionWithNoArgument(token, instructionsForToken);
        }
        this.expectLineBreakOrEndOfSourcecode();
    }

    parseInstructionWithIndirectArgument(token: AssemblyToken, instructionsForToken: Instruction[]) {
        let instruction = instructionsForToken.find(instr => instr.adressMode === "Indirect");
        if (instruction) {
            this.next();
            let addressToken = this.currentToken();
            if (addressToken.type === AssemblyTokenType.number) {
                if (this.checkIfTokenIs16BitUnsignedNumber(addressToken)) {
                    let address = addressToken.value as number;
                    this.registerInstruction(instruction, token.range, [address]);
                    this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                    this.writeToMemory(instruction.OpCode, address);
                }
                this.next();
                if (this.expect(AssemblyTokenType.rightBracket)) this.next();
            } else if (addressToken.type === AssemblyTokenType.identifier) {
                this.registerInstruction(instruction, token.range, [addressToken.text]);
                this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                this.writeToMemory(instruction.OpCode);
                let labelAddress = this.getLabelAddressAbsolute(addressToken, this.getProgramCounterAbsolute());
                this.writeToMemory(labelAddress, labelAddress);
                this.next();
                if (this.expect(AssemblyTokenType.rightBracket)) this.next();
            } else {
                this.pushError(AbiBayernAssemblyMessages.NumberOrLabelExpectedInIndirectAdress(token.text), "error", token.range);
                this.next();
                this.skip(AssemblyTokenType.rightBracket);
            }
        } else {
            this.pushError(AbiBayernAssemblyMessages.IndirectArgumentAfterInstructionNotExpected(token.text), "error", token.range);
            this.next();
            this.skip(AssemblyTokenType.number);
            this.skip(AssemblyTokenType.rightBracket);
        }
    }

    parseInstructionWithNoArgument(token: AssemblyToken, instructionsForToken: Instruction[]) {
        let instruction = instructionsForToken.find(instr => instr.adressMode === "None");
        if (instruction) {
            this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
            this.registerInstruction(instruction, token.range, []);
            this.writeToMemory(instruction.OpCode);
        } else {
            this.pushError(AbiBayernAssemblyMessages.NoArgumentAfterInstructionFound(token.text), "error", token.range);
            let specialCompletionComment = specialCompletionComments.find(item => item.tokenType === token.type);
            if (specialCompletionComment) {
                this.addHoverEntry(token.range, specialCompletionComment.description());
            }
        }
    }

    parseInstructionWithNumberArgument(token: AssemblyToken, instructionsForToken: Instruction[]) {
        let numberToken = this.currentToken();
        this.next();
        let instruction = instructionsForToken.find(instr => instr.adressMode === "Immediate" || instr.adressMode === "Address");
        if (instruction) {
            if (this.checkIfTokenIs16BitSignedNumber(numberToken)) {
                let value = numberToken.value as number;
                this.registerInstruction(instruction, token.range, [value]);
                this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                this.writeToMemory(instruction.OpCode, value);
            } else {
                this.registerInstruction(instruction, token.range, instruction.adressMode === "Immediate" ? [70] : ["address"]);
            }
        } else {
            this.pushError(AbiBayernAssemblyMessages.NumberAfterInstructionNotExpected(token.text), "error", numberToken.range);
            let specialCompletionComment = specialCompletionComments.find(item => item.tokenType === token.type);
            if (specialCompletionComment) {
                this.addHoverEntry(token.range, specialCompletionComment.description());
            }
        }
    }

    parseInstructionWithLabelArgument(token: AssemblyToken, instructionsForToken: Instruction[]) {
        let labelToken = this.currentToken();
        this.next();
        let instruction = instructionsForToken.find(instr => instr.adressMode === "Address");
        if (instruction) {
            this.registerInstruction(instruction, token.range, [labelToken.text]);
            this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
            this.writeToMemory(instruction.OpCode);
            let labelAddress = this.getLabelAddressAbsolute(labelToken, this.getProgramCounterAbsolute());
            this.writeToMemory(labelAddress);
        } else {
            this.pushError(AbiBayernAssemblyMessages.LabelAfterInstructionNotExpected(token.text), "error", labelToken.range);
            let specialCompletionComment = specialCompletionComments.find(item => item.tokenType === token.type);
            if (specialCompletionComment) {
                this.addHoverEntry(token.range, specialCompletionComment.description());
            }
        }
    }

    parseWord(token: AssemblyToken): void {

        this.addHoverEntry(token.range, AbiBayernAssemblyMessages.WordDirectiveHoverMessage(70));

        let firstLoop = true;
        do {
            if (!firstLoop) {
                this.next();
            }
            firstLoop = false;
            let numberToken = this.currentToken();
            if (this.checkIfTokenIs16BitSignedNumber(numberToken)) {
                let value = numberToken.value as number;
                this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                this.writeToMemory(value);
            }
            this.next();
        } while (this.currentToken().type === AssemblyTokenType.comma);

        this.expectLineBreakOrEndOfSourcecode();
    }

    parsePseudodirective(): void {
        this.next();    // skip dot
        if (this.expect(AssemblyTokenType.identifier)) {
            let identifierToken = this.currentToken();
            switch (identifierToken.text) {
                case "origin":
                    let addressTokenRange = identifierToken.range;
                    this.next();
                    let address = 1000;
                    if (this.expect(AssemblyTokenType.number)) {
                        let addressToken = this.currentToken();
                        addressTokenRange = addressToken.range;
                        this.next();
                        address = (addressToken.value as number);
                        if (address < 0 || address > 0x8000) {
                            this.pushError(AbiBayernAssemblyMessages.OriginAddressOutOfBounds(address, 0x8000 - 1), "error", addressToken.range);
                        } else {
                            this.setOrigin(address);
                        }
                    }
                    this.addHoverEntry(Range.plusRange(identifierToken.range, addressTokenRange),
                        AbiBayernAssemblyMessages.OriginHoverMessage(address));
                    break;
                case "assert":
                    this.parseAssertion(identifierToken);
                    break;
                default:
                    this.pushError(AbiBayernAssemblyMessages.UnknownPseudoDirective(identifierToken.text),
                        "error", identifierToken.range);
                    break;
            }
        }
        this.expectLineBreakOrEndOfSourcecode();
    }

    getKeywordTokens(): Set<AssemblyTokenType> {
        return this.tokenSet;
    }

    initTokenToInstructionMap(): void {
        for (let instruction of instructions) {
            if (!this.tokenToInstructionMap[instruction.tokenType]) {
                this.tokenToInstructionMap[instruction.tokenType] = [];
            }
            this.tokenToInstructionMap[instruction.tokenType].push(instruction);
        }
    }

    initTokenSet(): void {
        for (let instruction of instructions) {
            this.tokenSet.add(instruction.tokenType);
        }

        this.tokenSet.add(AssemblyTokenType.word);
    }

    getAssertionOpcode(): number {
        return OpCode.assertion;
    }

    getFlagNamesShort(): string[] {
        return ["z", "n", "v", "c"];
    }

}

