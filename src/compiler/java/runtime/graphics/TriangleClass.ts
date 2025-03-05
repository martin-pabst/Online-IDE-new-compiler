import { CallbackParameter } from '../../../common/interpreter/CallbackParameter.ts';
import { CallbackFunction } from '../../../common/interpreter/RuntimeConstants.ts';
import { Thread } from "../../../common/interpreter/Thread";
import { JRC } from '../../language/JavaRuntimeLibraryComments.ts';
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { PolygonClass } from './PolygonClass.ts';

export class TriangleClass extends PolygonClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Triangle extends Polygon", comment: JRC.TriangleClassComment },

        { type: "method", signature: "Triangle(double x1, double y1, double x2, double y2, double x3, double y3)", java: TriangleClass.prototype._cj$_constructor_$Triangle$double$double$double$double$double$double, comment: JRC.TriangleConstructorComment },
        { type: "method", signature: "final Triangle copy()", java: TriangleClass.prototype._mj$copy$Triangle$, comment: JRC.TriangleCopyComment },

    ]

    static type: NonPrimitiveType;
    left!: number;
    top!: number;
    width!: number;
    height!: number;

    _cj$_constructor_$Triangle$(t: Thread, callback: CallbackFunction) {
        this._cj$_constructor_$Polygon$boolean$double_I(t, callback, true, [0, 100, 100, 100, 50, 0]);

    }

    _cj$_constructor_$Triangle$double$double$double$double$double$double(t: Thread, callback: CallbackFunction,
        x1: number, y1: number, x2: number, y2: number, x3: number, y3: number
    ) {
        this._cj$_constructor_$Polygon$boolean$double_I(t, callback, true, [x1, y1, x2, y2, x3, y3]);

    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$Triangle$(t, callback);
    }

    _mj$copy$Triangle$(t: Thread, callback: CallbackParameter){
        let copy = new TriangleClass();
        copy._cj$_constructor_$Polygon$boolean$double_I(t, callback, true, [this.hitPolygonInitial[0].x, this.hitPolygonInitial[0].y,this.hitPolygonInitial[1].x, this.hitPolygonInitial[1].y,this.hitPolygonInitial[2].x, this.hitPolygonInitial[2].y,] );
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if(callback) callback();
    }


}