import * as THREE from 'three';
import { CallbackParameter } from "../../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { Camera3dClass } from './Camera3dClass';
import { PerspectiveCamera3dClass } from './PerspectiveCamera3dClass';

export class ArrayCamera3dClass extends Camera3dClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class ArrayCamera3d extends Camera3d" },
        { type: "method", signature: "ArrayCamera3d(PerspectiveCamera3d[] cameras)", java: ArrayCamera3dClass.prototype._cj$_constructor_$ArrayCamera3d$PerspectiveCamera3dII },
    ];

    static type: NonPrimitiveType;

    cameras: PerspectiveCamera3dClass[];

    getObject3d(): THREE.Object3D {
        return this.camera3d;
    }

    _cj$_constructor_$ArrayCamera3d$PerspectiveCamera3dII(t: Thread, callback: CallbackParameter, cameras: PerspectiveCamera3dClass[]) {
        this.cameras = cameras;
        this.camera3d = new THREE.ArrayCamera(cameras.map(c => <THREE.PerspectiveCamera>c.camera3d));
        super._cj$_constructor_$Camera3d$(t, callback);
    }

    updateViewport(): void {
        this.cameras.forEach(c => c.updateViewport());
    }

}