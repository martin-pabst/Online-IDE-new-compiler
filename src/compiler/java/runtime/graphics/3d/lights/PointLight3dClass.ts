import * as THREE from 'three';
import { CallbackParameter } from '../../../../../common/interpreter/CallbackParameter';
import { Thread } from '../../../../../common/interpreter/Thread';
import { LibraryDeclarations } from '../../../../module/libraries/LibraryTypeDeclaration';
import { NonPrimitiveType } from '../../../../types/NonPrimitiveType';
import { Vector3Class } from '../Vector3Class';
import { Light3dClass } from './Light3dClass';

export class PointLight3dClass extends Light3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class PointLight3d extends Light3d" },
        { type: "method", signature: "PointLight3d()", java: PointLight3dClass.prototype._cj$_constructor_$PointLight3d$ },
        { type: "method", signature: "PointLight3d(double x,double y,double z)", java: PointLight3dClass.prototype._cj$_constructor_$PointLight3d$double$double$double$ },
        { type: "method", signature: "PointLight3d(Vector3 position)", java: PointLight3dClass.prototype._cj$_constructor_$PointLight3d$double$double$double$ },
    ];

    static type: NonPrimitiveType;

    constructor(){
        super();
        this.light=new THREE.PointLight();
    }

    _cj$_constructor_$PointLight3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Light3d$(t, () => {
            if (callback) callback();
        });
    }
    _cj$_constructor_$PointLight3d$double$double$double$(t: Thread, callback: CallbackParameter,x:number,y:number,z:number) {
        this._cj$_constructor_$PointLight3d$(t,() => {
            this.light.position.set(x,y,z);
            if(callback) callback();
        });
    }
    _cj$_constructor_$PointLight3d$Vector3$(t: Thread, callback: CallbackParameter,position:Vector3Class) {
        this._cj$_constructor_$PointLight3d$(t, () => {
            this.light.position.set(position.v.x,position.v.y,position.v.z);
            if(callback) callback();
        });
    }

}