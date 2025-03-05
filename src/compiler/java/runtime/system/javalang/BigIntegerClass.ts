import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "./ObjectClassStringClass";

export class BigIntegerClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class BigInteger extends Object", comment: JRC.BigIntegerClassComment },

        { type: "method", signature: "BigInteger(long val)", java: BigIntegerClass.prototype._cj$_constructor_$BigInteger$long, comment: JRC.BigIntegerConstructorComment },
        { type: "method", signature: "BigInteger(string val)", java: BigIntegerClass.prototype._cj$_constructor_$BigInteger$string, comment: JRC.BigIntegerConstructorComment },
        { type: "method", signature: "final BigInteger add(BigInteger otherNumber)", native: BigIntegerClass.prototype._add, comment: JRC.BigIntegerAddComment },
        { type: "method", signature: "final BigInteger subtract(BigInteger otherNumber)", native: BigIntegerClass.prototype._subtract, comment: JRC.BigIntegerSubtractComment },
        { type: "method", signature: "final BigInteger divide(BigInteger otherNumber)", native: BigIntegerClass.prototype._divide, comment: JRC.BigIntegerDivideComment },
        { type: "method", signature: "final BigInteger multiply(BigInteger otherNumber)", native: BigIntegerClass.prototype._multiply, comment: JRC.BigIntegerMultiplyComment },
        { type: "method", signature: "final BigInteger remainder(BigInteger otherNumber)", native: BigIntegerClass.prototype._remainder, comment: JRC.BigIntegerRemainderComment },
        { type: "method", signature: "final BigInteger modPow(BigInteger exponent,BigInteger m)", native: BigIntegerClass.prototype._modPow, comment: JRC.BigIntegerRemainderComment },
        { type: "method", signature: "final String toString()", java: BigIntegerClass.prototype._mj$toString$String$, comment: JRC.BigIntegerToStringComment },
        { type: "method", signature: "final int intValue()", native: BigIntegerClass.prototype._intValue, comment: JRC.BigIntegerIntValueComment },

    ]

    static type: NonPrimitiveType;
    value!: bigint;

    constructor(value?: bigint){
        super();
        this.value = value!;
    }

    __internalHashCode(): any {
        return this.value;
    }

    _cj$_constructor_$BigInteger$string(t: Thread, callback: CallbackFunction, value: string){
        this.value = BigInt(value);
        t.s.push(this);
        if(callback) callback();
    }

    _cj$_constructor_$BigInteger$long(t: Thread, callback: CallbackFunction, value: number){
        this.value = BigInt(value);
        t.s.push(this);
        if(callback) callback();
    }

    _add(other: BigIntegerClass): BigIntegerClass {
        return new BigIntegerClass(this.value + other.value);
    }

    _subtract(other: BigIntegerClass): BigIntegerClass {
        return new BigIntegerClass(this.value - other.value);
    }

    _divide(other: BigIntegerClass): BigIntegerClass {
        return new BigIntegerClass(this.value / other.value);
    }

    _remainder(other: BigIntegerClass): BigIntegerClass {
        return new BigIntegerClass(this.value % other.value);
    }

    _multiply(other: BigIntegerClass): BigIntegerClass {
        return new BigIntegerClass(this.value * other.value);
    }

    _intValue(): number {
        return Number(BigInt.asIntN(52, this.value));
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        t.s.push(new StringClass(this.value.toString()));
        if(callback) callback();
        return;
    }

    _debugOutput(){
        let s = `${this.value.toString()}`;
        return s;
    }

    _modPow(exponent:BigIntegerClass,m2:BigIntegerClass):BigIntegerClass{
        let exp=exponent.value;
        let m=m2.value;
        let v=1n;
        let expBin=this.value;
        while(exp>0n){
            if((exp&1n)==1n){
                v*=expBin;
                v%=m;
            }
            expBin*=expBin;
            expBin%=m;
            exp>>=1n;
        }
        return new BigIntegerClass(v);
    }

}
