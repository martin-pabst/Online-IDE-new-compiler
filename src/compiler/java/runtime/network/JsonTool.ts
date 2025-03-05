import { JavaArrayType } from "../../types/JavaArrayType";
import { JavaClass } from "../../types/JavaClass";
import { JavaEnum } from "../../types/JavaEnum";
import { JavaType } from "../../types/JavaType";
import { EnumClass } from "../system/javalang/EnumClass";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";

type SerializedObject = {
    "!k"?: string, // Class identifier or object index
    "!i": number  // index
} | null;

export class JsonTool {
    // to deserialize:
    indexToObjectMap?: Map<number, ObjectClass>;
    arrayElementsToResolve?: {array: any[], arrayIndex: number, objectToResolveIndex: number}[];
    fieldsToResolve?: { objectHoldingField: ObjectClass, fieldIdentifier: string,  objectToResolveIndex: number }[];

    // to serialize:
    objectToIndexMap!: Map<ObjectClass, number>;
    nextIndex: number = -1;

    wrapperTypes: string[] = ["String", "Integer", "Double", "Boolean", "Float", "Character", "Short", "Long"];

    toJson(data: any): string {
        this.objectToIndexMap = new Map();
        this.nextIndex = 0;
        let json = JSON.stringify(this.anyToJson(data));
        return json;
    }

    private anyToJson(data: any): any {

        if(Array.isArray(data)){
            return data.map(element => this.anyToJson(element));
        }

        if(typeof data == "object"){
            if(data == null) return null;
            if(data instanceof EnumClass){
                return data.ordinal;
            }
            if(data instanceof ObjectClass){
                return this.objectToJson(data);
            }
        } else {
            // typeof data is "string" or "number" or "boolean"
            return data;
        }

    }

    objectToJson(object: ObjectClass): SerializedObject {
        let klass = <JavaClass>object.getType();
        if(this.wrapperTypes.indexOf(klass.identifier) >= 0){
            //@ts-ignore
            return object["value"];
        }


        // We solve circular object references by serializing an index when the same object occurs more than once.
        let index = this.objectToIndexMap.get(object);
        if (index != null) {
            return { "!i": index };
        }

        index = this.nextIndex++;
        this.objectToIndexMap.set(object, index);

        let serializedObject: SerializedObject = { "!k": klass.identifier, "!i": index };

        // Don't serialize system classes unless they are explicitely serializable
        if (klass.module.isLibraryModule) {
            return null;
        }

        while (klass != null) {
            let first: boolean = true;
            let serializedFields: any;
            for (let field of klass.getFields()) {
                if (!field.isStatic() && !field.isTransient()) {
                    if (first) {
                        first = false;
                        serializedFields = {};
                        //@ts-ignore
                        serializedObject[klass.identifier] = serializedFields;
                    }
                    //@ts-ignore
                    serializedFields[field.getInternalName()] = this.anyToJson(object[field.getInternalName()]);
                }
            }

            klass = <JavaClass>klass.getExtends();
        }

        return serializedObject;
    }

    fromJson(jsonString: string, type: JavaClass): ObjectClass | null {
        this.indexToObjectMap = new Map();
        this.arrayElementsToResolve = [];
        this.fieldsToResolve = [];

        let serializedObject: any = JSON.parse(jsonString);
        let ret = this.fromJsonObj(serializedObject, type, () => {});

        for (let ftr of this.fieldsToResolve) {
            let object = this.indexToObjectMap.get(ftr.objectToResolveIndex);
            if (object != null) {
                //@ts-ignore
                ftr.objectHoldingField[ftr.fieldIdentifier] = object;
            }
        }

        for(let atr of this.arrayElementsToResolve){
            let object = this.indexToObjectMap.get(atr.objectToResolveIndex);
            if (object != null) {
                atr.array[atr.arrayIndex] = object;
            }
        }

        return ret;
    }

    fromJsonObj(serializedObject: any, klass: JavaClass, registerResolver: (index: number) => void): ObjectClass | null{
        if (serializedObject == null) return null;

        if(this.wrapperTypes.indexOf(klass.identifier) >= 0){
            return new klass.runtimeClass!(serializedObject);
        }

        let klassIdentifier: string = serializedObject["!k"];
        let index = serializedObject["!i"];

        if(klassIdentifier != null){
            let realObject = new klass.runtimeClass!(); // todo: call constructor...

            let serializedFields: any = serializedObject[klass.identifier];
            if(serializedFields){
                while(klass != null){
                    for(let field of klass.getFields()){
                        let identifier = field.getInternalName();
                        let type = field.type;
                        if(type instanceof JavaClass){
                            realObject[identifier] = this.fromJsonObj(serializedFields[identifier], type, (index: number) => {
                                this.fieldsToResolve!.push({
                                    objectHoldingField: realObject,
                                    fieldIdentifier: identifier,
                                    objectToResolveIndex: index
                                });
                            });
                        } else {
                            realObject[identifier] = this.fromJsonAny(serializedFields[identifier], type);
                        }
                    }
                    klass = <JavaClass>klass.getExtends();
                }
            }

            this.indexToObjectMap!.set(index, realObject);

            return realObject;

        } else {
            let cachedObject = this.indexToObjectMap!.get(index);
            if(cachedObject != null) return cachedObject;
            registerResolver(index);
            return null;
        }

    }


    fromJsonAny(data: any, type: JavaType): any {
        if(type instanceof JavaEnum){
            let ordinal: number = data;
            return type.runtimeClass!.values.find((v: any) => v.ordinal == ordinal );
        } else if(type instanceof JavaArrayType && Array.isArray(data)){
            return this.fromJsonArray(data, type.elementType, type.dimension);
        } else if(type.isPrimitive){
            return data;
        }
        return undefined;
    }

    fromJsonArray(data: any[], elementType: JavaType, dimension: number): any[]{
        if(dimension > 1){
            return data.map(element => this.fromJsonArray(element, elementType, dimension - 1));
        } else {
            let ret: any[] = [];
            for(let i: number = 0; i < data.length; i++){
                let element = data[i];
                if(elementType instanceof JavaClass){
                    ret.push(this.fromJsonObj(element, elementType, (index: number) => {
                        this.arrayElementsToResolve!.push({
                            array: data,
                            arrayIndex: i,
                            objectToResolveIndex: index
                        })
                    }))
                } else {
                    ret.push(this.fromJsonAny(element, elementType));
                }
            }
            return ret;
        }
    }



}


