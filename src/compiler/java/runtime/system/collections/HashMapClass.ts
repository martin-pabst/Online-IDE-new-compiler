import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { BiConsumerInterface } from "../functional/BiConsumerInterface.ts";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../javalang/ObjectClassStringClass.ts";
import { ArrayListClass } from "./ArrayListClass.ts";
import { HashSetClass } from "./HashSetClass.ts";

type Value = {
    k: ObjectClass | null;
    v: ObjectClass | null;
}

export class HashMapClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class HashMap<K, V> implements Map<K, V>", comment: JRC.hashMapClassComment },

        { type: "method", signature: "HashMap()", native: HashMapClass.prototype._constructor, comment: JRC.hashMapConstructorComment },

        // from Map-interface
        { type: "method", signature: "int size()", native: HashMapClass.prototype._size, comment: JRC.mapSizeComment },
        { type: "method", signature: "boolean isEmpty()", native: HashMapClass.prototype._isEmpty, comment: JRC.mapIsEmptyComment },
        { type: "method", signature: "boolean containsKey(K key)", native: HashMapClass.prototype._containsKey, comment: JRC.mapContainsKeyComment },
        { type: "method", signature: "boolean containsValue(V value)", native: HashMapClass.prototype._containsValue, comment: JRC.mapContainsValueComment },
        { type: "method", signature: "V get(K key)", native: HashMapClass.prototype._get, comment: JRC.mapGetComment },
        { type: "method", signature: "V put(K key, V value)", native: HashMapClass.prototype._put, comment: JRC.mapPutComment },
        { type: "method", signature: "void clear()", native: HashMapClass.prototype._clear, comment: JRC.mapClearComment },
        { type: "method", signature: "void forEach(BiConsumer<? super K, ? super V> action)", java: HashMapClass.prototype._mj$forEach$void$BiConsumer, comment: JRC.mapForeachComment },
        { type: "method", signature: "Collection<V> values()", java: HashMapClass.prototype._mj$values$Collection$, comment: JRC.mapValuesComment },
        { type: "method", signature: "Set<K> keySet()", java: HashMapClass.prototype._mj$keySet$Set$, comment: JRC.mapKeySetComment },

        { type: "method", signature: "V remove(K key)", java: HashMapClass.prototype._mj$remove$V$K, comment: JRC.mapRemoveComment1 },
        { type: "method", signature: "boolean remove(K key, V value)", java: HashMapClass.prototype._mj$remove$boolean$K$V, comment: JRC.mapRemoveComment1 },


        // override toString-method
        { type: "method", signature: "String toString()", java: HashMapClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },


    ]

    static type: NonPrimitiveType;

    map: Map<any, Value> = new Map();

    _constructor() {
        return this;
    }

    _size() {
        return this.map.size;
    }

    _isEmpty() {
        return this.map.size == 0;
    }

    _containsKey(key: ObjectClass) {
        if (key == null) {
            return (typeof this.map.get(null)) !== "undefined";
        } else {
            let hashCode = key.__internalHashCode();
            return (typeof this.map.get(hashCode)) !== "undefined";
        }
    }

    _values() {
        let values: (ObjectClass | null)[] = [];
        this.map.forEach((v, k) => values.push(v.v));
        return values;
    }

    _containsValue(value: ObjectClass) {
        let ret: boolean = false;
        for (let v of this.map.values()) {
            if (v.v == value) {
                ret = true;
                break;
            }
        }
        return ret;
    }

    _get(key: ObjectClass) {
        if (key == null) {
            return this.map.get(null)?.v || null;
        } else {
            let hashCode = key.__internalHashCode();
            return this.map.get(hashCode)?.v || null;
        }
    }

    _put(key: ObjectClass, value: ObjectClass) {
        if (key == null) {
            let oldValue = this.map.get(null) || null;
            this.map.set(null, { k: null, v: value });
            return oldValue;
        } else {
            let hashCode = key.__internalHashCode();
            let oldValue = this.map.get(hashCode);
            this.map.set(hashCode, { k: key, v: value });
            return oldValue;
        }
    }

    _clear() {
        this.map.clear();
    }

    _mj$forEach$void$BiConsumer(t: Thread, callback: CallbackFunction, biConsumer: BiConsumerInterface) {

        let index: number = -1;
        let elements: Value[] = [];
        this.map.forEach((v, k) => elements.push(v));

        let f = () => {
            index++;
            if (index < elements.length) {
                biConsumer._mj$accept$void$T$U(t, f, elements[index].k!, elements[index].v!);
            } else {
                if (callback) callback();
            }
        }

        f();

    }

    _mj$values$Collection$(t: Thread, callback: CallbackFunction) {
        //@ts-ignore
        t.s.push(new ArrayListClass(this._values()))
        if (callback) callback();
    }

    _mj$keySet$Set$(t: Thread, callback: CallbackFunction) {
        let set = new HashSetClass();
        this.map.forEach((v, k) => {
            set._add(v.k!);
        })
        t.s.push(set);
        if (callback) callback;
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        let entries: Value[] = [];
        this.map.forEach((v, k) => entries.push(v));

        let s = "[";
        let index = -1;


        let f: (callback: () => void) => void;

        let processValue = (value: ObjectClass | null, callback: () => void) => {
            s += " = ";
            if(value == null) {
                s += "null";
                f(callback);
            } else {
                value._mj$toString$String$(t, () => {
                    s += t.s.pop().value + "}";
                    f(callback);
                });
            }

        }

        f = (callback: () => void) => {
            index++;
            if(index >= entries.length){
                s += "]";
                callback();
                return;
            }
            let entry = entries[index];
            if(index > 0) s += ", ";
            s += "{";
            if(entry.k == null) {
                s += "null";
                processValue(entry.v, callback);
            } else {
                entry.k._mj$toString$String$(t, () => {
                    s += t.s.pop().value;
                    processValue(entry.v, callback);
                });
            }

        }

        f(() => {
            t.s.push( new StringClass(s));
            if(callback) callback();
        })

    }


    _mj$remove$V$K(t: Thread, callback: CallbackFunction, key: ObjectClass) { 
        let value: Value | undefined;
        let hashCode: any;

        if (key == null) {
            value = this.map.get(null);
        } else {
            hashCode = key.__internalHashCode();
            value = this.map.get(hashCode);
        }

        if(typeof value !== "undefined"){
            this.map.delete(hashCode);
            t.s.push(value.v);
            if(callback) callback();
        }

        t.s.push(null);
        if(callback) callback();
}
    
    _mj$remove$boolean$K$V(t: Thread, callback: CallbackFunction, key: ObjectClass, value: ObjectClass) {
        let value1: Value | undefined;
        let hashCode: any;

        if (key == null) {
            value1 = this.map.get(null);
        } else {
            hashCode = key.__internalHashCode();
            value1 = this.map.get(hashCode);
        }

        if(typeof value1 !== "undefined"){

            // test if value.equals(value1.v);
            let v1 = value1.v;
            if(v1 == null){
                if(value == null){
                    this.map.delete(hashCode);
                }
                t.s.push(value == null);
                if(callback) callback(); 
                return;       
            }
            
            v1._mj$equals$boolean$Object(t, () => {
                const ret = t.s.pop();
                if(ret){
                    this.map.delete(hashCode);
                }
                t.s.push(ret);
                if(callback) callback(); 
                return;       
            }, value);

            return;

        }

        t.s.push(false);
        if(callback) callback();
 }


}