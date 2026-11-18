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
npm test               # vitest (jsdom), watch mode - never returns, don't use from the Bash tool
npx vitest run --config vitest.config.ts                         # run all tests once
npx vitest run --config vitest.config.ts src/test/java/ArithmeticTest.java   # one Java test file
npx tsc                # type check only (noEmit)
```

On Windows from Claude Code's Bash tool, run tests as described in "Running tests from the Bash tool" below.

`deploy`/`build-deploy` upload via SSH (`src/development/ZipAndUpload.js`) — don't run them unless asked. There is no active ESLint config (`eslint.config.js1` is disabled, and the ESLint packages are not installed). `tsconfig.json` has `strict: false` and `moduleResolution: "bundler"`.

TypeScript is 7.x, the native Go compiler: `tsc` is only a CLI. The `typescript` package has no JavaScript API (`import ... from "typescript"` yields nothing usable), so tools that need it (typescript-eslint, madge, ...) won't work with it. Since 7.0, `@types/*` packages are no longer loaded automatically (`types` defaults to `[]`), and package subpaths are resolved via their `exports` map (e.g. `three/examples/jsm/controls/OrbitControls.js` needs the `.js`).

## Tests

Tests are data-driven, not hand-written vitest cases:
- Every `src/test/java/*.java` file is a vitest test file of its own (`include` in `vitest.config.ts`), so the files run in parallel and are reported separately. The plugin `javaTestFilePlugin` in `vitest.config.ts` turns each `.java` file into a module that passes its source to `runJavaTestFile` in `src/test/JavaTestHarness.ts`. The harness splits the source at `/**::` markers. Each block is one test: the first comment line is the title, and an optional JSON object in the header comment gives `expectedOutput`, `expectedCompilationError(s)` (`{id, line}` — error ids from the compiler messages), `expectedWarnings` (array of `{id, line}`), and `libraries` (e.g. `["nrw"]`, `["niedersachsen"]`, `["gng"]`). `line` is relative to the block: the `/**::` line is line 1.
- Block bodies are top-level Java statements (main program) plus classes; they use the built-in `assertEquals`/`assertTrue`/... functions, which report through `ViteTestAssertions`. The test compiles with `JavaCompiler`, then runs via `Interpreter.runMainProgramSynchronously()`.
- `src/test/AssemblyTests.test.ts` does the same for `src/test/assembly/*.asm`, but as a single test file.
- `vitest.config.ts` sets `isolate: false` and a `threads` pool with at most 4 workers, so each worker imports the compiler only once. Test files therefore share module state.
- To add a regression test for a compiler/runtime bug, add a `/**::` block to the fitting `.java` file in `src/test/java/`.
- Warnings are only checked in blocks that have `expectedWarnings`: then every warning must be listed and every listed warning must occur (`"expectedWarnings": []` asserts that there are no warnings). Without the field, warnings are ignored. Infos are never checked. Warnings without an `id` in `JavaCompilerMessages` get the id `"no id"`.
- For other checks (e.g. infos, message texts), write a temporary `src/test/Tmp*.test.ts` and delete it afterwards. It must import `"../compiler/common/interpreter/Interpreter"` before `JavaCompiler`, otherwise an import cycle fails with `Class extends value undefined is not a constructor`.

### Running tests from the Bash tool (Windows, Git Bash)

Use exactly this pattern (put the output file in the session's scratchpad directory):

```
cd "$(git rev-parse --show-toplevel | sed 's#^\([a-zA-Z]\):#/\U\1#')" && NO_COLOR=1 FORCE_COLOR=0 npx vitest run --config vitest.config.ts src/test/java/SwitchCaseConstructsTest.java > <scratchpad>/vitest.txt 2>&1; echo exit=$?
grep -E "FAIL|Test Files|Tests " <scratchpad>/vitest.txt
```

- **Uppercase drive letter:** the repo lives on different drives depending on the machine (`C:\Vorhaben\...` at work, `D:\Vorhaben\...` at home), so don't hard-code the drive. The `cd "$(git rev-parse --show-toplevel | sed ...)"` prefix changes to the repo root with an uppercase drive letter (`/C/...` or `/D/...`) on either machine. If vitest instead starts in the default working directory with a lowercase drive letter (`c:\...` / `d:\...`), it loads `@vitest/runner` twice (e.g. `file:///c:/` and `file:///C:/`). Every suite then fails with `Cannot read properties of undefined (reading 'test')` / `No test suite found`, and not a single test has run.
- **No non-ASCII characters in Bash tool commands** (e.g. ✓, ×): the command fails with exit code 127 before it runs. vitest marks tests with ✓/×, so grep for ASCII text instead.
- **Reading results:** `exit=0` means all passed. Each failed test is listed as `FAIL  src/test/java/<name>.java > <title>`. The reason is in the `stdout | src/test/java/<name>.java > <title>` (or `stderr | ...`) block printed earlier. It shows unexpected compiler errors with line numbers, `Expected Error with id ... on line ...`, or assertion messages; read it with the Grep tool or `grep -A`.
- `NO_COLOR=1 FORCE_COLOR=0` turns off ANSI color codes, which would otherwise break grep patterns. The output has one line per test, so redirect it to a file instead of piping it.
- File arguments filter by path substring (`src/test/java/LoopTest.java`, or just `LoopTest`; several are allowed). `-t` additionally filters by test name, which is the title of the `/**::` block. Leave out the file argument to run all suites (about 15 s).
- Use playwright to execute GUI Tests: start dev server on port 3000, then URL http://localhost:3000/embedded_java.html for embedded version and http://localhost:3000/index.html for full GUI version. For full GUI version use username and password given in file @intern\keys\dev-credentials.md


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
`vite.config-common.ts` defines `APP_VERSION` and `BUILD_DATE`, and strips code under the `DEBUG:` label (`build.rolldownOptions.transform.dropLabels`) in builds.

### Vite 8 (Rolldown/Oxc) pitfalls
- Vite 8 transpiles TS with Oxc and bundles with Rolldown (esbuild is not installed). Don't combine `import { X } from ...` with `declare var X` in the same file: Oxc then drops the import and `X` is undefined at runtime, which tsc doesn't notice.
- Lightning CSS minifies the CSS and fails the build on an `@namespace` rule that isn't at the start of the merged CSS file, so don't use `@namespace` in CSS.
- Chunking uses `output.codeSplitting.groups` (Rolldown's replacement for `manualChunks`). The embedded build must keep producing exactly one `online-ide-embedded.js` and one `online-ide-embedded.css`, because embedding pages (`public/includeIDE.js`) load these by name.
