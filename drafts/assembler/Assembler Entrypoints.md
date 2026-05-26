# Assembler entrypoints
## Meta information about assembler language
All meta information about assembler language is collected in class  [`AssemblerLanguage.ts`](../../src/compiler/assembler/AssemblerLanguage.ts)
  * Compiler (instantiated in method `registerMain`), one for each Main class-object\
  (N.B. There are multiple Main class-objects in embedded mode if there are several black online-ide divs.)
  *  Method `registerProviders` registers Providers for 
     * Code completion (-> high priority)
     * Hover (-> default priority)
     * Rename symbols (-> not necessary, for labels?)
     * Show definition ( -> no)
     * \<Ctrl-Click\> on Symbols (reference provider) ( -> low priority, for labels?)
     * Signature Help ( -> no)
     * Inlay Hints (-> interesting option to display compiled code)
     * Code formatter (-> high priority)
     * Code actions (-> low priority)
  * `LanguageConfiguration` (editor behaviour for brackets, comments, ...; set in method `registerLanguageAtMonacoEditor()`)\
  [Documentation see here.](https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor_editor_api.languages.LanguageConfiguration.html)
  * `MonarchTokensProvider` (for syntax highlighting; set in method `registerLanguageAtMonacoEditor()`)\
  [See here](https://microsoft.github.io/monaco-editor/monarch.html) for a detailed documentation of the **Monarch syntax highlighter**.

Documentation for each of the providers [can be found here](https://microsoft.github.io/monaco-editor/docs.html). It also may be useful to look at the corresponding providers for the java programming language.


## Compiler
Start of compilation in method `AssemblerCompiler.triggerCompile()`. It reads field `#files` and produces a subclass of [`Module`](../../src/compiler/common/module/Module.ts) which has a field
```typescript
    programsToCompileToFunctions: Program[] = [];
```

### Program
Each [`Program`](../../src/compiler/common/interpreter/Program.ts)-object represents a (Java) method, so we need only **one** for the entire assembly language program. It consists of several Steps:
```typescript
    stepsSingle: Step[] = [];
```

### Step
Each [`Step`](../../src/compiler/common/interpreter/Step.ts)-object has fields
```typescript
    run?: StepFunction;
    range!: { startLineNumber?: number; startColumn?: number; endLineNumber?: number; endColumn?: number; };
    codeAsString: string = "";
```
`run` is compiled by method `compileToJavascriptFunction()` from `codeAsString`, so the compiler has to produce the latter. `range` is the position inside the source code file.

[!TODO] As each Program represents a Java method which belongs to a unique file and as each Step belongs to a unique program, there is a unique correspondence between Step an source code file in Java. This is not the case in Assembler as several files may contribute to one program consisting of one method.

**Solution**: Add field `file: GUIFIle` to step?

### Parameters for each step function ###
```typescript
    compileToJavascriptFunction() {
        this.run = new Function(StepParams.thread, StepParams.stack, StepParams.stackBase, this.codeAsString);
    }
```
The first three parameters for the `Function` constructor are
```typescript`
export class StepParams {
    static thread = "__t";            // type Thread
    static stack = "__s";             // type any[]
    static stackBase = "__sb";        // type number
}
```
These identifiers may be used inside `codeAsString` which is a method body that **returns the next step index**.

### Proposal: ###
Add fields
```typescript
export class Thread {
    /**
     * For Assembler programs
     */
    memory: Memory; 
    cpu: CPU;
}
```
to class [Thread](../../src/compiler/common/interpreter/Thread.ts) and initialize them before starting an assembler program. Then use these fields inside the step functions.


#### Example: ####
The statement
```
start: LOAD 100
ADDI 1
STORE 100
CMPI 20
JLT start
HALT 
```
compiles to 5 functions:
```javascript
__t.cpu.load(100); return 1;    // step 0
__t.cpu.addi(1); return 2;      // step 1
__t.cpu.store(100); return 3;   // step 2
__t.cpu.cmpi(20); return 4;     // step 4
return __t.cpu.jlt(0, 6);       // step 5
__t.return(0)                   // step 6
```

### Example implementations for classes Memory and CPU ###
```typescript
export class Memory {
    private memory: number[] = [];

    constructor(public size: number) {
        this.memory = new Array(size).fill(0);
    }

    read(address: number): number {
        if (address < 0 || address >= this.size) {
            throw new Error(`Memory read error: Address ${address} out of bounds`);
        }
        return this.memory[address];
    }

    write(address: number, value: number): void {
        if (address < 0 || address >= this.size) {
            throw new Error(`Memory write error: Address ${address} out of bounds`);
        }
        this.memory[address] = value;
    }
    
}
```
```typescript
import { Memory } from "./Memory";

export class CPU {
    accumulator: number = 0;
    programCounter: number = 0;
    flags: { [key: string]: boolean } = {};

    memory: Memory;

    constructor(memory: Memory) {
        this.memory = memory;
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
```




