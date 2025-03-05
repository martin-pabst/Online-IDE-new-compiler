import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { Mesh3dClass } from "./Mesh3dClass";

export class Icosahedron3dClass extends Mesh3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Icosahedron3d extends Mesh3d"},
        { type: "method", signature: "Icosahedron3d(double radius, int detail)", 
            java: Icosahedron3dClass.prototype._cj$_constructor_$Icosahedron3d$double$int },
        { type: "method", signature: "Icosahedron3d(double radius)", java: Icosahedron3dClass.prototype._cj$_constructor_$Icosahedron3d$double },
        { type: "method", signature: "Icosahedron3d()", java: Icosahedron3dClass.prototype._cj$_constructor_$Icosahedron3d$ }
    ];


    _cj$_constructor_$Icosahedron3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{

            const geometry = new THREE.IcosahedronGeometry(0.5);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

    _cj$_constructor_$Icosahedron3d$double(t: Thread, callback: CallbackParameter, radius: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{

            const geometry = new THREE.IcosahedronGeometry(radius);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }

    _cj$_constructor_$Icosahedron3d$double$int(t: Thread, callback: CallbackParameter, radius: number, detail: number) {
        super._cj$_constructor_$Mesh3d$(t, ()=>{

            const geometry = new THREE.IcosahedronGeometry(radius, detail);

            this.mesh = new THREE.Mesh(geometry, this.getInitialMaterial().getMaterialAndIncreaseUsageCounter());
            this.world3d.scene.add(this.mesh);
            if(callback)callback();
        });
    }


}