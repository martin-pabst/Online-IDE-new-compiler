import * as THREE from 'three';
import { CallbackParameter } from '../../../../../common/interpreter/CallbackParameter';
import { Thread } from '../../../../../common/interpreter/Thread';
import { LibraryDeclarations } from '../../../../module/libraries/LibraryTypeDeclaration';
import { NonPrimitiveType } from '../../../../types/NonPrimitiveType';
import { Vector3Class } from '../Vector3Class';
import { Light3dClass } from './Light3dClass';
import { Object3dClass } from '../Object3dClass';

export class DirectionalLight3dClass extends Light3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class DirectionalLight3d extends Light3d" },
        { type: "method", signature: "DirectionalLight3d()", java: DirectionalLight3dClass.prototype._cj$_constructor_$DirectionalLight3d$ },
        { type: "method", signature: "DirectionalLight3d(double x,double y,double z)", java: DirectionalLight3dClass.prototype._cj$_constructor_$DirectionalLight3d$double$double$double$ },
        { type: "method", signature: "DirectionalLight3d(Vector3 position)", java: DirectionalLight3dClass.prototype._cj$_constructor_$DirectionalLight3d$double$double$double$ },
        { type: "method", signature: "DirectionalLight3d setTarget(Object3d object3d)", native: DirectionalLight3dClass.prototype._setTarget },
    ];

    static type: NonPrimitiveType;

    constructor(){
        super();
        this.light=new THREE.DirectionalLight();
    }

    _cj$_constructor_$DirectionalLight3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Light3d$(t, () => {
            if (callback) callback();
        });
    }
    _cj$_constructor_$DirectionalLight3d$double$double$double$(t: Thread, callback: CallbackParameter,x:number,y:number,z:number) {
        this._cj$_constructor_$DirectionalLight3d$(t,() => {
            this.light.position.set(x,y,z);
            if (callback) callback();
        });
    }
    _cj$_constructor_$DirectionalLight3d$Vector3$(t: Thread, callback: CallbackParameter,position:Vector3Class) {
        this._cj$_constructor_$DirectionalLight3d$(t,() => {
            this.light.position.set(position.v.x,position.v.y,position.v.z);
            if (callback) callback();
        });
    }

    _setTarget(object3d: Object3dClass){
        const light = <THREE.DirectionalLight>this.light;
        light.target = object3d.getObject3d();
        return this;
    }

}