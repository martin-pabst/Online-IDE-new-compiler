import * as PIXI from 'pixi.js';
import { Interpreter } from './Interpreter';
import { PixiSpritesheetData } from '../../../client/spritemanager/PixiSpritesheetData';
import type { WorldClass } from '../../java/runtime/graphics/WorldClass';

export interface GraphicSystem {
    getIdentifier(): string;
}


export class GraphicsManager {

    pixiSpritesheetData: PixiSpritesheetData;
    pngImageData: Uint8Array<ArrayBuffer>;

    // if 2d world is used then this is defined:
    public pixiUserSpritesheet?: PIXI.Spritesheet;

    // if 3d world is used then this is defined:


    graphicSystems: GraphicSystem[] = [];

    interpreter?: Interpreter;

    constructor(public graphicsDiv: HTMLElement | null, public coordinatesDiv: HTMLDivElement | undefined) {

    }

    registerGraphicSystem(graphicSystem: GraphicSystem) {
        // if (this.currentGraphicSystem) {
        //     throw new RuntimeExceptionClass(JRC.GraphicSystemNotAvailableError(this.currentGraphicSystem.getIdentifier(), graphicSystem.getIdentifier()));
        // }
        this.graphicSystems.push(graphicSystem);
    }

    setInterpreter(interpreter: Interpreter) {
        this.interpreter = interpreter;
        interpreter.eventManager.on("resetRuntime", () => {
            this.graphicSystems = [];
            this.graphicsDiv.style.height = "0px";
        });
    }

    setUserData(pixiSpritesheetData: PixiSpritesheetData, pngImageData: Uint8Array<ArrayBuffer>) {
        this.pixiSpritesheetData = pixiSpritesheetData;
        this.pngImageData = pngImageData;
        if(this.pixiUserSpritesheet){
            this.pixiUserSpritesheet.destroy();
            this.pixiUserSpritesheet = undefined;
        }
    }

    async initPixiUserSpritesheet() {

        if(!this.pixiUserSpritesheet && this.pixiSpritesheetData && this.pngImageData){
            // see https://pixijs.com/8.x/guides/migrations/v8
            let textureNew = PIXI.Texture.from(new PIXI.BufferImageSource({
                resource: this.pngImageData,
                width: this.pixiSpritesheetData.meta.size.w,
                height: this.pixiSpritesheetData.meta.size.h,
                alphaMode: "no-premultiply-alpha"
            }))

            this.pixiUserSpritesheet = new PIXI.Spritesheet(textureNew, this.pixiSpritesheetData);
            await this.pixiUserSpritesheet.parse()
        }

        return this.pixiUserSpritesheet;

    }

    resizeGraphicsDivHeight(){

        let canvases = this.graphicsDiv.getElementsByTagName('canvas');
        let height = 0;

        for(let i = 0; i < canvases.length; i++){
            let canvas = canvases[i];
            let cheight = canvas.getBoundingClientRect().height;
            if(cheight > height) height = cheight;
        }

        this.graphicsDiv.style.height = height + "px";
    }

    shrinkGraphicsDiv(){
        this.graphicsDiv.style.height = "0px";
    }

}