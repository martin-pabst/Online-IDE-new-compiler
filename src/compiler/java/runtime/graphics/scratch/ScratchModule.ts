import { CodeFragment } from "../../../../common/disassembler/CodeFragment";
import { JavaLibraryModule } from "../../../module/libraries/JavaLibraryModule";
import { BooleanSupplierInterface } from "./BooleanSupplierInterface";
import { KeyCodeEnum } from "./KeyCodeEnum";
import { LayerEnum } from "./LayerEnum";
import { MouseCodeEnum } from "./MouseCodeEnum";
import { RotationStyleEnum } from "./RotationStyleEnum";
import { ScratchAnimatedSpriteClass } from "./ScratchAnimatedSpriteClass";
import { ScratchBoundsClass } from "./ScratchBoundsClass";
import { ScratchCameraClass } from "./ScratchCameraClass";
import { ScratchClockClass } from "./ScratchClockClass";
import { ScratchColorClass } from "./ScratchColorClass";
import {
    ScratchFFmpegRecorderClass, ScratchFileClass, ScratchFrameRecorderClass, ScratchGifRecorderClass,
    ScratchMapObjectClass, ScratchPixelsClass, ScratchRecorderClass, ScratchShaderClass,
    ScratchPropertyClass, ScratchShadersClass, ScratchSortingClass, ScratchTiledMapClass,
    ScratchTilesetImageClass,
} from "./ScratchDesktopOnlyClasses";
import { ScratchExceptionClass } from "./ScratchExceptionClass";
import { ScratchHitboxClass } from "./ScratchHitboxClass";
import { ScratchHtmlColorClass } from "./ScratchHtmlColorClass";
import { ScratchListFlavour } from "./ScratchLists";
import {
    ScratchCircleClass, ScratchEllipseClass, ScratchPolygonClass, ScratchRectangleClass,
    ScratchShapeClass, ScratchTriangleClass,
} from "./ScratchShapeClasses";
import { ScratchOperatorsClass } from "./ScratchOperatorsClass";
import { ScratchPenClass } from "./ScratchPenClass";
import { ScratchRandomClass } from "./ScratchRandomClass";
import { ScratchStageClass } from "./ScratchStageClass";
import { ScratchSpriteClass } from "./ScratchSpriteClass";
import { ScratchTextClass } from "./ScratchTextClass";
import { ScratchTimerClass } from "./ScratchTimerClass";
import { ScratchUISpriteClass } from "./ScratchUISpriteClass";
import { ScratchVector2Class } from "./ScratchVector2Class";
import { ScratchWindowClass } from "./ScratchWindowClass";
import { TextAlignEnum } from "./TextAlignEnum";
import { TextStyleEnum } from "./TextStyleEnum";
import { TextureSamplingEnum } from "./TextureSamplingEnum";

/**
 * "Scratch for Java" library — a browser port of org.openpatch.scratch
 * (https://scratch4j.openpatch.org). Public class/method signatures match the
 * desktop library so student code copy-pastes between the two.
 *
 * The classes sit in the same packages as upstream, so a file copied from a
 * desktop project keeps its `import org.openpatch.scratch.*;` and still compiles.
 * `getStandardImports` imports all of them implicitly as well, so a program that
 * writes no import at all works just as it did before the packages existed.
 */
export class ScratchModule extends JavaLibraryModule implements ScratchListFlavour {

    /**
     * @param scratchNrwLists true when the NRW classes are loaded as well — the counterpart of
     * the NRW build of Scratch for Java: Stage.getAll, Stage.find and Sprite.getTouchingSprites
     * return the List of the NRW Zentralabitur instead of java.util.List. It needs the
     * NRWModule next to it, which is where that List comes from.
     */
    constructor(readonly scratchNrwLists: boolean = false) {
        super();
        this.classesInterfacesEnums.push(
            KeyCodeEnum, MouseCodeEnum, RotationStyleEnum, LayerEnum, TextAlignEnum, TextStyleEnum,
            TextureSamplingEnum,
            BooleanSupplierInterface,
            ScratchOperatorsClass, ScratchRandomClass, ScratchClockClass,
            ScratchHtmlColorClass, ScratchExceptionClass,
            ScratchColorClass, ScratchVector2Class, ScratchTimerClass, ScratchCameraClass,
            ScratchBoundsClass, ScratchHitboxClass,
            // geometry for custom hitboxes; these names also exist in the
            // always-on graphics module, and Scratch's win (see getStandardImports)
            ScratchShapeClass, ScratchCircleClass, ScratchRectangleClass,
            ScratchEllipseClass, ScratchTriangleClass, ScratchPolygonClass,
            ScratchWindowClass,
            ScratchStageClass, ScratchSpriteClass, ScratchAnimatedSpriteClass, ScratchUISpriteClass,
            ScratchPenClass, ScratchTextClass,
            // desktop-only: declared so copied code still compiles and runs
            ScratchPixelsClass, ScratchSortingClass, ScratchShaderClass, ScratchShadersClass,
            ScratchRecorderClass, ScratchGifRecorderClass, ScratchFFmpegRecorderClass, ScratchFrameRecorderClass,
            ScratchFileClass, ScratchMapObjectClass, ScratchTiledMapClass,
            ScratchPropertyClass, ScratchTilesetImageClass,
        );
    }

    isReplModule(): boolean {
        return false;
    }

    getCodeFragments(): CodeFragment[] {
        return [];
    }

    /**
     * Upstream's package layout, so that every `import org.openpatch.scratch...` a desktop
     * file carries resolves here too. Importing them all as standard imports keeps the
     * simple names available without an import — and it is what makes the Scratch classes
     * shadow the always-on graphics classes of the same name (Color, Timer, Sprite, Text,
     * Circle, Rectangle, ...): TypeResolver looks in the imported types before it looks in
     * the type store, so no base class has to be removed for Scratch's version to win.
     */
    getStandardImports(): string[][] {
        return [
            ["org", "openpatch", "scratch", "*"],
            ["org", "openpatch", "scratch", "extensions", "camera", "*"],
            ["org", "openpatch", "scratch", "extensions", "fs", "*"],
            ["org", "openpatch", "scratch", "extensions", "pixels", "*"],
            ["org", "openpatch", "scratch", "extensions", "recorder", "*"],
            ["org", "openpatch", "scratch", "extensions", "shader", "*"],
            ["org", "openpatch", "scratch", "extensions", "sorting", "*"],
            ["org", "openpatch", "scratch", "extensions", "tiled", "*"],
            // Stage.waitUntil takes a java.util.function.BooleanSupplier
            ["java", "util", "function", "*"],
            // the declarations' List is the nrw List then; see the constructor
            ...(this.scratchNrwLists ? [["nrw", "List"]] : []),
        ];
    }

}
