import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { Mesh3dClass } from "./Mesh3dClass";

export class Torus3dClass extends Mesh3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Torus3d extends Mesh3d"},
        { type: "method", signature: "Torus3d(double radius, double tube, int radialSegments, int tubularSegments, double arc)", java: Torus3dClass.prototype._cj$_constructor_$Torus3d$double$double$int$int$double},
        { type: "method", signature: "Torus3d(double radius, double tube, int radialSegments, int tubularSegments)", java: Torus3dClass.prototype._cj$_constructor_$Torus3d$double$double$int$int},
        { type: "method", signature: "Torus3d()", java: Torus3dClass.prototype._cj$_constructor_$Torus3d$ }
    ];

    _cj$_constructor_$Torus3d$double$double$int$int$double(t: Thread, callback: CallbackParameter, radius: number, tube: number, radialSegments: number, tubularSegments: number, arc: number) {
        arc *= Math.PI/180;
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();
        });

    }

    _cj$_constructor_$Torus3d$double$double$int$int(t: Thread, callback: CallbackParameter, radius: number, tube: number, radialSegments: number, tubularSegments: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();
        });

    }

    _cj$_constructor_$Torus3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.TorusGeometry(2, 0.5, 20, 32);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

}