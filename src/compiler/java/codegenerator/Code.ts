import { Program } from "../../common/interpreter/Program";
import { Step } from "../../common/interpreter/Step";
import { IRange } from "../../common/range/Range";

/**
 * Generated code is a flat list of operations (Op). The linker (see link below) cuts it into steps:
 * each step becomes a javascript function which returns the index of the next step. That's what makes
 * single stepping, breakpoints, speed control and simulated threads possible.
 */

/**
 * Jump target. After linking, stepIndex is the index of the step the label is in.
 */
export class Label {
    stepIndex: number = -1;
}

/** Step boundary: the current step returns the index of the next step. */
export type StepOp = { readonly k: "step" };

/** Jump to label: "return <stepIndex of label>;" */
export type JumpOp = { readonly k: "jump", readonly to: Label, readonly range?: IRange };

/** Source position of the code around it (range of the step for the debugger). */
export type RangeOp = { readonly k: "range", readonly range: IRange };

/**
 * Called by link() during its second pass with the Step currently being built at this position.
 * Labels already have their step indices then, but the Step has not yet been finished or run; this is
 * used to attach compile-time metadata such as catch-block information.
 */
export type HookOp = { readonly k: "hook", readonly fn: (step: Step) => void };

/** Declares a javascript variable which is local to the step containing this position. */
export type RegisterOp = { readonly k: "register", readonly name: string };

/**
 * Code which doesn't need a step of its own, e.g. discarding the return value of a method call: a step boundary
 * directly following it is dropped, so it runs at the beginning of the next step - unless a label follows, which
 * would then be the target of jumps. range is used if the step has no range otherwise.
 */
export type CleanupOp = { readonly k: "cleanup", readonly code: string, readonly range?: IRange };

export type Op = string | Label | StepOp | JumpOp | RangeOp | HookOp | RegisterOp | CleanupOp;

export type Code = Op[];

export const STEP: StepOp = { k: "step" };

export function jump(to: Label, range?: IRange): JumpOp {
    return { k: "jump", to, range };
}

/** Source position of the following code; empty if range is undefined. */
export function at(range: IRange | undefined): Code {
    return range ? [{ k: "range", range }] : [];
}

export function hook(fn: (step: Step) => void): HookOp {
    return { k: "hook", fn };
}

export function cleanup(code: string, range?: IRange): CleanupOp {
    return { k: "cleanup", code, range };
}

/** Does code contain anything to execute (besides labels, ranges, hooks and step boundaries)? */
export function isEmptyCode(code: Code): boolean {
    return code.every(op => typeof op == "string" ? op.trim() == "" : (op instanceof Label || op.k == "step" || op.k == "range" || op.k == "hook"));
}

/**
 * Cuts code into steps and stores them in program.stepsSingle.
 */
export function link(code: Code, program: Program, identifier: string): void {

    // logCode(code, identifier);

    // pass 1: drop step boundaries which would end an empty step (e.g. one which only holds labels) or a step which
    // only holds cleanup code; number the labels
    const ops: Code = [];
    let stepIndex = 0;
    let stepHasCode = false;
    let stepHasCleanupCode = false;

    const nextStep = () => {
        ops.push(STEP);
        stepIndex++;
        stepHasCode = stepHasCleanupCode = false;
    }

    for (const op of code) {
        if (op === STEP) {
            if (stepHasCode) nextStep();
            continue;
        }

        if (op instanceof Label) {
            // jumps go to the beginning of a step, so a label has to start a new step
            if (stepHasCode || stepHasCleanupCode) nextStep();
            op.stepIndex = stepIndex;
        } else if (typeof op == "string" ? op.length > 0 : op.k == "jump") {
            stepHasCode = true;
        } else if (typeof op == "object" && op.k == "cleanup") {
            stepHasCleanupCode = true;
        }
        ops.push(op);
    }

    // pass 2: build steps
    const steps: Step[] = [];
    let step = new Step(0, program.module);
    let registers: string[] = [];
    let cleanupRange: IRange | undefined;
    let endsWithJump = false;

    const finishStep = () => {
        if (registers.length > 0) step.codeAsString = `let ${registers.join(", ")};\n` + step.codeAsString;
        step.setRangeStartIfUndefined(cleanupRange);
        registers = [];
        cleanupRange = undefined;
        steps.push(step);
    }

    for (const op of ops) {
        if (op === STEP) {
            if (!endsWithJump) step.codeAsString += `return ${step.index + 1};`;
            finishStep();
            step = new Step(step.index + 1, program.module);
            endsWithJump = false;
        } else if (typeof op == "string") {
            step.codeAsString += op;
            if (op.length > 0) endsWithJump = false;
        } else if (op instanceof Label) {
            // labels only mark a position
        } else {
            switch (op.k) {
                case "jump":
                    step.codeAsString += `return ${op.to.stepIndex};\n`;
                    step.setRangeStartIfUndefined(op.range);
                    endsWithJump = true;
                    break;
                case "range":
                    step.setRangeStartIfUndefined(op.range);
                    step.adaptRangeEnd(op.range);
                    break;
                case "hook":
                    op.fn(step);
                    break;
                case "register":
                    if (!registers.includes(op.name)) registers.push(op.name);
                    break;
                case "cleanup":
                    step.codeAsString += op.code;
                    cleanupRange ??= op.range;
                    endsWithJump = false;
                    break;
            }
        }
    }

    if (!step.isEmpty()) finishStep();

    program.stepsSingle = steps;
}

/**
 * Logs code to the console in human readable form (for debugging the code generator): javascript code is printed
 * as it is, every other op on a line of its own. Labels are named L0, L1, ... in order of appearance (as label or
 * as jump target); after linking, their step index is appended.
 */
function logCode(code: Code, title: string = "Code"): void {
    console.log(codeToString(code, title));
}


/**
 * Transforms code to a human readable string (for debugging the code generator): javascript code is printed
 * as it is, every other op on a line of its own. Labels are named L0, L1, ... in order of appearance (as label or
 * as jump target); after linking, their step index is appended.
 */
export function codeToString(code: Code, title: string = "Code"): string {
    const labelNames = new Map<Label, string>();
    const labelName = (label: Label) => {
        if (!labelNames.has(label)) labelNames.set(label, "L" + labelNames.size);
        return labelNames.get(label) + (label.stepIndex >= 0 ? ` (step ${label.stepIndex})` : "");
    }
    const rangeToString = (range: IRange) => `${range.startLineNumber}:${range.startColumn}-${range.endLineNumber}:${range.endColumn}`;
    const withRange = (range: IRange | undefined) => range ? ", " + rangeToString(range) : "";

    let text = "";
    const line = (s: string) => {
        if (text.length > 0 && !text.endsWith("\n")) text += "\n";
        text += s + "\n";
    }

    for (const op of code) {
        if (typeof op == "string") {
            text += op;
        } else if (op instanceof Label) {
            line(`${labelName(op)}:`);
        } else {
            switch (op.k) {
                case "step": line("-------------------- STEP --------------------"); break;
                case "jump": line(`[jump to ${labelName(op.to)}${withRange(op.range)}]`); break;
                case "range": line(`[range ${rangeToString(op.range)}]`); break;
                case "hook": line(`[hook${op.fn.name ? " " + op.fn.name : ""}]`); break;
                case "register": line(`[register ${op.name}]`); break;
                case "cleanup": line(`[cleanup${withRange(op.range)}] ${op.code.trim()}`); break;
            }
        }
    }

    return `==================== ${title} (${code.length} ops) ====================\n${text}`;
}


