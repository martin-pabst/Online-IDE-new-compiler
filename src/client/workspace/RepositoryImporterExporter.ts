import { base64ToBytes, bytesToBase64 } from "../../tools/Base64";
import { ajaxAsync } from "../communication/AjaxHelper";
import { GetRepositoryRequest, GetRepositoryResponse } from "../communication/Data";
import { MainBase } from "../main/MainBase";
import { SpriteManager } from "../spritemanager/SpriteManager";
import { SpritesheetData } from "../spritemanager/SpritesheetData";

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
        let getRepositoryResponse = await ajaxAsync("/servlet/getRepository", getRepositoryRequest) as GetRepositoryResponse;
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