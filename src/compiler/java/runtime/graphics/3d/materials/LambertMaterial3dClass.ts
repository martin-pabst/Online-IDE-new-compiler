import * as THREE from 'three';
import { JRC } from "../../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { ColorClass } from "../../ColorClass";
import { Material3dClass } from "./Material3dClass";
import { ColorConverter } from '../../ColorConverter';
import { TextureEnum } from './TextureEnum';
import { World3dClass } from '../World3dClass';
import { Thread } from '../../../../../common/interpreter/Thread';
import { CallbackParameter } from '../../../../../common/interpreter/CallbackParameter';
import { SpriteLibraryEnum } from '../../SpriteLibraryEnum';

export class LambertMaterial3dClass extends Material3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "final class LambertMaterial3d extends Material3d", comment: JRC.lambertMaterial3dClassComment },
        { type: "method", signature: "LambertMaterial3d(int color)", native: LambertMaterial3dClass.prototype._lambertMaterialConstructor, comment: JRC.lambertMaterial3dConstructorComment },
        { type: "method", signature: "LambertMaterial3d(string color)", native: LambertMaterial3dClass.prototype._lambertMaterialConstructor, comment: JRC.lambertMaterial3dConstructorComment },
        { type: "method", signature: "LambertMaterial3d(Color color)", native: LambertMaterial3dClass.prototype._lambertMaterialConstructor, comment: JRC.lambertMaterial3dConstructorComment },

        { type: "method", signature: "LambertMaterial3d(Texture texture)", native: LambertMaterial3dClass.prototype._lambertMaterialConstructorTexture, comment: JRC.lambertMaterial3dConstructorTextureComment },
        { type: "method", signature: "LambertMaterial3d(SpriteLibrary spriteLibrary, int imageIndex)", java: LambertMaterial3dClass.prototype._cj$_constructor_$LambertMaterial3d$SpriteLibrary$int, comment: JRC.lambertMaterial3dConstructorSpriteLibraryComment },

        { type: "field", signature: "private int emissive", comment: JRC.material3dEmissiveComment },
        { type: "method", signature: "void setEmissive(int color)", native: LambertMaterial3dClass.prototype._setEmissive, comment: JRC.material3dEmissiveComment },
        { type: "method", signature: "void setEmissive(string color)", native: LambertMaterial3dClass.prototype._setEmissive, comment: JRC.material3dEmissiveComment },
        { type: "method", signature: "void setEmissive(Color color)", native: LambertMaterial3dClass.prototype._setEmissive, comment: JRC.material3dEmissiveComment },
        { type: "method", signature: "int getEmissive()", template: "§1.emissive", comment: JRC.material3dEmissiveComment },

        { type: "field", signature: "boolean wireframe", comment: JRC.materialWireframeComment },
        { type: "method", signature: "boolean isWireframe()", template: "§1.material.wireframe", comment: JRC.materialWireframeComment },
        { type: "method", signature: "void setWireframe(boolean value)", template: "§1.material.wireframe = §2", comment: JRC.materialWireframeComment },

    ]

    get wireframe(): boolean {
        return (<THREE.MeshLambertMaterial>this.material).wireframe;
    }


    get emissive(): number {
        let c = (<THREE.MeshLambertMaterial>this.material).emissive;
        if (!c) return 0x000000;
        return Math.round(c.r * 0xff0000 + c.g * 0xff00 + c.b * 0xff);
    }


    _lambertMaterialConstructorTexture(texture: TextureEnum) {
        const loader = new THREE.TextureLoader();
        this.material = new THREE.MeshLambertMaterial({
            map: loader.load(texture.path)
        })
        return this;
    }


    _cj$_constructor_$LambertMaterial3d$SpriteLibrary$int(t: Thread, callback: CallbackParameter, library: SpriteLibraryEnum, index: number) {

        t.s.push(this);
        let world3d: World3dClass = t.scheduler.interpreter.retrieveObject("World3dClass");
        if (!world3d) {
            world3d = new World3dClass();
            world3d._cj$_constructor_$World3d$(t, () => {
                t.s.pop(); // constructor of world3d pushed it's this-object

                this.createMaterialWithTexture(world3d, library.name, index);

                if (callback) callback();
            })
            return;
        }

        this.createMaterialWithTexture(world3d, library.name, index);
        if (callback) callback();
    }

    createMaterialWithTexture(world3d: World3dClass, name: string, index: number) {
        let texture = world3d.textureManager3d.getSpritesheetBasedTexture(name, index);
        this.material = new THREE.MeshLambertMaterial({
            map: texture
        })
    }


    _setEmissive(color: number | string | ColorClass) {
        (<THREE.MeshLambertMaterial>this.material).emissive = ColorConverter.convertToThreeJsColor(color);
    }

    _lambertMaterialConstructor(color: number | string | ColorClass) {
        this.material = new THREE.MeshLambertMaterial({
            color: ColorConverter.convertToThreeJsColor(color)
        })
        return this;
    }

}