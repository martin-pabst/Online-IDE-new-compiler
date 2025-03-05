import * as THREE from 'three';
import { CallbackParameter } from "../../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { Camera3dClass } from './Camera3dClass';

export class PerspectiveCamera3dClass extends Camera3dClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class PerspectiveCamera3d extends Camera3d" },
        { type: "method", signature: "PerspectiveCamera3d(double fov, double aspect, double near, double far)", java: PerspectiveCamera3dClass.prototype._cj$_constructor_$PerspectiveCamera3d$double$double$double$double },
        { type: "method", signature: "void setViewport(double xRel, double yRel, double widthRel, double heightRel)", native: PerspectiveCamera3dClass.prototype._setViewport},
    ];

    static type: NonPrimitiveType;

    viewportRelativeCoordinates?: number[];

    getObject3d(): THREE.Object3D {
        return this.camera3d;
    }

    _cj$_constructor_$PerspectiveCamera3d$double$double$double$double(t: Thread, callback: CallbackParameter, fov: number, aspect: number, near: number, far: number) {
        this.camera3d = new THREE.PerspectiveCamera(fov, aspect, near, far);
        super._cj$_constructor_$Camera3d$(t, callback);
    }

    _setViewport(xRel: number, yRel: number, widthRel: number, heightRel: number){

        this.viewportRelativeCoordinates = [xRel, yRel, widthRel, heightRel];

        let dimensions = this.world3d.graphicsDiv!.getBoundingClientRect();
        xRel *= dimensions.width;
        yRel *= dimensions.height;

        widthRel *= dimensions.width;
        heightRel *= dimensions.height;

        (<THREE.PerspectiveCamera>this.camera3d).viewport = new THREE.Vector4(xRel, yRel, widthRel, heightRel);
        (<THREE.PerspectiveCamera>this.camera3d).updateProjectionMatrix();
        this.camera3d.updateMatrixWorld();
        
    }

    updateViewport(){
        if(this.viewportRelativeCoordinates){
            this._setViewport(this.viewportRelativeCoordinates[0], this.viewportRelativeCoordinates[1], this.viewportRelativeCoordinates[2], this.viewportRelativeCoordinates[3]);
        }
    }

}