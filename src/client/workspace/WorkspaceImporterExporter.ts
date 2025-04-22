import { IMain } from "../../compiler/common/IMain";
import { base64ToBytes, bytesToBase64 } from "../../tools/Base64";
import { WorkspaceSettings } from "../communication/Data";
import { Main } from "../main/Main";
import { MainBase } from "../main/MainBase";
import { SpritesheetData } from "../spritemanager/SpritesheetData";
import { GUIFile } from "./File";
import { Workspace } from "./Workspace";

export type ExportedWorkspace = {
    name: string;
    modules: ExportedFile[];
    settings: WorkspaceSettings;
    spritesheetBase64?: string;
    path?: string;
    isSelected?: boolean;
}

export type ExportedFile = {
    name: string;
    text: string;

    is_copy_of_id?: number,
    repository_file_version?: number,
    identical_to_repository_version: boolean,

}


export class WorkspaceImporterExporter {

    static async exportAllWorkspaces(main: Main): Promise<ExportedWorkspace[]> {
        let exportedWorkspaces: ExportedWorkspace[] = [];
        for (let ws of main.projectExplorer.workspaceListPanel.elements.map(el => <Workspace>el.externalElement)) {
            if (ws.isFolder) continue;
            let exportedWorkspace: ExportedWorkspace = await WorkspaceImporterExporter.exportWorkspace(ws);
            exportedWorkspaces.push(exportedWorkspace);
        }
        return exportedWorkspaces;
    }



    static async exportWorkspace(workspace: Workspace): Promise<ExportedWorkspace> {

        let spritesheetBase64: string = undefined;
        if (workspace.spritesheetId) {
            let sd: SpritesheetData = new SpritesheetData();
            await sd.load(workspace.spritesheetId);
            spritesheetBase64 = bytesToBase64(sd.zipFile);
        }

        return {
            name: workspace.name,
            modules: workspace.getFiles().map(file => WorkspaceImporterExporter.exportFile(file)),
            settings: workspace.settings,
            spritesheetBase64: spritesheetBase64,
            path: workspace.path
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



}