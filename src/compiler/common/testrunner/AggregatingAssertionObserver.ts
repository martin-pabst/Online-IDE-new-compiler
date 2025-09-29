import exp from "constants";
import { IAssertionObserver } from "../../java/runtime/unittests/IAssertionObserver";
import { Step } from "../interpreter/Step";
import { Thread } from "../interpreter/Thread";
import { JUnitTestrunnerLanguage } from "./JUnitTestrunnerLanguage";
import { DOM } from "../../../tools/DOM";
import { IRange } from "../range/Range";
import { IMain } from "../IMain";

export type AssertionResultState = "passed" | "failed" | "error";

export type AssertionResult = {
    state: AssertionResultState,
    messageHtmlElement?: HTMLElement        // if state != "passed"
}

export class AggregatingAssertionObserver implements IAssertionObserver {

    constructor(private main: IMain) {

    }

    public assertionResults: AssertionResult[] = [];

    notifyOnAssertTrue(thread: Thread, step: Step, condition: boolean, message: string): void {
        if (condition !== true) {
            this.addFailedResult(thread, step, "notifyOnAssertTrue", "true", "false", message);
        }
    }

    notifyOnAssertFalse(thread: Thread, step: Step, condition: boolean, message: string): void {
        if (condition !== false) {
            this.addFailedResult(thread, step, "notifyOnAssertFalse", "false", "true", message);
        }
    }

    notifyOnAssertEqualsBoolean(thread: Thread, step: Step, expected: boolean, actual: boolean, message: string): void {
        if (actual !== expected) {
            this.addFailedResult(thread, step, "notifyOnAssertEquals", "" + expected, "" + actual, message);
        }
    }

    notifyOnAssertEqualsNumber(thread: Thread, step: Step, expected: number, actual: number, message: string): void {
        if (Math.abs(actual - expected) > 1e-14) {
            this.addFailedResult(thread, step, "notifyOnAssertEquals", "" + expected, "" + actual, message);
        }
    }

    notifyOnAssertEqualsString(thread: Thread, step: Step, expected: string, actual: string, message: string): void {
        if (expected !== actual) {
            this.addFailedResult(thread, step, "notifyOnAssertEquals", expected == null ? "null" : expected, actual == null ? "null" : actual, message);
        }
    }

    notifyOnAssertEqualsObject(thread: Thread, step: Step, expected: string, actual: string, message: string): void {
        if (expected !== actual) {
            this.addFailedResult(thread, step, "notifyOnAssertEquals", expected, actual, message);
        }
    }

    notifyOnFail(thread: Thread, step: Step, message: string): void {
        this.addFailedResult(thread, step, "notifyOnFail", "---", "---", message);
    }

    addFailedResult(thread: Thread, step: Step, notifyMethodIdentifier: string, expected: string, actual: string, message: string) {

        let positionHtml = "";
        let range = step.getValidRangeOrUndefined();
        if (range) {
            positionHtml = ` <span class="jo_junitLink">(${JUnitTestrunnerLanguage.line(range.startLineNumber, range.startColumn)})</span>`;
        }

        let messageHtml =
            `<div class="jo_junitFailBlock">` +
            `<div><span class="jo_junitError">${notifyMethodIdentifier} ${JUnitTestrunnerLanguage.failed()}${positionHtml}: </span> </div>\n` +
            `<div>Details: ${message}</div>` +
            `<div>${JUnitTestrunnerLanguage.expectedValue()}<span class="jo_junitExpected">${expected}</span></div>\n` +
            `<div>${JUnitTestrunnerLanguage.actualValue()}<span class="jo_junitActual">${actual}</span></div>\n` +
            `</div>`;

        let messageHtmlElement = DOM.makeDiv(undefined);
        messageHtmlElement.innerHTML = messageHtml;

        if (range) {
            let linkSpan = <HTMLSpanElement>messageHtmlElement.getElementsByClassName("jo_junitLink")[0];
            linkSpan.addEventListener("click", () => {
                this.main.showProgramPosition(step.module.file, range);
            })
        }

        this.assertionResults.push({
            state: "failed",
            messageHtmlElement: messageHtmlElement
        })

        // TODO: stacktrace!
    }
}