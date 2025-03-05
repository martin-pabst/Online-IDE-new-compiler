import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "./ObjectClassStringClass";

export class MathClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Math extends Object"},
        {type: "method", signature: "private Math()", native: MathClass.prototype._emptyConstructor},
        {type: "field", signature: "public static final double PI", template: 'Math.PI', constantValue: Math.PI, comment: JRC.mathPIComment},
        {type: "field", signature: "public static final double E", template: 'Math.E', constantValue: Math.E , comment: JRC.mathEComment},

        {type: "method", signature: "public static int abs(int a)", template: 'Math.abs(§1)', constantFoldingFunction: (a) => Math.abs(a) , comment: JRC.mathAbsComment},
        {type: "method", signature: "public static long abs(long a)", template: 'Math.abs(§1)', constantFoldingFunction: (a) => Math.abs(a), comment: JRC.mathAbsComment},
        {type: "method", signature: "public static float abs(float a)", template: 'Math.abs(§1)', constantFoldingFunction: (a) => Math.abs(a), comment: JRC.mathAbsComment},
        {type: "method", signature: "public static double abs(double a)", template: 'Math.abs(§1)', constantFoldingFunction: (a) => Math.abs(a), comment: JRC.mathAbsComment},
        {type: "method", signature: "public static double sin(double angleInRadians)", template: 'Math.sin(§1)', constantFoldingFunction: (a) => Math.sin(a) , comment: JRC.mathSinComment},
        {type: "method", signature: "public static double cos(double angleInRadians)", template: 'Math.cos(§1)', constantFoldingFunction: (a) => Math.cos(a) , comment: JRC.mathCosinComment},
        {type: "method", signature: "public static double tan(double angleInRadians)", template: 'Math.tan(§1)', constantFoldingFunction: (a) => Math.tan(a) , comment: JRC.mathTanComment},
        {type: "method", signature: "public static double asin(double angleInRadians)", template: 'Math.asin(§1)', constantFoldingFunction: (a) => Math.asin(a), comment: JRC.mathArcsinComment},
        {type: "method", signature: "public static double acos(double angleInRadians)", template: 'Math.acos(§1)', constantFoldingFunction: (a) => Math.acos(a) , comment: JRC.mathArccosComment},
        {type: "method", signature: "public static double atan(double angleInRadians)", template: 'Math.atan(§1)', constantFoldingFunction: (a) => Math.atan(a) , comment: JRC.mathArctanComment},
        {type: "method", signature: "public static double atan2(double y, double x)", template: 'Math.atan2(§1, §2)', constantFoldingFunction: (y, x) => Math.atan2(y, x) , comment: JRC.mathAtan2Comment},
        {type: "method", signature: "public static int round(double value)", template: 'Math.round(§1)', constantFoldingFunction: (value) => Math.round(value) , comment: JRC.mathRoundComment},
        {type: "method", signature: "public static int floor(double value)", template: 'Math.floor(§1)', constantFoldingFunction: (value) => Math.floor(value) , comment: JRC.mathFloorComment},
        {type: "method", signature: "public static int ceil(double value)", template: 'Math.ceil(§1)', constantFoldingFunction: (value) => Math.ceil(value) , comment: JRC.mathCeilComment},
        {type: "method", signature: "public static int signum(double value)", template: 'Math.sign(§1)', constantFoldingFunction: (value) => Math.sign(value) , comment: JRC.mathSignComment},
        {type: "method", signature: "public static double sqrt(double a)", template: 'Math.sqrt(§1)', constantFoldingFunction: (a) => Math.sqrt(a) , comment: JRC.mathSqrtComment},
        {type: "method", signature: "public static double random()", template: 'Math.random()' , comment: JRC.mathRandomComment},
        {type: "method", signature: "public static double pow(double basis, double exponent)", template: 'Math.pow(§1, §2)', constantFoldingFunction: (a, b) => Math.pow(a, b) , comment: JRC.mathPowComment},
        {type: "method", signature: "public static double toDegrees(double angleInRad)", template: '(§1 / Math.PI * 180)', constantFoldingFunction: (a) => a/Math.PI*180 , comment: JRC.mathToDegreesComment},
        {type: "method", signature: "public static double toRadians(double angleInDegrees)", template: '(§1 / 180 * Math.PI)', constantFoldingFunction: (a) => a/180*Math.PI , comment: JRC.mathToRadiansComment},
        {type: "method", signature: "public static double exp(double value)", template: 'Math.exp(§1)', constantFoldingFunction: (value) => Math.exp(value) , comment: JRC.mathExpComment},
        {type: "method", signature: "public static double log(double value)", template: 'Math.log(§1)', constantFoldingFunction: (value) => Math.log(value) , comment: JRC.mathLogComment},
        {type: "method", signature: "public static double log10(double value)", template: 'Math.log10(§1)', constantFoldingFunction: (value) => Math.log10(value) , comment: JRC.mathLog10Comment},

        {type: "method", signature: "public static int max(int a, int b)", template: 'Math.max(§1, §2)', constantFoldingFunction: (a, b) => Math.max(a, b), comment: JRC.mathMaxComment},
        {type: "method", signature: "public static long max(long a, long b)", template: 'Math.max(§1, §2)', constantFoldingFunction: (a, b) => Math.max(a, b), comment: JRC.mathMaxComment},
        {type: "method", signature: "public static float max(float a, float b)", template: 'Math.max(§1, §2)', constantFoldingFunction: (a, b) => Math.max(a, b), comment: JRC.mathMaxComment},
        {type: "method", signature: "public static double max(double a, double b)", template: 'Math.max(§1, §2)', constantFoldingFunction: (a, b) => Math.max(a, b), comment: JRC.mathMaxComment},

        {type: "method", signature: "public static int min(int a, int b)", template: 'Math.min(§1, §2)', constantFoldingFunction: (a, b) => Math.min(a, b) , comment: JRC.mathMinComment},
        {type: "method", signature: "public static long min(long a, long b)", template: 'Math.min(§1, §2)', constantFoldingFunction: (a, b) => Math.min(a, b) , comment: JRC.mathMinComment},
        {type: "method", signature: "public static float min(float a, float b)", template: 'Math.min(§1, §2)', constantFoldingFunction: (a, b) => Math.min(a, b) , comment: JRC.mathMinComment},
        {type: "method", signature: "public static double min(double a, double b)", template: 'Math.min(§1, §2)', constantFoldingFunction: (a, b) => Math.min(a, b) , comment: JRC.mathMinComment},

    ]

    static type: NonPrimitiveType;

    static PI: number = Math.PI;
    static E: number = Math.E;

    constructor(){
        super();
    }

    _emptyConstructor(){
        return this;
    }

}