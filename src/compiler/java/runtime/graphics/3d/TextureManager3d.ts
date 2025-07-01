import * as THREE from 'three';
import { PixiSpritesheetData } from '../../../../../client/spritemanager/PixiSpritesheetData';
import { Interpreter } from '../../../../common/interpreter/Interpreter';
import { JRC } from '../../../language/JavaRuntimeLibraryComments';
import { RuntimeExceptionClass } from '../../system/javalang/RuntimeException';
import spritesheetjson from '/assets/graphics/spritesheet.json.txt';
import spritesheetpng from '/assets/graphics/spritesheet.png';

export class TextureManager3d {

    systemSpritesheetData: PixiSpritesheetData;
    systemTexture: THREE.Texture;

    userSpritesheetData: PixiSpritesheetData;
    userTexture: THREE.Texture;

    textureCache: Map<string, THREE.Texture> = new Map();


    async init(interpreter: Interpreter) {

        /**
         * Create systemTexture
         */

        this.systemTexture = await new THREE.TextureLoader().loadAsync(spritesheetpng);
        this.systemTexture.colorSpace = THREE.SRGBColorSpace;
        this.systemTexture.magFilter = THREE.NearestFilter;

        this.systemTexture.needsUpdate = true;

        this.systemSpritesheetData = await (await fetch(spritesheetjson)).json();


        /**
         * Create userTexture
         */
        let graphicsManager = interpreter.graphicsManager;
        if (graphicsManager && graphicsManager.pixiSpritesheetData) {
            this.userSpritesheetData = graphicsManager.pixiSpritesheetData;
            this.userTexture = new THREE.DataTexture(graphicsManager.pngImageData, this.userSpritesheetData.meta.size.w, this.userSpritesheetData.meta.size.h,
                THREE.RGBAFormat, THREE.UnsignedByteType, undefined, undefined, undefined, THREE.NearestFilter, THREE.NearestFilter, undefined, THREE.SRGBColorSpace,
            )
            this.userTexture.needsUpdate = true;
            // this.userTexture.type = THREE.UnsignedByteType;
        }


    }

    getFrame(spritesheet: string, index: number) {
        let key: string = spritesheet + "#" + index;
        let frame = this.systemSpritesheetData.frames[key];

        if (frame) {
            frame.isSystemSpritesheet = true;
        } else {
            frame = this.userSpritesheetData?.frames[key];
            if (frame) frame.isSystemSpritesheet = false;
        }

        return frame;

    }

    getSpritesheetBasedTexture(spritesheet: string, index: number) {
        let key: string = spritesheet + "#" + index;
        let frame = this.systemSpritesheetData.frames[key];
        let t: THREE.Texture;
        let isUserTexture: boolean = false;

        if (frame) {
            t = this.systemTexture.clone();
        } else {
            frame = this.userSpritesheetData?.frames[key];
            if (!frame) {
                throw new RuntimeExceptionClass(JRC.textureNotFoundError(spritesheet, index));
            }
            t = this.userTexture.clone();
            t.flipY = true;
            isUserTexture = true;
        }

        let data = frame.frame;

        t.userData["isPartOfSpritesheet"] = true;
        t.userData["width"] = data.w;
        t.userData["height"] = data.h;
        t.userData["key"] = key;

        if (isUserTexture) {
            t.repeat.set(data.w / this.userTexture.image.width, data.h / this.userTexture.image.height);
            t.offset.x = data.x / this.userTexture.image.width;
            t.offset.y = 1 - (data.h / this.userTexture.image.height + data.y / this.userTexture.image.height);
            // t.offset.y = data.y / this.userTexture.image.height;
        } else {
            t.repeat.set(data.w / this.systemTexture.image.width, data.h / this.systemTexture.image.height);
            t.offset.x = data.x / this.systemTexture.image.width;
            t.offset.y = 1 - data.h / this.systemTexture.image.height - data.y / this.systemTexture.image.height;
        }


        t.colorSpace = THREE.SRGBColorSpace;
        t.magFilter = THREE.NearestFilter;

        return t;
    }

    getTextureWithOwnData(key: string, renderer: THREE.WebGLRenderer) {
        let frame = this.systemSpritesheetData.frames[key];
        let t: THREE.Texture;
        if (frame) {
            t = this.systemTexture;
        } else {
            frame = this.userSpritesheetData?.frames[key];
            if (!frame) {
                throw new RuntimeExceptionClass(JRC.textureNotFoundError(key, 0));
            }
            t = this.userTexture;
        }

        let data = frame.frame;

        let topLeft = new THREE.Vector2(data.x, t.image.height - data.y - data.h);
        let bottomRight = topLeft.clone();
        bottomRight.x += data.w;
        bottomRight.y += data.h;

        // see https://github.com/mrdoob/three.js/issues/28282
        let renderTarget = new THREE.WebGLRenderTarget(data.w, data.h,
            {
                minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat,
                colorSpace: THREE.SRGBColorSpace
            }
        );

        let newTexture = renderTarget.texture;
        newTexture.wrapS = THREE.RepeatWrapping;
        newTexture.wrapT = THREE.RepeatWrapping;
        newTexture.flipY = true;


        renderer.initRenderTarget(renderTarget);
        renderer.copyTextureToTexture(t, newTexture, new THREE.Box2(topLeft, bottomRight))

        newTexture.userData["width"] = data.w;
        newTexture.userData["height"] = data.h;
        newTexture.userData["key"] = key;
        newTexture.userData["renderTarget"] = renderTarget;

        return newTexture;

    }

    // static cutoutTexture(t: THREE.Texture, renderer: THREE.WebGLRenderer): THREE.Texture {

    //     let imageWidth: number = Math.round(t.image.width);
    //     let imageHeight: number = Math.round(t.image.height);

    //     let textureWidth = Math.round(t.repeat.x * imageWidth);
    //     let textureHeight = Math.round(t.repeat.y * imageHeight);

    //     let v = new THREE.Vector2(textureWidth, textureHeight);
    //     let offset = new THREE.Vector2(Math.round(imageWidth * t.offset.x), imageHeight - Math.round(imageHeight * t.offset.y) - textureHeight);
    //     let max = offset.clone().add(v);

    //     let srcRegion = new THREE.Box2(offset, max);

    //     // see https://github.com/mrdoob/three.js/issues/28282
    //     let renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight,
    //         { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat,
    //             colorSpace: THREE.SRGBColorSpace
    //          }
    //     );

    //     renderer.initRenderTarget(renderTarget);
    //     renderer.copyTextureToTexture(t, renderTarget.texture, srcRegion)

    //     return renderTarget.texture;
    // }

    destroy(){
        this.systemTexture.dispose();
        this.userTexture.dispose();
    }

}