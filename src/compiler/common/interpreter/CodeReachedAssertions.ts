import { generateSecret } from "../../../tools/StringTools";
import { JavaBaseModule } from "../../java/module/JavaBaseModule";
import { JavaCompiledModuleManager } from "../../java/module/JavaCompiledModuleManager";
import { IRange } from "../range/Range";

export class CodeReacedAssertion {

    public reached: boolean = false;
    public key: string;

    constructor(public messageIfNotReached: string, public module: JavaBaseModule, public range: IRange){
        this.key = generateSecret(10);
    }
}

export class CodeReachedAssertions {

    assertions: Map<string, CodeReacedAssertion> = new Map();

    init(moduleManager: JavaCompiledModuleManager) {
        this.assertions.clear();
        moduleManager.modules.forEach( m => {
            this.addAll(m.codeReachedAssertions);
        })
    }

    addAll(otherAssertions: CodeReachedAssertions){
        otherAssertions.assertions.forEach((assertion, key) => this.assertions.set(key, assertion));
    }

    registerAssertion(assertion: CodeReacedAssertion){
        this.assertions.set(assertion.key, assertion);
    }

    registerAssertionReached(key: string){
        let assertion = this.assertions.get(key);
        if(assertion) assertion.reached = true;
    }

    getUnreachedAssertions(): CodeReacedAssertion[]{

        let ret: CodeReacedAssertion[] =  [];
        this.assertions.forEach((assertion, key) => {
            if(!assertion.reached) ret.push(assertion);
        })

        return ret;

    }


}