import { Punkt, abstandPunktZuGerade, abstandPunktZuStrecke, polygonEnthältPunkt, schnittpunkteKreisStrecke, streckeSchneidetStrecke } from "../../../../../tools/MatheTools";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../javalang/ObjectClassStringClass";
import { Vector2Class } from "./Vector2Class";

export class MathToolsClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class MathTools extends Object", comment: JRC.MathToolsClassComment },
        { type: "method", signature: "static Vector2[] intersectCircleWithPolygon(double mx, double my, double r, Vector2[] polygon)", native: MathToolsClass.intersectCircleWithPolygon, comment: JRC.MathToolsIntersectCircleWithPolygonComment },
        { type: "method", signature: "static Vector2 intersectLineSegments(Vector2 p0, Vector2 p1, Vector2 p2, Vector2 p3)", native: MathToolsClass.intersectLineSegments, comment: JRC.MathToolsIntersectLineSegmentsComment },
        { type: "method", signature: "static boolean polygonContainsPoint(Vector2[] polygonPoints, Vector2 p)", native: MathToolsClass.polygonContainsPoint, comment: JRC.MathToolsPolygonContainsPointComment },
        { type: "method", signature: "static double distancePointToLine(Vector2 p, Vector2 a, Vector2 b)", native: MathToolsClass.distancePointToLine, comment: JRC.MathToolsDistancePointToLineComment },
        { type: "method", signature: "static double distancePointToLineSegment(Vector2 p, Vector2 a, Vector2 b)", native: MathToolsClass.distancePointToLineSegment, comment: JRC.MathToolsDistancePointToLineSegmentComment },
    ];

    static type: NonPrimitiveType;

    static intersectCircleWithPolygon(mx: number, my: number, r: number, polygon: Vector2Class[]): Vector2Class[] {

        let m: Punkt = { x: mx, y: my };
        let schnittpunkte: Punkt[] = [];
        for (let i = 0; i < polygon.length; i++) {
            let p1 = polygon[i];
            let p2 = polygon[(i + 1) % polygon.length];
            schnittpunkteKreisStrecke(m, r, p1, p2, schnittpunkte);
        }

        return schnittpunkte.map(s => new Vector2Class(s.x, s.y));
    }

    static intersectLineSegments(p0: Vector2Class, p1: Vector2Class, p2: Vector2Class, p3: Vector2Class): Vector2Class | null {
        let ps: Punkt = { x: 0, y: 0 };
        if (streckeSchneidetStrecke(p0, p1, p2, p3, ps)) {
            return new Vector2Class(ps.x, ps.y);
        } else {
            return null;
        }
    }

    static polygonContainsPoint(polygon: Vector2Class[], p: Vector2Class): boolean {
        return polygonEnthältPunkt(polygon, p);
    }

    static distancePointToLine(p: Vector2Class, a: Vector2Class, b: Vector2Class): number {
        return abstandPunktZuGerade(a, b, p);
    }

    static distancePointToLineSegment(p: Vector2Class, a: Vector2Class, b: Vector2Class): number {
        return abstandPunktZuStrecke(a, b, p);
    }

}
