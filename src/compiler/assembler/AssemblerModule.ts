import { CodeFragment } from "../common/disassembler/CodeFragment";
import { Thread } from "../common/interpreter/Thread";
import { Module } from "../common/module/Module";

export class AssemblerModule extends Module {

    hasMainProgram(): boolean {
        throw new Error("Method not implemented.");
    }

    startMainProgram(thread: Thread, setOneTimeBreakpointAtFirstVisibleLine: boolean): boolean {
        throw new Error("Method not implemented.");
    }

    isReplModule(): boolean {
        return false;
    }
    
    getCodeFragments(): CodeFragment[] {
        throw new Error("Method not implemented.");
    }

}