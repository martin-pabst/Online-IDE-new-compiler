import { TokenType } from "../../java/TokenType";
import { AbiBayernMemory } from "../AbiBayernMemory";
import { AssemblyTokenType } from "../AssemblyTokens";
import { _cpu, AssemblyInstruction, CPU } from "../CPU";
import { AbiBayernAssemblyMessages } from "../language/AbiBayernAssemblyMessages";
import { Memory } from "../Memory";

export class AbiBayernCPU extends CPU {

    keywords: string[] = [
        'load', 'store',
        'add', 'sub', 'mul', 'div', 'mod',
        'jmp', 'jeq', 'jne', 'jgt', 'jge', 'jlt', 'jle',
        'hold', 'word'
    ];

    instrucions: { [type: number]: AssemblyInstruction[] };
    name = AbiBayernAssemblyMessages.AbiBayernCPUName();
    description = AbiBayernAssemblyMessages.AbiBayernCPUDescription();

    accumulator: number = 0;
    programCounter: number = 0;

    flagNames = ['zero', 'negative', 'overflow'];
    flagNamesShort = ['Z', 'N', 'V'];

    registerNames = ['Accumulator', 'Program Counter'];
    registerNamesShort = ['A', 'PC'];

    flags: {
        zero: boolean;
        negative: boolean;
        overflow: boolean;
    }

    memory: AbiBayernMemory;

    constructor() {
        super();
        this.initializeKeywordMap(this.keywords);
        this.memory = new AbiBayernMemory(0x10000); // 64 * 2 KB of memory
        this.setupInstructions();
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

    reset(): void {
        this.accumulator = 0;
        this.programCounter = 0;
        this.flags = {
            'zero': false,
            'negative': false,
            'overflow': false
        };
    }

    setupInstructions(): void {
        [AssemblyTokenType.load, AssemblyTokenType.store, AssemblyTokenType.add, AssemblyTokenType.sub, AssemblyTokenType.mul, AssemblyTokenType.div, AssemblyTokenType.mod].forEach(type => {
            this.instrucions[type] = [
                {
                    type: type,
                    argumentTypes: ['Address'],
                    compiled: AssemblyTokenType[type] + '($0)'
                }
            ];
        });
        [AssemblyTokenType.loadi, AssemblyTokenType.storei, AssemblyTokenType.addi, AssemblyTokenType.subi, AssemblyTokenType.muli, AssemblyTokenType.divi, AssemblyTokenType.modi].forEach(type => {
            this.instrucions[type] = [
                {
                    type: type,
                    argumentTypes: ['Immediate'],
                    compiled: AssemblyTokenType[type] + '($0)'
                }
            ];
        });
        [AssemblyTokenType.jeq, AssemblyTokenType.jne, AssemblyTokenType.jgt, AssemblyTokenType.jge, AssemblyTokenType.jlt, AssemblyTokenType.jle].forEach(type => {
            this.instrucions[type] = [
                {
                    type: type,
                    argumentTypes: ['Address'],
                    jumpType: "branch",
                    compiled: AssemblyTokenType[type] + '($0, $next)'
                }
            ];
        });
        this.instrucions[AssemblyTokenType.jmp] = [
            {
                type: AssemblyTokenType.jmp,
                argumentTypes: ['Address'],
                jumpType: "jump",
                compiled: AssemblyTokenType[AssemblyTokenType.jmp] + '($0)'
            }
        ];

    }

    load(address: number): void {
        this.accumulator = this.memory.read(address);
        this.programCounter += 2;
    }

    addi(value: number): void {
        this.accumulator += value;
        this.programCounter += 2;
    }

    store(address: number): void {
        this.memory.write(address, this.accumulator);
        this.programCounter += 2;
    }

    cmpi(value: number): void {
        this.flags['zero'] = (this.accumulator === value);
        this.flags['negative'] = (this.accumulator < value);
        this.programCounter += 2;
    }

    jlt(indexIfTrue: number, indexIfFalse: number): void {
        if (this.flags['negative']) {
            this.programCounter = indexIfTrue;
        } else {
            this.programCounter = indexIfFalse;
        }
    }

}