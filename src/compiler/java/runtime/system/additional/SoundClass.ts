import { SoundTools } from "../../../../../tools/SoundTools";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations, LibraryDeclaration } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "../javalang/ObjectClassStringClass";

export class SoundClass extends ObjectClass {
    //@ts-ignore
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Sound extends Object", comment: JRC.SoundClassComment },
        { type: "method", signature: "static void playSound(string sound)", native: SoundClass.playSound, comment: JRC.SoundPlaySoundComment},
        { type: "method", signature: "static double getVolume()", native: SoundClass.getVolume, comment: JRC.SoundGetVolumeComment},
    ].concat(<any>SoundClass.addConstants());

    static type: NonPrimitiveType;


    static addConstants():LibraryDeclaration[] {
        let constants: LibraryDeclaration[] = [];
        for(let sound of SoundTools.sounds){
            constants.push({
                type: "field", signature: "static string " + sound.name, constantValue: sound.name, comment: sound.description
            });
        }
        return constants;
    }

    static playSound(sound: string){
        SoundTools.play(sound);
    }

    static getVolume(){
        if(!SoundTools.volumeDetectionRunning) SoundTools.startDetectingVolume();
        return SoundTools.getVolume();
    }

}