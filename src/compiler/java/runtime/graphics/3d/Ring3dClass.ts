import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { Mesh3dClass } from "./Mesh3dClass";

export class Ring3dClass extends Mesh3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Ring3d extends Mesh3d"},
        { type: "method", signature: "Ring3d(double innerRadius, double outerRadius, int numberOfSegments)", java: Ring3dClass.prototype._cj$_constructor_$Ring3d$double$double$int},
        { type: "method", signature: "Ring3d()", java: Ring3dClass.prototype._cj$_constructor_$Ring3d$ }
    ];

    _cj$_constructor_$Ring3d$double$double$int(t: Thread, callback: CallbackParameter, innerRadius: number, outerRadius, segments: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();
        });

    }

    _cj$_constructor_$Ring3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.RingGeometry(1, 2);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

}