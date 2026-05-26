import { JavaReplCompiledModule } from "../../java/parser/repl/JavaReplCompiledModule";
import { ReplReturnValue } from "./ReplReturnValue";
import { Executable } from "../Executable";
import { Program } from "../interpreter/Program";
import { Module } from "../module/Module";

export type ReplState = "standalone" | "none";
export type ProgramAndModule = { module: JavaReplCompiledModule, program: Program | undefined };


export abstract class Repl {

    state: ReplState = "none";

    abstract init(executable: Executable): void;
    abstract executeAsync(statement: string, withMaxSpeed: boolean): Promise<ReplReturnValue>;
    abstract executeSynchronously(statement: string): ReplReturnValue;
    abstract compile(statement: string, withToStringCall: boolean): ProgramAndModule | undefined;
    abstract getCurrentModule(): Module | undefined;
    
}