import { base64ToBytes, bytesToBase64 } from "../../tools/Base64";
import { GetRepositoryRequest, GetRepositoryResponse, WorkspaceSettings } from "../communication/Data";
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
import { ajaxAsync } from "../communication/AjaxHelper";

export type ExportedRepository = {
    name: string,
    files: string,
    history: string,
    description: string,
    spritesheetBase64?: string;
    spritesheet_id?: number;        // for uploading onto server
}


export class RepositoryExporter {

    static async exportRepository(repository_id: number, workspace_id?: number): Promise<ExportedRepository> {

        let getRepositoryRequest: GetRepositoryRequest = { repository_id: repository_id, workspace_id: workspace_id };
        let getRepositoryResponse: GetRepositoryResponse = await ajaxAsync("/servlet/getRepository", getRepositoryRequest)
        if (!getRepositoryResponse.success) return;

        let repository = getRepositoryResponse.repository;

        let spritesheetBase64: string = undefined;
        if (repository.spritesheet_id) {
            try {
                let sd: SpritesheetData = new SpritesheetData();
                await sd.load(repository.spritesheet_id);
                if(sd.zipFile != null) spritesheetBase64 = bytesToBase64(sd.zipFile);
            } catch (ex){
                console.log("Fehler beim Laden des Spritesheets.");
            }
        }

        return {
            name: repository.name,
            files: repository.files,
            history: repository.history,
            description: repository.description,
            spritesheetBase64: spritesheetBase64    
        }
    }

}

export class RepositoryImporter {


    constructor(private main: MainBase) {
    }


    public async importRepository(repositoryToImport: ExportedRepository) {
        if(repositoryToImport.spritesheetBase64){
            let zipFile = base64ToBytes(repositoryToImport.spritesheetBase64); 
            try {
                let spritesheetId = await SpriteManager.uploadSpritesheet(zipFile, null, false);
                repositoryToImport.spritesheet_id = spritesheetId;
                repositoryToImport.spritesheetBase64 = undefined; // no longer needed
            } catch (e) { }
        }

        let response = await ajaxAsync("/servlet/importRepository", repositoryToImport);
    }


}