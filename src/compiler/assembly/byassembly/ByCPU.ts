import { CPU, type Architecture } from "../CPU";
import { Memory } from "../Memory";
import { ByMemory } from "./ByMemory";
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
import { ByAssemblyMessages } from "./ByAssemblyMessages";
import { ByArchitecture } from "./ByArchitecture";

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

    jsr = 0x21,
    rts = 0x22,
    rsv = 0x23,
    rel = 0x24,
    push = 0x25,
    pop = 0x26,

    loadSPRel = 0x27,
    storeSPRel = 0x28,

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

    jsr = BaseOpCode.jsr | AddressingMode.Address,
    call = BaseOpCode.jsr | AddressingMode.Address,

    rts = BaseOpCode.rts | AddressingMode.None,
    return = BaseOpCode.rts | AddressingMode.Address,

    rsv = BaseOpCode.rsv | AddressingMode.Immediate,
    rel = BaseOpCode.rel | AddressingMode.Immediate,

    push = BaseOpCode.push | AddressingMode.None,
    pop = BaseOpCode.pop | AddressingMode.None,

    loadSPRel = BaseOpCode.loadSPRel | AddressingMode.Immediate,
    storeSPRel = BaseOpCode.storeSPRel | AddressingMode.Immediate,

    hold = BaseOpCode.hold | AddressingMode.None,
    assertion = BaseOpCode.assertion | AddressingMode.None
}
type Instruction = {
    tokenType: AssemblyTokenType, jumpType: "branch" | "jump" | "nojump",
    adressMode: "Address" | "Immediate" | "Indirect" | "None",
    OpCode: OpCode,
    description: (...parameterValues: (string | number)[]) => string,
    parameterCount: number,
    exec: (cpu: ByCPU) => boolean // returns true on program end
};

var instructions: Instruction[] = [
    {
        tokenType: AssemblyTokenType.load, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.load, description: ByAssemblyMessages.LoadAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.accumulator = cpu.memory.read(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.store, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.store, description: ByAssemblyMessages.StoreAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.memory.write(cpu.readAddressOperand(), cpu.accumulator); return false; }
    },
    {
        tokenType: AssemblyTokenType.add, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.add, description: ByAssemblyMessages.AddAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator + cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.sub, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.sub, description: ByAssemblyMessages.SubAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator - cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.mul, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.mul, description: ByAssemblyMessages.MulAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator * cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.div, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.div, description: ByAssemblyMessages.DivAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator / cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.mod, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.mod, description: ByAssemblyMessages.ModAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator % cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.and, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.and, description: ByAssemblyMessages.AndAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator & cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.or, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.or, description: ByAssemblyMessages.OrAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator | cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.xor, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.xor, description: ByAssemblyMessages.XorAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator ^ cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.shr, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.shr, description: ByAssemblyMessages.ShrAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.shr(cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.shl, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.shl, description: ByAssemblyMessages.ShlAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.shl(cpu.accumulator << cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.cmp, jumpType: "nojump", adressMode: "Address", OpCode: OpCode.cmp, description: ByAssemblyMessages.CmpAddress, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.cmp(cpu.memory.read(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.load, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.loadIndirect, description: ByAssemblyMessages.LoadIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.accumulator = cpu.memory.readIndirect(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.store, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.storeIndirect, description: ByAssemblyMessages.StoreIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.memory.writeIndirect(cpu.readAddressOperand(), cpu.accumulator); return false; }
    },
    {
        tokenType: AssemblyTokenType.add, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.addIndirect, description: ByAssemblyMessages.AddIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator + cpu.memory.readIndirect(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.sub, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.subIndirect, description: ByAssemblyMessages.SubIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator - cpu.memory.readIndirect(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.mul, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.mulIndirect, description: ByAssemblyMessages.MulIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator * cpu.memory.readIndirect(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.div, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.divIndirect, description: ByAssemblyMessages.DivIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator / cpu.memory.readIndirect(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.mod, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.modIndirect, description: ByAssemblyMessages.ModIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator % cpu.memory.readIndirect(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.and, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.andIndirect, description: ByAssemblyMessages.AndIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator & cpu.memory.readIndirect(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.or, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.orIndirect, description: ByAssemblyMessages.OrIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator | cpu.memory.readIndirect(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.xor, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.xorIndirect, description: ByAssemblyMessages.XorIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator ^ cpu.memory.readIndirect(cpu.readAddressOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.cmp, jumpType: "nojump", adressMode: "Indirect", OpCode: OpCode.cmpIndirect, description: ByAssemblyMessages.CmpIndirect, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.cmp(cpu.memory.readIndirect(cpu.readAddressOperand())); return false; }
    },

    {
        tokenType: AssemblyTokenType.jmp, jumpType: "jump", adressMode: "Address", OpCode: OpCode.jmp, description: ByAssemblyMessages.Jmp, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setProgramCounter(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jeq, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jeq, description: ByAssemblyMessages.Jeq, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jeq(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jne, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jne, description: ByAssemblyMessages.Jne, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jne(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jgt, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jgt, description: ByAssemblyMessages.Jgt, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jgt(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jge, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jge, description: ByAssemblyMessages.Jge, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jge(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jlt, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jlt, description: ByAssemblyMessages.Jlt, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jlt(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jle, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jle, description: ByAssemblyMessages.Jle, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jle(cpu.readAddressOperand()); return false; }
    },

    {
        tokenType: AssemblyTokenType.jmpp, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpp, description: ByAssemblyMessages.Jmpp, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jmpp(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpn, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpn, description: ByAssemblyMessages.Jmpn, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jmpn(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpz, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpz, description: ByAssemblyMessages.Jmpz, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jmpz(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpv, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpv, description: ByAssemblyMessages.Jmpv, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jmpv(cpu.readAddressOperand()); return false; }
    },
    // {
    //     tokenType: AssemblyTokenType.jmpc, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpc, description: AbiBayernAssemblyMessages.Jmpc, parameterCount: 1,
    //     exec: (cpu: AbiBayernCPU) => { cpu.jmpc(cpu.readOperand()); return false; }
    // },
    {
        tokenType: AssemblyTokenType.jmpnp, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnp, description: ByAssemblyMessages.Jmpnp, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jmpnp(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpnn, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnn, description: ByAssemblyMessages.Jmpnn, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jmpnn(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpnz, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnz, description: ByAssemblyMessages.Jmpnz, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jmpnz(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.jmpnv, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnv, description: ByAssemblyMessages.Jmpnv, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jmpnv(cpu.readAddressOperand()); return false; }
    },
    // {
    //     tokenType: AssemblyTokenType.jmpnc, jumpType: "branch", adressMode: "Address", OpCode: OpCode.jmpnc, description: AbiBayernAssemblyMessages.Jmpnc, parameterCount: 1,
    //     exec: (cpu: AbiBayernCPU) => { cpu.jmpnc(cpu.readOperand()); return false; }
    // },
    {
        tokenType: AssemblyTokenType.loadi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.loadi, description: ByAssemblyMessages.LoadImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.addi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.addi, description: ByAssemblyMessages.AddImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator + cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.subi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.subi, description: ByAssemblyMessages.SubImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator - cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.muli, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.muli, description: ByAssemblyMessages.MulImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator * cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.divi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.divi, description: ByAssemblyMessages.DivImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(Math.floor(cpu.accumulator / cpu.readDataOperand())); return false; }
    },
    {
        tokenType: AssemblyTokenType.modi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.modi, description: ByAssemblyMessages.ModImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator % cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.andi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.andi, description: ByAssemblyMessages.AndImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator & cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.ori, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.ori, description: ByAssemblyMessages.OrImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator | cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.xori, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.xori, description: ByAssemblyMessages.XorImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.setAccu(cpu.accumulator ^ cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.shri, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.shri, description: ByAssemblyMessages.ShrImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.shr(cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.shli, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.shli, description: ByAssemblyMessages.ShlImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.shl(cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.cmpi, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.cmpi, description: ByAssemblyMessages.CmpImmediate, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.cmp(cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.not, jumpType: "nojump", adressMode: "None", OpCode: OpCode.not, description: ByAssemblyMessages.Not, parameterCount: 0,
        exec: (cpu: ByCPU) => { cpu.not(); return false; }
    },
    {
        tokenType: AssemblyTokenType.jsr, jumpType: "jump", adressMode: "Address", OpCode: OpCode.jsr, description: ByAssemblyMessages.Jsr, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jsr(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.call, jumpType: "jump", adressMode: "Address", OpCode: OpCode.jsr, description: ByAssemblyMessages.Jsr, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.jsr(cpu.readAddressOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.rts, jumpType: "nojump", adressMode: "None", OpCode: OpCode.rts, description: ByAssemblyMessages.Rts, parameterCount: 0,
        exec: (cpu: ByCPU) => { cpu.rts(); return false; }
    },
    {
        tokenType: AssemblyTokenType.return, jumpType: "nojump", adressMode: "None", OpCode: OpCode.rts, description: ByAssemblyMessages.Rts, parameterCount: 0,
        exec: (cpu: ByCPU) => { cpu.rts(); return false; }
    },
    {
        tokenType: AssemblyTokenType.rsv, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.rsv, description: ByAssemblyMessages.Rsv, parameterCount: 1,
        exec: (cpu: ByCPU) => { return false; }
    },
    {
        tokenType: AssemblyTokenType.rel, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.rel, description: ByAssemblyMessages.Rel, parameterCount: 1,
        exec: (cpu: ByCPU) => { return false; }
    },
    {
        tokenType: AssemblyTokenType.push, jumpType: "nojump", adressMode: "None", OpCode: OpCode.push, description: ByAssemblyMessages.Push, parameterCount: 0,
        exec: (cpu: ByCPU) => { cpu.push(); return false; }
    },
    {
        tokenType: AssemblyTokenType.pop, jumpType: "nojump", adressMode: "None", OpCode: OpCode.pop, description: ByAssemblyMessages.Pop, parameterCount: 0,
        exec: (cpu: ByCPU) => { cpu.pop(); return false; }
    },
    {
        tokenType: AssemblyTokenType.load, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.loadSPRel, description: ByAssemblyMessages.LoadSpRelative, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.accumulator = cpu.memory.read(cpu.stackPointer + cpu.readDataOperand()); return false; }
    },
    {
        tokenType: AssemblyTokenType.store, jumpType: "nojump", adressMode: "Immediate", OpCode: OpCode.storeSPRel, description: ByAssemblyMessages.StoreSpRelative, parameterCount: 1,
        exec: (cpu: ByCPU) => { cpu.memory.write(cpu.stackPointer + cpu.readDataOperand(), cpu.accumulator); return false; }
    },
    {
        tokenType: AssemblyTokenType.hold, jumpType: "nojump", adressMode: "None", OpCode: OpCode.hold, description: ByAssemblyMessages.Hold, parameterCount: 0,
        exec: (cpu: ByCPU) => { return true; }
    },
    {
        tokenType: AssemblyTokenType.halt, jumpType: "nojump", adressMode: "None", OpCode: OpCode.hold, description: ByAssemblyMessages.Hold, parameterCount: 0,
        exec: (cpu: ByCPU) => { return true; }
    },
    // {
    //     tokenType: AssemblyTokenType.assert, jumpType: "nojump", adressMode: "None", OpCode: OpCode.assertion, description: AbiBayernAssemblyMessages.Assert, parameterCount: 0,
    //     exec: (cpu: AbiBayernCPU) => { cpu.assertMemory(); return true; }
    // },

];

var specialCompletionComments: { tokenType: AssemblyTokenType, description: () => string }[] = [
    { tokenType: AssemblyTokenType.load, description: ByAssemblyMessages.LoadCompletionComment },
    { tokenType: AssemblyTokenType.store, description: ByAssemblyMessages.StoreCompletionComment },
    { tokenType: AssemblyTokenType.add, description: ByAssemblyMessages.AddCompletionComment },
    { tokenType: AssemblyTokenType.sub, description: ByAssemblyMessages.SubCompletionComment },
    { tokenType: AssemblyTokenType.mul, description: ByAssemblyMessages.MulCompletionComment },
    { tokenType: AssemblyTokenType.div, description: ByAssemblyMessages.DivCompletionComment },
    { tokenType: AssemblyTokenType.mod, description: ByAssemblyMessages.ModCompletionComment },
    { tokenType: AssemblyTokenType.and, description: ByAssemblyMessages.AndCompletionComment },
    { tokenType: AssemblyTokenType.or, description: ByAssemblyMessages.OrCompletionComment },
    { tokenType: AssemblyTokenType.xor, description: ByAssemblyMessages.XorCompletionComment },
    { tokenType: AssemblyTokenType.cmp, description: ByAssemblyMessages.CmpCompletionComment },
    { tokenType: AssemblyTokenType.word, description: ByAssemblyMessages.WordCompletionComment },
];



export class ByCPU extends CPU {

    description = ByAssemblyMessages.CPUDescription();

    accumulator: number = 0;
    programCounter: number = 0;
    stackPointer: number = 0;   // Stack grows downwards.

    flagNames = ['zero', 'negative', 'overflow', 'carry'];
    flagNamesShort = ['Z', 'N', 'V', 'C'];

    registerNames = ['Accumulator', 'Program Counter', 'Stack Pointer'];
    registerNamesShort = ['AC', 'PC', 'SP'];

    flags: {
        zero: boolean;
        negative: boolean;
        overflow: boolean;
        carry: boolean;
    }

    memory: ByMemory;

    opcodeToInstructionMap: { [opcode: number]: Instruction } = {};
    specialCompletionCommentTokens: Set<AssemblyTokenType>;

    architecture: ByArchitecture;

    constructor(assemblyParserResult: AssemblyParserResult, main: IMain, architectureIdentifier?: string) {
        super(assemblyParserResult, main);
        this.memory = new ByMemory(0x1000); // 64 * 4 KB of memory
        this.initOpcodeToInstructionMap();
        this.specialCompletionCommentTokens = new Set<AssemblyTokenType>();
        for (let item of specialCompletionComments) {
            this.specialCompletionCommentTokens.add(item.tokenType);
        }
        this.architecture = ByArchitecture.getArchitectureByName(architectureIdentifier);
        this.reset();
    }

    getArchitectureIdentifiers(): Architecture[] {
        return ByArchitecture.getArchitectures().map(arch => ({ identifier: arch.identifier, localizedName: arch.getLocalizedName()() }));
    }

    getName(): string {
        return ByAssemblyMessages.CPUName();
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
                description: () => instr.description(...getPlaceholderOperands(instr)),
                insertText: AssemblyTokenType[instr.tokenType] + (instr.parameterCount > 0 ? ' ' : '\n') 
            }))
            .concat(specialCompletionComments.map(item => ({ tokenIdentifier: AssemblyTokenType[item.tokenType], description: item.description, insertText: undefined})));
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


    getPseudoDirectivesWithDescription(): { directiveIdentifier: string; description: () => string; insertText?: string }[] {
        return [
            { directiveIdentifier: ".origin", description: ByAssemblyMessages.OriginPseudoDirective, insertText: '.origin $0' },
            { directiveIdentifier: ".assert", description: ByAssemblyMessages.AssertPseudoDirective, insertText: '.assert { $1 }\n$0' },];
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
            'Program Counter': this.programCounter,
            'Stack Pointer': this.stackPointer
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
                case "Immediate": return 2;
                case "Address":
                case "Indirect": return this.architecture.cellsPerAddressOperand + 1;
            }
        }
        return 1; // In case of invalid opcode
    }

    getAddressOperandLocationOfCurrentStatement(): { location: number | undefined; indirectLocation: number | undefined; } {
        let opcode = this.memory.dump()[this.programCounter];
        let mem = this.memory.dump();
        let operandAddress = mem[this.programCounter + 1];

        if(opcode === OpCode.loadSPRel || opcode === OpCode.storeSPRel) {
            return { location: this.stackPointer + operandAddress, indirectLocation: undefined };
        }

        let instruction = this.opcodeToInstructionMap[opcode];
        if (!instruction) return { location: undefined, indirectLocation: undefined };
        if (instruction.adressMode === "None" || instruction.adressMode === "Immediate") {
            return { location: undefined, indirectLocation: undefined };
        }
        if (operandAddress < 0 || operandAddress >= mem.length) return { location: undefined, indirectLocation: undefined };
        if (instruction.adressMode === "Address") {
            return { location: operandAddress, indirectLocation: undefined };
        } else { // Indirect
            let indirectLocation = mem[operandAddress];
            if (indirectLocation < 0 || indirectLocation >= mem.length) return { location: undefined, indirectLocation: undefined };
            return { location: operandAddress, indirectLocation: indirectLocation };
        }
    }

    getStackPointer(): number {
        return this.stackPointer;
    }

    reset(): void {
        this.accumulator = 0;
        this.programCounter = 0;
        this.stackPointer = 0;
        this.flags = {
            'zero': false,
            'negative': false,
            'overflow': false,
            'carry': false
        };
        if (this.assemblyParserResult) {
            this.programCounter = this.assemblyParserResult.startAddress ?? this.assemblyParserResult.codeParts[0].offset;
            this.stackPointer = this.assemblyParserResult.initialStackPointer ?? this.memory.size() - 1;
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
                        throw new Error(ByAssemblyMessages.UnknownOpCode(opcode, --this.programCounter));
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

    readAddressOperand(): number {
        let address = this.architecture.loadAddressOperand(this.programCounter, this.memory.dump());
        this.programCounter += this.architecture.cellsPerAddressOperand;
        return address;
    }


    readDataOperand(): number {
        return this.memory.read(this.programCounter++);
    }

    setAccu(value: number): void {
        value = Math.floor(value); // Ensure value is an integer

        if (value > this.architecture.valueRangeMax || value < this.architecture.valueRangeMin) {
            this.flags.overflow = true;
            value = this.architecture.sanitizeValue(value);
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

    jsr(address: number): void {
        let returnAddress = this.programCounter + this.architecture.cellsPerAddressOperand; // Address of the next instruction after the call
        let addressValues = this.architecture.addressOperandToMemoryCellValues(returnAddress);

        for(let i = 0; i < addressValues.length; i++) {
            this.memory.write(--this.stackPointer, addressValues[addressValues.length - 1 - i]);
        }
        this.setProgramCounter(address);
    }

    rts(): void {
        this.setProgramCounter(this.architecture.loadAddressOperand(this.stackPointer, this.memory.dump()));
        this.stackPointer += this.architecture.cellsPerAddressOperand;
    }

    rsv(size: number): void {
        this.stackPointer -= size;
    }

    rel(size: number): void {
        this.stackPointer += size;
    }

    push(): void {
        this.memory.write(--this.stackPointer, this.accumulator);
    }

    pop(): void {
        this.setAccu(this.memory.read(this.stackPointer++));
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
        let shiftedValue = this.architecture.sanitizeValue(absoluteValue << shiftAmount);
        this.flags.carry = (absoluteValue & ((this.architecture.valueRangeMax + 1) >> (shiftAmount - 1))) !== 0; // Capture the last bit shifted out for carry flag
        this.flags.zero = shiftedValue === 0;
        this.flags.negative = sign === -1 && shiftedValue !== 0;
        this.setAccu(shiftedValue * sign);
    }


}

export class ByParser extends AssemblyParser {

    tokenToInstructionMap: { [type: number]: Instruction[] } = {};
    tokenSet: Set<AssemblyTokenType> = new Set();
    architecture: ByArchitecture;

    constructor(architectureIdentifier?: string) {
        super();
        this.initTokenSet();
        this.initTokenToInstructionMap();
        this.architecture = ByArchitecture.getArchitectureByName(architectureIdentifier);
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
                if (this.checkIfTokenIsValidAddress(addressToken)) {
                    let address = addressToken.value as number;
                    this.registerInstruction(instruction, token.range, [address]);
                    this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                    this.writeToMemory([instruction.OpCode, address], false);
                }
                this.next();
                if (this.expect(AssemblyTokenType.rightBracket)) this.next();
            } else if (addressToken.type === AssemblyTokenType.identifier) {
                this.registerInstruction(instruction, token.range, [addressToken.text]);
                this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                this.writeToMemory([instruction.OpCode], false);
                let labelAddress = this.getLabelAddressAbsolute(addressToken, this.getProgramCounterAbsolute(), undefined);
                this.writeToMemory(this.architecture.addressOperandToMemoryCellValues(labelAddress), false);
                this.next();
                if (this.expect(AssemblyTokenType.rightBracket)) this.next();
            } else {
                this.pushError(ByAssemblyMessages.NumberOrLabelExpectedInIndirectAdress(token.text), "error", token.range);
                this.next();
                this.skip(AssemblyTokenType.rightBracket);
            }
        } else {
            this.pushError(ByAssemblyMessages.IndirectArgumentAfterInstructionNotExpected(token.text), "error", token.range);
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
            this.writeToMemory([instruction.OpCode], false);
        } else {
            this.pushError(ByAssemblyMessages.NoArgumentAfterInstructionFound(token.text), "error", token.range);
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
        if(this.isToken(AssemblyTokenType.leftBracket)) {
            this.parseInstructionWithStackRelativeArgument(token, numberToken.value as number, instructionsForToken);
            return;
        }
        if (instruction) {
            if (instruction.adressMode === "Immediate" && this.checkIfTokenIsValidValue(numberToken) ||
                (instruction.adressMode === "Address" && this.checkIfTokenIsValidAddress(numberToken))) {
                let value = numberToken.value as number;
                this.registerInstruction(instruction, token.range, [value]);
                this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                this.writeToMemory([instruction.OpCode], false);
                if (instruction.adressMode === "Immediate") {
                    this.writeToMemory([value], false);
                } else {
                    this.writeToMemory(this.architecture.addressOperandToMemoryCellValues(value), false);
                }
            } else {
                this.registerInstruction(instruction, token.range, instruction.adressMode === "Immediate" ? [70] : ["address"]);
            }
        } else {
            this.pushError(ByAssemblyMessages.NumberAfterInstructionNotExpected(token.text), "error", numberToken.range);
            let specialCompletionComment = specialCompletionComments.find(item => item.tokenType === token.type);
            if (specialCompletionComment) {
                this.addHoverEntry(token.range, specialCompletionComment.description());
            }
        }
    }

    parseInstructionWithStackRelativeArgument(token: AssemblyToken, operand: number, instructionsForToken: Instruction[]) {
        this.next(); // skip left bracket
        let spToken = this.currentToken();
        if(!this.isToken(AssemblyTokenType.identifier) || spToken.text.toLowerCase() !== "sp") {
            this.pushError(ByAssemblyMessages.SpExpectedInStackRelativeAddress(), "error", spToken.range);
            this.readTillBeginOfNextLine();
            return;
        }
        this.next(); // skip sp identifier
        if(this.expect(AssemblyTokenType.rightBracket)) this.next();

        let instruction: Instruction | undefined;
        if(token.type === AssemblyTokenType.load) {
            instruction = instructionsForToken.find(instr => instr.OpCode === OpCode.loadSPRel);            
        } else if(token.type === AssemblyTokenType.store) {
            instruction = instructionsForToken.find(instr => instr.OpCode === OpCode.storeSPRel);
        } else {
            this.pushError(ByAssemblyMessages.StackRelativeAddressingOnlySupportedForLoadAndStore(token.text), "error", token.range);
        }

        if(instruction) {
            this.registerInstruction(instruction, token.range, [operand]);
            this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
            this.writeToMemory(instruction.OpCode, false);
            this.writeToMemory(operand, false);
        }
        
        this.readTillBeginOfNextLine();

    }

    parseInstructionWithLabelArgument(token: AssemblyToken, instructionsForToken: Instruction[]) {
        let labelToken = this.currentToken();
        this.next();
        let instruction = instructionsForToken.find(instr => instr.adressMode === "Address");
        if (instruction) {
            this.registerInstruction(instruction, token.range, [labelToken.text]);
            this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
            this.writeToMemory(instruction.OpCode, false);
            let labelAddress = this.getLabelAddressAbsolute(labelToken, this.getProgramCounterAbsolute(), undefined);
            this.writeToMemory(this.architecture.addressOperandToMemoryCellValues(labelAddress), false);
        } else {
            this.pushError(ByAssemblyMessages.LabelAfterInstructionNotExpected(token.text), "error", labelToken.range);
            let specialCompletionComment = specialCompletionComments.find(item => item.tokenType === token.type);
            if (specialCompletionComment) {
                this.addHoverEntry(token.range, specialCompletionComment.description());
            }
        }
    }

    parseWord(token: AssemblyToken): void {

        this.addHoverEntry(token.range, ByAssemblyMessages.WordDirectiveHoverMessage(70));

        let firstLoop = true;
        do {
            if (!firstLoop) {
                this.next();
            }
            firstLoop = false;
            let numberToken = this.currentToken();
            if (this.checkIfTokenIsValidValue(numberToken)) {
                let value = numberToken.value as number;
                this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                this.writeToMemory(value, true);
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
                        if (!this.checkIfTokenIsValidAddress(addressToken)) {
                            // Error is already pushed by checkIfTokenIsValidAddress
                            return;
                        }
                        this.setOrigin(address);
                    }
                    this.addHoverEntry(Range.plusRange(identifierToken.range, addressTokenRange),
                        ByAssemblyMessages.OriginHoverMessage(address));
                    break;
                case "assert":
                    this.parseAssertion(identifierToken);
                    break;
                default:
                    this.pushError(ByAssemblyMessages.UnknownPseudoDirective(identifierToken.text),
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

    getRegisterNamesShort(): string[] {
        return ["a", "pc"];
    }

    addressToCellValues(address: number): number[] {
        return this.architecture.addressOperandToMemoryCellValues(address);
    }

    checkIfTokenIsValidAddress(token: AssemblyToken): boolean {
        if (token.type !== AssemblyTokenType.number) {
            this.pushError(AssemblyParserMessages.NumberExpected(), "error", token.range);
            return false;
        }
        let valid = this.architecture.isValidAddress(token.value as number);

        if (!valid) {
            this.pushError(AssemblyParserMessages.AddressOutOfRange(token.value as number, 0, 0x10000), "error", token.range);
        }

        return valid;
    }

    checkIfTokenIsValidValue(token: AssemblyToken): boolean {
        if (token.type !== AssemblyTokenType.number) {
            this.pushError(AssemblyParserMessages.NumberExpected(), "error", token.range);
            return false;
        }
        let valid = this.architecture.isValidValue(token.value as number);

        if (!valid) {
            this.pushError(AssemblyParserMessages.ValueOutOfRange(token.value as number, this.architecture.valueRangeMin, this.architecture.valueRangeMax), "error", token.range);
        }

        return valid;
    }

}