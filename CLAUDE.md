# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-only IDE for a large subset of Java (plus a small educational assembly language): lexer, parser, type resolver, code generator, interpreter and debugger are all TypeScript running in the browser. It ships in two variants built from the same sources:
- **Online-IDE** (`index.html`, entry `src/client/main/`): school IDE that talks to a separate backend server (not in this repo) via `/servlet/...`.
- **Embedded-IDE** (`embedded_java.html`, entry `src/client/embedded/`): standalone, embeddable in arbitrary web pages; built as `dist-embedded/online-ide-embedded.js/.css`.

UI texts, comments and the README are mostly German; user-facing strings are bilingual (see i18n below).

## Commands

```
npm run dev            # Vite dev server on http://localhost:3000 (proxies /servlet, /sprites to a backend on localhost:5500)
npm run build          # tsc type check + IDE build (dist/) + embedded build
npm run build-ide      # tsc + IDE build only
npm test               # vitest (jsdom), watch mode
npx vitest run --config vitest.config.ts                         # run all tests once
npx vitest run --config vitest.config.ts src/test/JavaTests.test.ts -t "ArithmeticTest.java"   # one test file's cases
npx tsc                # type check only (noEmit)
```

Note: `dev-embedded`/`build-embedded`/`build` reference `vite.config-embedded.js`, but the file in the repo is `vite.config-embedded.ts`. `deploy`/`build-deploy` upload via SSH (`src/development/ZipAndUpload.js`) — don't run them unless asked. There is no active ESLint config (`eslint.config.js1` is disabled). `tsconfig.json` has `strict: false`.

## Tests

Tests are data-driven, not hand-written vitest cases:
- `src/test/JavaTests.test.ts` reads every `src/test/java/*.java` file and splits it at `/**::` markers. Each block is one test: the first comment line is the title, and an optional JSON object in the header comment gives `expectedOutput`, `expectedCompilationError(s)` (`{id, line}` — error ids from the compiler messages), and `libraries` (e.g. `["nrw"]`, `["niedersachsen"]`, `["gng"]`).
- Block bodies are top-level Java statements (main program) plus classes; they use the built-in `assertEquals`/`assertTrue`/... functions, which report through `ViteTestAssertions`. The test compiles with `JavaCompiler`, then runs via `Interpreter.runMainProgramSynchronously()`.
- `src/test/AssemblyTests.test.ts` does the same for `src/test/assembly/*.asm`.
- To add a regression test for a compiler/runtime bug, add a `/**::` block to the fitting `.java` file in `src/test/java/`.

## Architecture

### Compiler pipeline (`src/compiler/java/`)
`JavaCompiler.compileIfDirty()` runs per module (one module per file, only dirty ones re-lexed/parsed):
`lexer/Lexer` → `parser/Parser` (AST) → `TypeResolver/TypeResolver` (resolves types across all modules + library modules) → `codegenerator/CodeGenerator` (with `StatementCodeGenerator`, `TermCodeGenerator`, `BinopCastCodeGenerator`, `InnerClassCodeGenerator`) → `JavaExecutable`.

The code generator emits **JavaScript source snippets** (`CodeSnippet`, linked by `SnippetLinker`), grouped into `Step`s. Each `Step` is turned into a JS function via `new Function(thread, stack, stackBase, code)` (`src/compiler/common/interpreter/Step.ts`). A step returns the index of the next step, which makes single-stepping, breakpoints (swap `run` function), threads and speed control possible.

Compilation can also run in a web worker (`compiler/java/webworker/`). Monaco editor integrations (completion, hover, signature help, quickfixes, rename, references) live in `compiler/java/monacoproviders/` and work on the compiler's module/type data.

### Language-agnostic layer (`src/compiler/common/`)
`Compiler`, `Executable`, `Module`, `Error`, the `interpreter/` (`Interpreter`, `Scheduler`, `Thread`, `Program`, `Step`), `debugger/`, `repl/` (console window), `testrunner/`. Both Java and assembly (`src/compiler/assembly/`) plug into this.

### Runtime library (`src/compiler/java/runtime/`)
Java library classes are TypeScript classes (named `XxxClass`, extending `ObjectClass`) that declare their Java API in a static `__javaDeclarations: LibraryDeclarations` array of Java signature strings:
- `native:` → plain synchronous TS function, called directly from generated code.
- `java:` → step-aware method with signature `(t: Thread, callback, ...args)` that pushes its result onto `t.s`; used when the method may call back into user Java code (e.g. `toString`). Such TS methods follow the mangled naming scheme `_mj$<name>$<ReturnType>$<ParamTypes>` (e.g. `_mj$toString$String$`).
- Every declaration has a `comment` pointing to a `JRC.*` entry.
- New core classes must be registered in `runtime/system/SystemModule.ts`. Optional libraries (`gng`, `nrw`, `niedersachsen`, plus always-on `DatabaseModule`) are separate modules selected by `JavaLibraryManager`.

Graphics uses pixi.js (2D), three.js (3D, `graphics/3d`), p5 (`graphics/processing`).

### i18n
User-visible strings are lambdas returning `lm({"de": ..., "en": ...})` (`src/tools/language/LanguageManager.ts`). Compiler errors: `compiler/java/language/JavaCompilerMessages.ts`; library docs: `JavaRuntimeLibraryComments.ts` (`JRC`); client strings under `src/client/**/language/`. Always provide both `de` and `en`.

### Client (`src/client/`)
`main/` (Online-IDE: `Main.ts`, `MainBase.ts` shared interface, GUI, login, exams in `pruefung/`), `embedded/` (`MainEmbedded`, `EmbeddedStarter`, IndexedDB storage), `communication/` (server requests, push websocket), `workspace/`, `repository/` (group-work repositories, sync), `libraries/java/` (client-dependent library classes such as database). `src/tools/` holds shared helpers (HTML/DOM tools, treeview component, sql.js database worker).

### Build-time constants
`vite.config-common.ts` defines `APP_VERSION` and `BUILD_DATE`, and strips code under the `DEBUG:` label (`esbuild.dropLabels`) in builds.
