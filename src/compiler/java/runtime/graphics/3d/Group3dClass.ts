import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { Object3dClass } from "./Object3dClass";
import { Vector3Class } from './Vector3Class';
import { Matrix4Class } from './Matrix4Class';
import { BaseListType } from '../../../../common/BaseType';

export class Group3dClass extends Object3dClass implements BaseListType {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Group3d<O3d extends Object3d> extends Object3d", comment: JRC.Group3dClassComment },
        { type: "method", signature: "Group3d()", java: Group3dClass.prototype._cj$_constructor_$Group3d$ },

        { type: "method", signature: "void move(double x,double y,double z)" },
        { type: "method", signature: "final void move(Vector3 v)", native: Group3dClass.prototype.vmove },
        { type: "method", signature: "void moveTo(double x,double y,double z)" },
        { type: "method", signature: "final void moveTo(Vector3 p)", native: Group3dClass.prototype.vmoveTo },
        
        { type: "method", signature: "void rotateX(double angleDeg)", native: Group3dClass.prototype.rotateX },
        { type: "method", signature: "void rotateY(double angleDeg)", native: Group3dClass.prototype.rotateY },
        { type: "method", signature: "void rotateZ(double angleDeg)", native: Group3dClass.prototype.rotateZ },
        
        { type: "method", signature: "final void scaleX(double angleDeg)", native: Group3dClass.prototype.scaleX },
        { type: "method", signature: "final void scaleY(double angleDeg)", native: Group3dClass.prototype.scaleY },
        { type: "method", signature: "final void scaleZ(double angleDeg)", native: Group3dClass.prototype.scaleZ },
        { type: "method", signature: "final void scale(Vector3 v)", native: Group3dClass.prototype.vscale },
        { type: "method", signature: "final void scale(double d)", native: Group3dClass.prototype.scaleDouble },

        {type: "method", signature: "final void applyMatrix4(Matrix4 matrix)", native: Group3dClass.prototype.applyMatrix4 },

        { type: "method", signature: "final void add(O3d object)", native: Group3dClass.prototype._add, comment: JRC.Group3dAddComment},
        { type: "method", signature: "final void remove(O3d object)", native: Group3dClass.prototype._remove, comment: JRC.Group3dRemoveComment},
        { type: "method", signature: "final int size()", native: Group3dClass.prototype._size, comment: JRC.Group3dSizeComment},
        { type: "method", signature: "final O3d get(int index)", native: Group3dClass.prototype._get, comment: JRC.Group3dGetComment},

        { type: "method", signature: "void destroy()", java: Group3dClass.prototype.destroy },

    ];

    static type: NonPrimitiveType;

    group3d: THREE.Group;
    children: Object3dClass[] = [];

    getObject3d(): THREE.Object3D {
        return this.group3d;
    }

    _cj$_constructor_$Group3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Object3d$(t, () => {

            this.group3d = new THREE.Group();
            this.world3d.scene.add(this.group3d);

            if(callback) callback();
        });
    }

    move(x: number, y: number, z: number): void {
        // this.mesh.position.add(new THREE.Vector3(x,y,z));
        this.group3d.position.set(this.group3d.position.x + x, this.group3d.position.y + y, this.group3d.position.z + z)
    }
    moveTo(x: number, y: number, z: number): void {
        this.group3d.position.set(x, y, z);
    }

    rotateX(angleDeg: number): void {
        this.group3d.rotateX(angleDeg / 180 * Math.PI);
    }
    rotateY(angleDeg: number): void {
        this.group3d.rotateY(angleDeg / 180 * Math.PI);
    }
    rotateZ(angleDeg: number): void {
        this.group3d.rotateZ(angleDeg / 180 * Math.PI);
    }
    rotateOnWorldAxis(axis: Vector3Class, angleDeg: number): void {
        this.group3d.rotateOnWorldAxis(axis.v, angleDeg / 180 * Math.PI);
    }


    scaleX(factor: number): void {
        this.group3d.scale.setX(this.group3d.scale.x * factor);
    }

    scaleY(factor: number): void {
        this.group3d.scale.setY(this.group3d.scale.y * factor);
    }

    scaleZ(factor: number): void {
        this.group3d.scale.setZ(this.group3d.scale.z * factor);
    }

    applyMatrix4(matrix4: Matrix4Class){

        // a vector v local to this mesh is transformed via
        // W * L * v to world coordinates. W is World matrix of parent, L is local matrix.
        // We want to achieve an additional global transformation of v which corresponds to
        // A * W * L * v, but we only can alter matrix L. As
        // A * W * L * v = W * (W^-1 * A * W) * L * v, we have to premultiply L by W^-1 * A * W.

        if(this.group3d.parent){
            const helperMatrix = this.group3d.parent.matrixWorld.clone().invert();
            helperMatrix.multiply(matrix4.m);
            helperMatrix.multiply(this.group3d.parent.matrixWorld);
            this.group3d.applyMatrix4(helperMatrix);
        } else {
            this.group3d.applyMatrix4(matrix4.m);
        }

    }

    vscale(factor: Vector3Class) {
        let scale = this.group3d.scale;
        scale.setX(scale.x * factor.v.x);
        scale.setY(scale.y * factor.v.y);
        scale.setZ(scale.z * factor.v.z);
    }

    scaleDouble(factor: number) {
        let scale = this.group3d.scale;
        scale.setX(scale.x * factor);
        scale.setY(scale.y * factor);
        scale.setZ(scale.z * factor);
    }

    destroy() {
        super.destroy();
        this.world3d.scene.remove(this.group3d);

        for(let child of this.children){
            child.destroy();
        }

        this.world3d.scene.remove(this.group3d);
    }

    getElements(): any[] {
        return this.children;
    }

    _add(child: Object3dClass){
        if(this.children.indexOf(child) < 0){
            this.children.push(child);
            this.group3d.add(child.getObject3d())
        }
    }

    _remove(child: Object3dClass){
        let index = this.children.indexOf(child);
        if( index >= 0){
            this.children.splice(index, 1);
            this.group3d.remove(child.getObject3d())
        }
    }

    _size(): number {
        return this.children.length;
    }

    _get(index: number){
        let element = this.children[index];
        if(!element) return null;
        return element;
    }


}