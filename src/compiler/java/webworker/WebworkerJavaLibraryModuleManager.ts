import { JavaLibraryModuleManager } from "../module/libraries/JavaLibraryModuleManager";
import { WebworkerJavaLibraryModule } from "./WebworkerJavaLibraryModule";
import { SerializedLibraryClass, WebworkerSystemModule } from "./WebworkerSystemModule";

export type SerializedLibraryModuleManager = {
    additionalSerializedLibraryModules: SerializedLibraryClass[][],
    serializedSystemClasses: SerializedLibraryClass[], 
    serializedPrimitiveStringClass: SerializedLibraryClass
}


export class WebworkerJavaLibraryModuleManager extends JavaLibraryModuleManager {

    constructor(slmm: SerializedLibraryModuleManager) {
        super(
            slmm.additionalSerializedLibraryModules.map(slm => new WebworkerJavaLibraryModule(slm)),
            new WebworkerSystemModule(slmm.serializedSystemClasses, slmm.serializedPrimitiveStringClass)
        )
    }

}