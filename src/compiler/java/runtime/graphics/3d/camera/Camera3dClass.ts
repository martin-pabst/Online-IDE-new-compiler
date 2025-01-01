import * as THREE from 'three';
import { CallbackParameter } from "../../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../../common/interpreter/Thread";
import { JRC } from "../../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { Object3dClass } from "../Object3dClass";
import { Vector3Class } from '../Vector3Class';
import { Matrix4Class } from '../Matrix4Class';
import { BaseListType } from '../../../../../common/BaseType';

export class Camera3dClass extends Object3dClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "abstract class Camera3d extends Object3d" },
        { type: "method", signature: "Camera3d()", java: Camera3dClass.prototype._cj$_constructor_$Camera3d$ },

        { type: "method", signature: "void move(double x,double y,double z)" },
        { type: "method", signature: "final void move(Vector3 v)", native: Camera3dClass.prototype.vmove },
        { type: "method", signature: "void moveTo(double x,double y,double z)" },
        { type: "method", signature: "final void moveTo(Vector3 p)", native: Camera3dClass.prototype.vmoveTo },
        
        { type: "method", signature: "void rotateX(double angleDeg)", native: Camera3dClass.prototype.rotateX },
        { type: "method", signature: "void rotateY(double angleDeg)", native: Camera3dClass.prototype.rotateY },
        { type: "method", signature: "void rotateZ(double angleDeg)", native: Camera3dClass.prototype.rotateZ },
        
        { type: "method", signature: "final void scaleX(double angleDeg)", native: Camera3dClass.prototype.scaleX },
        { type: "method", signature: "final void scaleY(double angleDeg)", native: Camera3dClass.prototype.scaleY },
        { type: "method", signature: "final void scaleZ(double angleDeg)", native: Camera3dClass.prototype.scaleZ },
        { type: "method", signature: "final void scale(Vector3 v)", native: Camera3dClass.prototype.vscale },
        { type: "method", signature: "final void scale(double d)", native: Camera3dClass.prototype.scaleDouble },

        {type: "method", signature: "final void applyMatrix4(Matrix4 matrix)", native: Camera3dClass.prototype.applyMatrix4 },

        { type: "method", signature: "void destroy()", java: Camera3dClass.prototype.destroy },

    ];

    static type: NonPrimitiveType;

    camera3d: THREE.Camera;

    getObject3d(): THREE.Object3D {
        return this.camera3d;
    }

    _cj$_constructor_$Camera3d$(t: Thread, callback: CallbackParameter) {
        super._cj$_constructor_$Object3d$(t, () => {
            this.world3d.scene.add(this.camera3d);
            if(callback) callback();
        });
    }

    move(x: number, y: number, z: number): void {
        // this.mesh.position.add(new THREE.Vector3(x,y,z));
        this.camera3d.position.set(this.camera3d.position.x + x, this.camera3d.position.y + y, this.camera3d.position.z + z)
    }
    moveTo(x: number, y: number, z: number): void {
        this.camera3d.position.set(x, y, z);
    }

    rotateX(angleDeg: number): void {
        this.camera3d.rotateX(angleDeg / 180 * Math.PI);
    }
    rotateY(angleDeg: number): void {
        this.camera3d.rotateY(angleDeg / 180 * Math.PI);
    }
    rotateZ(angleDeg: number): void {
        this.camera3d.rotateZ(angleDeg / 180 * Math.PI);
    }
    rotateOnWorldAxis(axis: Vector3Class, angleDeg: number): void {
        this.camera3d.rotateOnWorldAxis(axis.v, angleDeg / 180 * Math.PI);
    }


    scaleX(factor: number): void {
        this.camera3d.scale.setX(this.camera3d.scale.x * factor);
    }

    scaleY(factor: number): void {
        this.camera3d.scale.setY(this.camera3d.scale.y * factor);
    }

    scaleZ(factor: number): void {
        this.camera3d.scale.setZ(this.camera3d.scale.z * factor);
    }

    applyMatrix4(matrix4: Matrix4Class){

        // a vector v local to this mesh is transformed via
        // W * L * v to world coordinates. W is World matrix of parent, L is local matrix.
        // We want to achieve an additional global transformation of v which corresponds to
        // A * W * L * v, but we only can alter matrix L. As
        // A * W * L * v = W * (W^-1 * A * W) * L * v, we have to premultiply L by W^-1 * A * W.

        if(this.camera3d.parent){
            const helperMatrix = this.camera3d.parent.matrixWorld.clone().invert();
            helperMatrix.multiply(matrix4.m);
            helperMatrix.multiply(this.camera3d.parent.matrixWorld);
            this.camera3d.applyMatrix4(helperMatrix);
        } else {
            this.camera3d.applyMatrix4(matrix4.m);
        }

    }

    vscale(factor: Vector3Class) {
        let scale = this.camera3d.scale;
        scale.setX(scale.x * factor.v.x);
        scale.setY(scale.y * factor.v.y);
        scale.setZ(scale.z * factor.v.z);
    }

    scaleDouble(factor: number) {
        let scale = this.camera3d.scale;
        scale.setX(scale.x * factor);
        scale.setY(scale.y * factor);
        scale.setZ(scale.z * factor);
    }

    destroy() {
        super.destroy();
        this.world3d.scene.remove(this.camera3d);

        this.world3d.scene.remove(this.camera3d);
    }

    updateViewport(){}


}