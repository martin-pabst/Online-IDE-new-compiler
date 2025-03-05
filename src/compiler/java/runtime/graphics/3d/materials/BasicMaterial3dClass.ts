import * as THREE from 'three';
import { JRC } from "../../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { ColorClass } from "../../ColorClass";
import { Material3dClass } from "./Material3dClass";
import { ColorConverter } from '../../ColorConverter';
import { TextureEnum } from './TextureEnum';
import { SpriteLibraryEnum } from '../../SpriteLibraryEnum';
import { CallbackParameter } from '../../../../../common/interpreter/CallbackParameter';
import { Thread } from '../../../../../common/interpreter/Thread';
import { World3dClass } from '../World3dClass';

export class BasicMaterial3dClass extends Material3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "final class BasicMaterial3d extends Material3d", comment: JRC.basicMaterial3dClassComment},
        {type: "method", signature: "BasicMaterial3d(int color)", native: BasicMaterial3dClass.prototype._basicMaterialConstructor, comment: JRC.basicMaterial3dConstructorComment },
        {type: "method", signature: "BasicMaterial3d(int color, boolean wireframe)", native: BasicMaterial3dClass.prototype._basicMaterialConstructor, comment: JRC.basicMaterial3dConstructorComment },
        {type: "method", signature: "BasicMaterial3d(string color, boolean wireframe)", native: BasicMaterial3dClass.prototype._basicMaterialConstructor, comment: JRC.basicMaterial3dConstructorComment },
        {type: "method", signature: "BasicMaterial3d(Color color, boolean wireframe)", native: BasicMaterial3dClass.prototype._basicMaterialConstructor, comment: JRC.basicMaterial3dConstructorComment },
        
        {type: "method", signature: "BasicMaterial3d(Texture texture)", native: BasicMaterial3dClass.prototype._basicMaterialConstructorTexture, comment: JRC.basicMaterial3dConstructorTextureComment },
        {type: "method", signature: "BasicMaterial3d(SpriteLibrary spriteLibrary, int imageIndex)", java: BasicMaterial3dClass.prototype._cj$_constructor_$BasicMaterial3d$SpriteLibrary$int, comment: JRC.basicMaterial3dConstructorSpriteLibraryComment },

        {type: "field", signature: "boolean wireframe", comment: JRC.materialWireframeComment},
        {type: "method", signature: "boolean isWireframe()", template: "§1.material.wireframe", comment: JRC.materialWireframeComment},
        {type: "method", signature: "void setWireframe(boolean value)", template: "§1.material.wireframe = §2", comment: JRC.materialWireframeComment},

    ]

    get wireframe(): boolean {
        return (<THREE.MeshBasicMaterial>this.material).wireframe;
    }

    _basicMaterialConstructor(color: number | string | ColorClass, wireframe: boolean = false){
        this.material = new THREE.MeshBasicMaterial({
            color: ColorConverter.convertToThreeJsColor(color),
            wireframe: wireframe
        })

        return this;
    }

    _basicMaterialConstructorTexture(texture: TextureEnum){
        const loader = new THREE.TextureLoader();
        this.material = new THREE.MeshStandardMaterial({
            map: loader.load(texture.path)
        })
        return this;
    }


    _cj$_constructor_$BasicMaterial3d$SpriteLibrary$int(t: Thread, callback: CallbackParameter , library: SpriteLibraryEnum, index: number){

        t.s.push(this);
        let world3d: World3dClass = t.scheduler.interpreter.retrieveObject("World3dClass");
        if (!world3d) {
            world3d = new World3dClass();
            world3d._cj$_constructor_$World3d$(t, () => {
                t.s.pop(); // constructor of world3d pushed it's this-object
                
                this.createMaterialWithTexture(world3d, library.name, index);
                
                if(callback) callback();
            })
            return;
        }
        
        this.createMaterialWithTexture(world3d, library.name, index);
        if(callback) callback();
    }

    createMaterialWithTexture(world3d: World3dClass, name: string, index: number) {
        let texture = world3d.textureManager3d.getSpritesheetBasedTexture(name, index);
        this.material = new THREE.MeshStandardMaterial({
            map: texture
        })
    }



}