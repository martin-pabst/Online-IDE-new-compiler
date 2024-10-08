import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { Material3dClass } from './materials/Material3dClass';
import { Object3dClass } from "./Object3dClass";
import { Vector3Class } from './Vector3Class';
import { PhongMaterial3dClass } from './materials/PhongMaterial3dClass';

export class Mesh3dClass extends Object3dClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Mesh3d extends Object3d", comment: JRC.Mesh3dClassComment },
        { type: "method", signature: "Mesh3d()", java: Mesh3dClass.prototype._cj$_constructor_$Mesh3d$ },
        { type: "field", signature: "public Material3d material" },


        { type: "method", signature: "void move(double x,double y,double z)" },
        { type: "method", signature: "final void move(Vector3 v)", native: Mesh3dClass.prototype.vmove },
        { type: "method", signature: "void moveTo(double x,double y,double z)" },
        { type: "method", signature: "final void moveTo(Vector3 p)", native: Mesh3dClass.prototype.vmoveTo },
        { type: "method", signature: "void rotateX(double angleDeg)", native: Mesh3dClass.prototype.rotateX },
        { type: "method", signature: "void rotateY(double angleDeg)", native: Mesh3dClass.prototype.rotateY },
        { type: "method", signature: "void rotateZ(double angleDeg)", native: Mesh3dClass.prototype.rotateZ },

        { type: "method", signature: "final void scaleX(double angleDeg)", native: Mesh3dClass.prototype.scaleX },
        { type: "method", signature: "final void scaleY(double angleDeg)", native: Mesh3dClass.prototype.scaleY },
        { type: "method", signature: "final void scaleZ(double angleDeg)", native: Mesh3dClass.prototype.scaleZ },
        { type: "method", signature: "final void scale(Vector3 v)", native: Mesh3dClass.prototype.vscale },
        { type: "method", signature: "final void scale(double d)", native: Mesh3dClass.prototype.scaleDouble },

        { type: "method", signature: "final void enableFrontBackSide(boolean frontSideVisible, boolean backSideVisible)", native: Mesh3dClass.prototype.enableFrontBackSide },
        { type: "method", signature: "final void repeatTexture(int repeatX, int repeatY)", native: Mesh3dClass.prototype.repeatTexture },
        { type: "method", signature: "final void renderTransparent(boolean transparent)", native: Mesh3dClass.prototype.renderTransparent },

        { type: "method", signature: "void destroy()", java: Mesh3dClass.prototype.destroy },

    ];

    static type: NonPrimitiveType;

    mesh: THREE.Mesh;
    private _material: Material3dClass;
    side: THREE.Side = THREE.FrontSide;

    set material(newMaterial: Material3dClass) {
        if (this._material === newMaterial) return;

        if (this._material) this.material.destroyIfNotUsedByOtherMesh();

        this._material = newMaterial;
        this.mesh.material = this._material.getMaterialAndIncreaseUsageCounter();

    }

    get material(): Material3dClass {
        return this._material;
    }

    _cj$_constructor_$Mesh3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Object3d$(t, callback);
    }

    move(x: number, y: number, z: number): void {
        // this.mesh.position.add(new THREE.Vector3(x,y,z));
        this.mesh.position.set(this.mesh.position.x + x, this.mesh.position.y + y, this.mesh.position.z + z)
    }
    moveTo(x: number, y: number, z: number): void {
        this.mesh.position.set(x, y, z);
    }

    rotateX(angleDeg: number): void {
        this.mesh.rotateX(angleDeg / 180 * Math.PI);
    }
    rotateY(angleDeg: number): void {
        this.mesh.rotateY(angleDeg / 180 * Math.PI);
    }
    rotateZ(angleDeg: number): void {
        this.mesh.rotateZ(angleDeg / 180 * Math.PI);
    }

    scaleX(factor: number): void {
        this.mesh.scale.setX(this.mesh.scale.x * factor);
    }

    scaleY(factor: number): void {
        this.mesh.scale.setY(this.mesh.scale.y * factor);
    }

    scaleZ(factor: number): void {
        this.mesh.scale.setZ(this.mesh.scale.z * factor);
    }

    vscale(factor: Vector3Class) {
        let scale = this.mesh.scale;
        scale.setX(scale.x * factor.v.x);
        scale.setY(scale.y * factor.v.y);
        scale.setZ(scale.z * factor.v.z);
    }

    scaleDouble(factor: number) {
        let scale = this.mesh.scale;
        scale.setX(scale.x * factor);
        scale.setY(scale.y * factor);
        scale.setZ(scale.z * factor);
    }


    getInitialMaterial(): Material3dClass {

        return new PhongMaterial3dClass()._phongMaterialConstructor(0x00ff00, 100);

    }

    enableFrontBackSide(frontSideVisible: boolean, backSideVisible: boolean) {
        if (frontSideVisible) {
            this.side = THREE.FrontSide;
            if (backSideVisible) {
                this.side = THREE.DoubleSide;
            }
        } else {
            this.side = THREE.BackSide;
        }

        let materials = this.mesh.material;
        if (!Array.isArray(materials)) materials = [materials];
        for (let material of materials) {
            material.side = this.side;
            material.needsUpdate = true;
        }
    }

    repeatTexture(repeatX: number, repeatY: number) {
        let materials = this.mesh.material;
        if (!Array.isArray(materials)) materials = [materials];
        for (let material of materials) {
            if (material["map"]) {
                let texture: THREE.Texture = material["map"];

                if (texture.userData["key"] !== undefined) {

                    texture = this.world3d.textureManager3d.getTextureWithOwnData(texture.userData["key"], this.world3d.renderer);

                    material["map"] = texture;
                    material.needsUpdate = true;
                }

                texture.repeat.set(repeatX, repeatY);
            }
        }

    }

    renderTransparent(isTransparent: boolean) {
        let materials = this.mesh.material;
        if (!Array.isArray(materials)) materials = [materials];
        for (let material of materials) {
            material.transparent = isTransparent;
            material.needsUpdate = true;
        }
    }

    destroy() {
        super.destroy();
        this.world3d.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this._material.destroyIfNotUsedByOtherMesh();
    }
}