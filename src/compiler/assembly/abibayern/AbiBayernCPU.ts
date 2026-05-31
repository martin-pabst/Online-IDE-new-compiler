import { CPU } from "../CPU";
import { AbiBayernAssemblyMessages } from "./AbiBayernAssemblyMessages";
import { Memory } from "../Memory";
import { AbiBayernMemory } from "./AbiBayernMemory";
import { AssemblyTokenType } from "../AssemblyTokens";
import { AssemblyParser, AssemblyParserResult } from "../AssemblyParser";
import { AssemblyToken } from "../AssemblyLexer";
import { AssemblyParserMessages } from "../language/AssemblyParserMessages";
import { IMain } from "../../common/IMain";
import { ExceptionPrinter } from "../../common/interpreter/ExceptionPrinter";
import { IRange } from "monaco-editor";
import { CompilerFile } from "../../common/module/CompilerFile";
import { Thread } from "../../common/interpreter/Thread";

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
}
type Instruction = {
    type: AssemblyTokenType, jumpType: "branch" | "jump" | "nojump", argumentType: "Address" | "Immediate" | "Indirect" | "None", OpCode: OpCode, description: string,
    exec: (cpu: AbiBayernCPU) => boolean // returns true on program end
};

var instructions: Instruction[] = [
    {
        type: AssemblyTokenType.load, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.load, description: AbiBayernAssemblyMessages.LoadAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.accumulator = cpu.memory.read(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.store, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.store, description: AbiBayernAssemblyMessages.StoreAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.memory.write(cpu.readOperand(), cpu.accumulator); return false; }
    },
    {
        type: AssemblyTokenType.add, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.add, description: AbiBayernAssemblyMessages.AddAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator + cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.sub, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.sub, description: AbiBayernAssemblyMessages.SubAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator - cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.mul, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.mul, description: AbiBayernAssemblyMessages.MulAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator * cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.div, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.div, description: AbiBayernAssemblyMessages.DivAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator / cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.mod, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.mod, description: AbiBayernAssemblyMessages.ModAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator % cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.and, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.and, description: AbiBayernAssemblyMessages.AndAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator & cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.or, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.or, description: AbiBayernAssemblyMessages.OrAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator | cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.xor, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.xor, description: AbiBayernAssemblyMessages.XorAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator ^ cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.cmp, jumpType: "nojump", argumentType: "Address", OpCode: OpCode.cmp, description: AbiBayernAssemblyMessages.CmpAddress(),
        exec: (cpu: AbiBayernCPU) => { cpu.cmp(cpu.memory.read(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.load, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.loadIndirect, description: AbiBayernAssemblyMessages.LoadIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.accumulator = cpu.memory.readIndirect(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.store, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.storeIndirect, description: AbiBayernAssemblyMessages.StoreIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.memory.writeIndirect(cpu.readOperand(), cpu.accumulator); return false; }
    },
    {
        type: AssemblyTokenType.add, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.addIndirect, description: AbiBayernAssemblyMessages.AddIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator + cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.sub, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.subIndirect, description: AbiBayernAssemblyMessages.SubIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator - cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.mul, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.mulIndirect, description: AbiBayernAssemblyMessages.MulIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator * cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.div, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.divIndirect, description: AbiBayernAssemblyMessages.DivIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator / cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.mod, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.modIndirect, description: AbiBayernAssemblyMessages.ModIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator % cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.and, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.andIndirect, description: AbiBayernAssemblyMessages.AndIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator & cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.or, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.orIndirect, description: AbiBayernAssemblyMessages.OrIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator | cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.xor, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.xorIndirect, description: AbiBayernAssemblyMessages.XorIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator ^ cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.cmp, jumpType: "nojump", argumentType: "Indirect", OpCode: OpCode.cmpIndirect, description: AbiBayernAssemblyMessages.CmpIndirect(),
        exec: (cpu: AbiBayernCPU) => { cpu.cmp(cpu.memory.readIndirect(cpu.readOperand())); return false; }
    },

    {
        type: AssemblyTokenType.jmp, jumpType: "jump", argumentType: "Address", OpCode: OpCode.jmp, description: AbiBayernAssemblyMessages.Jmp(),
        exec: (cpu: AbiBayernCPU) => { cpu.setProgramCounter(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jeq, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jeq, description: AbiBayernAssemblyMessages.Jeq(),
        exec: (cpu: AbiBayernCPU) => { cpu.jeq(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jne, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jne, description: AbiBayernAssemblyMessages.Jne(),
        exec: (cpu: AbiBayernCPU) => { cpu.jne(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jgt, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jgt, description: AbiBayernAssemblyMessages.Jgt(),
        exec: (cpu: AbiBayernCPU) => { cpu.jgt(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jge, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jge, description: AbiBayernAssemblyMessages.Jge(),
        exec: (cpu: AbiBayernCPU) => { cpu.jge(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jlt, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jlt, description: AbiBayernAssemblyMessages.Jlt(),
        exec: (cpu: AbiBayernCPU) => { cpu.jlt(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jle, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jle, description: AbiBayernAssemblyMessages.Jle(),
        exec: (cpu: AbiBayernCPU) => { cpu.jle(cpu.readOperand()); return false; }
    },

    {
        type: AssemblyTokenType.jmpp, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpp, description: AbiBayernAssemblyMessages.Jmpp(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpp(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jmpn, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpn, description: AbiBayernAssemblyMessages.Jmpn(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpn(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jmpz, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpz, description: AbiBayernAssemblyMessages.Jmpz(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpz(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jmpv, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpv, description: AbiBayernAssemblyMessages.Jmpv(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpv(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jmpc, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpc, description: AbiBayernAssemblyMessages.Jmpc(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpc(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jmpnp, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpnp, description: AbiBayernAssemblyMessages.Jmpnp(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpnp(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jmpnn, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpnn, description: AbiBayernAssemblyMessages.Jmpnn(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpnn(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jmpnz, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpnz, description: AbiBayernAssemblyMessages.Jmpnz(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpnz(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jmpnv, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpnv, description: AbiBayernAssemblyMessages.Jmpnv(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpnv(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.jmpnc, jumpType: "branch", argumentType: "Address", OpCode: OpCode.jmpnc, description: AbiBayernAssemblyMessages.Jmpnc(),
        exec: (cpu: AbiBayernCPU) => { cpu.jmpnc(cpu.readOperand()); return false; }
    },

    {
        type: AssemblyTokenType.loadi, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.loadi, description: AbiBayernAssemblyMessages.LoadImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.addi, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.addi, description: AbiBayernAssemblyMessages.AddImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator + cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.subi, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.subi, description: AbiBayernAssemblyMessages.SubImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator - cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.muli, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.muli, description: AbiBayernAssemblyMessages.MulImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator * cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.divi, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.divi, description: AbiBayernAssemblyMessages.DivImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(Math.floor(cpu.accumulator / cpu.readOperand())); return false; }
    },
    {
        type: AssemblyTokenType.modi, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.modi, description: AbiBayernAssemblyMessages.ModImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator % cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.andi, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.andi, description: AbiBayernAssemblyMessages.AndImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator & cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.ori, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.ori, description: AbiBayernAssemblyMessages.OrImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator | cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.xori, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.xori, description: AbiBayernAssemblyMessages.XorImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.setAccu(cpu.accumulator ^ cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.cmpi, jumpType: "nojump", argumentType: "Immediate", OpCode: OpCode.cmpi, description: AbiBayernAssemblyMessages.CmpImmediate(),
        exec: (cpu: AbiBayernCPU) => { cpu.cmp(cpu.readOperand()); return false; }
    },
    {
        type: AssemblyTokenType.hold, jumpType: "nojump", argumentType: "None", OpCode: OpCode.hold, description: AbiBayernAssemblyMessages.Hold(),
        exec: (cpu: AbiBayernCPU) => { return true; }
    },
    {
        type: AssemblyTokenType.halt, jumpType: "nojump", argumentType: "None", OpCode: OpCode.hold, description: AbiBayernAssemblyMessages.Hold(),
        exec: (cpu: AbiBayernCPU) => { return true; }
    }
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

    constructor(assemblyParserResult: AssemblyParserResult, main: IMain) {
        super(assemblyParserResult, main);
        this.memory = new AbiBayernMemory(0x1000); // 64 * 4 KB of memory
        this.initOpcodeToInstructionMap();
        this.reset();
    }

    getTokensWithDescription(): { tokenIdentifier: string; description: string; }[] {
        return instructions.map(instr => ({ tokenIdentifier: AssemblyTokenType[instr.type], description: instr.description }));
    }

    getPseudoDirectivesWithDescription(): { directiveIdentifier: string; description: string; }[] {
        return [
            { directiveIdentifier: ".origin", description: AbiBayernAssemblyMessages.OriginPseudoDirective() },];
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
            switch (instruction.argumentType) {
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
        if (instruction.argumentType === "None" || instruction.argumentType === "Immediate") {
            return { location: undefined, indirectLocation: undefined };
        }
        let mem = this.memory.dump();
        let operandAddress = mem[this.programCounter + 1];
        if (operandAddress < 0 || operandAddress >= mem.length) return { location: undefined, indirectLocation: undefined };
        if (instruction.argumentType === "Address") {
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
                throw new Error(AbiBayernAssemblyMessages.UnknownOpCode(opcode, --this.programCounter));
            }
        } catch (error) {
            let range = this.assemblyParserResult.sourceMap.get(this.programCounter);
            let irange: IRange | undefined = range ? { startLineNumber: range.lineNumber, startColumn: range.column, endLineNumber: range.lineNumber, endColumn: range.column } : undefined;
            let errorMessage = error instanceof Error ? error.message : String(error);
            let html = ExceptionPrinter.getHTMLWithLinksForMessage(errorMessage, irange, this.assemblyParserResult.file, this.main);
            this.main.getInterpreter().printManager?.printHtmlElement(html);
            if (irange) {
                this.main.showProgramPosition(this.assemblyParserResult.file, irange, false);
                this.main.getInterpreter().exceptionMarker?.markExceptionByFileAndRange(this.assemblyParserResult.file, irange);
            }
            alert(errorMessage + "\n\n Details siehe Reiter 'Ausgabe'.");
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
        this.flags.overflow = result > 0x7FFF || result < -0x8000;
        this.flags.carry = this.flags.overflow;
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
        this.tokens = tokens;
        this.initBeforeParsing();

        this.skip(AssemblyTokenType.lineBreak);

        while (!this.programEndReached()) this.parseInstructionOrData();

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
                    this.parseSetLabel(token);
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
        let instruction = instructionsForToken.find(instr => instr.argumentType === "Indirect");
        if (instruction) {
            this.next();
            let addressToken = this.currentToken();
            if (addressToken.type === AssemblyTokenType.number) {
                if (this.checkIfTokenIs16BitUnsignedNumber(addressToken)) {
                    let address = addressToken.value as number;
                    this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                    this.writeToMemory(instruction.OpCode, address);
                }
                this.next();
                if (this.expect(AssemblyTokenType.rightBracket)) this.next();
            } else if (addressToken.type === AssemblyTokenType.identifier) {
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
        let instruction = instructionsForToken.find(instr => instr.argumentType === "None");
        if (instruction) {
            this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
            this.writeToMemory(instruction.OpCode);
        } else {
            this.pushError(AbiBayernAssemblyMessages.NoArgumentAfterInstructionExpected(token.text), "error", token.range);
        }
    }

    parseInstructionWithNumberArgument(token: AssemblyToken, instructionsForToken: Instruction[]) {
        let numberToken = this.currentToken();
        this.next();
        if (this.checkIfTokenIs16BitSignedNumber(numberToken)) {
            let instruction = instructionsForToken.find(instr => instr.argumentType === "Immediate" || instr.argumentType === "Address");
            if (instruction) {
                let value = numberToken.value as number;
                this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
                this.writeToMemory(instruction.OpCode, value);
            } else {
                this.pushError(AbiBayernAssemblyMessages.NumberAfterInstructionNotExpected(token.text), "error", numberToken.range);
            }
        }
    }

    parseInstructionWithLabelArgument(token: AssemblyToken, instructionsForToken: Instruction[]) {
        let labelToken = this.currentToken();
        this.next();
        let instruction = instructionsForToken.find(instr => instr.argumentType === "Address");
        if (instruction) {
            this.addSourceMapEntry(token.range, this.getProgramCounterAbsolute());
            this.writeToMemory(instruction.OpCode);
            let labelAddress = this.getLabelAddressAbsolute(labelToken, this.getProgramCounterAbsolute());
            this.writeToMemory(labelAddress);
        } else {
            this.pushError(AbiBayernAssemblyMessages.LabelAfterInstructionNotExpected(token.text), "error", labelToken.range);
        }
    }

    parseWord(token: AssemblyToken): void {
        do {
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
                    this.next();
                    if (this.expect(AssemblyTokenType.number)) {
                        let addressToken = this.currentToken();
                        this.next();
                        let address = (addressToken.value as number);
                        if (address < 0 || address > 0x8000) {
                            this.pushError(AbiBayernAssemblyMessages.OriginAddressOutOfBounds(address, 0x8000 - 1), "error", addressToken.range);
                        } else {
                            this.setOrigin(address);
                        }
                    }
                    break;
                default:
                    this.pushError(AbiBayernAssemblyMessages.UnknownPseudoDirective(identifierToken.text),
                        "error", identifierToken.range);
                    break;
            }
        }
        this.expectLineBreakOrEndOfSourcecode();
    }

    getTokenSet(): Set<AssemblyTokenType> {
        return this.tokenSet;
    }

    initTokenToInstructionMap(): void {
        for (let instruction of instructions) {
            if (!this.tokenToInstructionMap[instruction.type]) {
                this.tokenToInstructionMap[instruction.type] = [];
            }
            this.tokenToInstructionMap[instruction.type].push(instruction);
        }
    }

    initTokenSet(): void {
        for (let instruction of instructions) {
            this.tokenSet.add(instruction.type);
        }

        this.tokenSet.add(AssemblyTokenType.word);
    }

}