import { IRange } from "../range/Range.ts";
import type { Thread } from "./Thread.ts";

export type StepFunction = (thread: Thread, stack: any[], stackBase: number) => number;
export type CallbackFunction = (() => void) | undefined;

export enum ThreadMethodNames {
    newArray, print, println, return, pushProgram, getExceptionAndTrimStack,
    beginTryBlock, endCatchTryBlock, AE, IOBE, ArrayValue1, ArrayValue2, ArrayValue3, ArrayValueN, 
    Array0, Array1, Array2, ArrayN,
    CheckLastIndex, NPE, CheckCast, Instanceof, ToString, exit,
    registerCodeReached, NullstringIfNull, _primitiveElementOrArrayToString,
    _arrayOfObjectsToString, startREPLProgram, returnFromREPLProgram, leaveAllSynchronizedBlocksInCurrentMethod
}

export enum ObjectClassMethodNames {
    leaveSynchronizedBlock, beforeEnteringSynchronizedBlock
}

export class StepParams {
    static thread = "__t";            // type Thread
    static stack = "__s";             // type any[]
    static stackBase = "__sb";        // type number
}

export class Helpers {
    static classes = StepParams.thread + ".classes";
    static newArray = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.newArray];
    static print = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.print];
    static println = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.println];
    static return = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.return];
    static threadStack = StepParams.thread + ".s";
    static pushProgram = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.pushProgram];
    static getExceptionAndTrimStack = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.getExceptionAndTrimStack];
    static beginTryBlock = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.beginTryBlock];
    static endTryBlock = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.endCatchTryBlock];
    static throwArithmeticException = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.AE];

    static IOBE = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.IOBE];
    static arrayValue1 = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.ArrayValue1];
    static arrayValue2 = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.ArrayValue2];
    static arrayValue3 = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.ArrayValue3];
    static arrayValueN = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.ArrayValueN];

    static array0 = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.Array0];
    static array1 = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.Array1];
    static array2 = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.Array2];
    static arrayN = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.ArrayN];
    static checkLastIndex = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.CheckLastIndex];

    static throwNPE = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.NPE];
    static checkCast = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.CheckCast];
    static instanceof = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.Instanceof];
    static toString = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.ToString];
    static exit = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.exit];
    static assertionObservers = StepParams.thread + ".assertionObservers";
    static registerCodeReached = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.registerCodeReached];
    static nullstringIfNull = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.NullstringIfNull];
    static primitiveArrayToString = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames._primitiveElementOrArrayToString];
    static objectArrayToString = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames._arrayOfObjectsToString];
    static startReplProgram = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.startREPLProgram];
    static returnFromReplProgram = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.returnFromREPLProgram];
    static leaveAllSynchronizedBlocksInCurrentMethod = StepParams.thread + "." + ThreadMethodNames[ThreadMethodNames.leaveAllSynchronizedBlocksInCurrentMethod];

    static callbackParameter = "callback";

    static elementRelativeToStackbase(index: number) {
        return StepParams.stack + "[" + StepParams.stackBase + (index != 0 ? " + " + index : "") + "]";
    }

    static checkNPE(object: string, range: IRange){
        return `(${object} || ${Helpers.throwNPE}(${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn}))`;
    }

    static outerClassAttributeIdentifier = "__outerClass";
}

/**
 * int a = v[b + 3][x];
 * compiles to:
 * s[sb + 2] = h.arr(s[sb + 7], 1370, s[sb + 12] + 3, s[sb + 13])
 * (v lies on pos 7, b on pos 12, x on pos 13)
 */

// Thread function returns new stepIndex

export type Klass = { new(...args: any[]): any, [index: string]: any };
export type KlassObjectRegistry = Record<string, Klass>;
