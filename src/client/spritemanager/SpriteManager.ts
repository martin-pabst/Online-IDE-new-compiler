import jQuery from 'jquery';
import { Main } from "../main/Main.js";
import { downloadFile, makeDiv, openContextMenu } from "../../tools/HtmlTools.js";
import { ImageFile, SpriteData } from "./ImageFile.js";
import { EditableSpritesheet } from "./EditableSpritesheet.js";
import { SpritesheetData } from "./SpritesheetData.js";
import { UploadSpriteResponse } from "../communication/Data.js";
import { csrfToken } from '../communication/AjaxHelper.js';
import { SpriteLibrary } from '../../compiler/java/runtime/graphics/SpriteLibrary.js';
import { Workspace } from '../workspace/Workspace.js';
import { SpriteManagerMessages } from './SpriteManagerLanguage.js';

type SpriteLibraryEntry = {
    filename: string,
    name: string,
    index?: number
}

// declare var SpriteLibrary: SpriteLibraryEntry[];

export class SpriteManager {

    guiReady: boolean = false;

    userSpritesheet: EditableSpritesheet;

    $mainHeading: JQuery<HTMLDivElement>;

    $importDropZone: JQuery<HTMLDivElement>;
    $uploadRect: JQuery<HTMLDivElement>;

    $messagesDiv: JQuery<HTMLDivElement>;
    $zipSizeDiv: JQuery<HTMLDivElement>;

    $uploadButtonStart: JQuery<HTMLDivElement>;
    $uploadLinesCount: JQuery<HTMLInputElement>;
    $uploadColumnsCount: JQuery<HTMLInputElement>;
    $uploadMargin: JQuery<HTMLInputElement>;
    $uploadSpace: JQuery<HTMLInputElement>;
    $uploadSeries: JQuery<HTMLInputElement>;
    $uploadIndex: JQuery<HTMLInputElement>;

    $spriteListDiv: JQuery<HTMLDivElement>;

    $buttonDiv: JQuery<HTMLDivElement>;
    $buttonCancel: JQuery<HTMLDivElement>;
    $buttonOK: JQuery<HTMLDivElement>;
    $buttonImport: JQuery<HTMLDivElement>;

    $buttonFileImport: JQuery<HTMLInputElement>;

    fileList: FileList;

    hasErrors: boolean = false;
    readonly: boolean = false;

    constructor(public main: Main) {
    }

    initGUI() {
        this.guiReady = true;
        let that = this;
        let $spritemanagerDiv = jQuery('#spritemanager-div');

        // Heading
        $spritemanagerDiv.append(this.$mainHeading = makeDiv(null, "jo_sm_mainHeading"));
        this.$mainHeading.append(makeDiv("", "jo_sm_heading", SpriteManagerMessages.heading()));

        // Import/Export area
        let $importExportArea = makeDiv(null, "jo_sm_importExportArea", null, null, $spritemanagerDiv);

        let $importExportLeft = makeDiv(null, "jo_sm_importExportLeft jo_sm_writeonly", null, null, $importExportArea);
        this.$importDropZone = makeDiv(null, "jo_sm_importDropZone", null, null, $importExportLeft);
        makeDiv(null, null, SpriteManagerMessages.stepOne(), { "font-weight": "bold" }, this.$importDropZone);

        this.$buttonFileImport = <JQuery<HTMLInputElement>>jQuery('<input type="file" multiple="multiple" style="cursor:pointer; margin-top: 30px" class="jo_sm_writeonly"></input>');
        this.$importDropZone.append(this.$buttonFileImport);
        this.$buttonFileImport.on("change", (event) => {
            var files = event.target.files;
            that.fileList = files;
            $filesCountDiv.text(files.length != 1 ? (files.length + SpriteManagerMessages.filesSelected()) : SpriteManagerMessages.fileSelected());
            this.$buttonImport.addClass("jo_active");
         })

        let $filesCountDiv = makeDiv(null, null, "", null, this.$importDropZone);

        this.$importDropZone.on('dragover', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            evt.originalEvent.dataTransfer.dropEffect = 'copy';
        })
        this.$importDropZone.on('drop', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.originalEvent.dataTransfer.files;
            that.fileList = files;
            $filesCountDiv.text(files.length != 1 ? (files.length + SpriteManagerMessages.filesSelected()) : SpriteManagerMessages.fileSelected());
            this.$buttonImport.addClass("jo_active");
        })


        let $importExportCenter = makeDiv(null, "jo_sm_importExportCenter jo_sm_writeonly", null, null, $importExportArea);
        makeDiv(null, "jo_sm_importParameters", SpriteManagerMessages.stepTwo(), { "margin-bottom": "10px", "font-weight": "bold" }, $importExportCenter);
        let $importParameters1 = makeDiv(null, "jo_sm_importParameters", null, null, $importExportCenter);

        this.$uploadLinesCount = this.makeIntParameterInput($importParameters1, SpriteManagerMessages.rows(), 1);
        this.$uploadColumnsCount = this.makeIntParameterInput($importParameters1, SpriteManagerMessages.columns(), 1);
        this.$uploadMargin = this.makeIntParameterInput($importParameters1, SpriteManagerMessages.margin(), 0);
        this.$uploadSpace = this.makeIntParameterInput($importParameters1, SpriteManagerMessages.distance(), 0);

        let $importParameters2 = makeDiv(null, "jo_sm_importParameters", null, null, $importExportCenter);
        this.$uploadSeries = this.makeStringParameterInput($importParameters2, SpriteManagerMessages.series(), "Test", "10em");
        this.$uploadIndex = this.makeIntParameterInput($importParameters2, SpriteManagerMessages.fromIndex(), 0);

        makeDiv(null, null, null, { "border-bottom": "2px solid var(--slider)", "margin-bottom": "5px" }, $importExportCenter);

        this.$buttonImport = makeDiv(null, "jo_active jo_sm_button jo_sm_importButton", SpriteManagerMessages.stepThree(), { width: "fit-content" }, $importExportCenter);
        this.$buttonImport.on('click', () => { if (that.$buttonImport.hasClass("jo_active")) { 
            that.importFiles(that.fileList); $filesCountDiv.text(""); 
            that.$buttonFileImport.val("");
        } });


        let $importExportMessages = makeDiv(null, "jo_sm_importExportMessages jo_sm_writeonly", null, null, $importExportArea);
        makeDiv(null, null, SpriteManagerMessages.messages(), { "font-weight": "bold" }, $importExportMessages);
        let $messagesOuter = makeDiv(null, "jo_sm_messagesOuter jo_scrollable", null, null, $importExportMessages);
        this.$messagesDiv = makeDiv(null, "jo_sm_messagesDiv jo_scrollable", "Test", null, $messagesOuter);
        this.$zipSizeDiv = makeDiv(null, "jo_sm_pngSizeDiv", SpriteManagerMessages.fileSize() + "0 kB", null, $importExportMessages);

        let $importExportRight = makeDiv(null, "jo_sm_importExportRight", null, null, $importExportArea);
        makeDiv(null, "jo_sm_writeonly", SpriteManagerMessages.importWholeSpritesheet(), null, $importExportRight);
        let $buttonImportAll = <JQuery<HTMLInputElement>>jQuery('<input type="file" style="cursor:pointer" class="jo_sm_writeonly"></input>');
        $importExportRight.append($buttonImportAll);
        let $buttonExportAll = makeDiv(null, 'jo_sm_buttonExportAll jo_sm_button jo_active', SpriteManagerMessages.exportWholeSpritesheet(), null, $importExportRight);
        let $buttonDeleteAll = makeDiv(null, 'jo_sm_buttonDeleteAll jo_sm_button jo_active jo_sm_writeonly', SpriteManagerMessages.removeAllSprites(), null, $importExportRight);

        $buttonDeleteAll.on("click", (ev) => {
            ev.preventDefault();
            openContextMenu([{
                caption: SpriteManagerMessages.cancel(),
                callback: () => { }
            }, {
                caption: SpriteManagerMessages.sureDelete(),
                color: "#ff6060",
                callback: () => {
                    that.$spriteListDiv.empty()
                    that.userSpritesheet.spriteDataList = []
                    that.generateZipAndPrintZipSize();
                }
            }], ev.pageX + 2, ev.pageY + 2);
            ev.stopPropagation();
        })

        $buttonExportAll.on("click", () => { that.exportSpritesheet(); })
        $buttonImportAll.on("change", (event) => {
            that.importSpritesheet(event.target.files);
        })

        // Sprite list
        let $spritelistOuter = makeDiv(null, "jo_sm_spritelistOuter", null, null, $spritemanagerDiv);
        this.$spriteListDiv = makeDiv(null, "jo_sm_spritelistDiv jo_scrollable", null, null, $spritelistOuter);


        // Buttons at page bottom
        $spritemanagerDiv.append(this.$buttonDiv = makeDiv(null, "jo_sm_buttonDiv"));

        this.$buttonDiv.append(this.$buttonCancel = makeDiv("", "jo_active jo_sm_button", SpriteManagerMessages.cancel(), { "background-color": "var(--speedcontrol-grip)", "color": "var(--fontColorLight)", "font-size": "10pt" }));
        this.$buttonCancel.on("click", () => { that.exit() })

        this.$buttonDiv.append(this.$buttonOK = makeDiv("", "jo_active jo_sm_button jo_sm_writeonly", SpriteManagerMessages.save(), { "background-color": "var(--updateButtonBackground)", "color": "var(--fontColorLight)", "font-size": "10pt" }));
        this.$buttonOK.on("click", () => { if (that.$buttonOK.hasClass('jo_active')) that.saveAndExit() })

    }

    async importSpritesheet(fileList: FileList) {
        if(!this.userSpritesheet) return;

        await this.userSpritesheet.spritesheet.unpackZip(fileList[0]);

        this.userSpritesheet.extractImagesFromSheet();

        this.$spriteListDiv.empty();
        this.userSpritesheet.spriteDataList.forEach((sd) => this.renderImageInList(sd));

        this.checkSeriesAndIndexesAndSetNextSpriteIndex();

    }

    async exportSpritesheet() {
        let filename = window.prompt(SpriteManagerMessages.nameOfSpritesheet(), "Spritesheet");
        if(filename.endsWith(".zip")) filename = filename.replace(".zip", "");

        await this.userSpritesheet.generateAndZipSpritesheet(filename);

        downloadFile(new Blob([this.userSpritesheet.spritesheet.zipFile]), filename + ".zip", true);
    }

    async importFiles(files: FileList) {
        let linesCount = Number.parseInt(<string>this.$uploadLinesCount.val());
        let columnscount = Number.parseInt(<string>this.$uploadColumnsCount.val());
        let margin = Number.parseInt(<string>this.$uploadMargin.val());
        let space = Number.parseInt(<string>this.$uploadSpace.val());
        let series = <string>this.$uploadSeries.val();
        let indexFrom = Number.parseInt(<string>this.$uploadIndex.val());

        let images = await (new ImageFile()).loadFiles(files);
        for (let image of images) {
            let newSprites: SpriteData[] = this.userSpritesheet.addSprite(image, linesCount, columnscount, margin, space, series, indexFrom++);
            newSprites.forEach(sprite => this.renderImageInList(sprite))
        }
        this.$buttonImport.removeClass("jo_active");

        this.checkSeriesAndIndexesAndSetNextSpriteIndex();

        setTimeout(() => {
            this.printMessage(images.length + SpriteManagerMessages.imagesAdded());
            this.generateZipAndPrintZipSize();
        }, 500);

    }

    async generateZipAndPrintZipSize() {
        await this.userSpritesheet.generateAndZipSpritesheet();
        let size = this.userSpritesheet.spritesheet.zipFile.length;
        this.$zipSizeDiv.text("Spritesheet: " + Math.round(size / 1024 * 100) / 100 + " kB (Max: 2 MB)");
        let color: string = size > 2 * 1024 * 1024 ? "red" : "";
        this.$zipSizeDiv.css("color", color);
    }

    renderImageInList(imageData: SpriteData) {
        let that = this;
        let $line = makeDiv(null, "jo_sm_spriteListLine", null, null, this.$spriteListDiv);

        // let pngFile = UPNG.encode([imageData.image.buffer], imageData.width, imageData.height, 0);
        // let $img1: JQuery<HTMLImageElement> = jQuery('<img class="jo_sm_spritepreview">')
        // $img1[0].src = URL.createObjectURL(new Blob([pngFile], { type: 'image/png' } ));


        let $img: JQuery<HTMLCanvasElement> = jQuery('<canvas width="' + imageData.width + '" height="' + imageData.height + '"></canvas>');
        let canvas = $img[0].getContext("2d");
        const id = new ImageData(new Uint8ClampedArray(imageData.image), imageData.width, imageData.height);
        canvas.putImageData(id, 0, 0);

        let maxWidth: number = 300;
        let maxHeight: number = 100;

        let w = imageData.width;
        let h = imageData.height;

        if (w / maxWidth > h / maxHeight) {
            w = Math.min(imageData.width, maxWidth);
            h = imageData.height / imageData.width * w;
        } else {
            h = Math.min(imageData.height, maxHeight);
            w = imageData.width / imageData.height * h;
        }

        $img.css('width', w + "px");
        $img.css('height', h + "px");

        let $innerbox = makeDiv(null, "jo_spritepreview-innerbox", null, { width: w + "px", height: h + "px", "margin-right": (maxWidth - w) + "px" }, $line);
        $innerbox.append($img);

        let $inputInfoDiv = makeDiv(null, "jo_sm_inputInfoDiv", null, null, $line);
        let $inputDiv = makeDiv(null, "jo_sm_inputDiv", null, null, $inputInfoDiv);

        if(!this.readonly){
            let $seriesInput = this.makeStringParameterInput($inputDiv, SpriteManagerMessages.series(), imageData.series ? imageData.series : "", "10em");
            $seriesInput.addClass('jo_sm_series');

            let $indexInput = this.makeIntParameterInput($inputDiv, SpriteManagerMessages.index(), imageData.index ? imageData.index : 0);
            $indexInput.addClass('jo_sm_index');

            $seriesInput.on("input", () => { imageData.series = <string>$seriesInput.val(); that.checkSeriesAndIndexesAndSetNextSpriteIndex(); })
            $indexInput.on("input", () => { imageData.index = <number><any>$indexInput.val(); that.checkSeriesAndIndexesAndSetNextSpriteIndex(); })
        }

        let $infoDiv = makeDiv(null, "jo_sm_infoDiv", SpriteManagerMessages.widthHeight(imageData.width, imageData.height), null, $inputInfoDiv);
        let $errorSpan = jQuery('<span class="jo_sm_errorspan"></span>');
        $infoDiv.append($errorSpan);

        if(!this.readonly){
            let $deleteButton = makeDiv(null, "img_delete jo_button jo_active", null, null, $line);
            $deleteButton.on('pointerdown', (ev) => {
                ev.preventDefault();
                openContextMenu([{
                    caption: SpriteManagerMessages.cancel(),
                    callback: () => { }
                }, {
                    caption: SpriteManagerMessages.sureDelete(),
                    color: "#ff6060",
                    callback: () => {
                        let index = that.userSpritesheet.spriteDataList.indexOf(imageData);
                        that.userSpritesheet.spriteDataList.splice(index, 1);
                        $line.remove();
                        that.generateZipAndPrintZipSize();
                        that.checkSeriesAndIndexesAndSetNextSpriteIndex();
                    }
                }], ev.pageX + 2, ev.pageY + 2);
                ev.stopPropagation();
            });
        }

        this.$spriteListDiv.prepend($line);

    }

    makeIntParameterInput($enclosingDiv: JQuery<HTMLElement>, caption: string, defaultValue: number): JQuery<HTMLInputElement> {
        let $div = $enclosingDiv.append(makeDiv(null, "jo_sm_parameterDiv"));
        makeDiv(null, "jo_sm_parameterCaption", caption, null, $div);
        let $ret = jQuery('<input type="number" class="jo_sm_parameterInput" value="' + defaultValue + '" style="width: 3em"></input>');
        $div.append($ret);
        return <any>$ret;
    }

    makeStringParameterInput($enclosingDiv: JQuery<HTMLElement>, caption: string, defaultValue: string, width: string): JQuery<HTMLInputElement> {
        let $div = $enclosingDiv.append(makeDiv(null, "jo_sm_parameterDiv"));
        makeDiv(null, "jo_sm_parameterCaption", caption, null, $div);
        let $ret = jQuery('<input type="text" class="jo_sm_parameterInput" value="' + defaultValue + '" style="width: ' + width + '"></input>');
        $div.append($ret);
        return <any>$ret;
    }

    async show() {

        let that = this;
        if (!this.guiReady) {
            this.initGUI();
        }

        this.$buttonFileImport.val("");

        let workspace = this.main.getCurrentWorkspace();
        if(workspace == null){
            alert(SpriteManagerMessages.noWorkspaceSelected())
            return;
        }

        if(workspace.repository_id != null && !workspace.has_write_permission_to_repository)
        {
            this.readonly = true;
            jQuery('.jo_sm_writeonly').hide();
        } else {
            this.readonly = false;
            jQuery('.jo_sm_writeonly').show();
        }

        if(workspace.repository_id == null){
            this.$mainHeading.find('.jo_sm_heading').text(SpriteManagerMessages.mangeWorkspaceSprites(workspace.name));
        } else {
            this.$mainHeading.find('.jo_sm_heading').text(SpriteManagerMessages.mangeRepositorySprites(workspace.name));
        }


        this.$buttonImport.removeClass("jo_active");
        this.fileList = null;

        let $spriteDiv = jQuery('#spritemanager-div');
        $spriteDiv.css('visibility', 'visible');
        let $mainDiv = jQuery('#main');
        $mainDiv.css('visibility', 'hidden');


        this.main.windowStateManager.registerOneTimeBackButtonListener(() => {
            that.hide();
        });

        let spritesheetData = new SpritesheetData();
        await spritesheetData.load(workspace.spritesheetId);

        this.userSpritesheet = new EditableSpritesheet(spritesheetData);
        this.$spriteListDiv.empty();
        this.userSpritesheet.spriteDataList.forEach((sd) => {
            this.renderImageInList(sd);
        });

        this.checkSeriesAndIndexesAndSetNextSpriteIndex();

    }

    setNextSpriteIndex(){
        let maxIndex = -1;
        this.userSpritesheet.spriteDataList.forEach((sd) => {
            if(sd.index > maxIndex) maxIndex = sd.index;
        });

        this.$uploadIndex.val(maxIndex + 1);

        this.$uploadColumnsCount.val(1);
        this.$uploadLinesCount.val(1);
        this.$uploadMargin.val(0);
        this.$uploadSpace.val(0);

    }


    async saveAndExit() {
        await this.userSpritesheet.generateAndZipSpritesheet();
        let that = this;

        let deleteSpritesheet: boolean = this.userSpritesheet.spriteDataList.length == 0;
        let workspace: Workspace = this.main.getCurrentWorkspace();

        SpriteManager.uploadSpritesheet(this.userSpritesheet.spritesheet.zipFile, workspace.id, deleteSpritesheet).then((spritesheetId: number) => {
            workspace.spritesheetId = deleteSpritesheet ? null : spritesheetId;
            that.userSpritesheet.spritesheet.initializeSpritesheetForWorkspace(workspace, that.main, null).then(() => {
                for (let file of workspace.getFiles()) {
                    this.main.getCompiler().setFileDirty(file);
                }
                this.main.getCompiler().triggerCompile();
            });

            that.exit();
        }).catch((message) => {
            alert(message);
            that.exit();
        });

    }

    static async uploadSpritesheet(spriteSheet: Uint8Array, workspaceId: number, deleteSpritesheet: boolean): Promise<number> {
        let headers: {[key: string]: string;} = { 'x-workspaceid': "" + workspaceId, "x-filetype": deleteSpritesheet ? "delete" : "zip" };
        if(csrfToken != null) headers["x-token-pm"] = csrfToken;
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                type: 'POST',
                async: true,
                contentType: 'application/octet-stream',
                data: spriteSheet,
                processData: false,
                headers: headers,
                url: "servlet/uploadSprite",
                success: function (response: UploadSpriteResponse) {
                    if(response.success){
                        resolve(response.spriteFileId);
                    } else {
                        reject(response.message);
                    }
                },
                error: function (jqXHR, message) {
                    reject(message);
                }
            });
        });
    }


    hide() {
        let $spriteDiv = jQuery('#spritemanager-div');
        $spriteDiv.css('visibility', 'hidden');
        let $mainDiv = jQuery('#main');
        $mainDiv.css('visibility', 'visible');
    }

    exit() {
        window.history.back();
    }

    printMessage(message: string, color?: string) {
        let colorString = color == null ? "" : 'style="color: ' + color + '"';
        this.$messagesDiv.append(`<div ${colorString}>${message}</div>`);
        let md = this.$messagesDiv[0];
        md.scrollTop = md.scrollHeight;
    }

    checkSeriesAndIndexesAndSetNextSpriteIndex() {
        if(this.readonly) return;
        this.hasErrors = false;

        let internalSeries: { [key: string]: boolean } = {};
        for (let sle of SpriteLibrary) {
            internalSeries[sle.name] = true;
        }

        let seriesIndexMap: { [key: string]: boolean } = {};

        let that = this;

        this.$spriteListDiv.children().each((nr, element) => {
            let series = <string>jQuery(element).find('.jo_sm_series').val();
            let index = Number.parseInt(<string>(jQuery(element).find('.jo_sm_index').val()));
            let $errordiv = jQuery(element).find('.jo_sm_errorspan');
            if (internalSeries[series]) {
                $errordiv.text(SpriteManagerMessages.identifierAlreadyUsed(series));
                that.hasErrors = true;
                return;
            }
            if (seriesIndexMap[series + "#" + index]) {
                $errordiv.text(SpriteManagerMessages.seriesIndexAlreadyUsed(series, index));
                that.hasErrors = true;
                return;
            }
            $errordiv.text('');
            seriesIndexMap[series + "#" + index] = true;
        })

        if (this.hasErrors) {
            this.$buttonOK.removeClass('jo_active');
        } else {
            this.$buttonOK.addClass('jo_active');
        }

        this.setNextSpriteIndex();
    }


}