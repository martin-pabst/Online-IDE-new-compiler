import chalk from 'chalk';
import { TestContext } from 'vitest';
import { Step } from "../compiler/common/interpreter/Step";
import { Thread } from "../compiler/common/interpreter/Thread";
import { getLine, threeDez } from "../tools/StringTools";
import { DummyAssertionObserver } from '../compiler/java/runtime/unittests/IAssertionObserver';

export class ViteTestAssertions implements DummyAssertionObserver {

    check = '\xB7';

    constructor(private context: TestContext, private lineOffset: number) {

    }

    notifyOnAssertTrue(thread: Thread, step: Step, condition: boolean, message: string): void {
        if (condition !== true) {
            this.logFailedTest(thread, step, message, "Expected: " + chalk.green("true") + ", actual: " + chalk.yellow("false"));
        }
        // expect(condition).to.equal(true, message);
    }

    notifyOnAssertFalse(thread: Thread, step: Step, condition: boolean, message: string): void {
        if (condition !== false) {
            this.logFailedTest(thread, step, message, "Expected: " + chalk.green("false") + ", actual: " + chalk.yellow("true"));
        }
        // expect(condition).to.equal(true, message);
    }

    notifyOnAssertEqualsBoolean(thread: Thread, step: Step, expected: boolean, actual: boolean, message: string): void {
        if (expected !== actual) {
            this.logFailedTest(thread, step, message, "Expected: " + chalk.green(expected) + ", actual: " + chalk.yellow(actual));
        }
        // expect(actual).to.approximately(expected, 1e-20, message);
    }

    notifyOnAssertEqualsNumber(thread: Thread, step: Step, expected: number, actual: number, message: string): void {
        if (Math.abs(expected - actual) > 1e-20) {
            this.logFailedTest(thread, step, message, "Expected: " + chalk.green(expected) + ", actual: " + chalk.yellow(actual));
        }
        // expect(actual).to.approximately(expected, 1e-20, message);
    }

    notifyOnAssertEqualsString(thread: Thread, step: Step, expected: string, actual: string, message: string): void {
        if (expected != actual) {
            this.logFailedTest(thread, step, message, "Expected1 " + chalk.green(expected) + ", actual: " + chalk.yellow(actual));
        }
        // expect(actual).to.equal(expected, message);
        // assert.equal(actual, expected, message);
    }

    notifyOnAssertEqualsObject(thread: Thread, step: Step, expected: string, actual: string, message: string): void {
        this.logFailedTest(thread, step, message, "Expected: " + chalk.green(expected) + ", actual: " + chalk.yellow(actual));
        // expect(actual).to.equal(expected, message);
        // assert.equal(actual, expected, message);
    }

    notifyOnFail(thread: Thread, step: Step, message: string): void {
        this.logFailedTest(thread, step, "Intentional fail", message);
    }


    logFailedTest(thread: Thread, step: Step, message: string, detail: string) {
        console.log(chalk.red("Test failed: ") + message);
        console.log(chalk.gray("Details:     ") + detail);
        if (step && step.range) {
            console.log(chalk.gray("Position:    ") + chalk.white("Line ") +
                chalk.blue(step.range.startLineNumber! + this.lineOffset) + chalk.white(", Column ") +
                chalk.blue(step.range.startColumn))

            let fileText = thread.currentProgramState.program.module.file.getText();
            // console.log(chalk.gray("Context:"));

            for (let i = -4; i <= 2; i++) {
                let line = step.range.startLineNumber! + i;
                if (i == 0) {
                    console.log(chalk.blue(threeDez(line + this.lineOffset) + ": ") + chalk.italic.white(getLine(fileText, line)))
                } else {
                    console.log(chalk.blue(threeDez(line + this.lineOffset) + ": ") + chalk.gray(getLine(fileText, line)))
                }
            }

        }



        //@ts-ignore
        this.context.task.fails = 1;
    }



}