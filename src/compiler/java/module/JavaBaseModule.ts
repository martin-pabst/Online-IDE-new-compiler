import { CodeReachedAssertions } from "../../common/interpreter/CodeReachedAssertions";
import { Program } from "../../common/interpreter/Program";
import { Thread } from "../../common/interpreter/Thread";
import { Module } from "../../common/module/Module";
import { JavaType } from "../types/JavaType";
import { JavaTypeStore } from "./JavaTypeStore";

export abstract class JavaBaseModule extends Module {

    types: JavaType[] = []; 
    codeReachedAssertions: CodeReachedAssertions = new CodeReachedAssertions();

    registerTypesAtTypestore(typestore: JavaTypeStore) {
        for(let type of this.types){
            typestore.addType(type);
        }
    }

    hasMainProgram(): boolean {
        return false;
    }

    startMainProgram(thread: Thread, setOneTimeBreakpointAtFirstVisibleLine: boolean): boolean {
        return false;
    }

}