import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { Mesh3dClass } from "./Mesh3dClass";

export class Cone3dClass extends Mesh3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Cone3d extends Mesh3d"},
        { type: "method", signature: "Cone3d(double radius, double height, int radialSegments, int heightSegments, boolean openEnded, double thetaStart, double thetaLength)", java: Cone3dClass.prototype._cj$_constructor_$Cone3d$double$double$int$int$boolean$double$double},
        { type: "method", signature: "Cone3d(double radius, double height, int radialSegments, int heightSegments, boolean openEnded)", java: Cone3dClass.prototype._cj$_constructor_$Cone3d$double$double$int$int$boolean},
        { type: "method", signature: "Cone3d(double radius, double height)", java: Cone3dClass.prototype._cj$_constructor_$Cone3d$double$double},
        { type: "method", signature: "Cone3d()", java: Cone3dClass.prototype._cj$_constructor_$Cone3d$ }
    ];

        _cj$_constructor_$Cone3d$double$double$int$int$boolean$double$double(t: Thread, callback: CallbackParameter, 
            radius: number, h: number,
        radialSegments: number, heightSegments: number, openEnded: boolean, thetaStart: number, thetaLength: number) {
            
            thetaStart *= Math.PI/180;
            thetaLength *= Math.PI/180;
    
            super._cj$_constructor_$Mesh3d$(t, ()=>{
                const geometry = new THREE.ConeGeometry(radius, h, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
    
                this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
                this.world3d.scene.add(this.mesh);
                if(callback)callback();
            });
    
        }
    
        _cj$_constructor_$Cone3d$double$double$int$int$boolean(t: Thread, callback: CallbackParameter, 
            radius: number, h: number,
        radialSegments: number, heightSegments: number, openEnded: boolean) {
            super._cj$_constructor_$Mesh3d$(t, ()=>{
                const geometry = new THREE.ConeGeometry(radius, h, radialSegments, heightSegments, openEnded);
    
                this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
                this.world3d.scene.add(this.mesh);
                if(callback)callback();
            });
    
        }
    
        _cj$_constructor_$Cone3d$double$double(t: Thread, callback: CallbackParameter, radius:number, h: number) {
            super._cj$_constructor_$Mesh3d$(t, ()=>{
                const geometry = new THREE.ConeGeometry(radius, h);
    
                this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
                this.world3d.scene.add(this.mesh);
                if(callback)callback();
            });
    
        }
    
    

    _cj$_constructor_$Cone3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{
            const geometry = new THREE.ConeGeometry(0.5, 1);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

}