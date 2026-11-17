# Flow state instead of MissingStatementsManager

## Question

`src/compiler/java/codegenerator/MissingStatementsManager.ts` manages missing variable initializations, variables without read access and missing return statements. Over time its usage has led to many hard-to-read passages inside the code generator. Do you see a better way to achieve the described goals? Please give me your opinion on this.

## Answer

(Analysis from 2026-11-17, based on commit `9d5a97fb`.)

Yes, I think there's a better way. The main problem isn't how the class is written. It's that three different questions are answered by two mechanisms, and the code generator has to know how to combine the results.

### What's wrong with the current design

**1. Two of the three goals are the same problem.** "Is x definitely assigned here?" and "can this point still be reached?" are both facts about a point in the program. Both are combined the same way where control-flow paths meet: a fact holds only if it holds on every path that arrives there. But they are tracked differently:
- **Assignments** use the tree of branch states (`openBranch`, `closeBranch`, `endBranching`).
- **Returns** use a boolean that each statement saves and restores by hand. That's the `returnHappenedBeforeLoop` / `setReturnHappened(...)` code in every loop and in try/catch, plus `labelsTargetedByBreak`/`labelsTargetedByContinue` and the parameters of `endBranchingOfSwitchStatement`.

So every compile method has to know the merge rule for its statement, and it's spread across five places.

**2. The third goal doesn't need control flow at all.** "Was the variable ever read?" is true if any read happens anywhere. A flat `Set` per method body is enough. Running it through the branch stack (with reports in `onCloseBranch`) only adds complexity.

**3. Jumps are not modeled.** `return`/`throw` set a flag, while `break`/`continue` don't change the state at all. That's why the label sets exist.

These aren't just theoretical. A temporary probe test (since deleted) showed that the current implementation gets these wrong:

| Case | Java | Current result |
|---|---|---|
| `int x; if(c){ return; } else { x = 1; } println(x);` | OK | false "not initialized" warning |
| `int x; if(c) x = 1; else throw ...; println(x);` | OK | false warning |
| `int x; while(c){ x = 1; } println(x);` | error | no message |
| `int x; switch(k){ case 1: x=1; break; case 2: x=2; break; } println(x);` (no `default`) | error | no message |
| `int x; try { x = ...; } catch(Exception e){ println(x); }` | error | no message |
| `int x; Object o = new Object(){ { ... } }; println(x);` | error | no message, because `beginMethodBody` of the instance initializer resets the enclosing method's `stack` |

The first two happen because a branch that returns is treated as "x not written". In Java, nothing reaches the point after a `return` or `throw`, so that branch doesn't count against `x` where the paths meet. The others happen because loops, switch fall-through and try don't open branches.

### Proposal: a flow state, like javac's `Flow`

Keep the analysis in the code generator's single pass, but track one value at the current point in the code:

```ts
class FlowState {
    // alive == false: point is unreachable (after return/throw/break/continue/while(true)).
    // A dead state counts every variable as assigned, so it is the neutral element of join.
    constructor(public alive: boolean, public assigned: Set<BaseSymbol>) {}
    static dead() { return new FlowState(false, new Set()); }
    copy() { return new FlowState(this.alive, new Set(this.assigned)); }
    join(o: FlowState): FlowState {
        if (!this.alive) return o.copy();
        if (!o.alive) return this.copy();
        return new FlowState(true, new Set([...this.assigned].filter(s => o.assigned.has(s))));
    }
}

class FlowAnalyzer {                       // one instance per method body / initializer / lambda
    state = new FlowState(true, new Set());
    private jumps = new Map<LabelCodeSnippet, FlowState>();   // states of all break/continue to a label
    private declared: BaseSymbol[] = [];
    private read = new Set<BaseSymbol>();   // flow-insensitive: "unused variable" check

    declare(v, initialized)  { this.declared.push(v); if (initialized) this.state.assigned.add(v); }
    onWrite(v)               { this.state.assigned.add(v); }
    onRead(v, range, errors) { this.read.add(v);
                               if (this.state.alive && this.declared.includes(v) && !this.state.assigned.has(v)) /* warning */; }
    markDead()               { this.state = FlowState.dead(); }
    jumpTo(label)            { this.jumps.set(label, (this.jumps.get(label) ?? FlowState.dead()).join(this.state)); this.markDead(); }
    joinJumpsTo(label)       { this.state = this.state.join(this.jumps.get(label) ?? FlowState.dead()); }
    snapshot()               { return this.state.copy(); }
    restore(s: FlowState)    { this.state = s.copy(); }
    joinWith(s: FlowState)   { this.state = this.state.join(s); }
    end(method, errors)      { /* missing return if alive && non-void; info for declared \ read */ }
}
```

Every statement then follows the same short pattern, written in the terms the JLS uses:

```ts
// return / throw
flow.markDead();
// break / continue (existing breakStack/continueStack labels are the jump targets)
flow.jumpTo(label);

// if
const entry = flow.snapshot();
const thenSnippet = this.compileStatementOrTerm(node.statementIfTrue);
const thenCompletesNormally = flow.state.alive;      // decides scope of negated pattern variables
const afterThen = flow.snapshot();
flow.restore(entry);
const elseSnippet = this.compileStatementOrTerm(node.statementIfFalse);
flow.joinWith(afterThen);

// while / for / enhanced for  (condition already compiled)
const entry = flow.snapshot();
const body = this.compileStatementOrTerm(node.statementToRepeat);
flow.restore(conditionIsConstantTrue ? FlowState.dead() : entry);
flow.joinJumpsTo(breakLabel);

// switch: each group is reached via its label OR by falling through
const entry = flow.snapshot();
for (const caseNode of node.caseNodes) {
    flow.joinWith(entry);
    ... compileCaseStatement(...)
}
if (!hasDefaultNode) flow.joinWith(entry);
flow.joinJumpsTo(breakLabel);

// try/catch
const entry = flow.snapshot();
... compile try
let after = flow.snapshot();
for (const catchCase of node.catchCases) {
    flow.restore(entry);          // exception may occur before any assignment in try
    ... compile catch
    after = after.join(flow.state);
}
flow.restore(after);
... finally (adds its assignments; if it can't complete normally, the state is dead)
```

### What you gain

- **Removed entirely:** `openBranch`/`closeBranch`/`endBranching`/`endBranchingOfSwitchStatement`, `setReturnHappened` with its hand-made save/restore, `labelsTargetedByBreak`/`labelsTargetedByContinue`, and `MissingStatementsBlockState.children`.
- **All the cases above become correct** as a side effect of `dead` being neutral when states are joined. Nobody has to think about them per statement.
- **Unreachable code detection for free:** `if (!flow.state.alive)` before each statement in `compileBlockNode`. This replaces the special case in `compileBreakStatement`.
- **Better names:** `alive` / "can complete normally" instead of `returnHappened`. The existing comments and locals (`loopCanCompleteNormally`, `bodyCanCompleteNormally`) already use this wording because `returnHappened` doesn't fit what it means.
- **The anonymous-class bug goes away:** every method body, initializer and lambda gets its own `FlowAnalyzer` instead of `beginMethodBody` resetting a shared instance.

### Why not a separate analysis pass

A separate pass over the AST would be the textbook answer, and it would leave the code generator completely free of analysis code. But here the code generator is what resolves local symbols and constant conditions (`isConstantWithValue`). It also needs reachability during code generation: for the scope of `instanceof` pattern variables, and to decide whether to emit the implicit `return()`. A separate pass would mean storing all of that on the AST first. I'd only go that way if more analyses are planned later, such as null checks.

### Things to decide

- **New warnings:** Fixing the while, switch and try cases will show "not initialized" warnings in existing student programs that compiled silently before. Java treats these as errors, so keeping them at warning level seems a reasonable middle ground.
- **Tests:** The test harness only checks `error`-level messages. Regression tests for this refactoring would need either a temporary test or an `expectedWarnings` field in the test header.

The change can be implemented step by step, one statement kind at a time, running the test suite after each step.
