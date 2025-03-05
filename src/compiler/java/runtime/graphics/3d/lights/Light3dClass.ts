import * as THREE from 'three';
import { CallbackParameter } from '../../../../../common/interpreter/CallbackParameter';
import { Thread } from '../../../../../common/interpreter/Thread';
import { JRC } from '../../../../language/JavaRuntimeLibraryComments';
import { ColorHelper } from '../../../../lexer/ColorHelper';
import { LibraryDeclarations } from '../../../../module/libraries/LibraryTypeDeclaration';
import { NonPrimitiveType } from '../../../../types/NonPrimitiveType';
import { RuntimeExceptionClass } from '../../../system/javalang/RuntimeException';
import { ColorClass } from '../../ColorClass';
import { Object3dClass } from '../Object3dClass';
import { ColorConverter } from '../../ColorConverter';


export class Light3dClass extends Object3dClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Light3d extends Object3d" },
        { type: "method", signature: "Light3d()", java: Light3dClass.prototype._cj$_constructor_$Light3d$ },
        { type: "field", signature: "public Material3d material"},


        { type: "method", signature: "void move(double x,double y,double z)"},
        { type: "method", signature: "final void move(Vector3 v)", native:Light3dClass.prototype.vmove},
        { type: "method", signature: "void moveTo(double x,double y,double z)"},
        { type: "method", signature: "final void moveTo(Vector3 p)", native:Light3dClass.prototype.vmoveTo},
        { type: "method", signature: "void destroy()", java: Light3dClass.prototype.destroy },
        { type: "method", signature: "void rotateX(double angleDeg)",native: Light3dClass.prototype.rotateX },
        { type: "method", signature: "void rotateY(double angleDeg)",native: Light3dClass.prototype.rotateY },
        { type: "method", signature: "void rotateZ(double angleDeg)",native: Light3dClass.prototype.rotateZ },

        { type: "field", signature: "private double intensity"},
        { type: "method", signature: "void setIntensity(double intensity)",native: Light3dClass.prototype.setIntensity },
        { type: "method", signature: "double getIntensity()",native: Light3dClass.prototype.getIntensity },


        { type: "field", signature: "private int color"},
        { type: "method", signature: "void setColor(int color)",native: Light3dClass.prototype.setColor },
        { type: "method", signature: "void setColor(String color)",native: Light3dClass.prototype.setColor },
        { type: "method", signature: "void setColor(Color color)",native: Light3dClass.prototype.setColor },
    ];

    static type: NonPrimitiveType;

    light: THREE.Light;
    
    getObject3d(){
        return this.light;
    }

    get color(): number {
        let c = (<THREE.Color>this.light.color);
        if(!c) return 0x000000;
        return Math.round(c.r*0xff0000 + c.g*0xff00 + c.b*0xff);
    }

    get intensity(): number {
        return this.light.intensity;
    }

    _cj$_constructor_$Light3d$(t: Thread, callback: CallbackParameter){
        super._cj$_constructor_$Object3d$(t, () => {
            callback();
            this.world3d.addLight(this);
        });
    }

    move(x:number,y:number,z:number):void{
        this.light.position.set(this.light.position.x+x,this.light.position.y+y,this.light.position.z+z)
    }
    moveTo(x:number,y:number,z:number):void{
        this.light.position.set(x,y,z);
    }

    rotateX(angleDeg: number): void {
        this.light.rotateX(angleDeg/180*Math.PI);
    }
    rotateY(angleDeg: number): void {
        this.light.rotateY(angleDeg/180*Math.PI);
    }
    rotateZ(angleDeg: number): void {
        this.light.rotateZ(angleDeg/180*Math.PI);
    }
    setIntensity(i:number){
        this.light.intensity = i;
    }
    getIntensity(){
        return this.light.intensity;
    }
    setColor(color:number|string|ColorClass){
        switch (typeof color) {
            case "number":
                this.light.color.set(color);
                break;
            case "string":
                this.light.color.set(ColorHelper.parseColorToOpenGL(color).color);
                break;
            case "object":
                if(color==null){
                    throw new RuntimeExceptionClass(JRC.fsColorIsNullException())
                }
                this.light.color.set(color.red/255,color.green/255,color.blue/255);
                break;
        }
    }

    destroy(){
        super.destroy();
        this.world3d.removeLight(this);
        this.light.dispose();
    }
}