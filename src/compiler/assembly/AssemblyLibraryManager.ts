import { Compiler } from "../common/Compiler";
import { LibraryData, LibraryManager } from "../common/programminglanguage/LibraryManager";

export class AssemblyLibraryManager implements LibraryManager {

    addLibrariesToCompiler(compiler: Compiler): void {
    }
    addLibraries(...libraryIds: string[]): void {
    }
    getLibrariesData(): LibraryData[] {
        return [];
    }

}
    