# Compiler wiring
## Meta information about a language
All meta information about assembler language is collected in class  [`AssemblerLanguage.ts`](../../src/compiler/assembler/AssemblerLanguage.ts)
  * Compiler (instantiated in method `registerMain`), one for each Main class-object\
  (N.B. There are multiple Main class-objects in embedded mode if there are several black online-ide divs.)
  *  Method `registerProviders` registers Providers for 
     * Code completion 
     * Hover 
     * Rename symbols
     * Show definition 
     * \<Ctrl-Click\> on Symbols (reference provider **and** show definition combined) 
     * Signature Help 
     * Inlay Hints 
     * Code formatter 
     * Code actions 
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

[!TODO] As each Program represents a Java method which belongs to a unique file and as each Step belongs to a unique program, there is a unique correspondence between Step an source code file in Java. 

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

