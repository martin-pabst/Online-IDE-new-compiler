# Clean up the snippet layer of the code generator

Session of 2026-11-25. Starting point: commit `3715a69f` (main). Line numbers in task 1 refer to that commit;
files mentioned there (CodeSnippet.ts, CodeSnippetKinds.ts, CodeTemplate.ts, SnippetLinker.ts, CodeSnippetTools.ts,
LabelManager.ts) no longer exist.

This file contains the prompts and the answers/reports of the session. Tool calls and their raw output (file
reads, test logs, diffs) are omitted.

---

## Task 1

> A goal of the given implementation of the codegenerator is to produce fast javascript code which can get executed
> in single steps so that
>  - the user can adjust execution speed and
>  - can pause a program and
>  - so that the interpreter can simulate concurrent execution in threads.
>
> To achieve this goal there is a intermediate representation between AST and javascript-output. I called it
> "snippets". You find the code in folder src\compiler\java\codegenerator. Over time it got a bit bloaty and messy.
> Is there a more concise way to implement the code to generate and store the snippets?

### Answer

Yes. Nearly all of the bulk comes from one design choice: a single class tree (`CodeSnippet`) does three jobs at once.
It stores code, it represents expression results, and it carries markers for the linker. If you split those into two
plain data types plus one combine function, the core (~1,200 lines across 6 files) shrinks to roughly 300. It also
fixes four evaluation bugs and a stack leak that I found and confirmed while reading the code.

#### Why it got bloated

- **One hierarchy, three roles.** Every subclass has to implement `emit`, `index`, `emitToStep`, `flattenInto`,
  `isEmptyStatement`, … even when most of them do nothing (`NextStepMark`, `EmptyPart`, `LabelCodeSnippet`,
  `JumpToLabelCodeSnippet`).
- **The value state of an expression is implicit.** There are three states: pure term, container whose last part is
  the value, and `finalValueIsOnStack`. They are derived through `isPureTerm()`, `allButLastPart()`, `lastPartOrPop()`
  and `getLastPartWithType()`. `addParts` silently copies `type`/`finalValueIsOnStack` from the last typed part, so
  callers patch `snippet.type = …` / `finalValueIsOnStack = …` afterwards.
- **The "combine n operands" algorithm exists six times:** `OneParameterTemplate`, `TwoParameterTemplate`,
  `SeveralParameterTemplate`, `ParametersJoinedTemplate`, `BinaryOperatorTemplate`, `SnippetFramer`. Each has its own
  pure / mixed / stack branches, and they don't agree.
- **Mutation and string sniffing.** `ensureFinalValueIsOnStack`, `alterPureTerm` and `SnippetFramer.frame` modify their
  input, and `flattenInto` shifts parts out of containers during linking. Decisions depend on `endsWith(";\n")`,
  `indexOf('pop()')` and a regex for `return \d*;`.
- **Side channels.** Emit-to-step listeners have to be copied by hand in every template (`takeEmitToStepListenersFrom`),
  and labels have their own listener mechanism.
- **Dead code:** `StartPositionMark`, `EndPositionMark`, `applyMethod`, `getCommaSeparatedParameterIdentifiers`,
  `endsWithNextStepMark`.

#### Bugs this causes (all confirmed with temporary tests, now deleted)

| Java | expected | actual | where |
|---|---|---|---|
| `f(49) / f(49)` (int) | 1 | 0 | stack branch computes `Math.trunc(1/b * a)` (CodeTemplate.ts:327); the same formula makes `49.0/49.0` (both from calls) 0.9999999999999999 |
| `g(1) + g(2)` | calls g(1), g(2) | g(2), g(1) | right operand pushed first (CodeTemplate.ts:346) |
| `add3(h(1), h(2), h(3))` | 1,2,3 | 3,2,1 | arguments hoisted in descending order (CodeTemplate.ts:226) |
| `x + incX()` (incX sets `x = 10`, returns 0) | 1 | 10 | all pre-code runs before any value is read (CodeTemplate.ts:300) |
| `f();` with non-void Java method | — | return value stays on the stack | `endsWith(";\n")` decides whether `__s.pop()` is emitted (StatementCodeGenerator.ts:103); in a main-program loop the stack grows without limit |

#### Proposal: two data types, one combinator, one flat linker

**1. Storage: a flat op list instead of a tree**

```ts
export class Label { stepIndex = -1; }
export const STEP = { k: "step" } as const;

export type Op =
    | string                                    // JavaScript source
    | Label                                     // jump target
    | typeof STEP                               // step boundary
    | { k: "jump", to: Label }                  // → "return <to.stepIndex>;"
    | { k: "range", range: IRange }             // source position for step range / debugger
    | { k: "hook", fn: (step: Step) => void };  // catchBlockInfos, inner classes, …

export type Code = Op[];
```

Concatenation is `[...a, ...b]`; there's no `flattenInto`/`index`/`emitToStep` per class, and hooks can't get lost
because they sit in the array like everything else.

**2. Expression results: `Expr` with an explicit "pre + value"**

```ts
export interface Expr {
    pre: Code;          // runs first; may contain steps, labels, jumps
    value: string;      // JS expression, valid directly after pre ("" for void)
    type: JavaType;
    range: IRange;
    constant?: ConstantValue;
    lvalue?: boolean; finalField?: boolean; superLevel?: number;  // today's isLefty, …
}
```

"Pure term" just means `pre.length == 0`, and "final value is on stack" means `value == "__s.pop()"`. Nothing is
mutated: helpers return new objects.

**3. One combinator replaces all template classes**

```ts
/**
 * Evaluates operands left to right. If a later operand has pre code (method call, step boundary),
 * every earlier non-constant value is computed first and kept in a stack frame slot.
 * So at most one __s.pop() is left (from the last operand with pre code) and no value is read after code
 * that could change it.
 */
combine(type: JavaType, range: IRange, args: Expr[], build: (...values: string[]) => string): Expr {
    const last = args.findLastIndex(a => a.pre.length > 0);
    const pre: Code = [];
    const values = args.map((a, i) => {
        pre.push(...a.pre);
        if (i >= last || a.constant !== undefined) return a.value;
        const slot = this.tempSlot();   // __s[__sb + n] via getStackFrame().insertInvisibleLocalVariableAndGetItsIndex(),
        pre.push(`${slot} = ${a.value};\n`);   // as the enhanced for loop already does
        return slot;
    });
    return { pre, value: build(...values), type, range };
}
```

When everything is pure (the common case), the generated JS is the same as today. Slots are only used when a Java
calling-convention call follows; that call already costs a step boundary, so one extra assignment doesn't matter.
Everything else becomes a one-liner on top:

```ts
const map = (e: Expr, f: (v: string) => string, type = e.type): Expr => ({ ...e, value: f(e.value), type, constant: undefined }); // SnippetFramer
const template = (t: string) => (...v: string[]) => t.replace(/§(\d+)/g, (_, n) => v[n - 1]);   // library "§1.value.endsWith(§2)"
const toStack = (e: Expr): Expr => ({ ...e, pre: [...e.pre, `__s.push(${e.value});\n`], value: "__s.pop()" });
const toStatement = (e: Expr): Code => e.value ? [...e.pre, at(e.range), e.value + ";\n"] : e.pre;  // pop always emitted → leak fixed

// Java calling convention: the call ends the step, the result comes back on the stack
const call = combine(ret, range, [obj, ...args], (o, ...a) => `${o}.${name}(${["__t", ...a].join(", ")})`);
return { ...call, pre: [...call.pre, at(range), call.value + ";\n", STEP], value: ret == voidType ? "" : "__s.pop()" };
```

**4. Generators read like the code layout**

`compileWhileStatement` (StatementCodeGenerator.ts:762–780) becomes:

```ts
return [
    start,
    ...cond.pre, negated ? `if(${cond.value}){\n` : `if(!(${cond.value})){\n`, jump(end), "}\n", STEP,
    ...body,
    at(endOf(body)), jump(start), STEP,
    end,
];
```

The `enforceNewStepBeforeSnippet` / `removeNextStepBeforeSnippetMark` pair disappears: a leading `STEP` is just an
array element (`code.slice(1)` in try/catch).

**5. Linker: two loops instead of five methods on six classes**

```ts
link(code: Code, program: Program) {
    const ops: Code = [];                       // pass 1: skip steps that would be empty, number the labels
    let index = 0, empty = true;
    for (const op of code) {
        if (op === STEP) { if (empty) continue; index++; empty = true; }
        else if (op instanceof Label) op.stepIndex = index;
        else if (typeof op == "string" || op.k == "jump") empty = false;
        ops.push(op);
    }
    const steps: Step[] = [];                   // pass 2: build the steps
    let step = new Step(0, program.module), afterJump = false;
    for (const op of ops) {
        if (op === STEP) {
            if (!afterJump) step.codeAsString += `return ${step.index + 1};`;
            steps.push(step); step = new Step(step.index + 1, program.module);
        } else if (typeof op == "string") step.codeAsString += op;
        else if (op instanceof Label) continue;
        else if (op.k == "jump") step.codeAsString += `return ${op.to.stepIndex};\n`;
        else if (op.k == "range") { step.setRangeStartIfUndefined(op.range); step.adaptRangeEnd(op.range); }
        else op.fn(step);
        afterJump = typeof op == "object" && op.k == "jump";
    }
    if (!step.isEmpty()) steps.push(step);
    program.stepsSingle = steps;
}
```

The runtime model (`Step`, `new Function`, a step returns the next index) stays unchanged; it's fine. Only the layer
between AST and steps changes. Constant folding and the division-by-zero/`Math.trunc` handling of binary operators
move over as `build` functions.

**Open details to decide**

- Where to put `at(range)` so step ranges match today's (today every string snippet contributes its range).
- Hooks on pure values (lambdas, anonymous classes put a hook on a pure term): put the hook into `pre`. Such an operand
  then counts as non-pure and may cause an unnecessary spill; that's harmless.
- A library template that uses `§n` twice: `combine` must spill that operand unless it's a pure term (today
  `TwoParameterTemplate` throws).

#### Migration order (keeps tests green at every step)

1. Add the five cases above as regression tests (they fail today).
2. Golden output: dump the generated JS (`CodePrinter`) of all test programs before starting, and diff after each step.
3. Swap storage + linker first; old snippet classes get a `toCode()` adapter. Expected diff: none (or close to none).
4. Introduce `Expr`/`combine` and reimplement the template classes as thin wrappers. Expected diff: only expressions
   that mix pure and non-pure operands; regression tests turn green.
5. Migrate generators file by file (Statement → Term → BinopCast → InnerClass), then delete the old classes.

---

## Task 2

> please execute steps 1 - 5

### Progress log

**Preparation.** Frames are pre-allocated per method (`Thread.pushProgram` pushes `numberOfLocalVariables` nulls), but
instance field initializers are compiled once per class and copied into every constructor. Temporary frame slots
(as sketched in task 1) would therefore collide with constructor parameters. Decision: spilled values go onto the
operand stack and are popped into step-local JavaScript variables ("registers", declared by the linker per step)
right before the combined expression. The pop order doesn't matter that way.

**Step 1 – regression tests.**
- New file `src/test/java/EvaluationOrderTest.java`: operand order, argument order (methods, constructors, varargs,
  array literals), assignment order, variable read before a call changes it, division/modulo with calls on both sides,
  non-void calls as statements.
- `src/test/JavaTestHarness.ts` now wraps `Thread.prototype.return` and checks for every method return that the
  method's part of the stack consists of exactly `this`, parameters and local variables (main programs additionally
  hold the main class). This makes stack leaks visible to the tests.
- Result: all 6 new tests failed as expected. Additionally `getBox(1).value = h(2)` crashed with
  `ReferenceError: Invalid left-hand side in assignment` (both sides non-pure → `__s.pop() = __s.pop()`). 34 existing
  tests failed only because of the stack check, e.g. a main program ended with 1001 leftover values (loop calling a
  non-void method as a statement), constructors with `super(...)`/`this(...)` leaked one value each.

**Step 2 – golden output.** A temporary test (`src/test/TmpGolden.test.ts`, deleted at the end) compiled every test
block and dumped all steps (code, range, catch block infos, step-attached objects); optionally it ran the programs and
recorded leftover stack values. Baseline taken from the original code.

**Step 3 – flat op list and new linker.** New `codegenerator/Code.ts` (ops, `Label`, `STEP`, `link()`). The old classes
lost `index`/`emitToStep`; `SnippetLinker` translated the flattened snippets into ops. Golden diff: identical code
except dropped empty steps (label-only steps after a final `return`, and an empty first step in methods that start with
a do-while loop). Test results identical.

**Step 4 – `Expr` and `combine`.** New `codegenerator/Expr.ts`. The multi-operand templates (`TwoParameterTemplate`,
`SeveralParameterTemplate`, `ParametersJoinedTemplate`, `BinaryOperatorTemplate`) became thin wrappers around
`combine` (bridged via temporary `toExpr`/`fromExpr`/`OpsSnippet`). Statements now pop values left on the stack.
Failures dropped from 40 to 7, then to 5 after fixing leaks the stack check found in runtime library code:
- `ArrayToStringCaster` pushed every nested array once too often (and pushed `"null"` instead of appending it to the
  text).
- `HashSet.removeAll` called `_mj$remove$boolean$E` per element without popping its result; additionally
  `HashSet.remove` returned the inverted result (true when the element was *absent*). Test added to
  `HashSetTest.java`.

The remaining 5 failures (constructor leaks in code rewritten in step 5, and the assignment test) were expected.
The golden diff showed only intended changes. Note: a non-void call used as a statement then got an extra step for the
`__s.pop()`; step-over treats it as part of the call because it has the same range.

**Step 5 – migration of all generators.** `BinopCastCodeGenerator`, `TermCodeGenerator`, `StatementCodeGenerator`,
`InnerClassCodeGenerator`, `CodeGenerator`, `JavaReplCodeGenerator`, `FlowAnalyzer`, `JavaTypeWithInstanceInitializer`,
`JavaArrayType` (three unused methods returning `CodeTemplate` removed) and `JavaCompiler` now use `Code`/`Expr`. The
six old snippet files were deleted. After fixing a regex slip (`!x.isConstant()` had become `isConstant(!x)`), all
281 tests passed on the first run.

Golden diff step 4 → step 5, reviewed hunk by hunk:
- the null check of a method call's target now happens in the call itself, i.e. after the arguments are evaluated
  (Java semantics);
- assignments use the `place` of the left side (`(__r6 || NPE).$f_value = __r5`), which fixes the crashing assignment;
- generated standard constructors store the outer-class reference first and, after a base constructor with Java
  calling convention, insert a step boundary and pop the pushed `this`. Before, field initializers ran before the
  base constructor had finished;
- step ranges of `if`/`while` conditions containing method calls now cover the condition instead of the whole statement;
- a `return;` step that had no range now has one.

Issues found in this review and fixed:
- Ternary branches lost the source range of pushed values → `toStack` now emits the range.
- Enum value construction got an extra step per value → removed.
- The pop after an implicit `super()` call (and after statement calls) needed a step of its own, without a source
  range; the debugger would have stopped there with nothing highlighted. New op `cleanup`: code which needs no step of
  its own. A step boundary directly after it is dropped, so it runs at the start of the next statement's step; if a
  label follows, the boundary stays (a jump must not re-run it). If it stays alone, it gets the call's range. The linker
  also enforces in general that a label starts a step.

Further bugs found during step 5:
- Two lambdas capturing variables in one statement (`combine(() -> x, () -> y)`) both instantiated the second lambda's
  class: both used the step property `innerClass`. Now each lambda has its own property (`innerClass<n>`);
  `step.innerClass` is still set for the disassembler. Test added to `LambdaTest.java`.
- Compound assignments with a method call on the right side read the variable after the call (`x += setX()`).
  JavaScript reads the variable before evaluating the right side, like Java; the problem only arises because the call
  runs in earlier steps. New `compoundAssignment` in `Expr.ts` pushes the current value before the right side's code
  runs. Tests added to `EvaluationOrderTest.java`.

**Further checks.**
- REPL (console window), via a temporary test with a stubbed `IMain`: expressions, Java-convention calls, assignments,
  loops, array elements and compound assignments work; the stack stays balanced. (The standalone REPL can't see
  main-program methods and variables — existing behavior.) `K.counter += K.f()` gives 1253 as in Java (1254 before the
  compound-assignment fix).
- `npm run build` (type check, IDE build, embedded build) succeeds.
- Browser check of the embedded IDE (Edge via playwright-core, temporary dev server on port 3011): a program with
  method calls in operands, array assignment, loop and compound assignment prints exactly the Java output. Step over:
  4 → 5 → 6 → 7 → 7 → 7 → 8 (no extra stop after `f(a);`; line 7 `int b = f(3) + f(4);` stops at `f(3)`, `f(4)` and
  the assignment). Step into: after returning from `f`, the debugger continues at the next statement.
- Line endings of touched files restored to CRLF (as checked out).

### Final report

I've done all five steps. The snippet layer is replaced, all 321 tests pass, the production build works, and a browser
check of the embedded IDE (running a program, step-over, step-into) behaves correctly. Nothing is committed yet.

#### Result

- **Core:** the six snippet files (1,198 lines) are replaced by [Code.ts](../../src/compiler/java/codegenerator/Code.ts)
  (flat op list and linker, 159 lines) and [Expr.ts](../../src/compiler/java/codegenerator/Expr.ts) (compiled terms and
  `combine`, 239 lines).
- **Generators:** 919 lines out, 756 in. The compiler is about 990 lines smaller overall.
- **CLAUDE.md:** the architecture and test sections now describe `Code`/`Expr` and the new stack check.

#### How I verified it

- **Golden output:** I dumped the generated JavaScript of all test programs (code, step ranges, catch info) after each
  step. Step 3 changed nothing except dropping empty steps. Steps 4 and 5 changed only where intended; I reviewed every
  hunk.
- **Stack check in the test harness:** every test now fails if a method returns while values are left on the operand
  stack. It found leaks in about 35 existing tests.
- **Console (REPL):** a temporary test ran a range of inputs through it.

#### Bugs fixed, each with a regression test

1. Expressions with method calls are evaluated left to right: operands, arguments, constructor arguments and array
   literals.
2. A variable is read before a method call to its right changes it (`x + incX()`).
3. Integer division with method calls on both sides is correct again (`f(49) / f(49)` used to give 0).
4. Non-void methods called as statements no longer leave their return value on the stack. The same was true for
   `super(...)`/`this(...)` calls and implicit base-constructor calls.
5. `getBox(1).value = h(2)` no longer crashes. The object or array and the index are evaluated before the right side.
6. Compound assignments read the variable before a method call on the right side (`x += setX()`).

Found along the way and also fixed:
- Two capturing lambdas in one statement both got the second lambda's class.
- `HashSet.removeAll` and array `toString` for nested arrays left values on the stack.
- `HashSet.remove` returned the inverted result (true when the element was *absent*).
- In generated standard constructors, field initializers ran before a base constructor with Java calling convention
  had finished.

#### Behavior changes you might notice

- A `NullPointerException` for `obj.m(args)` is now thrown after the arguments are evaluated, as in Java.
- For `if`/`while` conditions that contain method calls, the debugger now highlights the condition instead of the
  whole statement.
- Popping an unused return value no longer needs its own step. It runs at the start of the next statement, so stepping
  over `f();` goes straight to the next line.

#### Deviations from the plan

- Spilled values go onto the operand stack and are popped into step-local variables, not into frame slots. Field
  initializers are compiled once and copied into every constructor, so frame slots would have collided with
  constructor parameters.
- In step 4 the one-operand template stayed unchanged, because it had no ordering problem; step 5 removed it with the
  rest.

The new files `Code.ts`, `Expr.ts` and `EvaluationOrderTest.java` are untracked, so they need a `git add` when you
commit. Temporary test files, the test Vite config and its cache are deleted.
