import { GamepadTool } from "../../../../../tools/GamepadTool";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "../javalang/ObjectClassStringClass";

export class GamepadClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Gamepad extends Object", comment: JRC.GamepadClassComment},
        {type: "method", signature: "static boolean isButtonDown(int gamepadIndex, int buttonIndex)", native: GamepadClass._isButtonDown, comment: JRC.GamepadIsButtonDownComment},
        {type: "method", signature: "static boolean isConnected(int gamepadIndex)", native: GamepadClass._isConnected, comment: JRC.GamepadIsConnectedComment},
        {type: "method", signature: "static double getAxisValue(int gamepadIndex, int axisIndex)", native: GamepadClass._getAxisValue, comment: JRC.GamepadGetAxisValueComment},

    ];

    static type: NonPrimitiveType;

    static gamepadTool?: GamepadTool = (typeof window === 'undefined') ? undefined : new GamepadTool();

    static _isButtonDown(gamepadIndex: number, buttonIndex: number): boolean {
        if(!GamepadClass.gamepadTool) return false;
        return GamepadClass.gamepadTool.isGamepadButtonPressed(gamepadIndex, buttonIndex);
    }

    static _isConnected(gamepadIndex: number): boolean {
        if(!GamepadClass.gamepadTool) return false;
        return GamepadClass.gamepadTool.isGamepadConnected(gamepadIndex);
    }

    static _getAxisValue(gamepadIndex: number, axisIndex: number): number {
        if(!GamepadClass.gamepadTool) return 0.0;
        return GamepadClass.gamepadTool.getGamepadAxisValue(gamepadIndex, axisIndex);
    }

}