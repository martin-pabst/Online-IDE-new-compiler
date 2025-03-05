import * as THREE from 'three';
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { UnusedSpriteMaterial3dClass } from './materials/UnusedSpriteMaterial3dClass';
import { Matrix4Class } from './Matrix4Class';
import { Object3dClass } from './Object3dClass';
import { CallbackParameter } from '../../../../common/interpreter/CallbackParameter';
import { Thread } from '../../../../common/interpreter/Thread';



export class UnusedSprite3dClass extends Object3dClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Sprite3d extends Mesh3d", comment: JRC.Sprite3dClassComment },
        { type: "method", signature: "Sprite3d(double x, double y, double z, double width, SpriteMaterial3d material)", java: UnusedSprite3dClass.prototype._cj$_constructor_$Sprite3d$double$double$double$double$SpriteMaterial3d, comment: JRC.Sprite3dConstructorComment },

        { type: "method", signature: "void move(double x,double y,double z)", native: UnusedSprite3dClass.prototype.move },
        { type: "method", signature: "final void move(Vector3 v)", native: UnusedSprite3dClass.prototype.vmove },
        { type: "method", signature: "void moveTo(double x,double y,double z)", native: UnusedSprite3dClass.prototype.moveTo },
        { type: "method", signature: "final void moveTo(Vector3 p)", native: UnusedSprite3dClass.prototype.vmoveTo },

        { type: "method", signature: "final void scale(double d)", native: UnusedSprite3dClass.prototype.scaleDouble },

        { type: "method", signature: "final void applyMatrix4(Matrix4 matrix)", native: UnusedSprite3dClass.prototype.applyMatrix4 },

        { type: "method", signature: "final SpriteMaterial3d getMaterial()", native: UnusedSprite3dClass.prototype.getMaterial },
        { type: "method", signature: "final void setMaterial(SpriteMaterial3d material)", native: UnusedSprite3dClass.prototype.setMaterial },

        { type: "method", signature: "void destroy()", java: UnusedSprite3dClass.prototype.destroy },


    ];

    sprite: THREE.Sprite;
    spriteMaterial: UnusedSpriteMaterial3dClass;

    _cj$_constructor_$Sprite3d$double$double$double$double$SpriteMaterial3d(t: Thread, callback: CallbackParameter, x: number, y: number, z: number, width: number, material: UnusedSpriteMaterial3dClass) {

        super._cj$_constructor_$Object3d$(t, () => {

            this.spriteMaterial = material;
            let threeMaterial = <THREE.SpriteMaterial>this.spriteMaterial.getMaterialAndIncreaseUsageCounter();

            this.sprite = new THREE.Sprite(threeMaterial);
            this.sprite.scale.set(width, width * threeMaterial.map.image.height/threeMaterial.map.image.width, width);
            this.sprite.position.set(x, y, z);
            this.world3d.scene.add(this.sprite);

            if(callback) callback();
        });

    }

    destroy(): void {
        super.destroy();
        this.world3d.scene.remove(this.sprite);
        this.sprite.geometry.dispose();
        this.spriteMaterial.destroyIfNotUsedByOtherMesh();
    }

    getObject3d(): THREE.Object3D {return this.sprite};


    move(x: number, y: number, z: number): void {
        // this.mesh.position.add(new THREE.Vector3(x,y,z));
        this.sprite.position.set(this.sprite.position.x + x, this.sprite.position.y + y, this.sprite.position.z + z)
    }
    moveTo(x: number, y: number, z: number): void {
        this.sprite.position.set(x, y, z);
    }
    applyMatrix4(matrix4: Matrix4Class) {

        // a vector v local to this mesh is transformed via
        // W * L * v to world coordinates. W is World matrix of parent, L is local matrix.
        // We want to achieve an additional global transformation of v which corresponds to
        // A * W * L * v, but we only can alter matrix L. As
        // A * W * L * v = W * (W^-1 * A * W) * L * v, we have to premultiply L by W^-1 * A * W.

        if (this.sprite.parent) {
            const helperMatrix = this.sprite.parent.matrixWorld.clone().invert();
            helperMatrix.multiply(matrix4.m);
            helperMatrix.multiply(this.sprite.parent.matrixWorld);
            this.sprite.applyMatrix4(helperMatrix);
        } else {
            this.sprite.applyMatrix4(matrix4.m);
        }

    }

    scaleDouble(factor: number) {
        let scale = this.sprite.scale;
        scale.setX(scale.x * factor);
        scale.setY(scale.y * factor);
        scale.setZ(scale.z * factor);
    }

    setMaterial(material: UnusedSpriteMaterial3dClass) {
        this.spriteMaterial.destroyIfNotUsedByOtherMesh();
        this.spriteMaterial = material;
        this.sprite.material = <THREE.SpriteMaterial>material.getMaterialAndIncreaseUsageCounter();
    }

    getMaterial() {
        return this.spriteMaterial;
    }

}