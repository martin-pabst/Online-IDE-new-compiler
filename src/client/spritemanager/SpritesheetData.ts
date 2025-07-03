import { MainBase } from "../main/MainBase.js";
import { CacheManager } from "../../tools/CacheManager.js";
import { Workspace } from "../workspace/Workspace.js";
import { PixiSpritesheetData } from "./PixiSpritesheetData.js";
import jQuery from 'jquery';
import { ajaxAsync, csrfToken } from "../communication/AjaxHelper.js";
import { JavaEnum } from "../../compiler/java/types/JavaEnum.js";
import * as UPNG from 'upng-js'
import JSZip from 'jszip'
import { SpritesheetDataMessages } from "./SpriteManagerLanguage.js";
import { GetSpritesheetIdForWorkspaceRequest, GetSpritesheetIdForWorkspaceResponse } from "../communication/Data.js";


export class SpritesheetData {

    pixiSpritesheetData: PixiSpritesheetData;
    pngImageData: Uint8Array;
    pngFile: Uint8Array;
    zipFile: Uint8Array;

    async initializeSpritesheetForWorkspace(workspace: Workspace, main: MainBase, spritesheetURLOrBlob?: string | Uint8Array) {

        let spriteIdentifiers: Set<string> = new Set();

        let newSpritesheetLoaded: boolean = false;


        if (workspace.spritesheetId != null || ((typeof spritesheetURLOrBlob == "string") && spritesheetURLOrBlob != null)) {
            
            if(workspace.repository_id != null){
                let request: GetSpritesheetIdForWorkspaceRequest = {workspace_id: workspace.id};
                let response: GetSpritesheetIdForWorkspaceResponse = await ajaxAsync('servlet/getSpritesheetIdForWorkspace', request);
                workspace.spritesheetId = response.spritesheet_id;
            }

            await this.load(workspace.spritesheetId != null ? workspace.spritesheetId : <string>spritesheetURLOrBlob);
            newSpritesheetLoaded = true;
            
        }

        if(spritesheetURLOrBlob != null && (typeof spritesheetURLOrBlob != "string")){
            await this.unpackZip(spritesheetURLOrBlob);
            newSpritesheetLoaded = true;
        }
        
        if(newSpritesheetLoaded){
            if (this.pngImageData != null && this.pixiSpritesheetData != null) {
    
                let graphicsManager = main.getInterpreter().graphicsManager;
                graphicsManager.setUserData(this.pixiSpritesheetData, this.pngImageData);
    
                for (let identifier in this.pixiSpritesheetData.frames) {
                    let hashIndex = identifier.indexOf('#');
                    spriteIdentifiers.add(identifier.substring(0, hashIndex));
                }
            }
        }


        /**
         * See user-defined-spritesheets.md
         */

        let spriteLibraryEnum = <JavaEnum>main.getCompiler().getType("SpriteLibrary");

        /**
         * object klass is the same for each instance of the embedded ide on a given webpage
         */
        let klass = spriteLibraryEnum.runtimeClass;
        klass.removeUserSpritesheets(spriteLibraryEnum);
        spriteIdentifiers.forEach(identifier => klass.addEntry(identifier, spriteLibraryEnum));

    }


    async load(spritesheetIdOrURL: number | string): Promise<void> {
        if (spritesheetIdOrURL == null) return;

        if (typeof spritesheetIdOrURL == "number") {
            spritesheetIdOrURL = "sprites/" + ('0' + (spritesheetIdOrURL % 256).toString(16)).slice(-2).toUpperCase() + "/" + spritesheetIdOrURL + ".zip";
        }

        // let cacheManager = new CacheManager();
        // this.zipFile = await cacheManager.fetchUint8ArrayFromCache(spritesheetIdOrURL);
        // if (this.zipFile == null) {
            await this.loadFromServer(spritesheetIdOrURL);
            // if (this.zipFile != null) {
            //     cacheManager.store(spritesheetIdOrURL, this.zipFile);
            // }
        // }

        await this.unpackZip(this.zipFile)

        return;
    }

    public unpackPngFile() {
        //@ts-ignore
        let img = UPNG.decode(this.pngFile.buffer);
        let rgba8 = UPNG.toRGBA8(img)[0];
        this.pngImageData = new Uint8Array(rgba8);
        this.pixiSpritesheetData.meta.size.w = img.width;
        this.pixiSpritesheetData.meta.size.h = img.height;
    }

    private async loadFromServer(path: string): Promise<void> {

        let headers: { [key: string]: string; } = {};
        if (csrfToken != null) headers = { "x-token-pm": csrfToken };

        return new Promise((resolve, reject) => {
            jQuery.ajax({
                type: 'GET',
                async: true,
                url: path,
                headers: headers,
                xhrFields: { responseType: 'arraybuffer' },
                success: (arrayBuffer: ArrayBuffer) => {

                    this.zipFile = new Uint8Array(arrayBuffer);
                    resolve();

                },
                error: (jqXHR, message) => {
                    alert(SpritesheetDataMessages.couldntLoadSpritesheet() + message);
                }
            });

        });

    }

    async unpackZip(zipData: File | Uint8Array) {


        if (zipData instanceof File) {

            zipData = await this.readFile(zipData);

        }

        await this.continueUnpackZip(zipData);

    }

    async readFile(file: File): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            var fr = new FileReader();
            fr.onload = () => {
                let arrayBuffer = new Uint8Array(<ArrayBuffer>fr.result);
                resolve(arrayBuffer)
            };
            fr.onerror = reject;
            fr.readAsArrayBuffer(file);
        });
    }

    async continueUnpackZip(zipData: Uint8Array) {
        let pixiDataFile: any;
        let pngDataFile: any;

        let zip = await JSZip.loadAsync(zipData);
        zip.forEach(function (relativePath, zipEntry) {  // 2) print entries
            if ((<string>zipEntry.name).endsWith(".png")) pngDataFile = zipEntry;
            if ((<string>zipEntry.name).endsWith(".json")) pixiDataFile = zipEntry;
        })

        this.pngFile = await pngDataFile.async("uint8array");
        this.pixiSpritesheetData = JSON.parse(await pixiDataFile.async("text"));

        this.unpackPngFile();

    }

    async makeZip(filename: string = "spritesheet") {
        const zip = new JSZip();

        zip.file(filename + ".png", this.pngFile);
        zip.file(filename + ".json", JSON.stringify(this.pixiSpritesheetData), {
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        })

        this.zipFile = await zip.generateAsync({ type: "uint8array" });
    }



}