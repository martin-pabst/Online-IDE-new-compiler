import { StepParams } from "../../common/interpreter/StepFunction";
import { IRange } from "../../common/range/Range";
import { JavaType } from "../types/JavaType";
import { at, cleanup, Code, Label, Op, STEP } from "./Code";

export type ConstantValue = number | boolean | string | null;

/**
 * Compiled term.
 *
 * Evaluating it means: run pre, then evaluate value. pre may contain step boundaries, e.g. after calling a method
 * with java calling convention, which pushes its return value onto the stack (value is then "__s.pop()").
 * value is always evaluated in the same step in which pre ends.
 */
export interface Expr {
    pre: Code;
    /** javascript expression, "" if term has no value (e.g. call of void method) */
    value: string;
    type?: JavaType;
    range?: IRange;
    /** value of compile time constant */
    constant?: ConstantValue;
    /** value doesn't change while other code runs (e.g. this, class objects), so it never has to be evaluated early */
    stable?: boolean;
    /** may be on the left side of an assignment */
    lefty?: boolean;
    /**
     * Location of variable which depends on other terms (obj.field, array[index]): these terms and how to build
     * the location from their values. Assignments evaluate these terms before the right side.
     */
    place?: Place;
    isFinalField?: boolean;
    /** super: 1, super.super: 2, ... */
    superLevel?: number;
}

export interface Place {
    parts: Expr[];
    build: Build;
}

export type Build = (...values: string[]) => string;

const S = StepParams.stack;

export function term(value: string, type?: JavaType, range?: IRange, constant?: ConstantValue): Expr {
    return { pre: [], value, type, range, constant };
}

function isExecutable(op: Op): boolean {
    return typeof op == "string" ? op.length > 0 : !(op instanceof Label) && (op.k == "step" || op.k == "jump" || op.k == "cleanup");
}

/** Has expression no code which has to run before its value is evaluated? (Hooks don't count.) */
export function isPure(e: Expr): boolean {
    return !e.pre.some(isExecutable);
}

export function isConstant(e: Expr | undefined): boolean {
    return e?.constant !== undefined;
}

function isStable(e: Expr): boolean {
    return e.stable || e.constant !== undefined;
}

let registerCounter: number = 0;

export function resetRegisterCounter() {
    registerCounter = 0;
}

/** Declares a new javascript variable which is local to the current step */
function newRegister(pre: Code): string {
    const name = "__r" + (registerCounter++);
    pre.push({ k: "register", name });
    return name;
}

/** build function for templates like "Math.max(§1, §2)" */
export function template(t: string): Build {
    return (...values: string[]) => t.replace(/§(\d+)/g, (_, n) => values[Number.parseInt(n) - 1]);
}

function usesPerArgument(build: Build, n: number): number[] {
    const markers = Array.from({ length: n }, (_, i) => `\u0001${i}\u0002`);
    const s = build(...markers);
    return markers.map(m => s.split(m).length - 1);
}

/**
 * Combines terms into a new term whose value is build(values of terms).
 *
 * Terms are evaluated left to right, as in java: if a later term has code to run (e.g. method call), every earlier
 * term which isn't stable is evaluated before and its value is pushed onto the stack. These values are popped into
 * step-local variables right before the new value is computed. Therefore at most one __s.pop() remains in the
 * new value and no term is read after code which could change it.
 */
export function combine(type: JavaType | undefined, range: IRange | undefined, args: Expr[], build: Build): Expr {
    let last = -1;
    for (let i = args.length - 1; i >= 0; i--) {
        if (!isPure(args[i])) {
            last = i;
            break;
        }
    }

    const pre: Code = [];
    const values = args.map(a => a.value);

    if (last < 0) {
        args.forEach(a => pre.push(...a.pre));      // hooks
        return { pre, value: build(...values), type, range };
    }

    const uses = usesPerArgument(build, args.length);
    const spilled: number[] = [];

    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        pre.push(...a.pre);
        if (i < last && !isStable(a)) {
            if (a.value != `${S}.pop()`) pre.push(`${S}.push(${a.value});\n`);
            spilled.push(i);
        }
    }

    if (uses[last] == 0) {
        // value isn't needed, but it may pop a value from the stack
        if (values[last] != "") pre.push(values[last] + ";\n");
    } else if (spilled.length > 0 || uses[last] > 1) {
        const register = newRegister(pre);
        pre.push(`${register} = ${values[last]};\n`);
        values[last] = register;
    }

    for (let j = spilled.length - 1; j >= 0; j--) {
        const register = newRegister(pre);
        pre.push(`${register} = ${S}.pop();\n`);
        values[spilled[j]] = register;
    }

    return { pre, value: build(...values), type, range };
}

/**
 * Compound assignment (+=, -=, ...) whose right side has code to run: as in java, the parts of the location
 * (object, array, index) are evaluated and the variable is read before this code runs.
 * build gets the location, the old value of the variable and the value of the right side.
 */
export function compoundAssignment(type: JavaType | undefined, range: IRange | undefined, place: Place, right: Expr,
    build: (location: string, oldValue: string, value: string) => string): Expr {
    const pre: Code = [];
    const values: string[] = [];
    const spilled: number[] = [];

    for (const part of place.parts) {
        pre.push(...part.pre);
        if (!isStable(part)) {
            if (part.value != `${S}.pop()`) pre.push(`${S}.push(${part.value});\n`);
            spilled.push(values.length);
        }
        values.push(part.value);
    }

    // read variable while values of spilled parts are on top of the stack
    const valuesOnStack = values.map((v, i) => spilled.includes(i) ? `${S}[${S}.length - ${spilled.length - spilled.indexOf(i)}]` : v);
    pre.push(`${S}.push(${place.build(...valuesOnStack)});\n`, ...right.pre);

    const valueRegister = newRegister(pre);
    pre.push(`${valueRegister} = ${right.value};\n`);
    const oldValueRegister = newRegister(pre);
    pre.push(`${oldValueRegister} = ${S}.pop();\n`);
    for (let j = spilled.length - 1; j >= 0; j--) {
        const register = newRegister(pre);
        pre.push(`${register} = ${S}.pop();\n`);
        values[spilled[j]] = register;
    }

    return { pre, value: build(place.build(...values), oldValueRegister, valueRegister), type, range };
}

/** combine with template like "Math.max(§1, §2)" */
export function apply(type: JavaType | undefined, range: IRange | undefined, t: string, ...args: Expr[]): Expr {
    return combine(type, range, args, template(t));
}

/** combine with values joined, e.g. array literal "[" + v1 + ", " + v2 + "]" */
export function joined(type: JavaType | undefined, range: IRange | undefined, prefix: string, separator: string, suffix: string, ...args: Expr[]): Expr {
    return combine(type, range, args, (...values) => prefix + values.join(separator) + suffix);
}

/** New term with value f(e.value) */
export function map(e: Expr, f: (value: string) => string, type?: JavaType, range?: IRange): Expr {
    return { pre: e.pre, value: f(e.value), type: type ?? e.type, range: range ?? e.range };
}

/** New term with value t, where §1 is replaced by e.value */
export function frame(e: Expr, t: string, type?: JavaType, range?: IRange): Expr {
    return map(e, v => t.replace(/§1/g, () => v), type, range);
}

/** (e): is assignable if e is */
export function parenthesize(e: Expr): Expr {
    const place = e.place ? { parts: e.place.parts, build: (...v: string[]) => "(" + e.place!.build(...v) + ")" } : undefined;
    return { ...e, value: "(" + e.value + ")", constant: undefined, place };
}

/** Term whose value is on the stack */
export function toStack(e: Expr): Expr {
    if (e.value == "" || e.value == `${S}.pop()`) return e;
    return { pre: [...e.pre, `${S}.push(${e.value});\n`, ...at(e.range)], value: `${S}.pop()`, type: e.type, range: e.range };
}

/** Code which evaluates e and discards its value */
export function toStatement(e: Expr): Code {
    if (e.value == "") return e.pre;
    // value of method call with java calling convention: it doesn't need a step of its own to be discarded
    if (e.value == `${S}.pop()`) return [...e.pre, cleanup(`${S}.pop();\n`, e.range)];
    return [...e.pre, e.value + ";\n", ...at(e.range)];
}

/** Code which evaluates e and then executes statement f(value of e) */
export function statement(e: Expr, f: (value: string) => string, range?: IRange): Code {
    return [...e.pre, f(e.value), ...at(range ?? e.range)];
}

/**
 * Call of method with java calling convention: the method is executed in following steps, its return value
 * (if any) is pushed onto the stack.
 */
export function javaCall(call: Expr, returnsValue: boolean): Expr {
    return {
        pre: [...call.pre, call.value + ";\n", ...at(call.range), STEP],
        value: returnsValue ? `${S}.pop()` : "",
        type: call.type,
        range: call.range
    };
}
