import { BaseSymbol } from "../../common/BaseSymbolTable";
import { Error } from "../../common/Error";
import { IRange } from "../../common/range/Range";
import { JCM } from "../language/JavaCompilerMessages";
import { JavaMethod } from "../types/JavaMethod";
import { JavaParameter } from "../types/JavaParameter";
import { Label } from "./Code";

/**
 * What is known at one point in the code, see
 * https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.22 (unreachable statements) and
 * https://docs.oracle.com/javase/specs/jls/se21/html/jls-16.html (definite assignment):
 * - alive: can this point be reached? (= can the preceding statement complete normally?)
 * - assigned: local variables and parameters which have definitely been assigned a value at this point
 *
 * An unreachable point counts every variable as assigned (JLS: "V is definitely assigned after any
 * statement that cannot complete normally"), so a dead state is the neutral element of join.
 */
export class FlowState {

    constructor(public readonly alive: boolean, public readonly assigned: Set<BaseSymbol>) { }

    static dead(): FlowState {
        return new FlowState(false, new Set());
    }

    copy(): FlowState {
        return new FlowState(this.alive, new Set(this.assigned));
    }

    /**
     * State at a point where control flow paths meet: it can be reached if one of the paths can be
     * reached, and a variable is assigned if it is assigned on every path that reaches it.
     */
    join(other: FlowState): FlowState {
        if (!this.alive) return other.copy();
        if (!other.alive) return this.copy();
        return new FlowState(true, new Set([...this.assigned].filter(symbol => other.assigned.has(symbol))));
    }

}

/**
 * Tracks the flow state while the code generator compiles a method body, an initializer block or a lambda
 * body in a single pass. Every one of them gets its own instance. Reports
 * - read accesses to local variables which may not have been assigned a value before (warning),
 * - a missing return statement at the end of a non-void method (error),
 * - local variables and parameters which are never read (info).
 *
 * Each statement updates the state at the current point in the code: return and throw make it dead,
 * break and continue hand it over to their jump target, branches are compiled starting with a snapshot
 * of the state before them and joined afterwards.
 */
export class FlowAnalyzer {

    state: FlowState = new FlowState(true, new Set());

    /**
     * Joined states of all break and continue statements which jump to a label. They are joined into
     * the current state when compilation reaches the label's position (see joinJumpsTo).
     * continue statements in while loops and enhanced for loops jump back to the beginning of the loop,
     * which has already been compiled. Their states are never joined: a jump back can't make a variable
     * unassigned or the code after the loop reachable.
     */
    private jumpStates: Map<Label, FlowState> = new Map();

    /**
     * Local variables and parameters whose initialization and read accesses are tracked
     * (in order of declaration).
     */
    private declared: Set<BaseSymbol> = new Set();

    /**
     * "Is the variable read anywhere?" doesn't depend on control flow.
     */
    private read: Set<BaseSymbol> = new Set();

    constructor(parameters: JavaParameter[] = []) {
        for (let parameter of parameters) {
            if (parameter.trackMissingReadAccess) this.declare(parameter, true);
        }
    }

    declare(variable: BaseSymbol, initialized: boolean) {
        this.declared.add(variable);
        if (initialized) {
            this.state.assigned.add(variable);
        } else {
            this.state.assigned.delete(variable);
        }
    }

    onWrite(variable: BaseSymbol) {
        this.state.assigned.add(variable);
    }

    onRead(variable: BaseSymbol, range: IRange, errors: Error[]) {
        this.read.add(variable);
        if (this.state.alive && this.declared.has(variable) && !this.state.assigned.has(variable)) {
            let error = JCM.variableNotInitialized(variable.identifier);
            errors.push({ message: error.message, id: error.id, level: "warning", range: range });
        }
    }

    /**
     * return and throw: the following code is unreachable.
     */
    markDead() {
        this.state = FlowState.dead();
    }

    /**
     * break and continue: the current state flows to the jump target instead of the following statement.
     */
    jumpTo(label: Label) {
        this.jumpStates.set(label, (this.jumpStates.get(label) ?? FlowState.dead()).join(this.state));
        this.markDead();
    }

    /**
     * Call when compilation reaches the position of a jump target: it is reached from the preceding code
     * and from every break/continue statement which jumps to it.
     */
    joinJumpsTo(label: Label) {
        let jumpState = this.jumpStates.get(label);
        if (jumpState) {
            this.state = this.state.join(jumpState);
            this.jumpStates.delete(label);
        }
    }

    snapshot(): FlowState {
        return this.state.copy();
    }

    restore(state: FlowState) {
        this.state = state.copy();
    }

    joinWith(state: FlowState) {
        this.state = this.state.join(state);
    }

    /**
     * Call after compiling the finally block of a try statement. The finally block has to be compiled
     * starting with the state before the try statement, because it may be entered after an exception
     * anywhere in the try block.
     * The try statement completes normally if the finally block and the try block (or one of the
     * catch blocks) complete normally. Afterwards a variable is assigned if it is assigned at the end
     * of the try block and all catch blocks or if it is assigned in the finally block.
     * @param afterTryAndCatchBlocks joined states at the end of the try block and of all catch blocks
     */
    afterFinallyBlock(afterTryAndCatchBlocks: FlowState) {
        if (!this.state.alive || !afterTryAndCatchBlocks.alive) {
            this.markDead();
            return;
        }
        afterTryAndCatchBlocks.assigned.forEach(variable => this.state.assigned.add(variable));
    }

    /**
     * Call after compiling the whole method body/initializer block/lambda body.
     * @param method undefined in case of initializer blocks
     */
    end(method: JavaMethod | undefined, errors: Error[]) {
        if (this.state.alive && method && !method.isConstructor &&
            method.returnParameterType && method.returnParameterType.identifier != "void") {
            let error = JCM.returnStatementMissing(method.identifier, method.returnParameterType.identifier);
            errors.push({ message: error.message, id: error.id, level: "error", range: method.identifierRange });
        }

        for (let variable of this.declared) {
            if (!this.read.has(variable)) {
                let error = JCM.noReadAccessForVariable(variable.identifier);
                errors.push({ message: error.message, id: error.id, level: "info", range: variable.identifierRange });
            }
        }
    }

}
