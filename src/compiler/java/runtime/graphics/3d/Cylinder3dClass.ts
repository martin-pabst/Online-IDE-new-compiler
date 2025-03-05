import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { Mesh3dClass } from "./Mesh3dClass";

export class Cylinder3dClass extends Mesh3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Cylinder3d extends Mesh3d"},
        { type: "method", signature: "Cylinder3d(double radiusTop, double radiusBottom, double height, int radialSegments, int heightSegments, boolean openEnded, double thetaStart, double thetaLength)", java: Cylinder3dClass.prototype._cj$_constructor_$Cylinder3d$double$double$double$int$int$boolean$double$double},
        { type: "method", signature: "Cylinder3d(double radiusTop, double radiusBottom, double height, int radialSegments, int heightSegments, boolean openEnded)", java: Cylinder3dClass.prototype._cj$_constructor_$Cylinder3d$double$double$double$int$int$boolean},
        { type: "method", signature: "Cylinder3d(double radiusTop, double radiusBottom, double height)", java: Cylinder3dClass.prototype._cj$_constructor_$Cylinder3d$double$double$double},
        { type: "method", signature: "Cylinder3d(double radius, double height)", java: Cylinder3dClass.prototype._cj$_constructor_$Cylinder3d$double$double},
        { type: "method", signature: "Cylinder3d()", java: Cylinder3dClass.prototype._cj$_constructor_$Cylinder3d$ }
    ];

    _cj$_constructor_$Cylinder3d$double$double$double$int$int$boolean$double$double(t: Thread, callback: CallbackParameter, 
        rTop:number, rBottom: number, h: number,
    radialSegments: number, heightSegments: number, openEnded: boolean, thetaStart: number, thetaLength: number) {
        
        thetaStart *= Math.PI/180;
        thetaLength *= Math.PI/180;

        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.CylinderGeometry(rTop, rBottom, h, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });

    }

    _cj$_constructor_$Cylinder3d$double$double$double$int$int$boolean(t: Thread, callback: CallbackParameter, 
        rTop:number, rBottom: number, h: number,
    radialSegments: number, heightSegments: number, openEnded: boolean) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.CylinderGeometry(rTop, rBottom, h, radialSegments, heightSegments, openEnded);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });

    }

    _cj$_constructor_$Cylinder3d$double$double$double(t: Thread, callback: CallbackParameter, rTop:number, rBottom: number, h: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.CylinderGeometry(rTop, rBottom, h);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });

    }

    _cj$_constructor_$Cylinder3d$double$double(t: Thread, callback: CallbackParameter, radius:number, h: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.CylinderGeometry(radius, radius, h);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });

    }

    _cj$_constructor_$Cylinder3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

}