import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { Mesh3dClass } from "./Mesh3dClass";
import earthDayMap from "/assets/graphics/textures/2k_earth_daymap.jpg";

export class Sphere3dClass extends Mesh3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Sphere3d extends Mesh3d"},
        { type: "method", signature: "Sphere3d(double radius, int widthSegments, int heightSegments, double phiStart, double phiLength, double thetastart, double thetaLength)", 
            java: Sphere3dClass.prototype._cj$_constructor_$Sphere3d$double$int$int$double$double$double$double },
        { type: "method", signature: "Sphere3d(double radius, int widthSegments, int heightSegments)", java: Sphere3dClass.prototype._cj$_constructor_$Sphere3d$double$int$int },
        { type: "method", signature: "Sphere3d(double radius)", java: Sphere3dClass.prototype._cj$_constructor_$Sphere3d$double },
        { type: "method", signature: "Sphere3d()", java: Sphere3dClass.prototype._cj$_constructor_$Sphere3d$ }
    ];


    _cj$_constructor_$Sphere3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{

            const geometry = new THREE.SphereGeometry(0.5);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

    _cj$_constructor_$Sphere3d$double(t: Thread, callback: CallbackParameter, radius: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{

            const geometry = new THREE.SphereGeometry(radius);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

    _cj$_constructor_$Sphere3d$double$int$int(t: Thread, callback: CallbackParameter, radius: number, 
        widthSegments: number, heightSegments: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{

            const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

    _cj$_constructor_$Sphere3d$double$int$int$double$double$double$double(t: Thread, callback: CallbackParameter, radius: number, 
        widthSegments: number, heightSegments: number, phiStart: number, phiLength: number, thetaStart: number, thetaLength: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            phiStart = phiStart/180*Math.PI;
            phiLength = phiLength/180*Math.PI;
            thetaStart = thetaStart/180*Math.PI;
            thetaLength = thetaLength/180*Math.PI;

            const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 
                phiStart, phiLength, thetaStart, thetaLength);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

}