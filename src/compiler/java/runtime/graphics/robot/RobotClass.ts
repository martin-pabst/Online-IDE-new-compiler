import * as THREE from 'three';

import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { ThreadState } from "../../../../common/interpreter/ThreadState";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass";
import { RobotCubeFactory } from "./RobotCubeFactory";
import { RobotWorldClass } from './RobotWorldClass';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RobotDirection } from './RobotDirection';
import { RuntimeExceptionClass } from '../../system/javalang/RuntimeException';
import { ExceptionClass } from '../../system/javalang/ExceptionClass';
import spritesheetpng from '/assets/graphics/spritesheet.png';
import { CallbackFunction } from '../../../../common/interpreter/StepFunction';



export class RobotClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Robot extends Object", comment: JRC.robotClassComment },

        { type: "method", signature: "Robot()", java: RobotClass.prototype._jc$_constructor_$Robot$, comment: JRC.robotEmptyConstructorComment },
        { type: "method", signature: "Robot(int startX, int startY)", java: RobotClass.prototype._jc$_constructor_$Robot$int$int, comment: JRC.robotConstructorStartXStartY },
        { type: "method", signature: "Robot(int startX, int startY, int worldX, int worldY)", java: RobotClass.prototype._jc$_constructor_$Robot$int$int$int$int, comment: JRC.robotConstructorStartXStartYWorldXWorldY },
        { type: "method", signature: "Robot(int startX, int startY, string initialWorld)", java: RobotClass.prototype._jc$_constructor_$Robot$int$int$string, comment: JRC.robotConstructorStartXStartYinitialWorld },

        { type: "method", signature: "RobotWorld getWelt()", native: RobotClass.prototype._getWelt, comment: JRC.robotGetWelt },
        { type: "method", signature: "void rechtsDrehen()", native: RobotClass.prototype._rechtsDrehen, comment: JRC.robotRechtsDrehen },
        { type: "method", signature: "void linksDrehen()", native: RobotClass.prototype._linksDrehen, comment: JRC.robotLinksDrehen },
        { type: "method", signature: "void schritt()", native: RobotClass.prototype._schritt, comment: JRC.robotSchritt },
        { type: "method", signature: "void schritt(int anzahl)", native: RobotClass.prototype._schrittAnzahl, comment: JRC.robotSchrittAnzahl },

        { type: "method", signature: "void hinlegen()", native: RobotClass.prototype._hinlegen, comment: JRC.robotHinlegen },
        { type: "method", signature: "void hinlegen(int n)", native: RobotClass.prototype._hinlegen, comment: JRC.robotHinlegen },
        { type: "method", signature: "void hinlegen(string farbe)", native: RobotClass.prototype._hinlegen, comment: JRC.robotHinlegenFarbe },

        { type: "method", signature: "void markeSetzen()", native: RobotClass.prototype._markeSetzen, comment: JRC.robotMarkeSetzen },
        { type: "method", signature: "void markeSetzen(string farbe)", native: RobotClass.prototype._markeSetzen, comment: JRC.robotMarkeSetzenFarbe },
        { type: "method", signature: "void markeLöschen()", native: RobotClass.prototype._markeLöschen, comment: JRC.robotMarkeLöschen },

        { type: "method", signature: "void aufheben()", native: RobotClass.prototype._aufheben, comment: JRC.robotAufheben },
        { type: "method", signature: "void aufheben(int n)", native: RobotClass.prototype._aufheben, comment: JRC.robotAufheben },
        { type: "method", signature: "void beenden()", java: RobotClass.prototype._mj$beenden$void$, comment: JRC.robotBeenden },
        { type: "method", signature: "boolean istWand()", native: RobotClass.prototype._istWand, comment: JRC.robotIstWand },
        { type: "method", signature: "boolean nichtIstWand()", native: RobotClass.prototype._nichtIstWand, comment: JRC.robotNichtIstWand },
        { type: "method", signature: "boolean istZiegel()", native: RobotClass.prototype._istZiegel, comment: JRC.robotIstZiegel },
        { type: "method", signature: "boolean istZiegel(int anzahl)", native: RobotClass.prototype._istZiegel, comment: JRC.robotIstZiegelAnzahl },
        { type: "method", signature: "boolean istZiegel(string farbe)", native: RobotClass.prototype._istZiegel, comment: JRC.robotIstZiegelFarbe },
        { type: "method", signature: "boolean nichtIstZiegel()", native: RobotClass.prototype._nichtIstZiegel, comment: JRC.robotNichtIstZiegel },
        { type: "method", signature: "boolean nichtIstZiegel(int anzahl)", native: RobotClass.prototype._nichtIstZiegel, comment: JRC.robotNichtIstZiegelAnzahl },
        { type: "method", signature: "boolean nichtIstZiegel(string farbe)", native: RobotClass.prototype._nichtIstZiegel, comment: JRC.robotNichtIstZiegelFarbe },
        { type: "method", signature: "boolean istMarke()", native: RobotClass.prototype._istMarke, comment: JRC.robotIstMarke },
        { type: "method", signature: "boolean istMarke(string farbe)", native: RobotClass.prototype._istMarke, comment: JRC.robotIstMarkeFarbe },
        { type: "method", signature: "boolean nichtIstMarke()", native: RobotClass.prototype._nichtIstMarke, comment: JRC.robotNichtIstMarke },
        { type: "method", signature: "boolean nichtIstMarke(string farbe)", native: RobotClass.prototype._nichtIstMarke, comment: JRC.robotNichtIstMarkeFarbe },

        { type: "method", signature: "boolean istNorden()", native: RobotClass.prototype._isNorth, comment: JRC.robotIstNorden },
        { type: "method", signature: "boolean istSüden()", native: RobotClass.prototype._isSouth, comment: JRC.robotIstSueden },
        { type: "method", signature: "boolean istOsten()", native: RobotClass.prototype._isEast, comment: JRC.robotIstOsten },
        { type: "method", signature: "boolean istWesten()", native: RobotClass.prototype._isWest, comment: JRC.robotIstWesten },

        { type: "method", signature: "boolean istLeer()", native: RobotClass.prototype._istLeer, comment: JRC.robotIstLeer },
        { type: "method", signature: "boolean nichtIstLeer()", native: RobotClass.prototype._nichtIstLeer, comment: JRC.robotNichtIstLeer },
        { type: "method", signature: "boolean istVoll()", native: RobotClass.prototype._istVoll, comment: JRC.robotIstVoll },
        { type: "method", signature: "boolean nichtIstVoll()", native: RobotClass.prototype._nichtIstVoll, comment: JRC.robotNichtIstVoll },

        { type: "method", signature: "boolean hatZiegel()", native: RobotClass.prototype._hatZiegel, comment: JRC.robotHatZiegel },

        { type: "method", signature: "void setzeAnzahlSteine(int anzahl)", native: RobotClass.prototype._setzeAnzahlSteine, comment: JRC.robotSetzeAnzahlSteine },
        { type: "method", signature: "void setzeRucksackGröße(int anzahl)", native: RobotClass.prototype._setzeRucksackGroesse, comment: JRC.robotSetzeRucksackGroesse },

    ];

    static type: NonPrimitiveType;

    robotCubeFactory: RobotCubeFactory;
    robotWorld: RobotWorldClass;

    steve: THREE.Group<THREE.Object3DEventMap>;
    x: number;
    y: number;
    z: number;

    direction: RobotDirection = new RobotDirection(this);
    hatSteine: number = 1e7;
    maxSteine: number = 1e10;


    constructor() {
        super();
    }

    _jc$_constructor_$Robot$(t: Thread, callback: CallbackParameter) {
        this._jc$_constructor_$Robot$int$int$int$int(t, callback, 1, 1, 5, 8);
    }

    _jc$_constructor_$Robot$int$int(t: Thread, callback: CallbackParameter, startX: number, startY: number) {
        this._jc$_constructor_$Robot$int$int$int$int(t, callback, startX, startY, 5, 10);
    }

    _jc$_constructor_$Robot$int$int$string(t: Thread, callback: CallbackParameter, startX: number, startY: number, initialWorld: string) {
        this._jc$_constructor_$Robot$int$int$int$int(t, callback, startX, startY, initialWorld, undefined);
    }


    _jc$_constructor_$Robot$int$int$int$int(t: Thread, callback: CallbackParameter, startX: number, startY: number,
        worldX: number | string, worldY?: number) {
        t.s.push(this);

        this.robotWorld = t.scheduler.interpreter.retrieveObject("robotWorldClass");

        if (!this.robotWorld) {

            t.scheduler.interpreter.eventManager.once("stop", () => {
                this.robotWorld = undefined;
                t.scheduler.interpreter.deleteObject("robotWorldClass");
            })

            new RobotWorldClass()._cj$_constructor_$RobotWorld$int$int(t, async () => {
                this.robotWorld = t.s.pop();
                t.state = ThreadState.waiting;
                await this.init(startX, startY);
                t.state = ThreadState.running;
                if (callback) callback();
                return;
            }, worldX, worldY);
            return;
        } else {
            t.state = ThreadState.waiting;
            this.init(startX, startY).then(() => {
                t.state = ThreadState.running;
                if (callback) callback();
            })
            return;
        }

    }

    public async init(startX: number, startY: number) {
        const loader = new GLTFLoader();

        // vite doesn't support file ending gltf, therefore
        // we have to hack a little bit to get correct URL for
        // file scene.gltf:
        let url = "" + spritesheetpng;
        const lastSlashIndex = url.lastIndexOf('assets/');
        url = url.substring(0, lastSlashIndex);

        this.steve = (await loader.loadAsync(url + 'assets/graphics/robot/minecraft_steve/scene.gltf')).scene;
        this.steve.translateX(-this.robotWorld.maxX / 2 + startX - 1);
        this.steve.translateY(1.45);
        this.steve.translateZ(-this.robotWorld.maxY / 2 + startY - 1);
        this.steve.scale.set(0.06, 0.06, 0.06);
        this.robotWorld.world3d.scene.add(this.steve);

        this.x = startX;
        this.y = startY;
        this.z = 0;
    }

    setZ(z: number) {
        this.steve.position.y += z / 2 - this.z;
        this.z = z / 2;
    }

    moveTo(x: number, y: number) {
        this.steve.position.x += x - this.x;
        this.steve.position.z += y - this.y;
        this.x = x;
        this.y = y;
    }

    _getWelt() {
        return this.robotWorld;
    }

    _rechtsDrehen() {
        this.direction.turnRight();
    }

    _linksDrehen() {
        this.direction.turnLeft();
    }

    _schritt() {
        let deltas = this.direction.getDeltas();
        let newX = this.x + deltas.dx;
        let newY = this.y + deltas.dy;

        if (newX < 1 || newX > this.robotWorld.maxX || newY < 1 || newY > this.robotWorld.maxY) {
            throw new RuntimeExceptionClass(JRC.robotHitWall());
        }

        let oldHeight = this.robotWorld.getNumberOfBricks(this.x, this.y);
        let newHeight = this.robotWorld.getNumberOfBricks(newX, newY);

        if (newHeight < oldHeight - 1) {
            throw new RuntimeExceptionClass(JRC.robotMaximumJumpHeightDown());
        }

        if (newHeight > oldHeight + 1) {
            throw new RuntimeExceptionClass(JRC.robotMaximumJumpHeightUp());
        }

        this.moveTo(newX, newY);
        this.setZ(this.robotWorld.getBrickCount(newX, newY));

    }

    _schrittAnzahl(n: number) {
        for (let i = 0; i < n; i++) {
            this._schritt();
        }
    }

    _hinlegen(farbeOrN?: string | number) {
        let farbe: string = (typeof farbeOrN == 'string') ? (farbeOrN || "rot") : "rot";
        let n: number = (typeof farbeOrN == 'number') ? (farbeOrN || 1) : 1;

        let deltas = this.direction.getDeltas();
        let newX = this.x + deltas.dx;
        let newY = this.y + deltas.dy;

        if (newX < 1 || newX > this.robotWorld.maxX || newY < 1 || newY > this.robotWorld.maxY) {
            throw new RuntimeExceptionClass(JRC.robotCantPlaceBricksIntoWall());
        }


        farbe = farbe.toLocaleLowerCase();
        if (!this.robotWorld.gibtFarbe(farbe)) {
            throw new RuntimeExceptionClass(JRC.robotColorUnknown());
        }

        if (this.hatSteine < n) {
            throw new RuntimeExceptionClass(JRC.robotOutOfBricks());
        }

        if (this.robotWorld.getBrickCount(newX, newY) + n > this.robotWorld.maximumHeight) {
            throw new ExceptionClass(JRC.robotMaximumHeightExceeded(this.robotWorld.maximumHeight));
        }

        for(let i = 0; i < n; i++) this.robotWorld.addBrick(newX, newY, farbe);
        this.hatSteine -= n;

        return true;

    }

    _aufheben(n?: number) {
        n = n || 1;
        let deltas = this.direction.getDeltas();
        let newX = this.x + deltas.dx;
        let newY = this.y + deltas.dy;

        if (newX < 1 || newX > this.robotWorld.maxX || newY < 1 || newY > this.robotWorld.maxY) {
            throw new RuntimeExceptionClass(JRC.robotCantPlaceBricksIntoWall());
        }

        if (this.robotWorld.getNumberOfBricks(newX, newY) < n) {
            throw new RuntimeExceptionClass(JRC.robotNoBricksToPickUp());
        }

        for(let i = 0; i < n; i++) this.robotWorld.removeBrick(newX, newY);

        if (this.hatSteine + n <= this.maxSteine) {
            this.hatSteine += n;
        } else {
            throw new RuntimeExceptionClass(JRC.robotCapacityExceeded());
        }

    }

    _markeSetzen(farbe: string) {
        farbe = farbe || "rot";
        farbe = farbe.toLocaleLowerCase();

        if (!this.robotWorld.gibtFarbe(farbe)) {
            throw new RuntimeExceptionClass(JRC.robotColorUnknown());
        }

        this.robotWorld.setMarker(this.x, this.y, farbe);
    }

    _markeLöschen() {
        this.robotWorld.removeMarker(this.x, this.y);
    }

    _istWand(): boolean {
        let deltas = this.direction.getDeltas();
        let newX = this.x + deltas.dx;
        let newY = this.y + deltas.dy;

        return (newX < 1 || newX > this.robotWorld.maxX || newY < 1 || newY > this.robotWorld.maxY)

    }

    _istZiegel(param: number | string | null): boolean {
        let deltas = this.direction.getDeltas();
        let newX = this.x + deltas.dx;
        let newY = this.y + deltas.dy;

        if (newX < 1 || newX > this.robotWorld.maxX || newY < 1 || newY > this.robotWorld.maxY) {
            return false;
        }

        if (param == null) return this.robotWorld.getBrickCount(newX, newY) > 0;

        if (typeof param == "string") {
            return this.robotWorld.hasBrickColor(newX, newY, param.toLocaleLowerCase());
        }

        return this.robotWorld.bricks[newX][newY].length == param;

    }

    _istMarke(param: string | null): boolean {
        let marke = this.robotWorld.markers[this.x][this.y];
        if (param == null) return marke != null;

        if (typeof param == "string") {
            return marke != null && marke.userData["farbe"] == param.toLocaleLowerCase();
        }

        return false;
    }

    _mj$beenden$void$(t: Thread, callback: CallbackParameter) {
        t.scheduler.interpreter.printManager?.print(JRC.robotStoppedProgram(), true, 0x808080);
        t.state = ThreadState.terminated;
        t.scheduler.exit(0);
    }

    _nichtIstWand() {
        return !this._istWand();
    }

    _nichtIstMarke(param: string | null) {
        return !this._istMarke(param);
    }

    _nichtIstZiegel(param: number | string | null) {
        return !this._istZiegel(param);
    }

    _isNorth() {
        return this.direction.is("north");
    }

    _isEast() {
        return this.direction.is("east");
    }

    _isSouth() {
        return this.direction.is("south");
    }

    _isWest() {
        return this.direction.is("west");
    }

    _istLeer() {
        return this.hatSteine == 0;
    }

    _istVoll() {
        return this.hatSteine == this.maxSteine;
    }

    _nichtIstLeer() {
        return !this._istLeer();
    }

    _nichtIstVoll() {
        return !this._istVoll();
    }

    _hatZiegel() {
        return this.hatSteine > 0;
    }

    _hatZiegelAnzahl(anzahl: number) {
        return this.hatSteine >= anzahl;
    }

    _setzeAnzahlSteine(anzahl: number) {
        this.hatSteine = anzahl;
    }

    _setzeRucksackGroesse(groesse: number) {
        this.maxSteine = groesse;
    }

    _debugOutput(){
        return `{x = ${this.x}, y = ${this.y}, direction = ${this.direction.getName()}}`;
    }
}