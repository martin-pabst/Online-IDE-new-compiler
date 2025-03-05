import * as THREE from "three"

import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { ObjectClass } from "../../../system/javalang/ObjectClassStringClass";
import { ColorClass } from "../../ColorClass";
import { ColorConverter } from "../../ColorConverter";
import { JRC } from "../../../../language/JavaRuntimeLibraryComments";

export class Material3dClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "abstract final class Material3d extends Object", comment: JRC.material3dClassComment },
        { type: "method", signature: "Material3d setColor(Color color)", native: Material3dClass.prototype._setColor, comment: JRC.material3dSetColorComment },
        { type: "method", signature: "Material3d setColor(int color)", native: Material3dClass.prototype._setColor, comment: JRC.material3dSetColorComment },
        { type: "method", signature: "Material3d setColor(String color)", native: Material3dClass.prototype._setColor, comment: JRC.material3dSetColorComment },

        { type: "method", signature: "int getColor()", native: Material3dClass.prototype.getColor, comment: JRC.material3dGetColorComment },


        { type: "field", signature: "private boolean transparent", comment: JRC.material3dSetTransparentComment },
        { type: "method", signature: "boolean isTransparent()", template: "§1.material.transparent", comment: JRC.material3dIsTransparentComment },
        { type: "method", signature: "Material3d setTransparent(boolean value)", native: Material3dClass.prototype._setTransparent, comment: JRC.material3dSetTransparentComment },

        { type: "field", signature: "private boolean flatShading", comment: JRC.material3dFlatShadingComment },
        { type: "method", signature: "boolean isFlatShading()", template: "§1.material.flatShading", comment: JRC.material3dFlatShadingComment },
        { type: "method", signature: "Material3d setFlatShading(boolean value)", native: Material3dClass.prototype._setFlatShading, comment: JRC.material3dFlatShadingComment },

        { type: "field", signature: "private double alpha", comment: JRC.material3dAlphaComment },
        { type: "method", signature: "Material3d setAlpha(double value)", native: Material3dClass.prototype._setAlpha, comment: JRC.material3dAlphaComment },
        { type: "method", signature: "double getAlpha(double value)", template: "§1.alpha", comment: JRC.material3dAlphaComment },
        
        
        { type: "field", signature: "private boolean wireframe", comment: JRC.materialWireframeComment },
        { type: "method", signature: "Material3d setWireframe(boolean value)", native: Material3dClass.prototype._setWireframe, comment: JRC.materialWireframeComment },
        { type: "method", signature: "boolean isWireframe()", template: "§1.material.wireframe", comment: JRC.materialWireframeComment },

    ]

    static type: NonPrimitiveType;

    protected material: THREE.Material;
    private usageCounter: number = 0;

    set alpha(value: number){
        if(value > 1) value = 1;
        if(value < 0) value = 0;
        this.material.opacity = 1 - value;
        this.material.transparent = this.material.opacity < 0.99999999;
    }

    get transparent(): boolean {
        return this.material.transparent;
    }

    set transparent(value: boolean){
        this.material.transparent = value;
    }

    get flatShading(): boolean {
        return this.material["flatShading"] || false;
    }

    set flatShading(value: boolean){
        this.material["flatShading"] = value;
    }

    get alpha():number {
        return 1 - this.material.opacity;
    }

    _setFlatShading(value: boolean){
        this.material["flatShading"] = value;
        return this;
    }

    _setTransparent(value: boolean){
        this.material.transparent = value;
        return this;
    }

    _setWireframe(value: boolean){
        this.material["wireframe"] = value;
        return this;
    }

    _setAlpha(value: number){
        this.alpha = value;
        return this;
    }

    _setColor(color: number | string | ColorClass) {
        if (this.material["color"]!==undefined) {
            this.material["color"]?.set(ColorConverter.convertToThreeJsColor(color));
        }
        return this;
    }

    getMaterialAndIncreaseUsageCounter(){
        this.usageCounter++;
        return this.material;
    }

    getMaterialWithoutIncreasingUsageCounter(){
        this.usageCounter++;
        return this.material;
    }

    getColor(): number {
        let c = (<THREE.Color>this.material["color"]);
        if(!c) return 0x000000;
        return Math.round(c.r*0xff0000 + c.g*0xff00 + c.b*0xff);
    }

    destroyIfNotUsedByOtherMesh(){
        if(--this.usageCounter == 0){
            let texture = this.material["map"];
            if(texture){
                if(texture["isPartOfSpritesheet"]) return;
                let rt: THREE.WebGLRenderTarget = texture["renderTarget"];
                if(rt){
                    rt.dispose();
                }
                texture.dispose();
            }
            this.material.dispose();
        }
    }

}