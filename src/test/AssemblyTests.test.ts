import chalk from "chalk";
import fs from "fs";
import { test } from "vitest";
import { Interpreter } from "../compiler/common/interpreter/Interpreter";
import { AssemblyCompiler } from "../compiler/assembly/AssemblyCompiler";
import { CompilerFile } from "../compiler/common/module/CompilerFile";
import { getLine, getLineNumber, threeDez } from "../tools/StringTools";
import { StoreOutputPrintManager } from "./StoreOutputPrintManager";
import { ViteTestAssertions } from "./ViteTestAssertions";

try {
    let assemblyDir: string = __dirname + "/assembly";

    let files = fs.readdirSync(assemblyDir);
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file && file.endsWith(".asm")) {
            let data = fs.readFileSync(assemblyDir + '/' + file, 'utf8');
            test1(data, file);
        }
    }
} catch (ex) {
    console.error(ex);
}


type ExpectedError = { id: string, line?: number, found?: boolean }

type TestInfo = {
    expectedCompilationErrors?: ExpectedError[]
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

        let expectedErrors: ExpectedError[] = [];

        let leftCurlyBraceIndex = sourcecode.indexOf("{", testBegin);
        if (leftCurlyBraceIndex >= 0 && leftCurlyBraceIndex < headerEnd) {
            let infoText = sourcecode.substring(leftCurlyBraceIndex, headerEnd);
            // infoText = infoText.replace(/\s*\s/g, "");

            let testInfo: TestInfo = JSON.parse(infoText);
            if (testInfo) {
                if (testInfo.expectedCompilationErrors) expectedErrors = expectedErrors.concat(testInfo.expectedCompilationErrors);
            }
        }

        compileAndTest(title, code, lineOffset, expectedErrors);

        testBegin = sourcecode.indexOf("/**::", testBegin + 1);
    }



}

function compileAndTest(name: string, program: string, lineOffset: number,
    expectedCompilationErrors: ExpectedError[]) {

    test(name, async (context) => {
        let file = new CompilerFile();

        file.setText(program);

        let compiler = new AssemblyCompiler();

        compiler.setFiles([<any>file]);
        let executable = await compiler.compileIfDirty();
        if (!executable) {
            return;
        }

        let allErrors = executable.getAllErrors().filter(error => error.level == "error");

        let allNotExpectedErrors = allErrors.filter(error => {
            let expectedError = expectedCompilationErrors.find(expectedError => expectedError.id == error.id && (!expectedError.line || expectedError.line == error.range.startLineNumber));
            if (expectedError) expectedError.found = true;
            return !expectedError;
        })

        if (allNotExpectedErrors.length > 0) {
            console.log(chalk.red("Compilation errors ") + "in " + name);
            for (let error of allNotExpectedErrors) {

                let expectedError = expectedCompilationErrors.find(expectedError => expectedError.id == error.id && (!expectedError.line || expectedError.line == error.range.startLineNumber + lineOffset));
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

        }

        for (let expectedError of expectedCompilationErrors.filter(e => !e.found)) {
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