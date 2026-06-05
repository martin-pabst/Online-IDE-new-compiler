import { JavaTypeStore } from "../module/JavaTypeStore";
import { NonPrimitiveType } from "../types/NonPrimitiveType";

export class ExceptionTree {

    // Maps identifiers of Exceptions to a map containing all subinterfaces/exceptions
    isExtendedImplementedBy: Record<string, Record<string, boolean>> = {};

    constructor(libraryTypestore?: JavaTypeStore, compiledTypesTypestore?: JavaTypeStore) {

        if (libraryTypestore && compiledTypesTypestore) {
            let exceptionClasses =
                libraryTypestore.getNonPrimitiveTypes().filter(type => type.fastExtendsImplements("Throwable"));

            exceptionClasses = exceptionClasses.concat(compiledTypesTypestore.getNonPrimitiveTypes().filter(type => type.fastExtendsImplements("Throwable")));

            for (let exc of exceptionClasses) {
                for (let extendsImplements of exc.getExtendedImplementedIdentifiers()) {
                    this.register(extendsImplements, exc.pathAndIdentifier);
                }
            }
        }

    }

    register(superType: string, subType: string) {
        if (superType == 'Object') return;

        let map = this.isExtendedImplementedBy[superType];
        if (!map) {
            map = {};
            this.isExtendedImplementedBy[superType] = map;
        }

        map[subType] = true;
    }

    getAllSubExceptions(identifier: string): Record<string, boolean> {
        return this.isExtendedImplementedBy[identifier] || {};
    }


}