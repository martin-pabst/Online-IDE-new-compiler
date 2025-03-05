import * as THREE from 'three';
import { JRC } from "../../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { ColorClass } from "../../ColorClass";
import { Material3dClass } from "./Material3dClass";
import { ColorConverter } from '../../ColorConverter';
import { CallbackParameter } from '../../../../../common/interpreter/CallbackParameter';
import { Thread } from '../../../../../common/interpreter/Thread';
import { SpriteLibraryEnum } from '../../SpriteLibraryEnum';
import { World3dClass } from '../World3dClass';
import { TextureEnum } from './TextureEnum';

export class PhongMaterial3dClass extends Material3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "final class PhongMaterial3d extends Material3d", comment: JRC.phongMaterial3dClassComment },
        { type: "method", signature: "PhongMaterial3d(int color)", native: PhongMaterial3dClass.prototype._phongMaterialConstructor, comment: JRC.phongMaterial3dConstructorComment },
        { type: "method", signature: "PhongMaterial3d(int color, double shininess)", native: PhongMaterial3dClass.prototype._phongMaterialConstructor, comment: JRC.phongMaterial3dConstructorComment },
        { type: "method", signature: "PhongMaterial3d(string color, double shininess)", native: PhongMaterial3dClass.prototype._phongMaterialConstructor, comment: JRC.phongMaterial3dConstructorComment },
        { type: "method", signature: "PhongMaterial3d(Color color, double shininess)", native: PhongMaterial3dClass.prototype._phongMaterialConstructor, comment: JRC.phongMaterial3dConstructorComment },


        { type: "method", signature: "PhongMaterial3d(Texture texture)", native: PhongMaterial3dClass.prototype._phongMaterialConstructorTexture, comment: JRC.phongMaterial3dConstructorTextureComment },
        { type: "method", signature: "PhongMaterial3d(SpriteLibrary spriteLibrary, int imageIndex)", java: PhongMaterial3dClass.prototype._cj$_constructor_$PhongMaterial3d$SpriteLibrary$int, comment: JRC.phongMaterial3dConstructorSpriteLibraryComment },


        { type: "field", signature: "private double shininess", template: "§1.material.shininess", comment: JRC.phongMaterial3dShininessComment },
        { type: "method", signature: "void setShininess(double shininess)", template: "§1.material.shininess = §2", comment: JRC.phongMaterial3dShininessComment },
        { type: "method", signature: "double getShininess()", template: "§1.materialshininess", comment: JRC.phongMaterial3dShininessComment },

        { type: "field", signature: "private int specular", comment: JRC.phongMaterial3dSpecularComment },
        { type: "method", signature: "void setSpecular(int color)", native: PhongMaterial3dClass.prototype._setSpecular, comment: JRC.phongMaterial3dSpecularComment },
        { type: "method", signature: "void setSpecular(string color)", native: PhongMaterial3dClass.prototype._setSpecular, comment: JRC.phongMaterial3dSpecularComment },
        { type: "method", signature: "void setSpecular(Color color)", native: PhongMaterial3dClass.prototype._setSpecular, comment: JRC.phongMaterial3dSpecularComment },
        { type: "method", signature: "int getSpecular()", template: "§1.specular", comment: JRC.phongMaterial3dSpecularComment },

        { type: "field", signature: "private int emissive", comment: JRC.material3dEmissiveComment },
        { type: "method", signature: "void setEmissive(int color)", native: PhongMaterial3dClass.prototype._setEmissive, comment: JRC.material3dEmissiveComment },
        { type: "method", signature: "void setEmissive(string color)", native: PhongMaterial3dClass.prototype._setEmissive, comment: JRC.material3dEmissiveComment },
        { type: "method", signature: "void setEmissive(Color color)", native: PhongMaterial3dClass.prototype._setEmissive, comment: JRC.material3dEmissiveComment },
        { type: "method", signature: "int getEmissive()", template: "§1.emissive", comment: JRC.material3dEmissiveComment },

        { type: "field", signature: "boolean wireframe", comment: JRC.materialWireframeComment },
        { type: "method", signature: "boolean isWireframe()", template: "§1.material.wireframe", comment: JRC.materialWireframeComment },
        { type: "method", signature: "void setWireframe(boolean value)", template: "§1.material.wireframe = §2", comment: JRC.materialWireframeComment },

    ]

    get wireframe(): boolean {
        return (<THREE.MeshPhongMaterial>this.material).wireframe;
    }

    get emissive(): number {
        let c = (<THREE.MeshPhongMaterial>this.material).emissive;
        if (!c) return 0x000000;
        return Math.round(c.r * 0xff0000 + c.g * 0xff00 + c.b * 0xff);
    }

    _setEmissive(color: number | string | ColorClass) {
        (<THREE.MeshPhongMaterial>this.material).emissive = ColorConverter.convertToThreeJsColor(color);
    }

    get specular(): number {
        let c = (<THREE.MeshPhongMaterial>this.material).specular;
        if (!c) return 0x000000;
        return Math.round(c.r * 0xff0000 + c.g * 0xff00 + c.b * 0xff);
    }

    _setSpecular(color: number | string | ColorClass) {
        (<THREE.MeshPhongMaterial>this.material).specular = ColorConverter.convertToThreeJsColor(color);
    }

    _phongMaterialConstructor(color: number | string | ColorClass, shininess: number = 30) {
        this.material = new THREE.MeshPhongMaterial({
            color: ColorConverter.convertToThreeJsColor(color),
            shininess: shininess
        })
        return this;
    }

    _phongMaterialConstructorTexture(texture: TextureEnum) {
        const loader = new THREE.TextureLoader();
        this.material = new THREE.MeshPhongMaterial({
            map: loader.load(texture.path)
        })
        return this;
    }


    _cj$_constructor_$PhongMaterial3d$SpriteLibrary$int(t: Thread, callback: CallbackParameter, library: SpriteLibraryEnum, index: number) {

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
        this.material = new THREE.MeshPhongMaterial({
            map: texture
        })
    }


}