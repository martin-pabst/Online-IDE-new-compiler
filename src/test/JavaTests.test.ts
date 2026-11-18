import chalk from "chalk";
import fs from "fs";
import { test } from "vitest";
import { Interpreter } from "../compiler/common/interpreter/Interpreter";
import { JavaCompiler } from "../compiler/java/JavaCompiler";
import { getLine, getLineNumber, threeDez } from "../tools/StringTools";
import { ViteTestAssertions } from "./ViteTestAssertions";
import { JavaLibraryManager } from "../compiler/java/runtime/JavaLibraryManager";
import { CompilerFile } from "../compiler/common/module/CompilerFile";
import { StoreOutputPrintManager } from "./StoreOutputPrintManager";
import type { Error as CompilerError } from "../compiler/common/Error";

try {
    let javaDir: string = __dirname + "/java";

    let files = fs.readdirSync(javaDir);
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file && file.endsWith(".java")) {
            let data = fs.readFileSync(javaDir + '/' + file, 'utf8');
            test1(data, file);
        }
    }
} catch (ex) {
    console.error(ex);
}


/**
 * Expected compiler message (error or warning). line is relative to the /**:: line of the test (= line 1).
 */
type ExpectedMessage = { id: string, line?: number, found?: boolean }

type TestInfo = {
    expectedOutput?: string,
    expectedCompilationError?: ExpectedMessage,
    expectedCompilationErrors?: ExpectedMessage[],
    /**
     * If present (even as empty array), the test checks warnings too: every warning must be listed here
     * and every listed warning must occur. If absent, warnings are ignored.
     */
    expectedWarnings?: ExpectedMessage[],
    libraries?: string[]
}

/**
 * Marks the first expected message matching id and (if given) line as found.
 * @returns true if message was expected
 */
function markIfExpected(message: CompilerError, expectedMessages: ExpectedMessage[]): boolean {
    let expectedMessage = expectedMessages.find(expected => expected.id == message.id && (!expected.line || expected.line == message.range.startLineNumber));
    if (expectedMessage) expectedMessage.found = true;
    return !!expectedMessage;
}

function test1(sourcecode: string, file: string) {
    /**::
     * Test switch case with constant
     * {expectedOutput: "Here!", expectedError: { id: "id13", line: 10 }}
     */

    sourcecode = sourcecode.replace(/\r\n/g, "\n");
    let testBegin = sourcecode.indexOf("/**::");
    while (testBegin >= 0) {
        let lineOffset = getLineNumber(sourcecode, testBegin);
        let titleBegin = sourcecode.indexOf(" * ", testBegin) + 3;
        let titleEnd = sourcecode.indexOf("\n", titleBegin);

        let title = "File " + file + ": " + sourcecode.substring(titleBegin, titleEnd);

        let testEnd = sourcecode.indexOf("/**::", testBegin + 1);
        if (testEnd <= testBegin + 1) testEnd = sourcecode.length;

        let code = sourcecode.substring(testBegin, testEnd);

        let headerEnd = sourcecode.indexOf("*/", testBegin);

        let expectedOutput: string | undefined;
        let expectedErrors: ExpectedMessage[] = [];
        let expectedWarnings: ExpectedMessage[] | undefined;
        let libraries: string[] = [];

        let leftCurlyBraceIndex = sourcecode.indexOf("{", testBegin);
        if (leftCurlyBraceIndex >= 0 && leftCurlyBraceIndex < headerEnd) {
            let infoText = sourcecode.substring(leftCurlyBraceIndex, headerEnd);
            // infoText = infoText.replace(/\s*\s/g, "");

            let testInfo: TestInfo = JSON.parse(infoText);
            if (testInfo) {
                expectedOutput = testInfo.expectedOutput;
                if (testInfo.expectedCompilationError) expectedErrors.push(testInfo.expectedCompilationError);
                if (testInfo.expectedCompilationErrors) expectedErrors = expectedErrors.concat(testInfo.expectedCompilationErrors);
                if (testInfo.expectedWarnings) expectedWarnings = testInfo.expectedWarnings;
                if (testInfo.libraries) libraries = testInfo.libraries;
            }
        }

        compileAndTest(title, code, lineOffset, expectedOutput, expectedErrors, expectedWarnings, libraries);

        testBegin = sourcecode.indexOf("/**::", testBegin + 1);
    }



}

function compileAndTest(name: string, program: string, lineOffset: number,
    expectedOutput: string | undefined, expectedCompiliationErrors: ExpectedMessage[],
    expectedWarnings: ExpectedMessage[] | undefined, libraries: string[]) {

    test(name, async (context) => {
        let file = new CompilerFile();

        file.setText(program);

        let compiler = new JavaCompiler();

        let libManager = new JavaLibraryManager();
        libManager.addLibraries(...libraries);
        libManager.addLibrariesToCompiler(compiler);

        compiler.setFiles([<any>file]);
        let executable = await compiler.compileIfDirty();
        if (!executable) {
            return;
        }


        if (expectedWarnings) {
            let allWarnings = executable.getAllErrors().filter(error => error.level == "warning");
            let allNotExpectedWarnings = allWarnings.filter(warning => !markIfExpected(warning, expectedWarnings));

            if (allNotExpectedWarnings.length > 0) {
                console.log(chalk.red("Unexpected warnings ") + "in " + name);
                for (let warning of allNotExpectedWarnings) {
                    console.log(chalk.white("Line ") +
                        chalk.blue(warning.range.startLineNumber + lineOffset) +
                        chalk.gray("(relative: " + warning.range.startLineNumber + ")")
                        + chalk.white(", Column ") +
                        chalk.blue(warning.range.startColumn) + chalk.white(", id ") + chalk.blue(warning.id) +
                        chalk.white(": " + warning.message));
                    printCode(program, warning.range.startLineNumber, lineOffset);
                }
                //@ts-ignore
                context.task.fails = 1;
            }
        }

        let allErrors = executable.getAllErrors().filter(error => error.level == "error");

        let allNotExpectedErrors = allErrors.filter(error => !markIfExpected(error, expectedCompiliationErrors));

        if (allNotExpectedErrors.length > 0) {
            console.log(chalk.red("Compilation errors ") + "in " + name);
            for (let error of allNotExpectedErrors) {

                let expectedError = expectedCompiliationErrors.find(expectedError => expectedError.id == error.id && (!expectedError.line || expectedError.line == error.range.startLineNumber + lineOffset));
                if (expectedError) {
                    expectedError.found = true;
                } else {
                    console.log(chalk.white("Line ") +
                        chalk.blue(error.range.startLineNumber + lineOffset) +
                        chalk.gray("(relative: " + error.range.startLineNumber + ")")
                        + chalk.white(", Column ") +
                        chalk.blue(error.range.startColumn) + chalk.white(": " + error.message));
                    printCode(program, error.range.startLineNumber, lineOffset);
                }

            }

            //@ts-ignore
            context.task.fails = 1;

        } else if (allErrors.length == 0) {

            let printManager = new StoreOutputPrintManager();

            let interpreter = new Interpreter(printManager);
            interpreter.setExecutable(executable);

            if (!executable.isCompiledToJavascript) {
                //@ts-ignore
                context.task.fails = 1;
                return;
            }

            interpreter.attachAssertionObserver(new ViteTestAssertions(context, lineOffset));

            interpreter.runMainProgramSynchronously();

            if (interpreter.exception) {
                console.log(chalk.red("Test failed: ") + "Program terminated with uncaught exception: " +
                    chalk.yellow(interpreter.exception.message ?? "") + chalk.gray(" (test beginning with line " + lineOffset + ")"));
                //@ts-ignore
                context.task.fails = 1;
            }

            let codeNotReachedAssertions = interpreter.codeReachedAssertions.getUnreachedAssertions();
            if (codeNotReachedAssertions.length > 0) {
                console.log(chalk.red("Test failed: ") + "CodeReached-assertions not reached");

                for (let cnr of codeNotReachedAssertions) {
                    console.log(chalk.gray("Details:     ") + cnr.messageIfNotReached);
                    console.log(chalk.gray("Position:    ") + chalk.white("Line ") +
                        chalk.blue(cnr.range.startLineNumber + lineOffset) + chalk.white(", Column ") +
                        chalk.blue(cnr.range.startColumn) + chalk.white(": " + cnr.messageIfNotReached));
                    printCode(program, cnr.range.startLineNumber, lineOffset);
                }

                //@ts-ignore
                context.task.fails = 1;
            }

            if (expectedOutput) {
                let actualOutput = printManager.output; // printManager.output.replace(/\n/g, "\\n");
                if (expectedOutput != actualOutput) {
                    console.log(chalk.gray("Position:    ") + chalk.white("Test beginning with Line ") + chalk.blue(lineOffset));
                    console.log(chalk.red("Test failed: ") + "Output doesn't match expected output.");
                    console.log(chalk.gray("Details:     ") + "Expected: " + chalk.green(expectedOutput) + " Actual: " + chalk.yellow(actualOutput));
                    //@ts-ignore
                    context.task.fails = 1;
                }

            }


        }

        reportMissingMessages("Expected Error", expectedCompiliationErrors);
        reportMissingMessages("Expected Warning", expectedWarnings ?? []);

        function reportMissingMessages(kind: string, expectedMessages: ExpectedMessage[]) {
            for (let expectedMessage of expectedMessages.filter(e => !e.found)) {
                let message = chalk.red(kind) + " with id " + chalk.blue(expectedMessage.id);
                if (expectedMessage.line) {
                    message += " on line " + chalk.blue(expectedMessage.line);
                    console.error(message);
                    printCode(program, expectedMessage.line, lineOffset);
                } else {
                    console.error(message);
                }
                //@ts-ignore
                context.task.fails = 1;
            }
        }

    });

    function printCode(code: string, errorLine: number, lineOffset: number) {

        for (let i = -4; i <= 2; i++) {
            let line = errorLine + i;
            if (i == 0) {
                console.log(chalk.blue(threeDez(line + lineOffset) + ": ") + chalk.italic.white(getLine(code, line)))
            } else {
                console.log(chalk.blue(threeDez(line + lineOffset) + ": ") + chalk.gray(getLine(code, line)))
            }
        }
    }



}