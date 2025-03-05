import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { Mesh3dClass } from "./Mesh3dClass";
import { SpriteLibraryEnum } from '../SpriteLibraryEnum';
import { RuntimeExceptionClass } from '../../system/javalang/RuntimeException';

export class Box3dClass extends Mesh3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Box3d extends Mesh3d", comment: JRC.box3dClassComment },
        { type: "method", signature: "Box3d(double width, double height, double depth, int widthSegments, int heightSegments, int depthSegments)", java: Box3dClass.prototype._cj$_constructor_$Box3d$double$double$double$int$int$int, comment: JRC.box3dConstructorXYZComment },
        { type: "method", signature: "Box3d(double width, double height, double depth)", java: Box3dClass.prototype._cj$_constructor_$Box3d$double$double$double, comment: JRC.box3dConstructorXYZComment },
        { type: "method", signature: "Box3d()", java: Box3dClass.prototype._cj$_constructor_$Box3d$, comment: JRC.box3dConstructorComment },
        
        { type: "method", signature: "void setCubemapTexture(SpriteLibrary spriteLibrary, int imageIndex)", native: Box3dClass.prototype._setCubemapTexture },
        { type: "method", signature: "void setSingleTextureForAllSides(SpriteLibrary spriteLibrary, int imageIndex)", native: Box3dClass.prototype._setSingleTextureForAllSides },
        { type: "method", signature: "void setTextures(SpriteLibrary spriteLibrary, int[] imageIndices)", native: Box3dClass.prototype._setTextures },

    ];

    static cubemapUvCoordinates = new Float32Array([
        2/4, 2/3, 3/4, 2/3, 2/4, 1/3, 3/4, 1/3,  // right side
        0/4, 2/3, 1/4, 2/3, 0/4, 1/3, 1/4, 1/3,  // left side
        1/4, 3/3, 2/4, 3/3, 1/4, 2/3, 2/4, 2/3, // top
        1/4, 1/3, 2/4, 1/3, 1/4, 0/3, 2/4, 0/3, // bottom
        1/4, 2/3, 2/4, 2/3, 1/4, 1/3, 2/4, 1/3,  // front
        3/4, 2/3, 4/4, 2/3, 3/4, 1/3, 4/4, 1/3,  // back
    ]);

    static singleTextureUvCoordinates = new Float32Array([
        0, 1, 1, 1, 0, 0, 1, 0,
        0, 1, 1, 1, 0, 0, 1, 0,
        0, 1, 1, 1, 0, 0, 1, 0,
        0, 1, 1, 1, 0, 0, 1, 0,
        0, 1, 1, 1, 0, 0, 1, 0,
        0, 1, 1, 1, 0, 0, 1, 0,
    ]);


    _cj$_constructor_$Box3d$double$double$double$int$int$int(t: Thread, callback: CallbackParameter, width: number, height: number, depth: number,
        widthSegments: number, heightSegments: number, depthSegments: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{

            const geometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();

        });
    }

    _cj$_constructor_$Box3d$double$double$double(t: Thread, callback: CallbackParameter, width: number, height: number, depth: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{

            const geometry = new THREE.BoxGeometry(width, height, depth);
            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();

        });
    }

    _cj$_constructor_$Box3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{

            const geometry = new THREE.BoxGeometry();
            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();

        });
    }

    _setCubemapTexture(spriteLibrary: SpriteLibraryEnum, imageIndex: number){
        let texture = this.world3d.textureManager3d.getSpritesheetBasedTexture(spriteLibrary.name, imageIndex);

        this.mesh.geometry.attributes.uv = new THREE.BufferAttribute(Box3dClass.cubemapUvCoordinates , 2 );

        this.mesh.geometry.attributes.uv.needsUpdate = true;

        this.mesh.material = new THREE.MeshLambertMaterial({
            map: texture
        })

    }

    _setSingleTextureForAllSides(spriteLibrary: SpriteLibraryEnum, imageIndex: number){
        let texture = this.world3d.textureManager3d.getSpritesheetBasedTexture(spriteLibrary.name, imageIndex);

        this.mesh.geometry.attributes.uv = new THREE.BufferAttribute(Box3dClass.singleTextureUvCoordinates , 2 );

        this.mesh.geometry.attributes.uv.needsUpdate = true;

        this.mesh.material = new THREE.MeshLambertMaterial({
            map: texture
        })

    }

    _setTextures(spriteLibrary: SpriteLibraryEnum, imageIndices: number[]){
        if(imageIndices?.length != 6){
            throw new RuntimeExceptionClass(JRC.box3dYouNeedSixTexturesError());
        }

        let textures: THREE.Texture[] = [];
        for(let i = 0; i < 6; i++){
            textures[i] = this.world3d.textureManager3d.getSpritesheetBasedTexture(spriteLibrary.name, imageIndices[i]);
        }

        this.mesh.geometry.attributes.uv = new THREE.BufferAttribute(Box3dClass.singleTextureUvCoordinates , 2 );

        this.mesh.geometry.attributes.uv.needsUpdate = true;

        this.mesh.material = textures.map(texture => new THREE.MeshLambertMaterial({
            map: texture
        }))

    }




}