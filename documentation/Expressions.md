# Expressions and Code: how the code generator builds steps

This document explains the two small modules at the heart of the Java code generator:

- [Code.ts](../src/compiler/java/codegenerator/Code.ts): `Code`, a flat list of operations, and `link()`, which cuts
  it into steps.
- [Expr.ts](../src/compiler/java/codegenerator/Expr.ts): `Expr`, the compiled form of a Java term (expression), and
  the functions that combine terms while keeping Java's evaluation order.

It starts with the runtime model that the generated code has to fit into, then works through examples of increasing
complexity. Each example shows the Java source, the code generator methods involved, the `Expr` objects and the `Code`
they produce, and the steps that `link()` makes of it.

All listings of generated code are real compiler output (captured with a temporary test, November 2026). Only
whitespace differs, and some listings leave out `[range ...]` ops or show only some of the steps. Line numbers in
ranges refer to the Java snippet shown, whose first line is line 1.

Excerpts from the generator's TypeScript source are sometimes shortened. They also write `__s` where the source uses
`${StepParams.stack}` (or its alias `S` in `Expr.ts`), and `__t` for `${StepParams.thread}`.

## Contents

1. [Why steps?](#1-why-steps)
2. [The pipeline at a glance](#2-the-pipeline-at-a-glance)
3. [A first example: pure terms](#3-a-first-example-pure-terms)
4. [The building blocks: `Code` and `Expr`](#4-the-building-blocks-code-and-expr)
5. [Calling a method: `javaCall`](#5-calling-a-method-javacall)
6. [Left to right: how `combine` keeps Java's evaluation order](#6-left-to-right-how-combine-keeps-javas-evaluation-order)
7. [Helpers built on `combine`: `apply`, `joined`, `map`, `frame`](#7-helpers-built-on-combine-apply-joined-map-frame)
8. [Throwing a value away: `toStatement` and `cleanup`](#8-throwing-a-value-away-tostatement-and-cleanup)
9. [Control flow: labels and jumps](#9-control-flow-labels-and-jumps)
10. [Control flow inside a term: `&&`, `||`, `?:` and `toStack`](#10-control-flow-inside-a-term----and-tostack)
11. [Assignments: `lefty`, `place` and compound assignments](#11-assignments-lefty-place-and-compound-assignments)
12. [Hooks: attaching compile-time data to steps](#12-hooks-attaching-compile-time-data-to-steps)
13. [Source ranges](#13-source-ranges)
14. [`link()` in detail](#14-link-in-detail)
15. [Looking at generated code yourself](#15-looking-at-generated-code-yourself)
16. [Rules of thumb and pitfalls](#16-rules-of-thumb-and-pitfalls)
17. [Reference](#17-reference)

---

## 1. Why steps?

The interpreter doesn't run a Java method as one JavaScript function. Each method is compiled into an array of
**steps**, and each step is a small JavaScript function:

```ts
(__t: Thread, __s: any[], __sb: number) => number      // returns the index of the next step
```

The thread calls one step after the other. Between two steps it can stop (breakpoint, pause, single step), wait
(speed control) or switch to another thread. That's why the code generator can't simply translate a method into one
JavaScript function.

Generated code uses these names:

| Name   | Meaning |
|--------|---------|
| `__t`  | the current `Thread` |
| `__s`  | the thread's stack (`__t.s`) |
| `__sb` | the stack base of the running method: `__s[__sb]` is `this` (for static methods: the class), `__s[__sb + 1]`, `__s[__sb + 2]`, ... are the parameters, then come the local variables |
| `this` | inside a step function: the `Step` object itself (used by hooks, see [section 12](#12-hooks-attaching-compile-time-data-to-steps)) |

For `int f(int a, int b) { int c = ...; }`, `a` is `__s[__sb + 1]`, `b` is `__s[__sb + 2]` and `c` is
`__s[__sb + 3]`. Temporary values are pushed on top of the method's part of the stack (`__s.push(...)`,
`__s.pop()`).

(In the main program, `__s[0]` holds the main class, and variables declared at the top level are static fields of it,
e.g. `__s[0].$f_a`.)

### The one rule that shapes everything

Methods written in Java (and some library methods) use the **Java calling convention**: they are compiled to steps
themselves. Calling such a method doesn't execute it. The method's stub only pushes `this` and the arguments and
registers the method's program at the thread
(see `InnerClassCodeGenerator.compileMethodDeclaration`):

```ts
function (__t, __callback, ...parameters) {
    __t.s.push(this, ...parameters);
    __t.pushProgram(method.program, __callback);
}
```

The calling step then runs to its end and returns the index of its next step. `Thread.run` stores that index as the
caller's resume position and continues with step 0 of the called method. When the called method executes
`__t.return(value)`, the thread removes the method's part of the stack, pushes `value`, and continues the caller at the
stored position.

This has two consequences:

1. **A call with Java calling convention has to be the last thing in its step.** Everything that follows it in Java
   order (e.g. adding `1` to the result) belongs in the next step.
2. **The result of such a call is on top of the stack when the next step starts.** The code there reads it with
   `__s.pop()`.

Methods with **native calling convention** (most library methods, e.g. `Math.sqrt`) are plain JavaScript
functions. Calling them is an ordinary JavaScript expression inside a step.

`Code` and `Expr` exist so that the individual generator methods don't have to deal with these two consequences
themselves.

---

## 2. The pipeline at a glance

```text
AST term       --compileTerm()------------->  Expr     code to run first (pre) + JavaScript expression (value)
AST statement  --compileStatementOrTerm()-->  Code     flat list: JS strings, STEP, labels, jumps, ranges, ...
Code of method --link()-------------------->  Step[]   program.stepsSingle: JS source + source range per step
Step           --compileToJavascriptFunction()-->  new Function("__t", "__s", "__sb", codeAsString)
```

- `TermCodeGenerator.compileTerm` (together with `BinopCastCodeGenerator`) turns terms into `Expr` objects.
- `StatementCodeGenerator.compileStatementOrTerm` turns statements into `Code`. Where a statement contains a term, it
  calls `compileTerm` and converts the `Expr` into `Code` (`toStatement`, `statement`).
- `InnerClassCodeGenerator.compileMethodDeclaration` collects the `Code` of a method body and calls `link()`.
  (`CodeGenerator.buildInitializer` does the same for static initializers, `JavaReplCodeGenerator` for the console.)
- Afterwards `Program.compileToJavascriptFunctions()` turns the source code of each step into a function.

---

## 3. A first example: pure terms

```java
class Calc {
    int f(int a, int b) {
        int c = a + b * 2;
        return c;
    }
}
```

### 3.1 Terms become `Expr` objects

`compileTerm` is called for the initial value `a + b * 2` and works its way down the AST:

| Term | Generator methods | Resulting `Expr` |
|------|-------------------|------------------|
| `a` | `compileTerm` → `compileSymbolNode` → `compileSymbolOnStackframeAccess` → `term()` | `{ pre: [], value: "__s[__sb + 1]", type: int, lefty: true, variableRead: true }` |
| `b` | same | `{ pre: [], value: "__s[__sb + 2]", type: int, lefty: true, variableRead: true }` |
| `2` | `compileTerm` → `compileLiteralNode` → `term()` | `{ pre: [], value: "2", type: int, constant: 2 }` |
| `b * 2` | `compileTerm` → `compileBinaryOperator` → `compileBinaryOperation` → `binaryOperation` → `combine()` | `{ pre: [], value: "__s[__sb + 2] * 2", type: int }` |
| `a + b * 2` | same | `{ pre: [], value: "__s[__sb + 1] + __s[__sb + 2] * 2", type: int }` |

(Every `Expr` also has a `range`, its position in the source code. It is left out in this table.)

`value` is a JavaScript expression, stored as a string. `pre` is empty: no code has to run before `value` can be
evaluated. Such an `Expr` is called **pure** (`isPure(e)`). Most terms are pure, and for them the generated code is
just one JavaScript expression.

`term()` is the simplest way to create an `Expr`:

```ts
export function term(value: string, type?: JavaType, range?: IRange, constant?: ConstantValue): Expr {
    return { pre: [], value, type, range, constant };
}
```

`binaryOperation` combines two `Expr` objects with `combine()`. For pure operands `combine` simply puts the values into
the template `l + " * " + r`. [Section 6](#6-left-to-right-how-combine-keeps-javas-evaluation-order) shows what it does
for operands that aren't pure.

### 3.2 The statement becomes `Code`

`compileStatementOrTerm` passes the declaration to `compileLocalVariableDeclaration`, which

1. compiles the initial value (`compileInitialValue` → `compileTermWithTargetType` → `compileTerm`, then `compileCast`,
   which does nothing for `int` to `int`),
2. gets an `Expr` for the new variable `c` from `compileSymbolOnStackframeAccess`: `__s[__sb + 3]`,
3. builds the assignment with ``assign(variable, initialValue, type, range, (l, r) => `${l} = ${r}`)``. Its value is
   `__s[__sb + 3] = __s[__sb + 1] + __s[__sb + 2] * 2`,
4. turns that `Expr` into `Code` with `toStatement()`: the value, followed by `;\n` and the source range.

`compileStatementOrTerm` puts a `STEP` in front of every statement it compiles. `compileReturnStatement` uses
``statement(e, value => `__t.return(${value});\n`, range)`` and appends another `STEP`.

This is the `Code` of the method body, printed with `codeToString()` (see
[section 15](#15-looking-at-generated-code-yourself)):

```text
-------------------- STEP --------------------
-------------------- STEP --------------------
__s[__sb + 3] = __s[__sb + 1] + __s[__sb + 2] * 2;
[range 3:9-3:26]
-------------------- STEP --------------------
__t.return(__s[__sb + 3]);
[range 4:9-4:17]
-------------------- STEP --------------------
```

`codeToString` prints JavaScript strings as they are and every other op on a line of its own: `STEP` as a dashed line,
source ranges as `[range startLine:startColumn-endLine:endColumn]`.

Note the two `STEP`s at the beginning: the block `{ ... }` is a statement, too, so it starts with a `STEP`, and so does
its first statement. That's harmless. `link()` drops every step boundary that would end an empty step, so generators
can put a `STEP` wherever a new step *may* begin without worrying about duplicates.

### 3.3 `link()` cuts the code into steps

`compileMethodDeclaration` finally calls `link(code, method.program, "Method Calc.f")`. Result (`program.stepsSingle`):

```js
// Step 0  [range 3:9-3:26]
__s[__sb + 3] = __s[__sb + 1] + __s[__sb + 2] * 2;
return 1;
// Step 1  [range 4:9-4:17]
__t.return(__s[__sb + 3]);
return 2;
```

- Each `STEP` ends the current step with `return <index of the next step>;`.
- The range ops become the step's range. The debugger highlights it and uses it to find the step for a breakpoint.
- `__t.return(...)` ends the method. The `return 2;` after it does no harm: the thread has already switched back to
  the caller and ignores it.

### 3.4 Constant folding

```java
class Calc {
    int g() {
        int d = 3 + 4 * 2;
        return d;
    }
}
```

Literals are compile-time constants: `compileLiteralNode` passes the value as fourth argument to `term()`, which
stores it in `constant`. If both operands are constant, `binaryOperation` calls `foldConstants`, which computes the
result at compile time:

```text
4         { pre: [], value: "4",  type: int, constant: 4 }
2         { pre: [], value: "2",  type: int, constant: 2 }
4 * 2     { pre: [], value: "8",  type: int, constant: 8 }
3 + 4 * 2 { pre: [], value: "11", type: int, constant: 11 }
```

Step 0 is `__s[__sb + 1] = 11; return 1;`.

---

## 4. The building blocks: `Code` and `Expr`

Now that you've seen both data types in action, here is the full picture.

### 4.1 `Code`: a flat list of operations

```ts
export type Op = string | Label | StepOp | JumpOp | RangeOp | HookOp | RegisterOp | CleanupOp;
export type Code = Op[];
```

| Op | Create with | `codeToString` prints | What `link()` makes of it |
|----|-------------|-----------------------|---------------------------|
| JavaScript code | a plain string | the string | appended to the step's code |
| step boundary | `STEP` (constant) | `---------- STEP ----------` | ends the step with `return <next index>;`; dropped if the step would be empty |
| jump target | `new Label()` | `L0:` | marks a position. A label always starts a new step; `label.stepIndex` becomes that step's index |
| jump | `jump(label, range?)` | `[jump to L0]` | `return <label.stepIndex>;` |
| source range | `at(range)` (returns `[]` if `range` is undefined) | `[range 3:9-3:26]` | sets or extends the step's range |
| hook | `hook(step => ...)` | `[hook]` | the function is called with the `Step` that is being built |
| register | only created inside `Expr.ts` | `[register __r0]` | `let __r0;` at the beginning of the step |
| cleanup | `cleanup(code, range?)` | `[cleanup] code` | appended like a string, but doesn't need a step of its own |

`Code` is just an array, so code is concatenated with the spread operator. Generator methods therefore read like the
layout of the generated program. `compileWhileStatement` (simplified, see
[section 9](#9-control-flow-labels-and-jumps)):

```ts
return [
    labelAtBeginOfWhileBlock,
    ...statement(condition, value => `if(!(${value})){\n`), jump(labelAfterWhileBlock), "}", STEP,
    ...statementToRepeat,
    jump(labelAtBeginOfWhileBlock), STEP,
    labelAfterWhileBlock
];
```

### 4.2 `Expr`: a compiled term

```ts
export interface Expr {
    pre: Code;                // code that has to run first; may contain STEPs, labels, jumps
    value: string;            // JavaScript expression, "" if the term has no value (call of a void method)
    type?: JavaType;
    range?: IRange;
    constant?: ConstantValue; // value of a compile-time constant: number | boolean | string | null
    stable?: boolean;         // value doesn't change while other code runs (this, class objects)
    variableRead?: boolean;   // value only reads a variable and has no side effects (see section 6)
    lefty?: boolean;          // may be on the left side of an assignment
    place?: Place;            // location depends on other terms (obj.field, a[i])
    isFinalField?: boolean;
    superLevel?: number;      // super: 1, super.super: 2, ...
}
```

The contract of an `Expr` is:

> To evaluate it, run `pre`, then evaluate `value`. `value` is evaluated **in the same step in which `pre` ends.**

The second sentence matters. `value` may refer to things that `pre` prepared at its end: a value that a method call
pushed onto the stack (`__s.pop()`), or a step-local JavaScript variable (`__r0`). Code that consumes an `Expr` must
therefore never put a `STEP` between `pre` and `value`. All helper functions in `Expr.ts` stick to this.

There are four kinds of `Expr`, and you'll meet all of them in the next sections:

| Kind | `pre` | `value` | Example |
|------|-------|---------|---------|
| pure term | empty (or only hooks and ranges) | JavaScript expression | `a + b * 2` |
| result of a Java call | ends with `STEP` | contains `__s.pop()` | `f(1, 2) + 1` |
| term with spilled operands | pushes values, ends with pops into registers | uses `__r0`, `__r1`, ... | `x + incX()` |
| void | anything | `""` | `r.run()` |

---

## 5. Calling a method: `javaCall`

```java
class Calc {
    int f(int a, int b) {
        return a + b;
    }
    int h() {
        int x = f(1, 2) + 1;
        return x;
    }
}
```

`compileMethodCall` compiles `f(1, 2)` in these steps:

1. The arguments: `getParameterValueSnippets` calls `compileTerm` for each of them. Here both are constants.
2. The object: there is none in the source, so `compileMethodCall` uses the implicit `this`:
   `{ ...term("__s[__sb]", Calc), stable: true }`.
3. `searchMethod` finds `f`, and `castParameterValuesAndPackEllipsis` casts the arguments to the parameter types.
4. `f` is declared in Java, so the calling convention is `"java"`. The call template is
   `§1._mj$f$int$int$int(__t, undefined, §2, §3)` (`_mj$<name>$<return type>$<parameter types>`; `undefined` is the
   callback parameter).
5. `combine(int, range, [object, 1, 2], build)` fills in the template. All three operands are pure, so the result is
   pure, too: `__s[__sb]._mj$f$int$int$int(__t, undefined, 1, 2)`.
6. `javaCall(expr, true)` applies the rule from [section 1](#the-one-rule-that-shapes-everything): the call moves into
   `pre`, a `STEP` follows, and the result is read from the stack:

```ts
export function javaCall(call: Expr, returnsValue: boolean): Expr {
    return {
        pre: [...call.pre, call.value + ";\n", ...at(call.range), STEP],
        value: returnsValue ? "__s.pop()" : "",
        type: call.type,
        range: call.range
    };
}
```

The `Expr` objects:

```text
f(1, 2)
  pre:
    __s[__sb]._mj$f$int$int$int(__t, undefined, 1, 2);
    [range 6:17-6:24]
    -------------------- STEP --------------------
  value: "__s.pop()"
  type:  int

f(1, 2) + 1
  pre:   (same as above)
  value: "__s.pop() + 1"
  type:  int
```

For `f(1, 2) + 1`, `binaryOperation` calls `combine` with the non-pure left operand and the constant `1`. `combine`
appends the left operand's `pre` and uses its value as it is. (Why that is correct here, but not always, is the topic
of the next section.)

The declaration then becomes `__s[__sb + 1] = __s.pop() + 1` (via `assign`, which `combine`s the variable and the
initial value), and `toStatement` turns it into `Code`:

```text
-------------------- STEP --------------------
__s[__sb]._mj$f$int$int$int(__t, undefined, 1, 2);
[range 6:17-6:24]
-------------------- STEP --------------------
__s[__sb + 1] = __s.pop() + 1;
[range 6:9-6:28]
```

The steps of `h`:

```js
// Step 0  [range 6:17-6:24]
__s[__sb]._mj$f$int$int$int(__t, undefined, 1, 2);
return 1;
// Step 1  [range 6:9-6:28]
__s[__sb + 1] = __s.pop() + 1;
return 2;
// Step 2  [range 7:9-7:17]
__t.return(__s[__sb + 1]);
return 3;
```

At runtime: step 0 calls the stub of `f`, which pushes `this`, `1` and `2` and pushes `f`'s program. Step 0 returns
`1`, which the thread stores as the resume position of `h`. The thread then runs `f`'s step 0,
`__t.return(__s[__sb + 1] + __s[__sb + 2])`, which removes `f`'s part of the stack and pushes `3`. The thread
continues `h` at step 1, which pops the `3` and adds `1`.

The step boundary also has a nice effect in the debugger: stepping through `h` stops at `f(1, 2)` (range `6:17-6:24`)
and then at the whole declaration.

### Nested calls

```java
    int m() {
        return f(3, f(4, 5));
    }
```

The inner call is an ordinary argument of the outer call, with `pre` ending in `STEP` and value `__s.pop()`:

```js
// Step 0
__s[__sb]._mj$f$int$int$int(__t, undefined, 4, 5);
return 1;
// Step 1
__s[__sb]._mj$f$int$int$int(__t, undefined, 3, __s.pop());
return 2;
// Step 2
__t.return(__s.pop());
return 3;
```

### Calls with native calling convention

```java
    double n(double a, double b) {
        return Math.max(a, b) + Math.sqrt(a);
    }
```

`Math.max` and `Math.sqrt` are library methods with a `template` (`Math.max(§1, §2)`, `Math.sqrt(§1)`).
`compileMethodCall` fills in the template with `apply()` and doesn't call `javaCall`. Everything stays pure, and the
whole method is a single step:

```js
// Step 0
__t.return(Math.max(__s[__sb + 1], __s[__sb + 2]) + Math.sqrt(__s[__sb + 1]));
return 1;
```

Library methods without a template but with `native:` implementation are called directly, too (`§1.methodName(...)`
without `__t` and callback). A method uses the Java calling convention if it is declared in Java, if its library
implementation may call back into Java code (`java:` declarations), or if Java code may override it.

---

## 6. Left to right: how `combine` keeps Java's evaluation order

In [section 5](#5-calling-a-method-javacall), `combine` could simply use `__s.pop()` in the combined value. That isn't
always correct:

```java
class Calc {
    int x = 1;
    int incX() {
        x = 10;
        return 0;
    }
    int k() {
        int y = x + incX();
        return y;
    }
}
```

Java evaluates operands from left to right: it reads `x` (1), then calls `incX()`, which sets `x` to 10 and returns 0.
So `y` is 1. The naive translation would be

```js
// Step 0
__s[__sb]._mj$incX$int$(__t, undefined);
return 1;
// Step 1
__s[__sb + 1] = __s[__sb].$f_x + __s.pop();    // reads x AFTER incX() changed it: y == 10
```

The problem: `x` is read in the step after the call, so the call's side effect is visible. The left operand has to be
evaluated **before** the right operand's `pre` code runs.

### What `combine` does

```ts
export function combine(type, range, args: Expr[], build: Build): Expr
```

`combine` gets the operands in Java order and a `build` function that assembles the new value from the operands'
values. In outline:

```text
last := index of the last operand that isn't pure (-1 if all are pure)

for each operand i, from left to right:
    append its pre                                    // for pure operands: only hooks and registers
    if i < last and the operand isn't stable:         // its value must be computed now,
        push its value onto the stack                 // before later pre code runs
        (nothing to do if its value already is "__s.pop()": it's on the stack already)

if there is a non-pure operand:
    if build doesn't use its value:          evaluate it as a statement (it may pop a value)
    else if values were pushed or build uses its value more than once:
                                             __r<n> = <its value>      (step-local variable)
pop the pushed values into new registers, in reverse order

inline := the values that build puts into the new value as they are
          (the last non-pure operand if it got no register, the non-stable operands after it)
if build doesn't use each of them exactly once and in operand order, and one of them isn't a variable read:
    assign each of them to a new register, in operand order     (see "Values that build uses twice" below)

return { pre, value: build(values, with registers where needed) }
```

In the common case, e.g. `a + b * 2`, all operands are pure and each is used once in order. Then nothing of this
applies, and the result is simply `{ pre: hooks of all operands, value: build(values) }`.

Applied to `x + incX()`, `binaryOperation` calls `combine(int, range, [x, incX()], (l, r) => l + " + " + r)`:

```text
x
  pre:   []
  value: "__s[__sb].$f_x"
  type:  int, lefty: true, variableRead: true

incX()
  pre:
    __s[__sb]._mj$incX$int$(__t, undefined);
    [range 8:21-8:27]
    -------------------- STEP --------------------
  value: "__s.pop()"

x + incX()
  pre:
    __s.push(__s[__sb].$f_x);
    __s[__sb]._mj$incX$int$(__t, undefined);
    [range 8:21-8:27]
    -------------------- STEP --------------------
    [register __r0]
    __r0 = __s.pop();
    [register __r1]
    __r1 = __s.pop();
  value: "__r1 + __r0"
  type:  int
```

And the steps of `k`:

```js
// Step 0  [range 8:21-8:27]
__s.push(__s[__sb].$f_x);
__s[__sb]._mj$incX$int$(__t, undefined);
return 1;
// Step 1  [range 8:9-8:27]
let __r0, __r1;
__r0 = __s.pop();
__r1 = __s.pop();
__s[__sb + 1] = __r1 + __r0;
return 2;
// Step 2  [range 9:9-9:17]
__t.return(__s[__sb + 1]);
return 3;
```

When step 1 starts, the stack holds `..., 1, 0`: the old value of `x` and, on top of it, the result of `incX()`. The
top value has to be popped first, which is why the last non-pure operand gets a register even though it is used only
once. Then the spilled values are popped in reverse order.

### Registers

A register is a JavaScript variable local to one step function. `combine` creates it with `newRegister`, which adds a
`{ k: "register", name }` op to `pre`. `link()` collects these ops per step and declares them at the beginning of the
step (`let __r0, __r1;`). Register names come from a counter that `JavaCompiler.compileIfDirty` resets
(`resetRegisterCounter`) at the start of each compilation, so names never clash, even when `combine` calls are nested.

Registers are only valid within one step. That's fine, because they are assigned at the very end of `pre` and used in
`value`, which according to the `Expr` contract is evaluated in the same step.

> **Design note.** Why not store spilled values in hidden local variables of the stack frame? Field initializers are
> compiled once and copied into every constructor, so such slots could collide with constructor parameters. The
> operand stack plus step-local registers has no such problem.

### Stable operands aren't spilled

An operand is **stable** if its value can't change while other code runs. Then it doesn't matter when it's
evaluated, and `combine` leaves it in place. `isStable(e)` is true for constants and for `Expr` objects with
`stable: true`:

- `this` and `super` (`compileKeywordThis`, `compileKeywordSuper`, and the implicit object of a method call without
  object),
- class objects like `__t.classes["Math"]` (`compileSymbolNode`, `compileDereferenceAttribute`),
- the left side of an assignment to a local variable or a field of `this` (`assign`, see
  [section 11](#11-assignments-lefty-place-and-compound-assignments)).

In the nested call `f(3, f(4, 5))` above, `this` and `3` come before the non-pure argument, but both are stable, so
nothing is spilled.

### Two calls as arguments

```java
    int u() {
        return f(g(1), g(2));
    }
```

`compileMethodCall` calls `combine` with `[this, g(1), g(2)]`. `g(2)` is the last non-pure operand. `g(1)` comes
before it and isn't stable, but its value already is `__s.pop()`: its result is on the stack anyway. So `combine`
only records it as spilled.

```js
// Step 0
__s[__sb]._mj$g$int$int(__t, undefined, 1);
return 1;
// Step 1
__s[__sb]._mj$g$int$int(__t, undefined, 2);
return 2;
// Step 2
let __r0, __r1;
__r0 = __s.pop();            // result of g(2)
__r1 = __s.pop();            // result of g(1)
__s[__sb]._mj$f$int$int$int(__t, undefined, __r1, __r0);
return 3;
// Step 3
__t.return(__s.pop());
return 4;
```

After `combine`, at most one `__s.pop()` is left in the value, and no operand is read after code that could change
it.

### Values that `build` uses twice or out of order

Most `build` functions use each value once, in operand order. Some don't:

- library templates, e.g. `Random.randint`: `Math.floor(Math.random()*(§2-(§1)+1)+§1)` (`§2` comes first, `§1` is
  used twice) or `Circle.getRadius`: `(§1.radius*§1.scaleFactor)`,
- the templates of `assertEquals`, `assertTrue`, ...: `let _z_ = §3; let _y_ = §2; let _x_ = §1; ...` (right to
  left),
- `/=` on integers and `++`/`--` on `Integer` variables, which use the location of the variable twice
  (`l = Math.trunc(l / (r || ...))`).

For a variable read that doesn't matter. For other terms it does: `Random.randint(i++, 5)` would increment `i` twice,
and `assertEquals(i++, i - 1, "...")` would compute `i - 1` before `i++`. Note that both `i++` and `i - 1` are pure:
"pure" only means that `pre` contains no code to run, not that the term has no side effects.

So `combine` calls `build` once with marker strings (`analyzeBuild`) to find out how often and in which order it uses
each value. If the values that go into the new value as they are aren't used exactly once each and in operand order,
and one of them isn't a variable read, `combine` evaluates all of them once, in operand order, into registers:

```java
int i = 5;
int r = Random.randint(i++, 5);
```

```js
let __r0;
__s[0].$f_r = (__r0 = __s[0].$f_i++, Math.floor(Math.random()*(5-(__r0)+1)+__r0));
```

The assignments go into the value as a comma expression, and `pre` only gets the register declaration. So the term
stays pure, and in `f && Random.randint(i++, 5) > 0` JavaScript's `&&` still evaluates the call only if `f` is true.

The value of a `void` term may be a statement sequence, though (as in the assertion templates), and then a comma
expression isn't possible. For terms of type `void`, `combine` puts the assignments at the end of `pre` instead:

```java
int i = 0;
assertEquals(i++, i - 1, "assertEquals evaluates arguments right to left");
```

```js
let __r0, __r1;
__r0 = __s[0].$f_i++;
__r1 = __s[0].$f_i - 1;
let _z_ = "assertEquals evaluates arguments right to left"; let _y_ = __r1; let _x_ = __r0; for(__ao of __t.assertionObservers){__ao.notifyOnAssertEqualsNumber(__t, this, _x_, _y_, _z_);};
```

(Both examples are from the main program, where `i` is `__s[0].$f_i`.)

Which terms count as variable reads? Those with `variableRead: true`:

- local variables and parameters (`compileSymbolOnStackframeAccess`) and copies of local variables of an enclosing
  method (`compileOuterClassLocalVariableAccess`),
- fields (`compileFieldAccess`, `compileDereferenceAttribute`), unless the field has a template or the object isn't a
  variable read or stable,
- array elements that are read (`arrayElement`), if the array and the indices are variable reads or stable.

Everything else, e.g. `i++`, `a + b` or a call with native calling convention, may have side effects as far as
`combine` is concerned. (`isVariableReadOrStable(e)` checks for a variable read or a stable term.)

---

## 7. Helpers built on `combine`: `apply`, `joined`, `map`, `frame`

Most generator code doesn't call `combine` directly but one of these shortcuts:

| Function | What it does | Example |
|----------|--------------|---------|
| `template(t)` | turns a template string into a `Build` function: `§1`, `§2`, ... are replaced by the values | `template("Math.max(§1, §2)")` |
| `apply(type, range, t, ...args)` | `combine(type, range, args, template(t))` | `apply(int, range, "-(§1)", operand)` |
| `joined(type, range, prefix, separator, suffix, ...args)` | `combine` with the values joined | array literals, varargs, `__t.newArray(0, n, m)` |
| `map(e, f, type?, range?)` | new `Expr` with `pre` of `e` and value `f(e.value)` | |
| `frame(e, t, type?, range?)` | `map` with a template: `§1` is replaced by `e.value` | `frame(e, "§1.charCodeAt(0)", int)` |

`map` and `frame` have only one operand, so there is no evaluation order to care about: they keep `pre` and wrap the
value. The new `Expr` has no `constant`, `stable`, `variableRead`, `lefty` or `place`.

### Example: array literal with `joined`

```java
class Calc {
    int g(int a) {
        return a;
    }
    int[] lit(int x) {
        int[] v = {1, x, g(3)};
        return v;
    }
}
```

`compileArrayLiteral` compiles the elements and calls `joined(type, range, "[", ", ", "]", ...elements)`. The constant
`1` stays in place, `x` is spilled because the call `g(3)` follows. Code of the declaration (ranges left out):

```text
-------------------- STEP --------------------
__s.push(__s[__sb + 1]);
__s[__sb]._mj$g$int$int(__t, undefined, 3);
-------------------- STEP --------------------
[register __r0]
__r0 = __s.pop();
[register __r1]
__r1 = __s.pop();
__s[__sb + 2] = [1, __r1, __r0];
```

### Example: `frame` around a Java call

```java
class Calc {
    String str(Object o, int i) {
        return "o=" + o + i;
    }
}
```

To append an object to a string, `compileBinaryOperationWithStrings` calls `wrapWithToStringCall(o, "string")`. The
runtime helper `__t.ToString` may call a `toString()` method written in Java, so it uses the Java calling convention:

```ts
let newSnippet = javaCall(frame(o, "__t.ToString(__t, undefined, §1)", String), true);
return frame(newSnippet, '(§1 ||__t.classes["String"].null).value', string);
```

The second `frame` wraps a value that is `__s.pop()`; `pre` is passed on unchanged:

```text
o (after wrapWithToStringCall)
  pre:
    __t.ToString(__t, undefined, __s[__sb + 1]);
    [range 3:23-3:24]
    -------------------- STEP --------------------
  value: "(__s.pop() ||__t.classes[\"String\"].null).value"
  type:  string
```

`"o=" + o` then `combine`s the constant `"o="` (stable, so it isn't spilled) with this `Expr`, and `... + i` appends
the pure `i`. The `return` statement casts the primitive `string` to the class `String` (`box`, another `frame`):

```js
// Step 0
__t.ToString(__t, undefined, __s[__sb + 1]);
return 1;
// Step 1
__t.return(__t.primitiveStringToStringObject("o=" + (__s.pop() ||__t.classes["String"].null).value + __s[__sb + 2]));
return 2;
```

---

## 8. Throwing a value away: `toStatement` and `cleanup`

A term used as a statement (method call, assignment, `i++`, ...) is converted to `Code` by `toStatement`:

```ts
export function toStatement(e: Expr): Code {
    if (e.value == "") return e.pre;                                  // no value, e.g. void method
    if (e.value == "__s.pop()") return [...e.pre, cleanup("__s.pop();\n", e.range)];
    return [...e.pre, e.value + ";\n", ...at(e.range)];
}
```

The middle case is a non-void method with Java calling convention whose result isn't used. The result is on the
stack and must be popped; otherwise the stack would grow with every call, e.g. in a loop. (The test harness checks
this at every method return, see [section 15](#15-looking-at-generated-code-yourself).)

```java
class Calc {
    int f(int a) {
        return a;
    }
    void s() {
        f(1);
        int z = 2;
    }
}
```

`Code` of the body of `s`:

```text
-------------------- STEP --------------------
-------------------- STEP --------------------
__s[__sb]._mj$f$int$int(__t, undefined, 1);
[range 6:9-6:13]
-------------------- STEP --------------------
[cleanup, 6:9-6:13] __s.pop();
-------------------- STEP --------------------
__s[__sb + 1] = 2;
[range 7:9-7:18]
-------------------- STEP --------------------
__t.return();
[range 8:6-8:6]
```

Steps:

```js
// Step 0  [range 6:9-6:13]
__s[__sb]._mj$f$int$int(__t, undefined, 1);
return 1;
// Step 1  [range 7:9-7:18]
__s.pop();
__s[__sb + 1] = 2;
return 2;
// Step 2  [range 8:6-8:6]
__t.return();
```

The `__s.pop()` has to run after the call, so in a later step. As an ordinary string it would get a step of its own,
with the call's range, and stepping over `f(1);` in the debugger would stop on line 6 twice. A `cleanup` op is code
that doesn't need a step of its own: `link()` drops the `STEP` that directly follows it, so the pop runs at the
beginning of the next statement's step.

There's one exception: if a label follows the cleanup, the step boundary stays, because a jump to the label must not
run the pop again. If the cleanup then stays alone in its step, the step gets the cleanup's range.

---

## 9. Control flow: labels and jumps

```java
class Calc {
    int w(int n) {
        int i = 0;
        while (i < n) {
            i++;
        }
        return i;
    }
}
```

`compileWhileStatement`:

```ts
let negationResult = this.negateConditionIfPossible(conditionNode);    // i < n  becomes  i >= n
let condition = this.compileTerm(negationResult.newNode);
...
let labelAtBeginOfWhileBlock = new Label();
this.continueStack.push(labelAtBeginOfWhileBlock);
let labelAfterWhileBlock = new Label();
this.breakStack.push(labelAfterWhileBlock);
let statementToRepeat = this.compileStatementOrTerm(node.statementToRepeat);
...
return [
    labelAtBeginOfWhileBlock,
    ...statement(condition, value => negationResult.negationHappened ? `if(${value}){\n` : `if(!(${value})){\n`),
    jump(labelAfterWhileBlock), "}", STEP,
    ...statementToRepeat,
    jump(labelAtBeginOfWhileBlock, <end of the loop body>), STEP,
    labelAfterWhileBlock
];
```

The loop leaves when the condition is false. `negateConditionIfPossible` turns `i < n` into `i >= n` in the AST
before compiling it, so the generated `if` needs no `!(...)`.

`Code` of the body of `w` (`codeToString` names labels `L0`, `L1`, ... in order of appearance):

```text
-------------------- STEP --------------------
-------------------- STEP --------------------
__s[__sb + 2] = 0;
[range 3:9-3:18]
-------------------- STEP --------------------
L0:
if(__s[__sb + 2] >= __s[__sb + 1]){
[range 4:16-4:21]
[jump to L1]
}
-------------------- STEP --------------------
-------------------- STEP --------------------
-------------------- STEP --------------------
__s[__sb + 2]++;
[range 5:13-5:16]
[jump to L0, 6:10-6:10]
-------------------- STEP --------------------
L1:
-------------------- STEP --------------------
__t.return(__s[__sb + 2]);
[range 7:9-7:17]
-------------------- STEP --------------------
```

Steps:

```js
// Step 0  [range 3:9-3:18]
__s[__sb + 2] = 0;
return 1;
// Step 1  [range 4:16-4:21]
if(__s[__sb + 2] >= __s[__sb + 1]){
return 3;
}return 2;
// Step 2  [range 5:13-5:16]
__s[__sb + 2]++;
return 1;
// Step 3  [range 7:9-7:17]
__t.return(__s[__sb + 2]);
return 4;
```

How `link()` got there:

- **Pass 1** numbers the steps and gives each label the index of the step it starts. `L0` starts step 1, `L1` starts
  step 3. The three `STEP`s in a row after `}` produce only one step boundary, because the steps in between would be
  empty.
- **Pass 2** writes the code. A jump becomes `return <label.stepIndex>;`. Inside the `if`, that's a conditional jump:
  the step function returns early. A step ending with a jump gets no additional `return <next>;` (step 2).

The loop body `i++` is an `Expr` with value `__s[__sb + 2]++`. It comes from `updateVariable`
(see [section 11](#11-assignments-lefty-place-and-compound-assignments)) and `toStatement`.

The other statements use the same pattern. `compileIfStatement`:

```ts
[
    ...statement(condition, value => `if(!(${value})){\n`), jump(label1), "}\n", STEP,
    ...statementIfTrue, jump(label2), STEP,
    label1, ...statementIfFalse, STEP,
    label2
]
```

`break` and `continue` compile to `jump(label)` with the label on top of `breakStack` / `continueStack`.
`compileSwitchCaseStatement` emits a JavaScript `switch` whose cases only jump to one label per statement group.

---

## 10. Control flow inside a term: `&&`, `||`, `?:` and `toStack`

Some operators evaluate an operand only under a condition. If all operands are pure, JavaScript's own `&&`, `||` and
`?:` do that within one step. But if an operand contains a call with Java calling convention, its `pre` code must run
only when needed. Then the generator builds the control flow from labels and jumps, inside the `pre` of an `Expr`.

For that it uses `toStack(e)`: an `Expr` whose value is on the stack.

```ts
export function toStack(e: Expr): Expr {
    if (e.value == "" || e.value == "__s.pop()") return e;           // already on the stack (or no value)
    return { pre: [...e.pre, `__s.push(${e.value});\n`, ...at(e.range)], value: "__s.pop()", type: e.type, range: e.range };
}
```

Both branches end with the value on the stack, so after the label where they join, the result is `__s.pop()`, no
matter which branch ran.

### `&&` with a method call

```java
class Calc {
    boolean t(int a) {
        return a > 0;
    }
    boolean r(int a, int b) {
        return a > 0 && t(b);
    }
}
```

`compileLogicOperation`:

```ts
// pure terms => javascript interpreter does lazy evaluation for us:
if (isPure(leftSnippet) && isPure(rightSnippet)) return this.binaryOperation("&&", ...);

let label = new Label();
return {
    pre: [
        ...toStack(leftSnippet).pre, `if(!__s.pop()){__s.push(false);`, jump(label), '};', STEP,
        ...toStack(rightSnippet).pre, STEP,
        label
    ],
    value: "__s.pop()",
    type: this.booleanType,
    range: wholeRange
}
```

Steps of `r`:

```js
// Step 0  [range 6:16-6:21]
__s.push(__s[__sb + 1] > 0);
if(!__s.pop()){__s.push(false);return 2;
};return 1;
// Step 1  [range 6:25-6:29]
__s[__sb]._mj$t$boolean$int(__t, undefined, __s[__sb + 2]);
return 2;
// Step 2  [range 6:9-6:29]
__t.return(__s.pop());
return 3;
```

If `a > 0` is false, step 0 pushes `false` and jumps to step 2. Otherwise step 1 calls `t(b)`, whose result ends up on
the stack. Step 2 pops whichever value is there.

### `?:` with a method call

```java
    int tern(boolean b) {
        return b ? f(1) : 2;
    }
```

`compileTernaryOperator` uses `apply(type, range, "((§1) ? (§2) : (§3) )", ...)` if both alternatives are pure.
Here `f(1)` isn't, so it builds:

```ts
[
    ...condition.pre, `if(${condition.value}){\n`, ...at(condition.range), jump(label1), "}\n", STEP,
    ...toStack(secondAlternative).pre, jump(label2), STEP,
    label1, ...toStack(firstAlternative).pre, STEP,
    label2
]
```

```js
// Step 0
if(__s[__sb + 1]){
return 2;
}
return 1;
// Step 1                    (b is false: push 2)
__s.push(2);
return 3;
// Step 2                    (b is true: call f(1), which pushes its result)
__s[__sb]._mj$f$int$int(__t, undefined, 1);
return 3;
// Step 3
__t.return(__s.pop());
return 4;
```

`toStack(f(1))` returns `f(1)` unchanged, because its value already is `__s.pop()`. For `2`, `toStack` adds
`__s.push(2);`.

---

## 11. Assignments: `lefty`, `place` and compound assignments

`compileAssignment` first checks `lefty`: only an `Expr` with `lefty: true` may be assigned to. These set it:

- `compileSymbolOnStackframeAccess` (local variables and parameters, unless `final`),
- `compileFieldAccess` and `compileDereferenceAttribute` (fields; `final` fields only in constructors),
- `arrayElement` (array elements).

How the assignment is built depends on whether the variable's **location** depends on other terms.

### Variables with a fixed location

For local variables, parameters, static fields and fields of `this`, the location can't change while the right side
is evaluated. `assign` therefore marks the left side as stable and `combine`s it with the right side:

```ts
assign(left: Expr, right: Expr, type: JavaType, range: IRange, build: (location: string, value: string) => string): Expr {
    if (left.place) { ... }                                           // see below
    // location of local variable, static field, field of this doesn't change
    return combine(type, range, [{ ...left, stable: true }, right], build);
}
```

Without `stable: true`, `combine` would push the left side's *value* onto the stack if the right side contains a Java
call. But the assignment needs the variable's *location*.

### Variables whose location depends on other terms: `place`

```java
class Box {
    int value;
}
class Calc {
    Box[] boxes = new Box[3];
    Box getBox(int i) {
        return boxes[i];
    }
    int h(int a) {
        return a;
    }
    void p() {
        getBox(1).value = h(2);
    }
}
```

Java evaluates `getBox(1)` before `h(2)`. The left side `getBox(1).value` therefore has two parts: the terms the
location depends on (here `getBox(1)`) and the way the location is built from their values. That is a `Place`:

```ts
export interface Place {
    parts: Expr[];
    build: Build;          // (...values of parts) => location
}
```

`compileDereferenceAttribute` creates it:

```ts
let fieldTemplate = `(§1 || __t.NPE(...)).${field.getInternalName()}`;
let snippet = apply(field.type, range, fieldTemplate, objectSnippet);
return { ...snippet, lefty, isFinalField: field._isFinal, place: { parts: [objectSnippet], build: template(fieldTemplate) } };
```

```text
getBox(1).value
  pre:
    __s[__sb]._mj$getBox$Box$int(__t, undefined, 1);
    [range 13:9-13:18]
    -------------------- STEP --------------------
  value: "(__s.pop() || __t.NPE(13, 19, 13, 24)).$f_value"
  type:  int, lefty: true
  place: { parts: [getBox(1)],
           build(p1) = "(p1 || __t.NPE(13, 19, 13, 24)).$f_value" }
```

`value` is what a read access uses. For the assignment, `assign` uses the `place`: it `combine`s the parts and the
right side, and builds the location from the parts' values:

```ts
if (left.place) {
    let place = left.place;
    return combine(type, range, [...place.parts, right],
        (...values) => build(place.build(...values.slice(0, -1)), values[values.length - 1]));
}
```

So the result of `getBox(1)` is spilled like any other operand before `h(2)`:

```js
// Step 0
__s[__sb]._mj$getBox$Box$int(__t, undefined, 1);
return 1;
// Step 1
__s[__sb]._mj$h$int$int(__t, undefined, 2);
return 2;
// Step 2
let __r0, __r1;
__r0 = __s.pop();                                      // result of h(2)
__r1 = __s.pop();                                      // result of getBox(1)
(__r1 || __t.NPE(13, 19, 13, 24)).$f_value = __r0;
return 3;
```

The null check happens after the right side has been evaluated, as in Java.

### Array elements: different code for reading and writing

```java
class Calc {
    int arr(int[] v, int i) {
        v[i] = v[i + 1] * 2;
        return v[0];
    }
}
```

`compileSelectArrayElement` (here `compileSelectArrayElementFast`, for arrays of primitive type) creates the element
with `arrayElement`, which `combine`s the array and the indices for the read access and stores the location template
as `place`:

```text
v[i + 1]   (read access)
  value: "(__s[__sb + 1][__s[__sb + 2] + 1]??__t.IOBE(3, 18, 3, 23))"
  place: { parts: ["__s[__sb + 1]", "__s[__sb + 2] + 1"],
           build(p1, p2) = "__t.Array0(p1)[__t.CheckLastIndex(p2, 1)]" }
```

A read only has to check that the element exists (`?? IOBE`), a write needs the checked array and index. For the left
side of an assignment, `compileBinaryOperator` calls `compileTerm(ast.leftSide, true)`, and the value is the location
right away. Everything is pure here, so the statement is one step:

```js
__t.Array0(__s[__sb + 1])[__t.CheckLastIndex(__s[__sb + 2], 1)] = (__s[__sb + 1][__s[__sb + 2] + 1]??__t.IOBE(3, 18, 3, 23)) * 2;
return 1;
```

### `++` and `--`: `updateVariable`

```ts
updateVariable(operand: Expr, type: JavaType, range: IRange, build: (location: string) => string): Expr {
    if (operand.place) {
        let place = operand.place;
        return combine(type, range, place.parts, (...values) => build(place.build(...values)));
    }
    return combine(type, range, [operand], build);
}
```

`i++` becomes `combine(int, range, [i], location => location + "++")`, value `__s[__sb + 2]++`
(see [section 9](#9-control-flow-labels-and-jumps)).

### Compound assignments: `compoundAssign` and `compoundAssignment`

```java
class Calc {
    int x = 1;
    int setX() {
        x = 5;
        return 2;
    }
    void q() {
        x += setX();
        x += 3;
    }
}
```

In Java, `x += setX()` reads `x` before calling `setX()`: the result is `1 + 2 = 3`. JavaScript's `+=` reads the
variable first, too, so for a pure right side `compoundAssign` just uses `assign` with `${location} += ${value}`:

```text
x += 3     value: "__s[__sb].$f_x += 3"
```

If the right side has `pre` code, the call runs in an earlier step than the `+=`, so `+=` would read `x` after
`setX()` changed it. In this case `compoundAssign` calls `compoundAssignment()` from `Expr.ts`, which pushes the old
value before the right side's `pre`:

```text
x += setX()
  pre:
    __s.push(__s[__sb].$f_x);                   // old value of x
    __s[__sb]._mj$setX$int$(__t, undefined);
    -------------------- STEP --------------------
    [register __r0]
    __r0 = __s.pop();                           // value of the right side
    [register __r1]
    __r1 = __s.pop();                           // old value of x
  value: "__s[__sb].$f_x = __r1 + __r0"
```

If the variable has a `place`, `compoundAssignment` also spills the parts and reads the old value through them while
they are on top of the stack (`__s[__s.length - k]`).

---

## 12. Hooks: attaching compile-time data to steps

Sometimes generated code needs an object that exists only at compile time, e.g. the runtime class of a lambda. A
**hook** is a function that `link()` calls with the `Step` it is building at the hook's position. Inside the step
function, `this` is that `Step` object, so the generated code can read what the hook stored.

### Lambdas

```java
class Calc {
    int base = 3;
    void lam() {
        Runnable r = () -> println(base);
        r.run();
    }
}
```

`compileLambdaFunction` compiles the lambda's body as a method of a new class and returns:

```ts
return {
    pre: [hook(step => {
        if (instantiationAtRuntimeNeeded) {
            step["innerClass" + counter] = klass.runtimeClass;     // here: step.innerClass0
            ...
        } else {
            step["lambdaObject" + counter] = new klass.runtimeClass!(null);
        }
    })],
    value: instantiationAtRuntimeNeeded ? `new this.innerClass${counter}(...)` : `this.lambdaObject${counter}`,
    ...
};
```

```text
-------------------- STEP --------------------
[hook]
__s[__sb + 1] = new this.innerClass0(__s[__sb]);
[range 4:9-4:41]
```

The lambda reads the field `base` of the enclosing object, so it has to be instantiated at runtime with the outer
object `__s[__sb]`. (A lambda that uses neither fields of the outer object nor local variables is created once at link
time and stored as `this.lambdaObject<n>`.)

A hook isn't executable code: `isPure` ignores it, so the lambda's `Expr` counts as pure and causes no spilling. When
`combine` combines only pure operands, it still copies their `pre` (the hooks) into the new `Expr`.

### `try`/`catch`: hooks that need step indices

```java
class Calc {
    int tc(int a) {
        try {
            a = 10 / a;
        } catch (ArithmeticException e) {
            a = -1;
        }
        return a;
    }
}
```

`compileTryCatchStatement` starts the `try` block with:

```ts
[`__t.beginTryBlock({catchBlockInfos: this.catchBlockInfoList, finallyBlockIndex: this.finallyBlockIndex});\n`, ...at(node.range),
 hook(step => {
     // labels already know their step index when hooks are called
     catchBlockInfos.forEach((catchBlockInfo, i) => catchBlockInfo.catchBlockBeginsWithStepIndex = catchCaseLabels[i].stepIndex);
     step.catchBlockInfoList = catchBlockInfos;
     step.finallyBlockIndex = node.finallyStatement ? finallyBlockLabel.stepIndex : -1;
 })]
```

The hook needs the step index of the `catch` block, whose label comes *later* in the code. That works because
`link()` calls hooks in its second pass, when the first pass has already numbered all labels.

```js
// Step 0
__t.beginTryBlock({catchBlockInfos: this.catchBlockInfoList, finallyBlockIndex: this.finallyBlockIndex});
__s[__sb + 1] = Math.trunc( 10 / (__s[__sb + 1]|| __t.AE("Teilen durch 0 nicht möglich", 4, 17, 4, 23)));
__t.endCatchTryBlock();
return 2;
// Step 1                    (catch block, label L1: its index 1 is stored in catchBlockInfoList)
__t.s[__sb + 2] = __t.getExceptionAndTrimStack(true);
__s[__sb + 1] = -1;
return 2;
// Step 2
__t.return(__s[__sb + 1]);
return 3;
```

(`withoutLeadingSteps` removes the leading `STEP` of the `try` block's code, so its first statement runs in the same
step as `beginTryBlock`.)

---

## 13. Source ranges

Each step has a source range. The debugger highlights it, a breakpoint is set on a step whose range contains the
breakpoint's line (`Program.findStep`), and exceptions report it. `link()` computes it from the range ops in the step:

- the first range op sets the step's range (`setRangeStartIfUndefined`; `EmptyRange` is ignored),
- every range op extends its end if it reaches further (`adaptRangeEnd`),
- the range of a `jump` is only used if the step has no range otherwise (e.g. the jump back to the start of a `for`
  loop without update statement),
- the range of a `cleanup` is only used if the step has no range otherwise.

Generators usually put the range after the code it belongs to: `toStatement`, `statement`, `toStack` and `javaCall`
add `at(range)` behind the JavaScript code. `at(undefined)` returns an empty array, so you can always spread it.

---

## 14. `link()` in detail

```ts
export function link(code: Code, program: Program, identifier: string): void
```

`identifier` is only used for logging (see next section). The result is stored in `program.stepsSingle`.

**Pass 1** copies the ops into a new list and decides where steps begin:

- A `STEP` is kept only if the current step contains code (a non-empty string or a jump). Steps that would contain
  nothing, only labels, or only cleanup code are not ended; a `STEP` after cleanup code is dropped, so the cleanup
  joins the next step.
- A label always starts a new step: if the current step already contains code or cleanup code, a `STEP` is inserted
  before it. Then the label gets `stepIndex` = index of the current step.

**Pass 2** builds the `Step` objects:

| Op | Effect |
|----|--------|
| `STEP` | appends `return <index + 1>;` unless the step ends with a jump; finishes the step: declares its registers (`let __r0, ...;` at the beginning), takes a cleanup range if it has no range; starts a new step |
| string | appended to `step.codeAsString` |
| label | nothing (it only marked a position for pass 1) |
| jump | appends `return <label.stepIndex>;\n`; range only if the step has none |
| range | `setRangeStartIfUndefined` + `adaptRangeEnd` |
| hook | `fn(step)`: labels already know their step indices, but the step isn't finished yet |
| register | remembers the name for the `let` declaration (once per step) |
| cleanup | appended like a string; its range is remembered for the step |

The last step is kept if it isn't empty. It gets no `return` at the end; usually it contains `__t.return(...)` anyway.

`isEmptyCode(code)` answers whether `code` contains anything to execute besides labels, ranges, hooks and step
boundaries. `compileIfStatement` uses it to warn about an empty statement after `if`.

---

## 15. Looking at generated code yourself

- **Code before linking:** in [Code.ts](../src/compiler/java/codegenerator/Code.ts), uncomment
  `// logCode(code, identifier);` at the beginning of `link()`. Every program then logs its `Code` in the notation used
  in this document, titled with the identifier (`Method Calc.f`, `Constructor Calc.Calc`,
  `Initialize staticInitializer`, `Repl.method`, ...). Works in the browser console and in vitest output.
- **`codeToString(code, title)`** returns that text, e.g. to print the `pre` of a single `Expr` while debugging a
  generator method.
- **Steps after linking:** `program.logAllSteps()` logs the code of every step; `new CodePrinter().printProgram(program)`
  returns it as a string, including catch block infos.
- **Stack balance:** the test harness ([JavaTestHarness.ts](../src/test/JavaTestHarness.ts)) checks at every method
  return that the method's part of the stack holds exactly `this`, parameters and local variables. Values left over by
  generated code (e.g. a missing `__s.pop()`) fail the test with `Operand stack not balanced`.
- **Evaluation order:** [EvaluationOrderTest.java](../src/test/java/EvaluationOrderTest.java) contains regression tests
  for `combine`, `place` and `compoundAssignment`.

---

## 16. Rules of thumb and pitfalls

**When writing generator code:**

- Never paste the `value` of one `Expr` into a string together with another `Expr`'s value. Use `combine`, `apply` or
  `joined`; they keep Java's evaluation order and handle `__s.pop()` correctly.
- Never put a `STEP` between an `Expr`'s `pre` and the use of its `value`.
- A value of `"__s.pop()"` may be used exactly once. If you need it twice, let `combine` handle it (it uses a register
  if `build` uses a value with `pre` code more than once) or call `toStatement` to throw it away.
- After `javaCall(expr, false)` the value is `""`. `toStatement` then returns just `pre`.
- Mark an `Expr` as `stable` only if its value can't change while other code runs.
- Set `variableRead: true` only if the value just reads a variable and has no side effects. `combine` relies on it
  when it decides whether a value may be evaluated twice or out of order.
- A `build` function or template may use a value several times or in any order; `combine` takes care of it. But the
  value of a non-void term must be a JavaScript expression (`combine` may wrap it in a comma expression). Only `void`
  terms may build statements.
- Put hooks into `pre`. They don't make an `Expr` impure.
- If a variable's location depends on other terms, give the `Expr` a `place`; otherwise assignments can't evaluate the
  parts before the right side.
- You don't need to avoid redundant `STEP`s. `link()` removes empty steps. Do make sure that code following a Java call
  is separated from it by a `STEP` (`javaCall` does that).

**Things to know:**

- **"Pure" isn't "free of side effects".** `isPure` only means that `pre` contains no code to run. `i++` is pure
  (value `__s[__sb + 2]++`). Whether a term may have side effects is what `variableRead` tells.
- **Parentheses keep everything.** `parenthesize` keeps `constant` (so `(3 + 4) * 2` is folded and `case (3 + 4):`
  works), `stable`, `variableRead`, `lefty` and `place`.
- **A colon ends a term unless it belongs to a `?`.** `TermParser.parseTermBinary` counts the `?` operators of the
  term, so the parser can read case labels like `case 3 + 4:` with `parseTerm`.

---

## 17. Reference

### Code.ts

| Export | Description |
|--------|-------------|
| `Op`, `Code` | `Code = Op[]`; an op is a string, `Label`, `StepOp`, `JumpOp`, `RangeOp`, `HookOp`, `RegisterOp` or `CleanupOp` |
| `class Label` | jump target; `stepIndex` is set by `link()` |
| `STEP` | step boundary |
| `jump(to, range?)` | jump to a label: `return <to.stepIndex>;` |
| `at(range)` | range op as one-element `Code`, or `[]` if `range` is undefined |
| `hook(fn)` | `fn(step)` is called by `link()` with the step being built |
| `cleanup(code, range?)` | code that doesn't need a step of its own (e.g. popping an unused return value) |
| `isEmptyCode(code)` | true if `code` contains nothing executable |
| `link(code, program, identifier)` | cuts `code` into steps and stores them in `program.stepsSingle` |
| `codeToString(code, title?)` | human-readable form of `code`, for debugging |

### Expr.ts

| Export | Description |
|--------|-------------|
| `Expr` | compiled term: `pre`, `value`, `type`, `range`, `constant`, `stable`, `variableRead`, `lefty`, `place`, `isFinalField`, `superLevel` |
| `Place` | `{ parts: Expr[], build: Build }`: location of a variable that depends on other terms |
| `Build` | `(...values: string[]) => string` |
| `ConstantValue` | `number \| boolean \| string \| null` |
| `term(value, type?, range?, constant?)` | pure `Expr` |
| `isPure(e)` | `pre` contains nothing executable (hooks, ranges and labels don't count) |
| `isConstant(e)` | `e.constant !== undefined` |
| `isVariableReadOrStable(e)` | `e` is a variable read or stable, so evaluating it has no side effects |
| `template(t)` | `Build` function for a template with `§1`, `§2`, ... |
| `combine(type, range, args, build)` | combines terms, evaluating them left to right and terms with side effects once (see [section 6](#6-left-to-right-how-combine-keeps-javas-evaluation-order)) |
| `apply(type, range, t, ...args)` | `combine` with `template(t)` |
| `joined(type, range, prefix, separator, suffix, ...args)` | `combine` with the values joined |
| `map(e, f, type?, range?)` | same `pre`, value `f(e.value)` |
| `frame(e, t, type?, range?)` | same `pre`, value `t` with `§1` replaced by `e.value` |
| `parenthesize(e)` | value in parentheses; keeps all other fields, `place` gets parentheses, too |
| `toStack(e)` | `Expr` whose value is on the stack (`__s.pop()`) |
| `toStatement(e)` | `Code` that evaluates `e` and throws the value away |
| `statement(e, f, range?)` | `Code`: `pre`, then the statement `f(value)` |
| `javaCall(call, returnsValue)` | call with Java calling convention: call in `pre`, then `STEP`; value `__s.pop()` or `""` |
| `compoundAssignment(type, range, place, right, build)` | `+=` etc. whose right side has `pre` code: reads the old value first |
| `resetRegisterCounter()` | called by `JavaCompiler.compileIfDirty` at the start of each compilation |

### Generator methods that combine `Expr` objects (selection)

| Method | File | Uses |
|--------|------|------|
| `compileStatementOrTerm` | StatementCodeGenerator | `STEP` before every statement, `toStatement` for terms |
| `compileReturnStatement`, `compileThrowStatement`, `compilePrintStatement` | StatementCodeGenerator | `statement` |
| `compileWhileStatement`, `compileForStatement`, `compileDoStatement`, `compileIfStatement`, `compileSwitchCaseStatement`, `compileEnhancedForLoop` | StatementCodeGenerator | `Label`, `jump`, `STEP`, `statement` |
| `compileTryCatchStatement` | StatementCodeGenerator | `hook`, `Label`, `withoutLeadingSteps` |
| `compileMethodCall`, `invokeConstructor` | TermCodeGenerator | `combine`, `apply`, `javaCall` |
| `compileDereferenceAttribute`, `compileSelectArrayElement`, `arrayElement` | TermCodeGenerator | `apply`, `combine`, `place` |
| `compileArrayLiteral`, `compileNewArrayWithDefaultElements`, `castParameterValuesAndPackEllipsis` | TermCodeGenerator | `joined` |
| `compileTernaryOperator` | TermCodeGenerator | `apply`, or `Label`/`jump`/`toStack` |
| `binaryOperation`, `foldConstants` | BinopCastCodeGenerator | `combine`, `term` |
| `compileLogicOperation` | BinopCastCodeGenerator | `binaryOperation`, or `Label`/`jump`/`toStack` |
| `assign`, `compoundAssign`, `updateVariable` | BinopCastCodeGenerator | `combine`, `compoundAssignment`, `place` |
| `compileCast`, `box`, `unbox`, `wrapWithToStringCall` | BinopCastCodeGenerator | `frame`, `apply`, `javaCall` |
| `compileLambdaFunction`, `compileAnonymousInnerClass` | InnerClassCodeGenerator | `hook` |
| `compileMethodDeclaration` | InnerClassCodeGenerator | `link` |
