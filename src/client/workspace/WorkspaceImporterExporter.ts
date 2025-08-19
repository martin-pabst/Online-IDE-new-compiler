import { bytesToBase64 } from "../../tools/Base64";
import { WorkspaceSettings } from "../communication/Data";
import { Main } from "../main/Main";
import { SpritesheetData } from "../spritemanager/SpritesheetData";
import { GUIFile } from "./File";
import { Workspace } from "./Workspace";
import { Treeview } from "../../tools/components/treeview/Treeview";

export type ExportedWorkspace = {
    name: string;
    modules: ExportedFile[];
    settings: WorkspaceSettings;
    spritesheetBase64?: string;
    parent_folder_id?: number;
    isFolder?: boolean;
    isSelected?: boolean;
}

export type ExportedFile = {
    name: string;
    text: string;

    is_copy_of_id?: number,
    repository_file_version?: number,
    identical_to_repository_version: boolean,

}


export class WorkspaceExporter {

    static async exportAllWorkspaces(main: Main): Promise<ExportedWorkspace[]> {
        let exportedWorkspaces: ExportedWorkspace[] = [];
        for (let ws of main.projectExplorer.workspaceTreeview.rootNode.getOrderedNodeListRecursively().map(node => <Workspace>node.externalObject)) {
            let exportedWorkspace: ExportedWorkspace = await WorkspaceExporter.exportWorkspace(ws);
            exportedWorkspaces.push(exportedWorkspace);
        }
        return exportedWorkspaces;
    }


    static async exportFolder(workspace: Workspace, workspaceTreeview: Treeview<Workspace, number>): Promise<ExportedWorkspace[]> {
        let node = workspaceTreeview.findNodeByElement(workspace);
        if(!node) return [];

        let workspacesToExport = node.getOrderedNodeListRecursively().map(node => node.externalObject);

        let exportedWorkspaces: ExportedWorkspace[] = [];
        for (let ws of workspacesToExport) {
            let exportedWorkspace: ExportedWorkspace = await WorkspaceExporter.exportWorkspace(ws);
            if(exportedWorkspace.parent_folder_id == workspace.id) exportedWorkspace.parent_folder_id = null;
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
            modules: workspace.getFiles().map(file => WorkspaceExporter.exportFile(file)),
            settings: workspace.settings,
            spritesheetBase64: spritesheetBase64,
            parent_folder_id: workspace.parent_folder_id,
            isFolder: workspace.isFolder
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