import * as THREE from 'three';
import { CallbackParameter } from '../../../../../common/interpreter/CallbackParameter';
import { Thread } from '../../../../../common/interpreter/Thread';
import { LibraryDeclarations } from '../../../../module/libraries/LibraryTypeDeclaration';
import { NonPrimitiveType } from '../../../../types/NonPrimitiveType';
import { Light3dClass } from './Light3dClass';

export class AmbientLight3dClass extends Light3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class AmbientLight3d extends Light3d" },
        { type: "method", signature: "AmbientLight3d()", java: AmbientLight3dClass.prototype._cj$_constructor_$AmbientLight3d$ },
        { type: "method", signature: "AmbientLight3d(double intensity)", java: AmbientLight3dClass.prototype._cj$_constructor_$AmbientLight3d$double },

    ];

    static type: NonPrimitiveType;

    constructor(){
        super();
        this.light=new THREE.AmbientLight();
    }

    _cj$_constructor_$AmbientLight3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Light3d$(t, () => {
            if (callback) callback();
        });
    }

    _cj$_constructor_$AmbientLight3d$double(t: Thread, callback: CallbackParameter, intensity: number) {
        super._cj$_constructor_$Light3d$(t, () => {
            this.light.intensity = intensity;
            if (callback) callback();
        });
    }

}