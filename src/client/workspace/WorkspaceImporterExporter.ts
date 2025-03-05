import { IMain } from "../../compiler/common/IMain";
import { WorkspaceSettings } from "../communication/Data";
import { MainBase } from "../main/MainBase";
import { GUIFile } from "./GUIFile";
import { Workspace } from "./Workspace";

export type ExportedWorkspace = {
    name: string;
    modules: ExportedFile[];
    settings: WorkspaceSettings;
}

type ExportedFile = {
    name: string;
    text: string;

    is_copy_of_id?: number,
    repository_file_version?: number,
    identical_to_repository_version: boolean,

}


export class WorkspaceImporterExporter {

    static exportWorkspace(workspace: Workspace): ExportedWorkspace {
        return {
            name: workspace.name,
            modules: workspace.getFiles().map(file => WorkspaceImporterExporter.exportFile(file)),
            settings: workspace.settings
        }
    }

    private static exportFile(file: GUIFile): ExportedFile {
        return {
            name: file.name,
            text: file.getText(),
            identical_to_repository_version: file.identical_to_repository_version,
            is_copy_of_id: file.is_copy_of_id,
            repository_file_version: file.repository_file_version
        }
    }

    static importWorkspace(wse: ExportedWorkspace, path: string[], main: MainBase, owner_id: number): Workspace {

        let ws: Workspace = new Workspace(wse.name, main, owner_id);

        ws.isFolder = false;
        ws.path = path.join("/");
        ws.settings = wse.settings;
        main.addWorkspace(ws);
        for(let exportedFile of wse.modules){
            ws.addFile(WorkspaceImporterExporter.importFile(main, exportedFile));
        }

        return ws;
    }

    private static importFile(main: IMain, ef: ExportedFile): GUIFile {
        let file = new GUIFile(main, ef.name);

        file.setText(ef.text);
        file.identical_to_repository_version = ef.identical_to_repository_version;
        file.is_copy_of_id = ef.is_copy_of_id;
        file.repository_file_version = ef.repository_file_version;

        return file;
    }


}