import * as THREE from 'three';
import { World3dClass } from '../World3dClass';
import { SpriteLibraryEnum } from '../../SpriteLibraryEnum';
import { Material3dClass } from './Material3dClass';
import { LibraryDeclarations } from '../../../../module/libraries/LibraryTypeDeclaration';
import { JRC } from '../../../../language/JavaRuntimeLibraryComments';
import { Thread } from '../../../../../common/interpreter/Thread';
import { CallbackParameter } from '../../../../../common/interpreter/CallbackParameter';
import { TextureEnum } from './TextureEnum';


export class UnusedSpriteMaterial3dClass extends Material3dClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "final class SpriteMaterial3d extends Material3d", comment: JRC.spriteMaterial3dClassComment },
        { type: "method", signature: "SpriteMaterial3d(SpriteLibrary spriteLibrary, int imageIndex)", java: UnusedSpriteMaterial3dClass.prototype._cj$_constructor_$SpriteMaterial3d$SpriteLibrary$int, comment: JRC.spriteMaterial3dConstructorSpriteLibraryComment },
        { type: "method", signature: "SpriteMaterial3d(Texture texture)", native: UnusedSpriteMaterial3dClass.prototype._spriteMaterialConstructorTexture, comment: JRC.spriteMaterial3dConstructorTextureComment },

    ]


    _cj$_constructor_$SpriteMaterial3d$SpriteLibrary$int(t: Thread, callback: CallbackParameter, spriteLibrary: SpriteLibraryEnum, imageIndex: number) {

        t.s.push(this);
        let world3d = <World3dClass>t.scheduler.interpreter.retrieveObject("World3dClass");
        if (!world3d) {
            world3d = new World3dClass();
            world3d._cj$_constructor_$World3d$(t, () => {
                t.s.pop(); // constructor of world3d pushed it's this-object
                this.createMaterial(world3d, spriteLibrary, imageIndex);
                return;
            })
            return;
        }
        this.createMaterial(world3d, spriteLibrary, imageIndex);
        return;
    }

    createMaterial(world3d: World3dClass, spriteLibrary: SpriteLibraryEnum, imageIndex: number) {
        const texture = world3d.textureManager3d.getSpritesheetBasedTexture(spriteLibrary.name, imageIndex);
        this.material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff, transparent: true });
        return;
    }


    _spriteMaterialConstructorTexture(textureEnum: TextureEnum) {

        const loader = new THREE.TextureLoader();
        this.material = new THREE.SpriteMaterial({
            map: loader.load(textureEnum.path),
            color: 0xffffff,
            transparent: true
        })

        return this;
    }
}