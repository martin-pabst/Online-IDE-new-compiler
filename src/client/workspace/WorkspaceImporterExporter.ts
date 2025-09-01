import { base64ToBytes, bytesToBase64 } from "../../tools/Base64";
import { WorkspaceSettings } from "../communication/Data";
import { Main } from "../main/Main";
import { SpritesheetData } from "../spritemanager/SpritesheetData";
import { GUIFile } from "./File";
import { Workspace } from "./Workspace";
import { Treeview } from "../../tools/components/treeview/Treeview";
import { IMain } from "../../compiler/common/IMain";
import { MainBase } from "../main/MainBase";
import { TreeviewNode } from "../../tools/components/treeview/TreeviewNode";
import { WorkspaceImportMessages } from "../main/gui/language/WorkspaceImportMessages";
import { NetworkManager } from "../communication/NetworkManager";
import { SpriteManager } from "../spritemanager/SpriteManager";
import { ProgressIndicator } from "../main/gui/ProgressIndicator";

export type ExportedWorkspace = {
    name: string;
    id: number;
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

    isFolder: boolean,
    parent_folder_id?: number
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
        if (!node) return [];

        let workspacesToExport = node.getOrderedNodeListRecursively().map(node => node.externalObject);
        workspacesToExport.unshift(workspace);

        let exportedWorkspaces: ExportedWorkspace[] = [];
        for (let ws of workspacesToExport) {
            let exportedWorkspace: ExportedWorkspace = await WorkspaceExporter.exportWorkspace(ws);
            if (ws == workspace) exportedWorkspace.parent_folder_id = null;
            exportedWorkspaces.push(exportedWorkspace);
        }

        return exportedWorkspaces;

    }

    static async exportWorkspace(workspace: Workspace): Promise<ExportedWorkspace> {

        let spritesheetBase64: string = undefined;
        if (workspace.spritesheetId) {
            try {
                let sd: SpritesheetData = new SpritesheetData();
                await sd.load(workspace.spritesheetId);
                if(sd.zipFile != null) spritesheetBase64 = bytesToBase64(sd.zipFile);
            } catch (ex){
                console.log("Hier!");
            }
        }

        return {
            name: workspace.name,
            id: workspace.id,
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
            repository_file_version: file.repository_file_version,
            isFolder: file.isFolder,
            parent_folder_id: file.parent_folder_id
        }
    }



}

export class WorkspaceImporter {

    /**
     * Subsequent code writes to server if networkManager != null.
     * Otherwise it assumes to be in embedded version.
     */
    networkManager: NetworkManager | null = null;

    constructor(private main: MainBase, private owner_id: number | null) {
        this.networkManager = (<Main>main).networkManager;
    }


    public async importWorkspaces(workspacesToImport: ExportedWorkspace[], 
        targetFolderNode: TreeviewNode<Workspace, number>, progressIndicator?: ProgressIndicator) {

        while (!targetFolderNode.isFolder && !targetFolderNode.isRootNode) {
            targetFolderNode = targetFolderNode.getParent();
        }

        if (!confirm(WorkspaceImportMessages.confirmInput(workspacesToImport.length))) {
            return;
        }

        // delete parent_folder_ids if workspacesToImport doesn't contain folder:
        let folderIds: Set<number> = new Set(workspacesToImport.filter(w => w.isFolder).map(w => w.id));
        workspacesToImport.forEach(w => { if (!folderIds.has(w.parent_folder_id)) w.parent_folder_id = null })
            
            // order: parents first, children next
            let orderedWorkspacesToImport: ExportedWorkspace[] = [];
            let oldLength = -1;
            let idsDone: Set<number> = new Set();
            while (orderedWorkspacesToImport.length > oldLength) {
                oldLength = orderedWorkspacesToImport.length;
                for (let ws of workspacesToImport) {
                    if (!idsDone.has(ws.id) && (ws.parent_folder_id == null || idsDone.has(ws.parent_folder_id))) {
                    orderedWorkspacesToImport.push(ws);
                    idsDone.add(ws.id);
                }
            }
        }
        
        if(progressIndicator){
            progressIndicator.init(0, orderedWorkspacesToImport.length);
            progressIndicator.show();
        }

        let i = 0;

        let oldIdToNewFolderMap: Map<number, TreeviewNode<Workspace, number>> = new Map();
        let newNodes: TreeviewNode<Workspace, number>[] = []

        for (let wse of orderedWorkspacesToImport) {
            if(progressIndicator){
                progressIndicator.set(i++);
            }

            let parentNode = wse.parent_folder_id == null ? targetFolderNode : oldIdToNewFolderMap.get(wse.parent_folder_id);
            let parent_folder_id = parentNode.isRootNode() ? null : parentNode.externalObject.id;

            let workspace = await this.importWorkspaceWithoutSpritesheet(wse, parent_folder_id);
            await this.importSpritesheet(wse, workspace);

            if(workspace){
                let iconClass = workspace.repository_id == null ? 'img_workspace-dark' : 'img_workspace-dark-repository';
                let newNode = parentNode.treeview.addNode(workspace.isFolder, workspace.name, iconClass, workspace);
                newNodes.push(newNode);
                if(workspace.isFolder) oldIdToNewFolderMap.set(wse.id, newNode);
            }

        }

        if(progressIndicator) progressIndicator.hide();

        newNodes.forEach(nn => nn.setCaptionColor('#00b000'));

    }

    private async importSpritesheet(wse: ExportedWorkspace, ws: Workspace) {
        if (this.networkManager && !wse.isFolder && wse.spritesheetBase64 && ws != null) {
            let zipFile = base64ToBytes(wse.spritesheetBase64);
            try {
                let spritesheetId = await SpriteManager.uploadSpritesheet(zipFile, ws.id, false);
                ws.spritesheetId = spritesheetId;
            } catch (e) { }
        }
    }

    private async importWorkspaceWithoutSpritesheet(wse: ExportedWorkspace, parent_folder_id: number = null): Promise<Workspace | null> {

        let ws: Workspace = new Workspace(wse.name, this.main, this.owner_id);
        ws.isFolder = wse.isFolder || false;
        ws.settings = wse.settings;
        ws.parent_folder_id = parent_folder_id;

        let success: boolean = true;
        if (this.networkManager) {
            success = await this.networkManager.sendCreateWorkspace(ws, this.owner_id);
        }

        if (success) {
            this.main.addWorkspace(ws);
            for (let exportedFile of wse.modules) {
                let file = await this.importFile(exportedFile, ws);
                if (file) ws.addFile(file);
            }

            return ws;
        }

        return null;
    }

    private async importFile(ef: ExportedFile, ws: Workspace): Promise<GUIFile> {
        let file = new GUIFile(this.main, ef.name);

        file.setText(ef.text);
        file.identical_to_repository_version = ef.identical_to_repository_version;
        file.is_copy_of_id = ef.is_copy_of_id;
        file.repository_file_version = ef.repository_file_version;
        file.isFolder = ef.isFolder || false;
        file.parent_folder_id = ef.parent_folder_id || null;

        if (this.networkManager) {
            let success = this.networkManager.sendCreateFile(file, ws, this.owner_id);
            if (!success) file = null;
        }

        return file;
    }

}