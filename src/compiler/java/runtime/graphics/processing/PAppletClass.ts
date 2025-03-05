import p5 from "p5";  
import { DOM } from "../../../../../tools/DOM";
import { GraphicSystem } from "../../../../common/interpreter/GraphicsManager";
import { Interpreter } from "../../../../common/interpreter/Interpreter";
import { SchedulerState } from "../../../../common/interpreter/SchedulerState";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../../common/interpreter/Thread";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";

import "/assets/css/papplet.css";


export class PAppletClass extends ObjectClass implements GraphicSystem {
    static __javaDeclarations: LibraryDeclarations = (<LibraryDeclarations>[
        { type: "declaration", signature: "class PApplet extends Object", comment: JRC.PAppletClassComment },

        { type: "field", signature: "int mouseX", template: "§1.p5o.mouseX", comment: JRC.PAppletMouseXComment },
        { type: "field", signature: "int mouseY", template: "§1.p5o.mouseY", comment: JRC.PAppletMouseYComment },
        { type: "field", signature: "int pMouseX", template: "§1.p5o.pMouseX", comment: JRC.PAppletPMouseXComment },
        { type: "field", signature: "int pMouseY", template: "§1.p5o.pMouseY", comment: JRC.PAppletPMouseYComment },
        { type: "field", signature: "int mouseButton", template: "§1.p5o.mouseButton", comment: JRC.PAppletMouseButtonComment },

        { type: "field", signature: "string key", template: "§1.p5o.key", comment: JRC.PAppletKeyComment },

        { hiddenWhenDebugging: true, type: "field", signature: "int LEFT", template: "§1.p5o.LEFT", comment: JRC.PAppletLEFTComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int CENTER", template: "§1.p5o.CENTER", comment: JRC.PAppletCENTERComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int RIGHT", template: "§1.p5o.RIGHT", comment: JRC.PAppletRIGHTComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int TOP", template: "§1.p5o.TOP", comment: JRC.PAppletTOPComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int BASELINE", template: "§1.p5o.BASELINE", comment: JRC.PAppletBASELINEComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int BOTTOM", template: "§1.p5o.BOTTOM", comment: JRC.PAppletBOTTOMComment },

        { hiddenWhenDebugging: true, type: "field", signature: "int CORNER", template: "§1.p5o.CORNER", comment: JRC.PAppletCORNERComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int CORNERS", template: "§1.p5o.CORNERS", comment: JRC.PAppletCORNERSComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int RADIUS", template: "§1.p5o.RADIUS", comment: JRC.PAppletRADIUSComment },

        { hiddenWhenDebugging: true, type: "field", signature: "int POINTS", template: "§1.p5o.POINTS", comment: JRC.PAppletPOINTSComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int LINES", template: "§1.p5o.LINES", comment: JRC.PAppletLINESComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int TRIANGLES", template: "§1.p5o.TRIANGLES", comment: JRC.PAppletTRIANGLESComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int TRIANGLE_STRIP", template: "§1.p5o.TRIANGLE_STRIP", comment: JRC.PAppletTRIANGLE_STRIPComment },
        { hiddenWhenDebugging: true, type: "field", signature: "int TRIANGLE_FAN", template: "§1.p5o.TRIANGLE_FAN", comment: JRC.PAppletTRIANGLE_FANComment },

        { hiddenWhenDebugging: true, type: "field", signature: "string QUADS", template: "§1.p5o.QUADS", comment: JRC.PAppletQUADSComment },
        { hiddenWhenDebugging: true, type: "field", signature: "string QUAD_STRIP", template: "§1.p5o.QUAD_STRIP", comment: JRC.PAppletQUAD_STRIPComment },
        { hiddenWhenDebugging: true, type: "field", signature: "string TESS", template: "§1.p5o.TESS", comment: JRC.PAppletTESSComment },

        { hiddenWhenDebugging: true, type: "field", signature: "string CLOSE", template: "§1.p5o.CLOSE", comment: JRC.PAppletCLOSEComment },

        { hiddenWhenDebugging: true, type: "field", signature: "string DEGREES", template: "§1.p5o.DEGREES", comment: JRC.PAppletDEGREESComment },
        { hiddenWhenDebugging: true, type: "field", signature: "string RADIANS", template: "§1.p5o.RADIANS", comment: JRC.PAppletRADIANSComment },

        { hiddenWhenDebugging: true, type: "field", signature: "string WEBGL", template: "§1.p5o.WEBGL", comment: JRC.PAppletWEBGLComment },
        { hiddenWhenDebugging: true, type: "field", signature: "string P2D", template: "§1.p5o.P2D", comment: JRC.PAppletP2DComment },

        { hiddenWhenDebugging: true, type: "field", signature: "string RGB", template: "§1.p5o.RGB", comment: JRC.PAppletRGBComment },
        { hiddenWhenDebugging: true, type: "field", signature: "string HSL", template: "§1.p5o.HSL", comment: JRC.PAppletHSLComment },
        { hiddenWhenDebugging: true, type: "field", signature: "string HSB", template: "§1.p5o.HSB", comment: JRC.PAppletHSBComment },

        { hiddenWhenDebugging: true, type: "field", signature: "string PI", template: "§1.p5o.PI", comment: "PI = 3.1415..." },
        { hiddenWhenDebugging: true, type: "field", signature: "string QUARTER_PI", template: "§1.p5o.QUARTER_PI", comment: "PI/4" },
        { hiddenWhenDebugging: true, type: "field", signature: "string TWO_PI", template: "§1.p5o.TWO_PI", comment: "2*PI" },
        { hiddenWhenDebugging: true, type: "field", signature: "string TAU", template: "§1.p5o.TAU", comment: "2*PI" },

        { type: "method", signature: "PApplet()", java: PAppletClass.prototype._cj$_constructor_$PApplet$, comment: JRC.PAppletConstructorComment },

        { type: "method", signature: "void main()", java: PAppletClass.prototype._mj$main$void$, comment: JRC.PAppletMainComment },
        { type: "method", signature: "void loop()", template: `§1.loopStopped = false`, comment: JRC.PAppletLoopComment },
        { type: "method", signature: "void noLoop()", template: `§1.loopStopped = true`, comment: JRC.PAppletNoLoopComment },
        { type: "method", signature: "void size(int width, int height)", native: PAppletClass.prototype._createCanvas, comment: JRC.PAppletCreateCanvasComment },
        { type: "method", signature: "void createCanvas(int width, int height)", native: PAppletClass.prototype._createCanvas, comment: JRC.PAppletCreateCanvasComment },
        { type: "method", signature: "void createCanvas(int width, int height, string renderer)", native: PAppletClass.prototype._createCanvas, comment: JRC.PAppletCreateCanvasComment },

        // Events:
        { type: "method", signature: "void setup()", java: PAppletClass.prototype._mj$setup$void$, comment: JRC.PAppletSetupComment },
        { type: "method", signature: "void settings()", java: PAppletClass.prototype._mj$settings$void$, comment: JRC.PAppletSettingsComment },
        { type: "method", signature: "void preload()", java: PAppletClass.prototype._mj$preload$void$, comment: JRC.PAppletPreloadComment },
        { type: "method", signature: "void draw()", java: PAppletClass.prototype._mj$draw$void$, comment: JRC.PAppletDrawComment },
        { type: "method", signature: "void mousePressed()", java: PAppletClass.prototype._mj$mousePressed$void$, comment: JRC.PAppletMousePressedComment },
        { type: "method", signature: "void mouseReleased()", java: PAppletClass.prototype._mj$mouseReleased$void$, comment: JRC.PAppletMouseReleasedComment },
        { type: "method", signature: "void mouseClicked()", java: PAppletClass.prototype._mj$mouseClicked$void$, comment: JRC.PAppletMouseClickedComment },
        { type: "method", signature: "void mouseDragged()", java: PAppletClass.prototype._mj$mouseDragged$void$, comment: JRC.PAppletMouseDraggedComment },
        { type: "method", signature: "void mouseEntered()", java: PAppletClass.prototype._mj$mouseEntered$void$, comment: JRC.PAppletMouseEnteredComment },
        { type: "method", signature: "void mouseExited()", java: PAppletClass.prototype._mj$mouseExited$void$, comment: JRC.PAppletMouseExitedComment },
        { type: "method", signature: "void mouseMoved()", java: PAppletClass.prototype._mj$mouseMoved$void$, comment: JRC.PAppletMouseMovedComment },
        { type: "method", signature: "void keyPressed()", java: PAppletClass.prototype._mj$keyPressed$void$, comment: JRC.PAppletKeyPressedComment },
        { type: "method", signature: "void keyReleased()", java: PAppletClass.prototype._mj$keyReleased$void$, comment: JRC.PAppletKeyReleasedComment },

        // methods
        { type: "method", signature: "final void clear()", template: "§1.p5o.clear()", comment: JRC.PAppletClear0Comment },
        { type: "method", signature: "final void background(double rgb)", template: "§1.p5o.background(§2)", comment: JRC.PAppletBackground1Comment },
        { type: "method", signature: "final string background(string colorAsString)", template: "§1.p5o.background(§2)", comment: JRC.PAppletBackground2Comment },
        { type: "method", signature: "final void background(double v1, double v2, double v3)", template: "§1.p5o.background(§2, §3, §4)", comment: JRC.PAppletBackground3Comment },
        { type: "method", signature: "final void fill(int rgb)", template: "§1.p5o.fill(§2)", comment: JRC.PAppletFill1Comment },
        { type: "method", signature: "final void fill(string rgb)", template: "§1.p5o.fill(§2)", comment: JRC.PAppletFill1aComment },
        { type: "method", signature: "final void fill(int rgb, double alpha)", template: "§1.p5o.fill(§2, §3)", comment: JRC.PAppletFill2Comment },
        { type: "method", signature: "final void fill(double gray)", template: "§1.p5o.fill(§2)", comment: JRC.PAppletFill3Comment },
        { type: "method", signature: "final void fill(double v1, double v2, double v3)", template: "§1.p5o.fill(§2, §3, §4)", comment: JRC.PAppletFill4Comment },
        { type: "method", signature: "final void fill(double v1, double v2, double v3, double alpha)", template: "§1.p5o.fill(§2, §3, §4, §5)", comment: JRC.PAppletFill5Comment },
        { type: "method", signature: "final void noFill()", template: "§1.p5o.noFill()", comment: JRC.PAppletNoFill0Comment },
        { type: "method", signature: "final void stroke(int rgb)", template: "§1.p5o.stroke(§2)", comment: JRC.PAppletStroke1Comment },
        { type: "method", signature: "final void stroke(string rgb)", template: "§1.p5o.stroke(§2)", comment: JRC.PAppletStroke1aComment },
        { type: "method", signature: "final void stroke(int rgb, double alpha)", template: "§1.p5o.stroke(§2, §3)", comment: JRC.PAppletStroke2Comment },
        { type: "method", signature: "final void stroke(double gray)", template: "§1.p5o.stroke(§2)", comment: JRC.PAppletStroke3Comment },
        { type: "method", signature: "final void stroke(double v1, double v2, double v3)", template: "§1.p5o.stroke(§2, §3, §4)", comment: JRC.PAppletStroke4Comment },
        { type: "method", signature: "final void stroke(double v1, double v2, double v3, double alpha)", template: "§1.p5o.stroke(§2, §3, §4, §5)", comment: JRC.PAppletStroke5Comment },
        { type: "method", signature: "final void strokeWeight(double weight)", template: "§1.p5o.strokeWeight(§2)", comment: JRC.PAppletStrokeWeight1Comment },
        { type: "method", signature: "final void noStroke()", template: "§1.p5o.noStroke()", comment: JRC.PAppletNoStroke0Comment },
        { type: "method", signature: "final string color(double gray)", template: "§1.p5o.color(§2)", comment: JRC.PAppletColor1Comment },
        { type: "method", signature: "final string color(string colorAsString)", template: "§1.p5o.color(§2)", comment: JRC.PAppletColor2Comment },
        { type: "method", signature: "final string color(double gray, double alpha)", template: "§1.p5o.color(§2, §3)", comment: JRC.PAppletColor3Comment },
        { type: "method", signature: "final string color(double v1, double v2, double v3)", template: "§1.p5o.color(§2, §3, §4)", comment: JRC.PAppletColor4Comment },
        { type: "method", signature: "final string color(double v1, double v2, double v3, double alpha)", template: "§1.p5o.color(§2, §3, §4, §5)", comment: JRC.PAppletColor5Comment },
        { type: "method", signature: "final string lerpColor(string colorA, string colorB, double t)", template: "§1.p5o.lerpColor(§2, §3, §4)", comment: JRC.PAppletLerpColor3Comment },
        { type: "method", signature: "final void colorMode(string mode)", template: "§1.p5o.colorMode(§2)", comment: JRC.PAppletColorMode1Comment },
        { type: "method", signature: "final void colorMode(string mode, double max)", template: "§1.p5o.colorMode(§2, §3)", comment: JRC.PAppletColorMode2Comment },
        { type: "method", signature: "final void colorMode(string mode, double max1, double max2, double max3)", template: "§1.p5o.colorMode(§2, §3, §4, §5)", comment: JRC.PAppletColorMode4Comment },
        { type: "method", signature: "final void colorMode(string mode, double max1, double max2, double max3, double maxAlpha)", template: "§1.p5o.colorMode(§2, §3, §4, §5, §6)", comment: JRC.PAppletColorMode5Comment },
        { type: "method", signature: "final void rectMode(string mode)", template: "§1.p5o.rectMode(§2)", comment: JRC.PAppletRectMode1Comment },
        { type: "method", signature: "final void rect(double left, double top, double width, double height)", template: "§1.p5o.rect(§2, §3, §4, §5)", comment: JRC.PAppletRect1Comment },
        { type: "method", signature: "final void rect(double left, double top, double width, double height, double radius)", template: "§1.p5o.rect(§2, §3, §4, §5, §6)", comment: JRC.PAppletRect1aComment },
        { type: "method", signature: "final void rect(double left, double top, double width, double height, double radius1, double radius2, double radius3, double radius4)", template: "§1.p5o.rect(§2, §3, §4, §5, §6, §7, §8, §9)", comment: JRC.PAppletRect1bComment },
        { type: "method", signature: "final void square(double left, double top, double width)", template: "§1.p5o.square(§2, §3, §4)", comment: JRC.PAppletSquare1Comment },
        { type: "method", signature: "final void square(double left, double top, double width, double radius)", template: "§1.p5o.square(§2, §3, §4, §5)", comment: JRC.PAppletSquare1aComment },
        { type: "method", signature: "final void square(double left, double top, double width, double radius1, double radius2, double radius3, double radius4)", template: "§1.p5o.square(§2, §3, §4, §5, §6, §7, §8)", comment: JRC.PAppletSquare1bComment },
        { type: "method", signature: "final void rect(double left, double top, double width, double height, double radius)", template: "§1.p5o.rect(§2, §3, §4, §5, §6)", comment: JRC.PAppletRect1cComment },
        { type: "method", signature: "final void ellipse(double left, double top, double width, double height)", template: "§1.p5o.ellipse(§2, §3, §4, §5)", comment: JRC.PAppletEllipse1Comment },
        { type: "method", signature: "final void circle(double x, double y, double extent)", template: "§1.p5o.circle(§2, §3, §4)", comment: JRC.PAppletCircle1Comment },
        { type: "method", signature: "final void ellipseMode(string mode)", template: "§1.p5o.ellipseMode(§2)", comment: JRC.PAppletEllipseMode1Comment },
        { type: "method", signature: "final void line(double x1, double y1, double x2, double y2)", template: "§1.p5o.line(§2, §3, §4, §5)", comment: JRC.PAppletLine1Comment },
        { type: "method", signature: "final void line(double x1, double y1, double z1, double x2, double y2, double z2)", template: "§1.p5o.line(§2, §3, §4, §5, §6, §7)", comment: JRC.PAppletLine1aComment },
        { type: "method", signature: "final void triangle(double x1, double y1, double x2, double y2, double x3, double y3)", template: "§1.p5o.triangle(§2, §3, §4, §5, §6, §7)", comment: JRC.PAppletTriangle1Comment },
        { type: "method", signature: "final void quad(double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4)", template: "§1.p5o.quad(§2, §3, §4, §5, §6, §7, §8, §9)", comment: JRC.PAppletQuad1Comment },
        { type: "method", signature: "final void bezier(double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4)", template: "§1.p5o.bezier(§2, §3, §4, §5, §6, §7, §8, §9)", comment: JRC.PAppletBezier1Comment },
        { type: "method", signature: "final void curve(double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4)", template: "§1.p5o.curve(§2, §3, §4, §5, §6, §7, §8, §9)", comment: JRC.PAppletCurve1Comment },
        { type: "method", signature: "final float curvePoint(double a, double b, double c, double d, double t)", template: "§1.p5o.curvePoint(§2, §3, §4, §5, §6)", comment: JRC.PAppletCurvePoint1Comment },
        { type: "method", signature: "final float curveTangent(double a, double b, double c, double d, double t)", template: "§1.p5o.curveTangent(§2, §3, §4, §5, §6)", comment: JRC.PAppletCurveTangent1Comment },
        { type: "method", signature: "final float bezierPoint(double x1, double x2, double x3, double x4, double t)", template: "§1.p5o.bezierPoint(§2, §3, §4, §5, §6)", comment: JRC.PAppletBezierPoint1Comment },
        { type: "method", signature: "final float bezierTangent(double x1, double x2, double x3, double x4, double t)", template: "§1.p5o.bezierTangent(§2, §3, §4, §5, §6)", comment: JRC.PAppletBezierTangent1Comment },
        { type: "method", signature: "final void beginShape()", template: "§1.p5o.beginShape()", comment: JRC.PAppletBeginShape0Comment },
        { type: "method", signature: "final void endShape()", template: "§1.p5o.endShape()", comment: JRC.PAppletEndShape0Comment },
        { type: "method", signature: "final void beginShape(string kind)", template: "§1.p5o.beginShape(§2)", comment: JRC.PAppletBeginShape1Comment },
        { type: "method", signature: "final void endShape(string kind)", template: "§1.p5o.endShape(§2)", comment: JRC.PAppletEndShape1Comment },
        { type: "method", signature: "final void vertex(double x, double y)", template: "§1.p5o.vertex(§2, §3)", comment: JRC.PAppletVertex1Comment },
        { type: "method", signature: "final void point(double x, double y)", template: "§1.p5o.point(§2, §3)", comment: JRC.PAppletPoint1Comment },
        { type: "method", signature: "final void set(double x, double y, string color)", template: "§1.p5o.set(§2, §3, §4)", comment: JRC.PAppletSet3Comment },
        { type: "method", signature: "final void vertex(double x, double y, double z)", template: "§1.p5o.vertex(§2, §3, §4)", comment: JRC.PAppletVertex1aComment },
        { type: "method", signature: "final void point(double x, double y, double z)", template: "§1.p5o.point(§2, §3, §4)", comment: JRC.PAppletPoint1aComment },
        { type: "method", signature: "final void curveVertex(double x, double y)", template: "§1.p5o.curveVertex(§2, §3)", comment: JRC.PAppletCurveVertex1Comment },
        { type: "method", signature: "final void curvevertex(double x, double y, double z)", template: "§1.p5o.curvevertex(§2, §3, §4)", comment: JRC.PAppletCurvevertex1Comment },
        { type: "method", signature: "final void box(double size)", template: "§1.p5o.box(§2)", comment: JRC.PAppletBox1Comment },
        { type: "method", signature: "final void box(double sizeX, double sizeY, double sizeZ)", template: "§1.p5o.box(§2, §3, §4)", comment: JRC.PAppletBox1aComment },
        { type: "method", signature: "final void resetMatrix()", template: "§1.p5o.resetMatrix()", comment: JRC.PAppletResetMatrix0Comment },
        { type: "method", signature: "final void push()", template: "§1.p5o.push()", comment: JRC.PAppletPush0Comment },
        { type: "method", signature: "final void pop()", template: "§1.p5o.pop()", comment: JRC.PAppletPop0Comment },
        { type: "method", signature: "final void scale(double factor)", template: "§1.p5o.scale(§2)", comment: JRC.PAppletScale1Comment },
        { type: "method", signature: "final void scale(double factorX, double factorY)", template: "§1.p5o.scale(§2, §3)", comment: JRC.PAppletScale1aComment },
        { type: "method", signature: "final void scale(double factorX, double factorY, double factorZ)", template: "§1.p5o.scale(§2, §3, §4)", comment: JRC.PAppletScale1bComment },
        { type: "method", signature: "final void translate(double x, double y)", template: "§1.p5o.translate(§2, §3)", comment: JRC.PAppletTranslate1Comment },
        { type: "method", signature: "final void translate(double x, double y, double z)", template: "§1.p5o.translate(§2, §3, §4)", comment: JRC.PAppletTranslate1aComment },
        { type: "method", signature: "final void rotate(double angle)", template: "§1.p5o.rotate(§2)", comment: JRC.PAppletRotate1Comment },
        { type: "method", signature: "final void rotateX(double angle)", template: "§1.p5o.rotateX(§2)", comment: JRC.PAppletRotateX1Comment },
        { type: "method", signature: "final void rotateY(double angle)", template: "§1.p5o.rotateY(§2)", comment: JRC.PAppletRotateY1Comment },
        { type: "method", signature: "final void shearX(double angle)", template: "§1.p5o.shearX(§2)", comment: JRC.PAppletShearX1Comment },
        { type: "method", signature: "final void shearY(double angle)", template: "§1.p5o.shearY(§2)", comment: JRC.PAppletShearY1Comment },
        { type: "method", signature: "final void rotateZ(double angle)", template: "§1.p5o.rotateZ(§2)", comment: JRC.PAppletRotateZ1Comment },
        { type: "method", signature: "final void angleMode(string mode)", template: "§1.p5o.angleMode(§2)", comment: JRC.PAppletAngleMode1Comment },
        { type: "method", signature: "final void textSize(double size)", template: "§1.p5o.textSize(§2)", comment: JRC.PAppletTextSize1Comment },
        { type: "method", signature: "final void textAlign(int alignX)", template: "§1.p5o.textAlign(§2)", comment: JRC.PAppletTextAlign1Comment },
        { type: "method", signature: "final void textAlign(int alignX, int alignY)", template: "§1.p5o.textAlign(§2, §3)", comment: JRC.PAppletTextAlign1aComment },
        { type: "method", signature: "final void text(string text, double x, double y)", template: "§1.p5o.text(§2, §3, §4)", comment: JRC.PAppletText3Comment },
        { type: "method", signature: "final void text(string text, double x, double y, double x2, double y2)", template: "§1.p5o.text(§2, §3, §4, §5, §6)", comment: JRC.PAppletText5Comment },
        { type: "method", signature: "final float random(double low, double high)", template: "§1.p5o.random(§2, §3)", comment: JRC.PAppletRandom1Comment },
        { type: "method", signature: "final float random(double high)", template: "§1.p5o.random(§2)", comment: JRC.PAppletRandom1aComment },
        { type: "method", signature: "final float sqrt(double n)", template: "§1.p5o.sqrt(§2)", comment: JRC.PAppletSqrt1Comment },
        { type: "method", signature: "final float pow(double basis, double exponent)", template: "§1.p5o.pow(§2, §3)", comment: JRC.PAppletPow1Comment },
        { type: "method", signature: "final float max(double a, double b)", template: "§1.p5o.max(§2, §3)", comment: JRC.PAppletMax1Comment },
        { type: "method", signature: "final float min(double a, double b)", template: "§1.p5o.min(§2, §3)", comment: JRC.PAppletMin1Comment },
        { type: "method", signature: "final float abs(double n)", template: "§1.p5o.abs(§2)", comment: JRC.PAppletAbs1Comment },
        { type: "method", signature: "final float sin(double n)", template: "§1.p5o.sin(§2)", comment: JRC.PAppletSin1Comment },
        { type: "method", signature: "final float cos(double n)", template: "§1.p5o.cos(§2)", comment: JRC.PAppletCos1Comment },
        { type: "method", signature: "final float tan(double n)", template: "§1.p5o.tan(§2)", comment: JRC.PAppletTan1Comment },
        { type: "method", signature: "final float asin(double n)", template: "§1.p5o.asin(§2)", comment: JRC.PAppletAsin1Comment },
        { type: "method", signature: "final float acos(double n)", template: "§1.p5o.acos(§2)", comment: JRC.PAppletAcos1Comment },
        { type: "method", signature: "final float radians(double angle)", template: "§1.p5o.radians(§2)", comment: JRC.PAppletRadians1Comment },
        { type: "method", signature: "final float degrees(double angle)", template: "§1.p5o.degrees(§2)", comment: JRC.PAppletDegrees1Comment },
        { type: "method", signature: "final float atan(double n)", template: "§1.p5o.atan(§2)", comment: JRC.PAppletAtan1Comment },
        { type: "method", signature: "final float atan2(double x, double y)", template: "§1.p5o.atan2(§2, §3)", comment: JRC.PAppletAtan21Comment },
        { type: "method", signature: "final float sqrt(double x, double y)", template: "§1.p5o.sqrt(§2, §3)", comment: JRC.PAppletSqrt1aComment },
        { type: "method", signature: "final float sq(double x, double y)", template: "§1.p5o.sq(§2, §3)", comment: JRC.PAppletSq1Comment },
        { type: "method", signature: "final int abs(int n)", template: "§1.p5o.abs(§2)", comment: JRC.PAppletAbs1aComment },
        { type: "method", signature: "final int round(double n)", template: "§1.p5o.round(§2)", comment: JRC.PAppletRound1Comment },
        { type: "method", signature: "final int ceil(double n)", template: "§1.p5o.ceil(§2)", comment: JRC.PAppletCeil1Comment },
        { type: "method", signature: "final int floor(double n)", template: "§1.p5o.floor(§2)", comment: JRC.PAppletFloor1Comment },
        { type: "method", signature: "final float dist(double x1, double y1, double x2, double y2)", template: "§1.p5o.dist(§2, §3, §4, §5)", comment: JRC.PAppletDist1Comment },
        { type: "method", signature: "final float lerp(double a, double b, double t)", template: "§1.p5o.lerp(§2, §3, §4)", comment: JRC.PAppletLerp1Comment },
        { type: "method", signature: "final float constrain(double value, double min, double max)", template: "§1.p5o.constrain(§2, §3, §4)", comment: JRC.PAppletConstrain1Comment },
        { type: "method", signature: "final int year()", template: "§1.p5o.year()", comment: JRC.PAppletYear0Comment },
        { type: "method", signature: "final int month()", template: "§1.p5o.month()", comment: JRC.PAppletMonth0Comment },
        { type: "method", signature: "final int day()", template: "§1.p5o.day()", comment: JRC.PAppletDay0Comment },
        { type: "method", signature: "final int hour()", template: "§1.p5o.hour()", comment: JRC.PAppletHour0Comment },
        { type: "method", signature: "final int minute()", template: "§1.p5o.minute()", comment: JRC.PAppletMinute0Comment },
        { type: "method", signature: "final int second()", template: "§1.p5o.second()", comment: JRC.PAppletSecond0Comment },
        { type: "method", signature: "final void frameRate(int n)", template: "§1.p5o.frameRate(§2)", comment: JRC.PAppletFrameRate1Comment },
        { type: "method", signature: "final float textWidth(string text)", template: "§1.p5o.textWidth(§2)", comment: JRC.PAppletTextWidth1Comment },
        { type: "method", signature: "final float textAscent(string text)", template: "§1.p5o.textAscent(§2)", comment: JRC.PAppletTextAscent1Comment },
        { type: "method", signature: "final float textDescent(string text)", template: "§1.p5o.textDescent(§2)", comment: JRC.PAppletTextDescent1Comment },
        { type: "method", signature: "final void textLeading(double leading)", template: "§1.p5o.textLeading(§2)", comment: JRC.PAppletTextLeading1Comment },
        { type: "method", signature: "final void cursor(string type)", template: "§1.p5o.cursor(§2)", comment: JRC.PAppletCursor1Comment },
        { type: "method", signature: "final void noCursor(string type)", template: "§1.p5o.noCursor(§2)", comment: JRC.PAppletNoCursor1Comment },
        { type: "method", signature: "final void copy(double sx, double sy, double sw, double sh, double dx, double dy, double dw, double dh)", template: "§1.p5o.copy(§2, §3, §4, §5, §6, §7, §8, §9)", comment: JRC.PAppletCopy1Comment },
        { type: "method", signature: "final void millis()", template: "§1.p5o.millis()", comment: JRC.PAppletMillis0Comment },
        { type: "method", signature: "final void redraw()", template: "§1.p5o.redraw()", comment: JRC.PAppletRedraw0Comment },

    ]);

    static type: NonPrimitiveType;

    // graphicsDiv contains containerOuter contains containerInnen
    graphicsDiv!: HTMLDivElement;
    containerOuter!: HTMLDivElement;
    containerInner!: HTMLDivElement;

    resizeObserver?: ResizeObserver;

    width: number = 800;
    height: number = 600;

    p5o!: p5;

    //
    renderer: string = "webgl";
    loopStopped: boolean = false;

    onSizeChanged: () => void = () => { };
    canvasCreated: boolean = false;

    _mj$setup$void$(t: Thread, callback: CallbackFunction) { }
    _mj$settings$void$(t: Thread, callback: CallbackFunction) { }
    _mj$preload$void$(t: Thread, callback: CallbackFunction) { }
    _mj$draw$void$(t: Thread, callback: CallbackFunction) { }
    _mj$mousePressed$void$(t: Thread, callback: CallbackFunction) { }
    _mj$mouseReleased$void$(t: Thread, callback: CallbackFunction) { }
    _mj$mouseClicked$void$(t: Thread, callback: CallbackFunction) { }
    _mj$mouseDragged$void$(t: Thread, callback: CallbackFunction) { }
    _mj$mouseEntered$void$(t: Thread, callback: CallbackFunction) { }
    _mj$mouseExited$void$(t: Thread, callback: CallbackFunction) { }
    _mj$mouseMoved$void$(t: Thread, callback: CallbackFunction) { }
    _mj$keyPressed$void$(t: Thread, callback: CallbackFunction) { }
    _mj$keyReleased$void$(t: Thread, callback: CallbackFunction) { }

    _mj$main$void$(t: Thread, callback: CallbackFunction) {

    }

    _cj$_constructor_$PApplet$(t: Thread, callback: CallbackFunction) {
        this._constructor();
        t.s.push(this);

        let interpreter = t.scheduler.interpreter;

        interpreter.graphicsManager?.registerGraphicSystem(this);

        interpreter.isExternalTimer = true;
        this.graphicsDiv = <HTMLDivElement>interpreter.graphicsManager?.graphicsDiv;
        this.graphicsDiv.style.overflow = "hidden";

        this.setupGraphicsDiv(this.graphicsDiv, interpreter);
        this.setupProcessing(this.containerInner, interpreter);

        interpreter.eventManager.once("stop", () => {
            let dummy = () => { };
            this.p5o.draw = dummy;
            this.p5o.setup = dummy;
            this.p5o.preload = dummy;
            this.p5o.mousePressed = dummy;
            this.p5o.mouseReleased = dummy;
            this.p5o.mouseClicked = dummy;
            this.p5o.mouseDragged = dummy;
            this.p5o.keyPressed = dummy;
            this.p5o.keyReleased = dummy;
            interpreter.isExternalTimer = false;
        })

        this.p5o.POINTS

        interpreter.eventManager.once("resetRuntime", () => {
            this.p5o.remove();
            interpreter.deleteObject("PAppletClass");
            this.canvasCreated = false;
            if(this.graphicsDiv) this.graphicsDiv.innerHTML = '';
        })

        interpreter.storeObject("PAppletClass", this);

    }

    get mouseX(): number {return this.p5o.mouseX;} set mouseX(n: number){this.p5o.mouseX = n}
    get mouseY(): number {return this.p5o.mouseY;} set mouseY(n: number){this.p5o.mouseY = n}
    get pMouseX(): number {return this.p5o.pmouseX;} set pMouseX(n: number){this.p5o.pmouseX = n}
    get pMouseY(): number {return this.p5o.pmouseY;} set pMouseY(n: number){this.p5o.pmouseY = n}
    get mouseButton(): number {return this.p5o.mouseButton;} set mouseButton(n: number){this.p5o.mouseButton = n}
    get key(): string {return this.p5o.key;} set key(n: string){this.p5o.key = n}


    setupGraphicsDiv(graphicsDiv: HTMLDivElement, interpreter: Interpreter) {
        this.containerOuter = DOM.makeDiv(undefined, 'jo_pAppletOuter');

        this.onSizeChanged = () => {
            let rect = graphicsDiv!.parentElement!.parentElement!.getBoundingClientRect();

            let maxWidth: number = rect.width;
            let maxHeight: number = rect.height;

            if (this.height / this.width > maxHeight / maxWidth) {
                graphicsDiv.style.width = this.width / this.height * maxHeight + "px";
                graphicsDiv.style.height = maxHeight + "px";
            } else {
                graphicsDiv.style.width = maxWidth + "px";
                graphicsDiv.style.height = this.height / this.width * maxWidth + "px";
            }

            interpreter.graphicsManager?.resizeGraphicsDivHeight();

        };

        // graphicsDiv.onresize = (ev) => {
        //     this.onSizeChanged()
        // }

        this.resizeObserver = new ResizeObserver(() => {
            this.onSizeChanged();
        });

        this.resizeObserver.observe(this.graphicsDiv!.parentElement!.parentElement!);

        this.onSizeChanged();

        this.containerInner = DOM.makeDiv(this.containerOuter, 'jo_pAppletInner');
        graphicsDiv.innerHTML = '';
        graphicsDiv.append(this.containerOuter);

        graphicsDiv.oncontextmenu = function (e) {
            e.preventDefault();
        };

        // this.module.main.getRightDiv()?.adjustWidthToWorld();

    }

    _createCanvas(width: number, height: number, renderer?: string) {
        renderer ||= this.renderer;
        this.renderer = renderer;

        this.width = width;
        this.height = height;
        this.onSizeChanged();
        this.p5o.createCanvas(this.width, this.height);

        let canvas = this.containerInner.getElementsByTagName('canvas');
        if (canvas.length > 0) {
            canvas[0].style.width = "";
            canvas[0].style.height = "";
        }

        this.canvasCreated = true;
    }


    setupProcessing(containerInner: HTMLDivElement, interpreter: Interpreter) {

        let that = this;
        this.canvasCreated = false;
        let drawMethodPending: boolean = true;
        
        let sketch = (p5: p5) => {
            
            p5.disableFriendlyErrors = true;

            p5.setup = function () {
                that.renderer = p5.P2D;
                that.p5o = p5;

                let afterFinishingBoth = () => {
                    drawMethodPending = false
                    // $div.find('canvas').css({
                    //     'width': '',
                    //     'height': ''
                    // })
                    if (!that.canvasCreated) {
                        that._createCanvas(that.width, that.height);
                    }
                }


                let i = 2;

                that.runMethod(that._mj$setup$void$, () => {
                    if (--i == 0) afterFinishingBoth();
                }, interpreter);

                that.runMethod(that._mj$settings$void$, () => {
                    if (--i == 0) afterFinishingBoth();
                }, interpreter);


            };

            p5.preload = function () {
                that.runMethod(that._mj$preload$void$, undefined, interpreter);
            };

            p5.draw = function () {
                if (interpreter.scheduler.state == SchedulerState.running && !that.loopStopped) {
                    if (!drawMethodPending) {
                        drawMethodPending = true;
                        that.runMethod(that._mj$draw$void$, () => {
                            drawMethodPending = false;
                        }, interpreter);
                    }
                }
                interpreter.timerFunction(1000 / 60.0);
                // p5.background(50);
                // p5.rect(p5.width / 2, p5.height / 2, 50, 50);

            };

            p5.mousePressed = function () {
                that.runMethod(that._mj$mousePressed$void$, undefined, interpreter);
            };

            p5.mouseReleased = function () {
                that.runMethod(that._mj$mouseReleased$void$, undefined, interpreter);
            };

            p5.mouseClicked = function () {
                that.runMethod(that._mj$mouseClicked$void$, undefined, interpreter);
            };

            p5.mouseDragged = function () {
                that.runMethod(that._mj$mouseDragged$void$, undefined, interpreter);
            };

            // p5.mouseEntered = function () {
            //     that.runMethod(that._mj$mouseEntered$void$, undefined, interpreter);
            // };

            // p5.mouseExited = function () {
            //     that.runMethod(that._mj$mouseExited$void$, undefined, interpreter);
            // };

            p5.mouseMoved = function () {
                that.runMethod(that._mj$mouseMoved$void$, undefined, interpreter);
            };

            p5.keyPressed = function () {
                that.runMethod(that._mj$keyPressed$void$, undefined, interpreter);
            };

            p5.keyReleased = function () {
                that.runMethod(that._mj$keyReleased$void$, undefined, interpreter);
            };


        }

        new p5(sketch, containerInner);
        let canvas = this.containerInner.getElementsByTagName('canvas');
        if (canvas.length > 0) {
            canvas[0].style.width = "";
            canvas[0].style.height = "";
        }

    }

    runMethod(method: (t: Thread, callback: CallbackFunction) => void, callback: CallbackFunction, interpreter: Interpreter) {

        // Test if method is overridden:
        //@ts-ignore
        if (method == PAppletClass.prototype[method.name]) {
            if (callback) callback();
            return;
        }

        let t: Thread = interpreter.scheduler.createThread("processing: " + method.name);
        method.call(this, t, callback);
        t.startIfNotEmptyOrDestroy();

    }

    getIdentifier(): string {
        return "Processing";
    }


}