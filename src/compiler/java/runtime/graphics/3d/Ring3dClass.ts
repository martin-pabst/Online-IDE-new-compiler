import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { Mesh3dClass } from "./Mesh3dClass";

export class Ring3dClass extends Mesh3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Ring3d extends Mesh3d"},
        { type: "method", signature: "Ring3d(double innerRadius, double outerRadius, int thetaSegments, int phiSegments, double thetaStart, double thetaLength)", java: Ring3dClass.prototype._cj$_constructor_$Ring3d$double$double$int$int$double$double},
        { type: "method", signature: "Ring3d(double innerRadius, double outerRadius, int thetaSegments, int phiSegments)", java: Ring3dClass.prototype._cj$_constructor_$Ring3d$double$double$int$int},
        { type: "method", signature: "Ring3d(double innerRadius, double outerRadius)", java: Ring3dClass.prototype._cj$_constructor_$Ring3d$double$double},
        { type: "method", signature: "Ring3d()", java: Ring3dClass.prototype._cj$_constructor_$Ring3d$ }
    ];

    _cj$_constructor_$Ring3d$double$double$int$int$double$double(t: Thread, callback: CallbackParameter, innerRadius: number, 
        outerRadius, thetaSegments: number, phiSegments: number, thetaStart: number, thetaLength: number) {
            thetaStart *= Math.PI/180;
            thetaLength *= Math.PI/180;
            super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();
        });

    }

    _cj$_constructor_$Ring3d$double$double$int$int(t: Thread, callback: CallbackParameter, innerRadius: number, outerRadius, thetaSegments: number, phiSegments: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);

            if(callback)callback();
        });

    }

    _cj$_constructor_$Ring3d$double$double(t: Thread, callback: CallbackParameter, innerRadius: number, outerRadius) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.RingGeometry(innerRadius, outerRadius);

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