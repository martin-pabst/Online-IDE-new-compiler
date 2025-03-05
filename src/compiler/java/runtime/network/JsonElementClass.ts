import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../system/javalang/RuntimeException";

export class JsonElementClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class JsonElement extends Object", comment: JRC.JsonElementClassComment},
        {type: "method", signature: "string getType()", native: JsonElementClass.prototype._jsonElementGetType, comment: JRC.JsonElementGetTypeComment},
        {type: "method", signature: "JsonElement getAttributeValue(string identifier)", native: JsonElementClass.prototype._getAttributeValue, comment: JRC.JsonElementGetAttributeValueComment},
        {type: "method", signature: "JsonElement[] getArrayValues()", native: JsonElementClass.prototype._getArrayValues, comment: JRC.JsonElementGetArrayValuesComment},
        {type: "method", signature: "JsonElement getArrayValue(string identifier)", native: JsonElementClass.prototype._getAttributeValue, comment: JRC.JsonElementGetAttributeValueComment},
        {type: "method", signature: "string getAsString()", native: JsonElementClass.prototype._getAsString1, comment: JRC.JsonElementGetAsStringComment},
        {type: "method", signature: "string getAsString(string identifier)", native: JsonElementClass.prototype._getAsString2, comment: JRC.JsonElementGetAsStringComment},
        {type: "method", signature: "int getAsInt()", native: JsonElementClass.prototype._getAsInt1, comment: JRC.JsonElementGetAsIntComment},
        {type: "method", signature: "int getAsInt(string identifier)", native: JsonElementClass.prototype._getAsInt2, comment: JRC.JsonElementGetAsIntComment},
        {type: "method", signature: "double getAsDouble()", native: JsonElementClass.prototype._getAsDouble1, comment: JRC.JsonElementGetAsDoubleComment},
        {type: "method", signature: "double getAsDouble(string identifier)", native: JsonElementClass.prototype._getAsDouble2, comment: JRC.JsonElementGetAsDoubleComment},
        {type: "method", signature: "boolean getAsBoolean()", native: JsonElementClass.prototype._getAsBoolean1, comment: JRC.JsonElementGetAsBooleanComment},
        {type: "method", signature: "boolean getAsBoolean(string identifier)", native: JsonElementClass.prototype._getAsBoolean2, comment: JRC.JsonElementGetAsBooleanComment},
        {type: "method", signature: "string toJson()", native: JsonElementClass.prototype._toJson, comment: JRC.JsonElementToJsonComment},
        {type: "method", signature: "string[] getAttributeIdentifiers()", native: JsonElementClass.prototype._getAttributeIdentifiers, comment: JRC.JsonElementGetAttributeIdentifiersComment},

    ]

    static type: NonPrimitiveType;

    value: any;

    constructor(value?: any){
        super()
        this.value = value;
    }

    _jsonElementGetType(): string {
        return Array.isArray(this.value) ? "array" : typeof this.value;
    }

    _getArrayValues(): JsonElementClass[] {
        if (!Array.isArray(this.value)) {
            throw new RuntimeExceptionClass(JRC.JsonElementNoArrayException());
        }

        return this.value.map(v => new JsonElementClass(v));

    }

    _getAttributeValue(identifier: string): JsonElementClass {
        if (Array.isArray(this.value) || (typeof this.value) != "object") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoObjectException());
        }

        return new JsonElementClass(this.value[identifier])

    }

    _getAsString1(): string {
        if (typeof this.value != "string") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoStringExceptionComment());
        }

        return this.value;
    }


    _getAsString2(identifier: string): string {
        if (Array.isArray(this.value) || (typeof this.value) != "object") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoObjectException());
        }


        if (typeof this.value[identifier] != "string") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoStringExceptionComment());
        }

        return this.value[identifier];
    }

    _getAsInt1(): number {
        if (typeof this.value != "number") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoIntValueException());
        }

        return Math.round(this.value);
    }


    _getAsInt2(identifier: string): number {
        if (Array.isArray(this.value) || (typeof this.value) != "object") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoObjectException());
        }


        if (typeof this.value[identifier] != "number") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoIntValueException());
        }

        return Math.round(this.value[identifier]);
    }

    _getAsDouble1(): number {
        if (typeof this.value != "number") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoDoubleException());
        }

        return this.value;
    }


    _getAsDouble2(identifier: string): number {
        if (Array.isArray(this.value) || (typeof this.value) != "object") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoObjectException());
        }


        if (typeof this.value[identifier] != "number") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoDoubleException());
        }

        return this.value[identifier];
    }

    _getAsBoolean1(): boolean {
        if (typeof this.value != "boolean") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoBooleanException());
        }

        return this.value;
    }


    _getAsBoolean2(identifier: string): boolean {
        if (Array.isArray(this.value) || (typeof this.value) != "object") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoObjectException());
        }


        if (typeof this.value[identifier] != "boolean") {
            throw new RuntimeExceptionClass(JRC.JsonElementNoBooleanException());
        }

        return this.value[identifier];
    }

    _toJson(): string {
        return JSON.stringify(this.value);
    }

    _getAttributeIdentifiers(): string[] {
        if (Array.isArray(this.value) || (typeof this.value) != "object") {
            throw new RuntimeExceptionClass(JRC.JsonElementGetAttributeIdentifiersException());
        }

        let identifierList: string[] = [];
        for (const [key, v] of Object.entries(this.value)){
            identifierList.push(key)
        }

        return identifierList;

    }

}