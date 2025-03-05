import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { Mesh3dClass } from "./Mesh3dClass";

export class Plane3dClass extends Mesh3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Plane3d extends Mesh3d"},
        { type: "method", signature: "Plane3d(double width, double height, int widthSegments, int heightSegments)", java: Plane3dClass.prototype._cj$_constructor_$Plane3d$double$double$int$int},
        { type: "method", signature: "Plane3d(double width, double height)", java: Plane3dClass.prototype._cj$_constructor_$Plane3d$double$double},
        { type: "method", signature: "Plane3d()", java: Plane3dClass.prototype._cj$_constructor_$Plane3d$ }
    ];

    _cj$_constructor_$Plane3d$double$double$int$int(t: Thread, callback: CallbackParameter, width: number, height: number, widthSegments: number, heightSegments: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();
        });

    }

    _cj$_constructor_$Plane3d$double$double(t: Thread, callback: CallbackParameter, width: number, height: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.PlaneGeometry(width, height);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();
        });

    }

    _cj$_constructor_$Plane3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.PlaneGeometry(1, 1);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

}