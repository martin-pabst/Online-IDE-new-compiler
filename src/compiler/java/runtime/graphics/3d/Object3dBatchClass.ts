import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";
import { Mesh3dClass } from "./Mesh3dClass";
import { BatchedObject3dClass } from './BatchedObject3dClass';
import { Object3dClass } from './Object3dClass';

export class Object3dBatchClass extends ObjectClass {

        static __javaDeclarations: LibraryDeclarations = [
            { type: "declaration", signature: "class Object3dBatch extends Object", comment: JRC.Object3dBatchClassComment },
            { type: "method", signature: "Object3dBatch(Mesh3d template, int maxInstanceCount)", java: Object3dBatchClass.prototype._cj$_constructor_$Object3dBatch$Mesh3d$int, comment: JRC.Object3dBatchConstructorComment },
            { type: "method", signature: "BatchedObject3d createInstance()", native: Object3dBatchClass.prototype.createInstance, comment: JRC.Object3dBatchCreateInstanceComment },
    
            { type: "method", signature: "void destroy()", native: Object3dBatchClass.prototype.destroy },
        ];
    
        batchedMesh: THREE.BatchedMesh;
        geometryID: number;
        template: Mesh3dClass;

        _cj$_constructor_$Object3dBatch$Mesh3d$int(t: Thread, callback: CallbackParameter, template: Mesh3dClass, maxInstanceCount: number) {
            t.s.push(this);

            this.template = template;
            let maxVertexCount: number = template._geometry.attributes.position.count;
            this.batchedMesh = new THREE.BatchedMesh(maxInstanceCount, maxVertexCount, maxVertexCount * 2,
                template.material.getMaterialAndIncreaseUsageCounter());
            this.geometryID = this.batchedMesh.addGeometry(template._geometry.clone());

            this.template.world3d.scene.add(this.batchedMesh);

            if(callback) callback();
        }   

        createInstance(): Object3dClass {
            let instanceID = this.batchedMesh.addInstance(this.geometryID);
            let object = new BatchedObject3dClass(this.batchedMesh, instanceID, this.template.mesh.matrix.clone(), this.template.mesh.position.clone());

            return object;
        }

        destroy(){
            this.batchedMesh.dispose();
            this.template.material.destroyIfNotUsedByOtherMesh();
        }

} 