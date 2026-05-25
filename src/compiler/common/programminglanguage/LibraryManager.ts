import { CheckboxState } from "../../../client/main/gui/Dialog";
import { Compiler } from "../Compiler";

export type LibraryData = {
    identifier: string,
    description: string,
    id: string,
    checkboxState?: CheckboxState
}

export interface LibraryManager {

    addLibrariesToCompiler(compiler: Compiler): void;

    addLibraries(...libraryIds: string[]): void;

    getLibrariesData(): LibraryData[];

}