import * as THREE from 'three';
import { CallbackParameter } from "../../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/DeclareType";
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

        // See https://stackoverflow.com/questions/64398567/using-arraycamera-causes-objects-outside-of-1-unit-disappear/64425887#64425887
        // and https://discourse.threejs.org/t/objects-out-of-fustrum-when-using-arraycamera/19683/5
        let dummyCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 2e6);
        dummyCamera.position.set(0, 0, 1e3);
        dummyCamera.lookAt(new THREE.Vector3(0, 0, 0));

        let arrayCamera = <THREE.ArrayCamera>this.camera3d;
        arrayCamera.position.copy(dummyCamera.position);
        arrayCamera.projectionMatrix.copy(dummyCamera.projectionMatrix);

        super._cj$_constructor_$Camera3d$(t, callback);
    }

    updateViewport(): void {
        this.cameras.forEach(c => c.updateViewport());
    }

}