import chalk from "chalk";
import fs from "fs";
import { test } from "vitest";
import { Interpreter } from "../compiler/common/interpreter/Interpreter";
import { JavaCompiler } from "../compiler/java/JavaCompiler";
import { getLine, getLineNumber, threeDez } from "../tools/StringTools";
import { IPrintManager } from "../compiler/common/interpreter/IPrintManager";
import { ViteTestAssertions } from "./ViteTestAssertions";
import { JavaLibraryManager } from "../compiler/java/runtime/JavaLibraryManager";
import { CompilerFile } from "../compiler/common/module/CompilerFile";

class StoreOutputPrintManager implements IPrintManager {

    output: string = "";

    isTestPrintManager(): boolean {
        return true;
    }

    printHtmlElement(htmlElement: HTMLElement): void {

    }

    print(text: string | undefined, withNewline: boolean, color: number | undefined): void {
        if (!text) return;
        if (text.startsWith("Execution")) return;
        this.output += text;
        if (withNewline) this.output += "\n";
    }
    clear(): void {
        this.output = "";
    }

    flush(): void {

    }
}

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


type ExpectedError = { id: string, line?: number, found?: boolean }

type TestInfo = {
    expectedOutput?: string,
    expectedCompilationError?: ExpectedError,
    expectedCompilationErrors?: ExpectedError[],
    libraries?: string[]
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
        let expectedErrors: ExpectedError[] = [];
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
                if (testInfo.libraries) libraries = testInfo.libraries;
            }
        }

        compileAndTest(title, code, lineOffset, expectedOutput, expectedErrors, libraries);

        testBegin = sourcecode.indexOf("/**::", testBegin + 1);
    }



}

function compileAndTest(name: string, program: string, lineOffset: number,
    expectedOutput: string | undefined, expectedCompiliationErrors: ExpectedError[],
    libraries: string[]) {

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


        let allErrors = executable.getAllErrors().filter(error => error.level == "error");

        let allNotExpectedErrors = allErrors.filter(error => {
            let expectedError = expectedCompiliationErrors.find(expectedError => expectedError.id == error.id && (!expectedError.line || expectedError.line == error.range.startLineNumber));
            if (expectedError) expectedError.found = true;
            return !expectedError;
        })

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

        for (let expectedError of expectedCompiliationErrors.filter(e => !e.found)) {
            let message = chalk.red("Expected Error") + " with id " + chalk.blue(expectedError.id);
            if (expectedError.line) {
                message += " on line " + chalk.blue(expectedError.line);
                console.error(message);
                printCode(program, expectedError.line, lineOffset);
            } else {
                console.error(message);
            }
            //@ts-ignore
            context.task.fails = 1;
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