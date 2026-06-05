import { CodeFragment } from "../../../../compiler/common/disassembler/CodeFragment.ts";
import { JavaLibraryModule } from "../../../../compiler/java/module/libraries/JavaLibraryModule.ts";
import { ConnectionClass } from "./ConnectionClass.ts";
import { DatabaseManagerClass } from "./DatabaseManagerClass.ts";
import { PreparedStatementClass } from "./PreparedStatementClass.ts";
import { ResultSetClass } from "./ResultSetClass.ts";
import { StatementClass } from "./StatementClass.ts";

export class DatabaseModule extends JavaLibraryModule {


    constructor(){
        super();
        this.classesInterfacesEnums.push(
            DatabaseManagerClass, ConnectionClass, StatementClass, PreparedStatementClass, ResultSetClass
        )
    }



    isReplModule(): boolean {
        return false;
    }
    getCodeFragments(): CodeFragment[] {
        return [];
    }

    clearAllBreakpoints(): void {
        
    }




}