# Assembly language
## Meta information about assembler language
All meta information about assembler language is collected in class  [`AssemblyLanguage.ts`](../../src/compiler/assembly/AssemblyLanguage.ts)
  * Compiler (instantiated in method `registerMain`), one for each Main class-object\
  (N.B. There are multiple Main class-objects in embedded mode if there are several black online-ide divs.)
  *  Method `registerProviders` registers Providers for 
     * Code completion (**done**)
     * Hover (**done**)
     * Rename symbols (**done**)
     * Show definition (**done**)
     * \<Ctrl-Click\> on Symbols (reference provider) (**done**)
     * Signature Help ( -> no)
     * Inlay Hints (-> interesting option to display compiled code)
     * Code formatter (-> high priority) (**TODO!**)
     * Code actions (-> low priority)
  * `LanguageConfiguration` (editor behaviour for brackets, comments, ...; set in method `registerLanguageAtMonacoEditor()`)\
  [Documentation see here.](https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor_editor_api.languages.LanguageConfiguration.html)
  * `MonarchTokensProvider` (for syntax highlighting; set in method `registerLanguageAtMonacoEditor()`)\
  [See here](https://microsoft.github.io/monaco-editor/monarch.html) for a detailed documentation of the **Monarch syntax highlighter**.

Documentation for each of the providers [can be found here](https://microsoft.github.io/monaco-editor/docs.html). It also may be useful to look at the corresponding providers for the java programming language.


## Compiler
Start of compilation in method [`AssemblyCompiler`](src\compiler\assembly\AssemblyCompiler.ts)`.compileIfDirty()`. It reads field `#files` and produces for each file an [`AssemblyModule`](src\compiler\assembly\AssemblyModule.ts) object. It's `startMainProgram` sets up a javascript main method on the fly which simply calls `cpu.nextStep(thread)` in an infinite loop. Then it calls `cpu.reset()`. The framework calling `startMainProgram` then sets up a thread and starts it.

## CPU, Memory
  * Each CPU is a subclass of [`CPU`](src\compiler\assembly\CPU.ts). It holds a memory-object whose class is a subclass of [`Memory`](src\compiler\assembly\Memory.ts) object.
  * Examples: See [`AbiBayernCPU`](src\compiler\assembly\abibayern\AbiBayernCPU.ts) and [`AbiBayernMemory`](src\compiler\assembly\abibayern\AbiBayernMemory.ts).

## Parser
  * Each Parser is a subclass of [`AssemblyParser`](src\compiler\assembly\AssemblyParser.ts).
  * Example: See [AbiBayernParser] (halfway down the file [`AbiBayernCPU`](src\compiler\assembly\abibayern\AbiBayernCPU.ts)).






