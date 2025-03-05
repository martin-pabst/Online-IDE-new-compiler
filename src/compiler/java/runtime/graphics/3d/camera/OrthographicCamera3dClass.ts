import * as THREE from 'three';
import { CallbackParameter } from "../../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { Camera3dClass } from './Camera3dClass';

export class OrthographicCamera3dClass extends Camera3dClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class OrthographicCamera3d extends Camera3d" },
        { type: "method", signature: "OrthographicCamera3d(double left, double right, double top, double bottom, double near, double far)", java: OrthographicCamera3dClass.prototype._cj$_constructor_$OrthographicCamera3d$double$double$double$double$double$double },
    ];

    static type: NonPrimitiveType;

    getObject3d(): THREE.Object3D {
        return this.camera3d;
    }

    _cj$_constructor_$OrthographicCamera3d$double$double$double$double$double$double(t: Thread, callback: CallbackParameter, left: number, right: number, top: number, bottom: number, near: number, far: number) {
        this.camera3d = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        super._cj$_constructor_$Camera3d$(t, callback);
    }

}