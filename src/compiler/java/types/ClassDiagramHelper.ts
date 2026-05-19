import { SystemModule } from "../runtime/system/SystemModule";
import { JavaArrayType } from "./JavaArrayType";
import { GenericVariantOfJavaClass, IJavaClass, JavaClass } from "./JavaClass";
import { GenericVariantOfJavaInterface, IJavaInterface, JavaInterface } from "./JavaInterface";
import { JavaType } from "./JavaType";


// Used for class diagrams:
export type CompostionData = { klass: IJavaClass | IJavaInterface, identifier: string };

export class ClassDiagramHelper {
    registerUsedSystemClasses(klass: JavaClass, usedSystemClasses: Set<IJavaClass | IJavaInterface>) {
        if(klass.getExtends() && (klass.getExtends()?.module instanceof SystemModule)){
            usedSystemClasses.add(this.getTypeWithoutGenerics(klass.getExtends()!));
        }

        for(let intf of klass.getImplements()){
            if(intf.module instanceof SystemModule){
                usedSystemClasses.add(this.getTypeWithoutGenerics(intf));
            }
        }

        for(let cd of this.getCompositeData(klass)){
            if(cd.klass && cd.klass.module instanceof SystemModule){
                usedSystemClasses.add(cd.klass);
            }
        }

    }


    getTypeWithoutGenerics(type: IJavaClass | IJavaInterface): JavaClass | JavaInterface {
        if(type instanceof GenericVariantOfJavaClass) return type.isGenericVariantOf;
        if(type instanceof GenericVariantOfJavaInterface) return type.isGenericVariantOf;
        return <JavaClass | JavaInterface> type;
    }

    aggregatingClassIdentifiers: string[] = ["list", "set", "menge", "tree", "baum"];
    getCompositeData(klass: JavaClass): CompostionData[] {

        let cd: CompostionData[] = [];
        let cdMap: Map<IJavaClass | IJavaInterface | JavaArrayType, CompostionData> = new Map();

        for (let a of klass.fields) {
            let type: JavaType | undefined = a.type;
            if (type && (a.type instanceof IJavaClass) || (a.type instanceof IJavaInterface)
                || (a.type instanceof JavaArrayType)) {
                
                let isAggregatingClass = this.aggregatingClassIdentifiers.some(id => a.type?.identifier.toLowerCase().includes(id));

                if (isAggregatingClass &&
                type instanceof GenericVariantOfJavaClass && type.typeMap?.size == 1) {
                    type.typeMap.forEach((v, k) => {
                        type = v;
                    });
                }

                while(type instanceof JavaArrayType){
                    type = type.elementType;
                }

                if(!type) continue;

                let cda = cdMap.get(a.type);
                if (cda == null) {
                    cda = {
                        klass: <IJavaClass | IJavaInterface>type,
                        identifier: a.identifier
                    };
                    cdMap.set(a.type, cda);
                    cd.push(cda);
                } else {
                    cda.identifier += ", " + a.identifier;
                }
            }
        }

        return cd;
    }

}