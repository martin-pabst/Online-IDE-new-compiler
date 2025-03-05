
import { CallbackParameter } from "../../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { SpriteLibraryEnum } from '../../SpriteLibraryEnum';
import { FastSprite } from './FastSpriteManager3d';
import { ActorClass } from '../../ActorClass';
import { World3dClass } from '../World3dClass';
import { Vector3Class } from '../Vector3Class';
import { Object3dClass } from "../Object3dClass";

export class Sprite3dClass extends Object3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Sprite3d extends Object3d"},
        { type: "method", signature: "Sprite3d(double width, SpriteLibrary spriteLibrary, int index)", java: Sprite3dClass.prototype._cj$_constructor_$Sprite3d$double$SpriteLibrary$int,  },

        { type: "method", signature: "void move(double x,double y,double z)", native: Sprite3dClass.prototype.move },
        { type: "method", signature: "void moveTo(double x,double y,double z)", native: Sprite3dClass.prototype.moveTo },
        { type: "method", signature: "double getX()", native: Sprite3dClass.prototype.getX },
        { type: "method", signature: "double getY()", native: Sprite3dClass.prototype.getY },
        { type: "method", signature: "double getZ()", native: Sprite3dClass.prototype.getZ },
        
        { type: "method", signature: "void setColor(int color)", native: Sprite3dClass.prototype.setColorInt },
        { type: "method", signature: "void setAlpha(double alpha)", native: Sprite3dClass.prototype.setAlpha },

        { type: "method", signature: "void scaleX(double angleDeg)",native: Sprite3dClass.prototype.scaleX },
        { type: "method", signature: "void scaleY(double angleDeg)",native: Sprite3dClass.prototype.scaleY },
        { type: "method", signature: "void scaleZ(double angleDeg)",native: Sprite3dClass.prototype.scale },
        { type: "method", signature: "void scale(Vector3 v)", native: Sprite3dClass.prototype.scaleV },
        { type: "method", signature: "void scale(double d)", native: Sprite3dClass.prototype.scale },

        { type: "method", signature: "void rotateX(double angleDeg)",native: Sprite3dClass.prototype.rotate },
        { type: "method", signature: "void rotateY(double angleDeg)",native: Sprite3dClass.prototype.rotate },
        { type: "method", signature: "void rotateZ(double angleDeg)",native: Sprite3dClass.prototype.rotate },
        { type: "method", signature: "void rotate(double angleDeg)",native: Sprite3dClass.prototype.rotate },

        // { type: "method", signature: "final void move(Vector3 v)", native: Sprite3dClass.prototype.vmove },
        // { type: "method", signature: "void moveTo(double x,double y,double z)", native: Sprite3dClass.prototype.moveTo },
        // { type: "method", signature: "final void moveTo(Vector3 p)", native: Sprite3dClass.prototype.vmoveTo },

        // { type: "method", signature: "final void scale(double d)", native: Sprite3dClass.prototype.scaleDouble },

        // { type: "method", signature: "final void applyMatrix4(Matrix4 matrix)", native: Sprite3dClass.prototype.applyMatrix4 },

        // { type: "method", signature: "void destroy()", java: Sprite3dClass.prototype.destroy },


    ];

    fastSprite: FastSprite;

    _cj$_constructor_$Sprite3d$double$SpriteLibrary$int(t: Thread, callback: CallbackParameter, width: number, library: SpriteLibraryEnum, index: number) {

        super._cj$_constructor_$Object3d$(t, () => {
            this.init(width, library, index);
            if(callback) callback();
        });
        return;
        
    }
    
    init(width: number, library: SpriteLibraryEnum, index: number){
        this.fastSprite = this.world3d.fastSpriteManager.getSprite(width, library, index);
    }

    destroy(): void {
        super.destroy();
        this.world3d.fastSpriteManager.removeSprite(this.fastSprite);
    }

    move(x: number, y: number, z: number): void {
        this.world3d.fastSpriteManager.moveSprite(this.fastSprite, x, y, z);
    }
    moveTo(x: number, y: number, z: number): void {
        this.world3d.fastSpriteManager.moveSpriteTo(this.fastSprite, x, y, z);
    }

    scale(factor: number): void {
        this.world3d.fastSpriteManager.scaleSprite(this.fastSprite, factor, factor);
    }

    scaleX(factor: number): void {
        this.world3d.fastSpriteManager.scaleSprite(this.fastSprite, factor, 1);
    }

    scaleY(factor: number): void {
        this.world3d.fastSpriteManager.scaleSprite(this.fastSprite, 1, factor);
    }

    scaleV(v: Vector3Class): void {
        this.world3d.fastSpriteManager.scaleSprite(this.fastSprite, v.v.x, v.v.y);
    }

    rotate(angle: number): void {
        angle *= Math.PI/180;
        this.world3d.fastSpriteManager.rotateSprite(this.fastSprite, angle);
    }

    getX(): number {
        return this.world3d.fastSpriteManager.getX(this.fastSprite);
    }

    getY(): number {
        return this.world3d.fastSpriteManager.getY(this.fastSprite);
    }

    getZ(): number {
        return this.world3d.fastSpriteManager.getZ(this.fastSprite);
    }

    setColorInt(color: number){
        this.world3d.fastSpriteManager.setColor(this.fastSprite, color);
    }

    setAlpha(alpha: number){
        this.world3d.fastSpriteManager.setAlpha(this.fastSprite, alpha);
    }



    // applyMatrix4(matrix4: Matrix4Class) {

    //     // a vector v local to this mesh is transformed via
    //     // W * L * v to world coordinates. W is World matrix of parent, L is local matrix.
    //     // We want to achieve an additional global transformation of v which corresponds to
    //     // A * W * L * v, but we only can alter matrix L. As
    //     // A * W * L * v = W * (W^-1 * A * W) * L * v, we have to premultiply L by W^-1 * A * W.

    //     if (this.sprite.parent) {
    //         const helperMatrix = this.sprite.parent.matrixWorld.clone().invert();
    //         helperMatrix.multiply(matrix4.m);
    //         helperMatrix.multiply(this.sprite.parent.matrixWorld);
    //         this.sprite.applyMatrix4(helperMatrix);
    //     } else {
    //         this.sprite.applyMatrix4(matrix4.m);
    //     }

    // }

    // scaleDouble(factor: number) {
    //     let scale = this.sprite.scale;
    //     scale.setX(scale.x * factor);
    //     scale.setY(scale.y * factor);
    //     scale.setZ(scale.z * factor);
    // }
}