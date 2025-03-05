import { test } from "vitest";
import { ObjectClassMethodNames, ThreadMethodNames } from "../compiler/common/interpreter/RuntimeConstants";
import { Thread } from "../compiler/common/interpreter/Thread";
import chalk from "chalk";
import { ObjectClass } from "../compiler/java/runtime/system/javalang/ObjectClassStringClass";

export class ThreadMethodNameChecker {

    run(){
        test("Check method names of class Thread", (context) => {
            for (let item in ThreadMethodNames) {
                if (isNaN(Number(item))) {
                    if(!(typeof Thread.prototype[item] == 'function')){
                        //@ts-ignore
                        context.task.fails = 1;
                        console.log(chalk.red("Method ") + chalk.white(item) + chalk.red(" is missing in class Thread!"));
                    }
                }
            }
        })
        test("Check method names of class ObjectClass", (context) => {
            for (let item in ObjectClassMethodNames) {
                if (isNaN(Number(item))) {
                    if(!(typeof ObjectClass.prototype[item] == 'function')){
                        //@ts-ignore
                        context.task.fails = 1;
                        console.log(chalk.red("Method ") + chalk.white(item) + chalk.red(" is missing in class Thread!"));
                    }
                }
            }
        })
    }


}