import * as THREE from 'three';
import { World3dClass } from '../World3dClass';
import { SpriteLibraryEnum } from '../../SpriteLibraryEnum';
import { RuntimeExceptionClass } from '../../../system/javalang/RuntimeException';



export type FastSprite = {
    index: number;
}

export class FastSpriteManager3d {

    texture: THREE.Texture;
    mesh: THREE.Mesh;
    geometry: THREE.InstancedBufferGeometry;
    material: THREE.ShaderMaterial;

    maxCount: number = 200;

    iOffset = 0;
    iSize = this.iOffset + 3;
    iUvBox = this.iSize + 2;
    iRotation = this.iUvBox + 4;
    iColor = this.iRotation + 1;
    iAlpha = this.iColor + 3;

    bufferElementSize = this.iAlpha + 1;

    interleavedBuffer: Float32Array = new Float32Array(this.maxCount * this.bufferElementSize);
    instanceInterleavedBuffer: THREE.InstancedInterleavedBuffer;

    fastsprites: FastSprite[] = [];

    dirty: boolean = false;
    oldCameraPos: THREE.Vector3 = new THREE.Vector3();
    intervalID: any;

    indicesToRemove: number[] = [];

    constructor(private world3d: World3dClass) {

        this.initMesh();

        this.intervalID = setInterval(() => {
            this.sortByDistanceToCamera();
        }, 10);

    }

    initMesh(oldInstanceCount: number = 0) {
        this.geometry = new THREE.InstancedBufferGeometry();
        //cubeGeo.maxInstancedCount = 8;
        const positions = [0.5, 0.5, 0, -0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0];
        const rawUVs = [1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0];

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute('rawUV', new THREE.Float32BufferAttribute(rawUVs, 2));

        this.instanceInterleavedBuffer = new THREE.InstancedInterleavedBuffer(this.interleavedBuffer, this.bufferElementSize, 1);

        this.geometry.setAttribute('offset', new THREE.InterleavedBufferAttribute(this.instanceInterleavedBuffer, 3, this.iOffset));
        this.geometry.setAttribute('size', new THREE.InterleavedBufferAttribute(this.instanceInterleavedBuffer, 2, this.iSize));
        this.geometry.setAttribute('uvBox', new THREE.InterleavedBufferAttribute(this.instanceInterleavedBuffer, 4, this.iUvBox));
        this.geometry.setAttribute('rotation', new THREE.InterleavedBufferAttribute(this.instanceInterleavedBuffer, 1, this.iRotation));
        this.geometry.setAttribute('color', new THREE.InterleavedBufferAttribute(this.instanceInterleavedBuffer, 3, this.iColor));
        this.geometry.setAttribute('alpha', new THREE.InterleavedBufferAttribute(this.instanceInterleavedBuffer, 1, this.iAlpha));

        this.geometry.instanceCount = oldInstanceCount;


        var mat = new THREE.RawShaderMaterial({
            uniforms: {
                systemTexture: { value: this.world3d.textureManager3d.systemTexture },
                userTexture: { value: this.world3d.textureManager3d.userTexture },
            },
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            side: THREE.FrontSide,
            transparent: true
        });

        mat.needsUpdate = true;

        this.mesh = new THREE.Mesh(this.geometry, mat);
        this.world3d.scene.add(this.mesh);

    }

    getVertexShader(): string {
        return `
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        
        attribute vec3 position;
        attribute vec2 rawUV;
        attribute vec3 offset;
        attribute vec2 size;
        attribute vec4 uvBox;
        attribute float rotation;
        attribute vec3 color;
        attribute float alpha;

        varying vec2 vUV;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vIsUserTexture;
        
        void main() {
         vColor = color;
         vAlpha = alpha;

        if(size.x < 0.0){
            vIsUserTexture = 1.0;
        } else {
            vIsUserTexture = 0.0; 
        }

         vUV = uvBox.xy + rawUV * vec2(uvBox.z, uvBox.w); // uvBox.zw;

         vec4 mvPosition = modelViewMatrix[ 3 ];

          vec2 rotatedPosition;
          rotatedPosition.x = cos( rotation ) * position.x - sin( rotation ) * position.y;
          rotatedPosition.y = sin( rotation ) * position.x + cos( rotation ) * position.y;

         mvPosition.xy = mvPosition.xy + rotatedPosition.xy * vec2(abs(size.x), size.y);

         gl_Position = projectionMatrix * (mvPosition + modelViewMatrix * vec4(offset, 0.0));

         // vec4 mvPosition = modelViewMatrix * vec4(position * size, 1.0);

         //gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + position * size, 1.0 );
        
        }
        `

    }

    getFragmentShader(): string {
        return `
        precision mediump float;
        uniform sampler2D systemTexture;
        uniform sampler2D userTexture;
        //attribute vec3 color;
        //attribute float alpha;

        varying vec2 vUV;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vIsUserTexture;

        void main() {
         if(vIsUserTexture > 0.5){
            gl_FragColor = texture2D(userTexture, vUV) * vec4(vColor, vAlpha);
         } else {
            gl_FragColor = texture2D(systemTexture, vUV) * vec4(vColor, vAlpha);
        }
        
        }
    `;

    }

    getSprite(width: number, library: SpriteLibraryEnum, index: number): FastSprite {
        let textureFrame = this.world3d.textureManager3d.getFrame(library.name, index);
        if (!textureFrame) {
            throw new RuntimeExceptionClass("Didn't find sprite " + index + " in library " + library.name + ".");
        }

        let frame = textureFrame.frame;

        let W: number = 1024;
        let H: number = 1024;

        let texture = textureFrame.isSystemSpritesheet ? this.world3d.textureManager3d.systemTexture : this.world3d.textureManager3d.userTexture;
        
        texture.flipY = true;

        W = texture.image.width;
        H = texture.image.height;

        let wFraction = frame.w / W;
        let hFraction = frame.h / H;
        let xStart = frame.x / W;
        let yStart = 1 - frame.y / H - hFraction;

        if (this.geometry.instanceCount >= this.maxCount) {
            this.resizeBuffers();
            this.sortByDistanceToCamera();
        }

        let nfi = this.geometry.instanceCount;
        let fs: FastSprite = {
            index: nfi
        }

        this.geometry.instanceCount++;
        let base = nfi * this.bufferElementSize;
        this.interleavedBuffer[base + 0] = 0;   // offset
        this.interleavedBuffer[base + 1] = 0;
        this.interleavedBuffer[base + 2] = 0;

        this.interleavedBuffer[base + 3] = textureFrame.isSystemSpritesheet ? width : - width;   // size
        this.interleavedBuffer[base + 4] = frame.h / frame.w * width;

        this.interleavedBuffer[base + 5] = xStart;   // uvs
        this.interleavedBuffer[base + 6] = yStart;
        this.interleavedBuffer[base + 7] = wFraction;
        this.interleavedBuffer[base + 8] = hFraction;

        this.interleavedBuffer[base + 9] = 0;    // rotation

        this.interleavedBuffer[base + 10] = 1;    // color
        this.interleavedBuffer[base + 11] = 1;
        this.interleavedBuffer[base + 12] = 1;

        this.interleavedBuffer[base + 13] = 1;    // alpha

        // this.instanceInterleavedBuffer.needsUpdate = true;

        this.fastsprites.push(fs);

        this.dirty = true;

        return fs;

    }


    resizeBuffers() {
        this.maxCount *= 3;
        const newInterleavedBuffer = new Float32Array(this.maxCount * this.bufferElementSize);
        newInterleavedBuffer.set(this.interleavedBuffer);
        this.interleavedBuffer = newInterleavedBuffer;

        let oldInstanceCount: number = 0;
        if (this.mesh) {
            oldInstanceCount = this.geometry.instanceCount;
            this.world3d.scene.remove(this.mesh);
            (<THREE.Material>this.mesh.material).dispose();
            (<THREE.InstancedBufferGeometry>this.mesh.geometry).dispose();
        }

        this.initMesh(oldInstanceCount);

    }

    destroy(){
        if(!this.mesh) return;
        this.world3d.scene.remove(this.mesh);
        (<THREE.Material>this.mesh.material).dispose();
        (<THREE.InstancedBufferGeometry>this.mesh.geometry).dispose();
    }

    removeSprite(fastSprite: FastSprite) {

        this.indicesToRemove.push(fastSprite.index);
        this.dirty = true;

    }

    removeIntern() {
        while (this.indicesToRemove.length > 0) {
            let index = this.indicesToRemove.pop();
            const lastFastSprite = this.fastsprites.pop();
            if (index < this.geometry.instanceCount - 1) {
                const lastIndex = this.geometry.instanceCount - 1;
                lastFastSprite.index = index;
                this.fastsprites[index] = lastFastSprite;

                this.interleavedBuffer.copyWithin(index * this.bufferElementSize, lastIndex * this.bufferElementSize, (lastIndex + 1) * this.bufferElementSize);
            }

            this.geometry.instanceCount--;
        }

    }


    moveSprite(fastSprite: FastSprite, x: number, y: number, z: number) {
        let baseIndex = fastSprite.index * this.bufferElementSize + this.iOffset;
        this.interleavedBuffer[baseIndex] = this.interleavedBuffer[baseIndex] + x;
        this.interleavedBuffer[baseIndex + 1] = this.interleavedBuffer[baseIndex + 1] + y;
        this.interleavedBuffer[baseIndex + 2] = this.interleavedBuffer[baseIndex + 2] + z;
        this.dirty = true;
    }
    
    scaleSprite(fastSprite: FastSprite, scaleH: number, scaleV: number){
        let baseIndex = fastSprite.index * this.bufferElementSize + this.iOffset;
        this.interleavedBuffer[baseIndex + 3] *= scaleH;
        this.interleavedBuffer[baseIndex + 4] *= scaleV;
        this.dirty = true;
    }

    rotateSprite(fastSprite: FastSprite, angleRad: number){
        let baseIndex = fastSprite.index * this.bufferElementSize + this.iOffset;
        this.interleavedBuffer[baseIndex + 9] += angleRad;
        this.dirty = true;
    }

    setColor(fastSprite: FastSprite, color: number) {
        let r = ((color & 0xff0000) >> 16) / 0xff;
        let g = ((color & 0xff00) >> 8) / 0xff;
        let b = (color & 0xff) / 0xff;
        let baseIndex = fastSprite.index * this.bufferElementSize + this.iColor;
        this.interleavedBuffer[baseIndex] = r;
        this.interleavedBuffer[baseIndex + 1] = g;
        this.interleavedBuffer[baseIndex + 2] = b;
        this.dirty = true;
    }

    setAlpha(fastSprite: FastSprite, alpha: number) {
        let baseIndex = fastSprite.index * this.bufferElementSize + this.iAlpha;
        this.interleavedBuffer[baseIndex] = alpha;
    }

    moveSpriteTo(fastSprite: FastSprite, x: number, y: number, z: number) {
        let baseIndex = fastSprite.index * this.bufferElementSize + this.iOffset;
        this.interleavedBuffer[baseIndex] = x;
        this.interleavedBuffer[baseIndex + 1] = y;
        this.interleavedBuffer[baseIndex + 2] = z;
        this.dirty = true;
    }

    getX(fastSprite: FastSprite) {
        return this.interleavedBuffer[fastSprite.index * this.bufferElementSize + this.iOffset];
    }

    getY(fastSprite: FastSprite) {
        return this.interleavedBuffer[fastSprite.index * this.bufferElementSize + this.iOffset + 1];
    }

    getZ(fastSprite: FastSprite) {
        return this.interleavedBuffer[fastSprite.index * this.bufferElementSize + this.iOffset + 2];
    }

    sortByDistanceToCamera() {
        this.instanceInterleavedBuffer.needsUpdate = true;

        
        let camera = this.world3d.currentCamera.camera3d;
        let cameraPosition = camera.position;
        
        if (!this.dirty) {
            if (cameraPosition.distanceTo(this.oldCameraPos) < 1e-2) return;
        }
        
        this.removeIntern();
        let count = this.geometry.instanceCount;
        if (count < 2) return;

        this.oldCameraPos = cameraPosition.clone();
        this.dirty = false;
        let cameraDirection = camera.getWorldDirection(new THREE.Vector3()).normalize();

        let distanceToCamera = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            let base = i * this.bufferElementSize + this.iOffset;
            let pos: THREE.Vector3 = new THREE.Vector3(this.interleavedBuffer[base], this.interleavedBuffer[base + 1], this.interleavedBuffer[base + 2]);
            distanceToCamera[i] = -pos.sub(cameraPosition).dot(cameraDirection);            
            // distanceToCamera[i] = -cameraPosition.distanceTo(pos);
        }
        this.quickSort(distanceToCamera, this.interleavedBuffer, 0, count - 1);
    }

    quickSort(distances: Float32Array, items: Float32Array, left: number, right: number) {
        let index: number = this.partition(distances, items, left, right); //index returned from partition
        if (left < index - 1) { //more elements on the left side of the pivot
            this.quickSort(distances, items, left, index - 1);
        }
        if (index < right) { //more elements on the right side of the pivot
            this.quickSort(distances, items, index, right);
        }
        return items;
    }

    partition(distances: Float32Array, items: Float32Array, left: number, right: number): number {
        var pivot = distances[Math.floor((right + left) / 2)], //middle element
            i = left, //left pointer
            j = right; //right pointer
        while (i <= j) {
            while (distances[i] < pivot) {
                i++;
            }
            while (distances[j] > pivot) {
                j--;
            }
            if (i <= j) {
                // swap sprites i and j
                let d = distances[i];
                distances[i] = distances[j];
                distances[j] = d;

                let basei = i * this.bufferElementSize;
                let basej = j * this.bufferElementSize;
                for (let t = 0; t < this.bufferElementSize; t++) {
                    let d = items[basei + t];
                    items[basei + t] = items[basej + t];
                    items[basej + t] = d;
                }

                let fs = this.fastsprites[i];
                this.fastsprites[i] = this.fastsprites[j];
                this.fastsprites[j] = fs;

                this.fastsprites[i].index = i;
                this.fastsprites[j].index = j;

                i++;
                j--;
            }
        }
        return i;
    }



}