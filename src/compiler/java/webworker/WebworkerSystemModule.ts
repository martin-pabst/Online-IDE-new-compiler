import type { CodeFragment } from "../../common/disassembler/CodeFragment";
import { Klass } from "../../common/interpreter/RuntimeConstants";
import { deserializeLibraryDeclarations, LibraryDeclarations } from "../module/libraries/LibraryTypeDeclaration";
import { JavaLibraryModule, LibraryKlassType } from "../module/libraries/JavaLibraryModule";
import { NonPrimitiveType } from "../types/NonPrimitiveType";
import { BooleanPrimitiveType } from "../runtime/system/primitiveTypes/BooleanPrimitiveType";
import { CharPrimitiveType } from "../runtime/system/primitiveTypes/CharPrimitiveType";
import { BytePrimitiveType } from "../runtime/system/primitiveTypes/BytePrimitiveType";
import { DoublePrimitiveType } from "../runtime/system/primitiveTypes/DoublePrimitiveType";
import { FloatPrimitiveType } from "../runtime/system/primitiveTypes/FloatPrimitiveType";
import { IntPrimitiveType } from "../runtime/system/primitiveTypes/IntPrimitiveType";
import { LongPrimitiveType } from "../runtime/system/primitiveTypes/LongPrimitiveType";
import { NullType } from "../runtime/system/primitiveTypes/NullType";
import { ShortPrimitiveType } from "../runtime/system/primitiveTypes/ShortPrimitiveType";
import { StringPrimitiveType } from "../runtime/system/primitiveTypes/StringPrimitiveType";
import { VoidPrimitiveType } from "../runtime/system/primitiveTypes/VoidPrimitiveType";


export type SerializedLibraryClass = {
    __javaDeclarations: LibraryDeclarations;
    enumValues?: string[]
}


export class WebworkerSystemModule extends JavaLibraryModule {

    public primitiveStringClass: Klass & LibraryKlassType;

    constructor(serializedLibraryClasses: SerializedLibraryClass[], serializedPrimitiveStringClass: SerializedLibraryClass) {
        super();

        this.types.push(
            new BooleanPrimitiveType(this),
            new CharPrimitiveType(this),
            new BytePrimitiveType(this),
            new ShortPrimitiveType(this),
            new IntPrimitiveType(this),
            new LongPrimitiveType(this),
            new FloatPrimitiveType(this),
            new DoublePrimitiveType(this),
            new StringPrimitiveType(this),
            new VoidPrimitiveType(this),
            new NullType(this)
        )


        for (let slc of serializedLibraryClasses) {
            let klass = class {
                static __javaDeclarations = [];
            }
            deserializeLibraryDeclarations(slc.__javaDeclarations, klass);
            if (slc.enumValues) {
                let a = [];
                for (let ordinal = 0; ordinal < slc.enumValues.length; ordinal++) {
                    let enumValue = new klass();
                    enumValue["name"] = slc.enumValues[ordinal];
                    enumValue["ordinal"] = ordinal;
                }
                klass["values"] = a;
            }
            this.classesInterfacesEnums.push(klass);
        }

        this.primitiveStringClass = class {
            static __javaDeclarations = [];
            static type: NonPrimitiveType;
        }
        deserializeLibraryDeclarations(serializedPrimitiveStringClass.__javaDeclarations, this.primitiveStringClass);
        this.classesInterfacesEnums.push(this.primitiveStringClass);
    }

    isReplModule(): boolean {
        return false;
    }

    getCodeFragments(): CodeFragment[] {
        return [];
    }

}