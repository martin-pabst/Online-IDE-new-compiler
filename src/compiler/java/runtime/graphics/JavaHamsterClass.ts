import * as PIXI from 'pixi.js';
import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { FilledShapeClass } from "./FilledShapeClass";
import { NonPrimitiveType } from '../../types/NonPrimitiveType';
import { ObjectClass } from '../system/javalang/ObjectClassStringClass';
import { RuntimeExceptionClass } from '../system/javalang/RuntimeException';

type HamsterDirection = {
    index: number,
    dx: number,
    dy: number
}


export class JavaHamsterWorldClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class JavaHamsterWorld extends FilledShape", comment: JRC.HamsterWorldClassComment },

        { type: "method", signature: "JavaHamsterWorld(int Breite, int Höhe)", java: JavaHamsterWorldClass.prototype._cj$_constructor_$JavaHamsterWorld$int$int, comment: JRC.HamsterWorldConstructorComment },
        { type: "method", signature: "final int getBreite()", template: '§1.sizeX', comment: JRC.HamsterWorldGetBreiteComment },
        { type: "method", signature: "final int getHöhe()", template: '§1.sizeY', comment: JRC.HamsterWorldGetHoeheComment },
        { type: "method", signature: "final void löscheAlles()", native: JavaHamsterWorldClass.prototype.clearAll, comment: JRC.HamsterWorldLoescheAllesComment },
        { type: "method", signature: "final void setzeMauer(int x, int y)", native: JavaHamsterWorldClass.prototype.setOrRemoveWall, comment: JRC.HamsterWorldSetzeMauerComment },
        { type: "method", signature: "final void setzeGetreide(int x, int y, int anzahl)", native: JavaHamsterWorldClass.prototype.setGrain, comment: JRC.HamsterWorldSetzeGetreideComment },
        { type: "method", signature: "final void init(string worldAsString)", native: JavaHamsterWorldClass.prototype.init, comment: JRC.HamsterWorldInitComment },
        { type: "method", signature: "final void scale(double factor)", native: JavaHamsterWorldClass.prototype.scaleNew, comment: JRC.shapeScaleComment1 }

    ]

    static type: NonPrimitiveType;

    left: number = 10;
    top: number = 10;
    sizeX!: number;
    sizeY!: number;

    cellWidth: number = 40;
    backgroundGraphics!: PIXI.Graphics;
    columns: WallGrainSprite[][] = [];

    hamsters: HamsterSpriteHelper[] = [];

    // Below World
    belowWorldText!: PIXI.Text;


    _cj$_constructor_$JavaHamsterWorld$int$int(t: Thread, callback: CallbackFunction, sizeX: number, sizeY: number) {
        this._cj$_constructor_$FilledShape$(t, () => {
            this.sizeX = sizeX;
            this.sizeY = sizeY;

            this.container = new PIXI.Container();

            this.columns = [];
            for (let column = 0; column < sizeX; column++) {
                let columnArray: WallGrainSprite[] = [];
                this.columns.push(columnArray);
                for (let row = 0; row < sizeY; row++) columnArray.push(new WallGrainSprite(this, column, row));
            }

            this.borderWidth = 2;
            this.fillColor = 0x90ee90;
            this.fillAlpha = 1.0;
            this.borderColor = 0x8b4513;
            this.borderAlpha = 1.0;

            this.centerXInitial = this.left + this.borderWidth / 2 + sizeX * this.cellWidth / 2;
            this.centerYInitial = this.top + this.borderWidth / 2 + sizeY * this.cellWidth / 2;


            this.world.app!.stage.addChild(this.container);

            this.render();
            this.renderBelowWorld();
        });   // call base class constructor
    }


    setGrain(x: number, y: number, count: number) {
        let sprite = this.columns[x][y];
        sprite.setGrainCount(count);
    }

    setOrRemoveWall(x: number, y: number) {
        let sprite = this.columns[x][y];
        sprite.setWall(!sprite.isWall());
    }

    scaleNew(factor: number) {
        let p = new PIXI.Point(this.left, this.top);
        this.getWorldTransform().apply(p, p);
        this._scale(factor, p.x, p.y);
    }

    isWall(x: number, y: number) {
        let sprite = this.columns[x][y];
        return sprite.isWall();
    }

    getGrainCount(x: number, y: number) {
        let sprite = this.columns[x][y];
        return sprite.getGrainCount();
    }

    renderBelowWorld() {
        let textstyle = new PIXI.TextStyle({
            fontFamily: "sans-serif",
            fontSize: 28,
            fontStyle: 'normal',
            fontWeight: 'normal',
            fill: 0xffffff,
            stroke: {
                width: 2,
                color: '#00000040'
            },
            align: "center",
        })

        this.belowWorldText = new PIXI.Text({
            text: "Hamster: 0, Feld: 0",
            style: textstyle
        });
        this.belowWorldText.localTransform.translate(this.left, this.top + this.sizeY * this.cellWidth + 5);
        this.belowWorldText.setFromMatrix(this.belowWorldText.localTransform);
        this.belowWorldText.updateLocalTransform();

        this.container.addChild(this.belowWorldText);
    }

    render(): void {

        if (this.backgroundGraphics != null) this.backgroundGraphics.destroy();

        this.backgroundGraphics = new PIXI.Graphics();
        this.container.addChild(this.backgroundGraphics);
        this.container.setChildIndex(this.backgroundGraphics, 0);

        let width = this.sizeX * this.cellWidth;
        let height = this.sizeY * this.cellWidth;

        this.hitPolygonInitial = [
            { x: this.left, y: this.top }, { x: this.left, y: this.top + height },
            { x: this.left + width, y: this.top + height }, { x: this.left + width, y: this.top }
        ];

        this.backgroundGraphics.clear();

        this.backgroundGraphics.moveTo(this.left, this.top);
        this.backgroundGraphics.lineTo(this.left + width, this.top);
        this.backgroundGraphics.lineTo(this.left + width, this.top + height);
        this.backgroundGraphics.lineTo(this.left, this.top + height);
        this.backgroundGraphics.closePath();


        for (let c = 1; c < this.sizeX; c++) {
            let x = this.left + this.cellWidth * c;
            this.backgroundGraphics.moveTo(x, this.top);
            this.backgroundGraphics.lineTo(x, this.top + height);
        }

        for (let r = 1; r < this.sizeY; r++) {
            let y = this.top + this.cellWidth * r;
            this.backgroundGraphics.moveTo(this.left, y);
            this.backgroundGraphics.lineTo(this.left + width, y);
        }

        if (this.fillColor != null) {
            this.backgroundGraphics.fill(this.fillColor);
            this.backgroundGraphics.alpha = this.fillAlpha;
        }

        if (this.borderColor != null) {
            this.backgroundGraphics.stroke({
                width: this.borderWidth,
                color: this.borderColor,
                alpha: this.borderAlpha,
                alignment: 0.5
            })
        }

    };

    getWallGrainSprite(x: number, y: number): WallGrainSprite {
        return this.columns[x][y];
    }

    isOutside(x: number, y: number) {
        return x < 0 || y < 0 || x >= this.sizeX || y >= this.sizeY;
    }

    clearAll() {
        // TODO
    }

    init(s: string) {
        let lines = s.split("\n");
        for (let y = 0; y < lines.length; y++) {
            if (y >= this.sizeY) break;
            let line = lines[y];
            for (let x = 0; x < line.length; x++) {
                if (x >= this.sizeX) break;
                let sprite = this.columns[x][y];
                let c = line.charAt(x).toLocaleLowerCase();
                if (c == 'm') {
                    sprite.setWall(true);
                } else {
                    let code = c.charCodeAt(0);
                    let grainCount = 0;
                    if (code >= 97 && code <= 102) grainCount = code - 97 + 10; // a ... f
                    if (code >= 49 && code <= 57) grainCount = code - 49 + 1; // 1 ... 9
                    if (grainCount > 0) {
                        sprite.setGrainCount(grainCount)
                    }
                }
            }
        }
    }

    public destroy(): void {
        for (let columnArray of this.columns) {
            for (let sprite of columnArray) {
                sprite.destroy();
            }
        }

        this.backgroundGraphics.destroy();
        this.hamsters.forEach((h) => h.destroy());
        this.belowWorldText.destroy();

        super.destroy();

    }

}


export class JavaHamsterClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Hamster extends Object", comment: JRC.HamsterClassComment },

        { type: "field", signature: "static int NORD", constantValue: 0 },
        { type: "field", signature: "static int OST", constantValue: 1 },
        { type: "field", signature: "static int SÜD", constantValue: 2 },
        { type: "field", signature: "static int WEST", constantValue: 3 },


        { type: "method", signature: "Hamster(JavaHamsterWorld world, int reihe, int spalte, int blickrichtung, int anzahlkörner)", java: JavaHamsterClass.prototype._cj$_constructor_$Hamster$JavaHamsterWorld$int$int$int$int, comment: JRC.HamsterConstructorComment },
        { type: "method", signature: "final void vor()", template: '§1.sprite.forward();', comment: JRC.HamsterVorComment },
        { type: "method", signature: "final JavaHamsterWorld getWorld()", template: '§1.world', comment: JRC.HamsterGetWorldComment },
        { type: "method", signature: "final int getBlickrichtung()", template: '§1.sprite.direction', comment: JRC.HamsterGetBlickrichtungComment },
        { type: "method", signature: "final int getReihe()", template: '§1.sprite.x', comment: JRC.HamsterGetReiheComment },
        { type: "method", signature: "final int getSpalte()", template: '§1.sprite.y', comment: JRC.HamsterGetSpalteComment },
        { type: "method", signature: "final int getAnzahlKoerner()", template: '§1.sprite.grainCount', comment: JRC.HamsterGetKoernerComment },
        { type: "method", signature: "final void linksUm()", template: '§1.sprite.turn(-1)', comment: JRC.HamsterLinksUmComment },
        { type: "method", signature: "final void gib()", template: '§1.sprite.give()', comment: JRC.HamsterGibComment },
        { type: "method", signature: "final void nimm()", template: '§1.sprite.take()', comment: JRC.HamsterNimmComment },
        { type: "method", signature: "final boolean vornFrei()", template: '§1.sprite.nextCellFree()', comment: JRC.HamsterVornFreiComment },
        { type: "method", signature: "final boolean maulLeer()", template: '(§1.sprite.grainCount == 0)', comment: JRC.HamsterMaulLeerComment },
        { type: "method", signature: "final boolean kornDa()", template: '§1.sprite.sitsOnGrain()', comment: JRC.HamsterKornDaComment },
        { type: "method", signature: "final void schreib(string text)", java: JavaHamsterClass.prototype._mj$schreib$void$string, comment: JRC.HamsterSchreibComment },


    ]

    static type: NonPrimitiveType;
    sprite!: HamsterSpriteHelper;
    world!: JavaHamsterWorldClass;

    _cj$_constructor_$Hamster$JavaHamsterWorld$int$int$int$int(t: Thread, callback: CallbackFunction, world: JavaHamsterWorldClass,
        reihe: number, spalte: number, blickrichtung: number, anzahlkoerner: number) {

        if (world == null) throw new RuntimeExceptionClass("Der Parameter javaHamsterWorld darf nicht null sein.");

        this.world = world;
        this.sprite = new HamsterSpriteHelper(world, spalte, reihe, blickrichtung, anzahlkoerner);

        t.s.push(this);
        if (callback) callback();
    }

    _mj$schreib$void$string(t: Thread, callback: CallbackFunction, text: string) {
        t.println(text, 0xffffff);
        if (callback) callback();
    }
}



class HamsterSpriteHelper {

    static directions: HamsterDirection[] = [{ index: 0, dx: 0, dy: -1 }, { index: 1, dx: 1, dy: 0 }, { index: 2, dx: 0, dy: 1 }, { index: 3, dx: -1, dy: 0 }];

    sprite: PIXI.Sprite;

    constructor(public world: JavaHamsterWorldClass, public x: number, public y: number, public direction: number, public grainCount: number) {
        let sheet = PIXI.Assets.get('spritesheet');

        let texture = sheet.textures["Hamster#" + 0];
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.move(world.left + (x + 0.5) * world.cellWidth, world.top + (y + 0.5) * world.cellWidth);

        (<PIXI.Container>world.container).addChild(this.sprite);
        this.direction = 2;
        this.setDirection(direction);

        world.hamsters.push(this);

    }

    writeBelowWorldText() {
        if (this.world.hamsters.length == 1) {
            this.world.belowWorldText.text = `Hamster: ${this.grainCount}, Zelle: ${this.world.getGrainCount(this.x, this.y)}`;
        }
    }

    testDestroyed(method: string): boolean {
        if (this.sprite.destroyed) {
            this.throwException("Die Methode " + method + " eines schon zerstörten Hamsters wurde aufgerufen.");
            return true;
        }
        return false;
    }

    destroy(): void {
        this.sprite.destroy();
    }

    forward() {
        let direction = HamsterSpriteHelper.directions[this.direction];
        let newX = (this.x + direction.dx); // + this.world.sizeX); // % this.world.sizeX;
        let newY = (this.y + direction.dy); // + this.world.sizeY); // % this.world.sizeY;

        if (this.world.isOutside(newX, newY)) {
            this.throwException(`Die neue Position (${newX}, ${newY}) ist außerhalb der Welt. Der Hamster kann daher nicht weitergehen.`);
            return;
        }

        if (this.world.isWall(newX, newY)) {
            this.throwException(`An der neuen Position (${newX}, ${newY}) befindet sich eine Mauer. Der Hamster kann daher nicht weitergehen.`);
            return;
        }

        this.moveToCell(newX, newY);
        this.writeBelowWorldText();
    }

    turn(angle: number) {
        this.setDirection((this.direction + angle + 4) % 4);
    }

    throwException(text: string) {
        throw new RuntimeExceptionClass(text);
    }

    private move(dx: number, dy: number) {
        this.sprite.localTransform.translate(dx, dy);
        this.sprite.setFromMatrix(this.sprite.localTransform);
        this.sprite.updateLocalTransform();
    }

    moveToCell(x: number, y: number) {
        this.move((x - this.x) * this.world.cellWidth, (y - this.y) * this.world.cellWidth);
        this.x = x;
        this.y = y;
    }

    setDirection(direction: number) {
        let d = (direction - this.direction + 4) % 4;
        let centerX = this.world.left + (this.x + 0.5) * this.world.cellWidth;
        let centerY = this.world.top + (this.y + 0.5) * this.world.cellWidth;

        this.sprite.localTransform.translate(-centerX, -centerY);
        this.sprite.localTransform.rotate(d * Math.PI / 2);
        this.sprite.localTransform.translate(centerX, centerY);

        this.sprite.setFromMatrix(this.sprite.localTransform);
        this.sprite.updateLocalTransform();
        this.direction = direction;
    }

    getPositionInDirection(dirDelta: number) {
        let dir = HamsterSpriteHelper.directions[(this.direction + dirDelta + 4) % 4];
        return { x: (this.x + dir.dx + this.world.sizeX) % this.world.sizeX, y: (this.y + dir.dy + this.world.sizeY) % this.world.sizeY };

    }

    setPosition(x: any, y: any) {
        if (x < 0) x = -x - 1 + this.world.sizeX;
        if (y < 0) y = -y - 1 + this.world.sizeY;
        this.moveToCell(x % this.world.sizeX, y % this.world.sizeY);
    }

    give() {
        if (this.grainCount <= 0) {
            this.throwException("Der Hamster hat kein Korn mehr, das er ablegen könnte.");
            return;
        }
        this.grainCount--;
        this.world.setGrain(this.x, this.y, this.world.getGrainCount(this.x, this.y) + 1);
        this.writeBelowWorldText();
    }

    take() {
        if (this.world.getGrainCount(this.x, this.y) <= 0) {
            this.throwException("In der Zelle, in der sich der Hamster befindet, liegt kein Korn. Der Hamster kann daher keines nehmen.");
            return;
        }
        this.grainCount++;
        this.world.setGrain(this.x, this.y, this.world.getGrainCount(this.x, this.y) - 1);
        this.writeBelowWorldText();
    }

    nextCellFree(): boolean {
        let direction = HamsterSpriteHelper.directions[this.direction];
        let newX = (this.x + direction.dx); // + this.world.sizeX); // % this.world.sizeX;
        let newY = (this.y + direction.dy); // + this.world.sizeY); // % this.world.sizeY;
        if (this.world.isOutside(newX, newY)) return false;
        return !this.world.isWall(newX, newY);
    }

    sitsOnGrain(): boolean {
        return this.world.getGrainCount(this.x, this.y) > 0;
    }

}


class WallGrainSprite {

    wallSprite: PIXI.Sprite;
    grainSprite: PIXI.Sprite;
    grainText: PIXI.Text;

    private grainCount: number = 0;
    private _isWall: boolean = false;

    constructor(public world: JavaHamsterWorldClass, public x: number, public y: number) {
        let sheet = PIXI.Assets.get('spritesheet');

        let container = <PIXI.Container>world.container;
        let xm = world.left + (x + 0.5) * world.cellWidth;
        let ym = world.top + (y + 0.5) * world.cellWidth;

        let grainTexture = sheet.textures["Hamster#1"];
        this.grainSprite = new PIXI.Sprite(grainTexture);
        this.move(xm, ym, this.grainSprite);
        this.grainSprite.anchor.x = 0.5;
        this.grainSprite.anchor.y = 0.5;

        container.addChild(this.grainSprite);

        let wallTexture = sheet.textures["Hamster#2"];
        this.wallSprite = new PIXI.Sprite(wallTexture);
        this.move(xm, ym, this.wallSprite);
        this.wallSprite.anchor.x = 0.5;
        this.wallSprite.anchor.y = 0.5;

        container.addChild(this.wallSprite);



        this.grainText = new PIXI.Text({
            text: "0",
            style: new PIXI.TextStyle({
                fontFamily: "sans-serif",
                fontSize: 24,
                fontStyle: 'normal',
                fontWeight: 'normal',
                fill: 0x000000,
                stroke: {
                    color: '#ffffff40',
                    width: 2
                },
                align: "center",
            })
        });

        this.grainText.anchor.x = 0.5;
        this.grainText.anchor.y = 0.5;
        this.move(xm, ym, this.grainText);

        container.addChild(this.grainText);

        this.grainSprite.visible = false;
        this.wallSprite.visible = false;
        this.grainText.visible = false;

    }

    private move(dx: number, dy: number, container: PIXI.Container) {
        container.localTransform.translate(dx, dy);
        container.setFromMatrix(container.localTransform)
        container.updateLocalTransform();
    }

    setGrainCount(n: number) {
        this.grainSprite.visible = n > 0;
        this.grainText.visible = n > 0;
        this.grainText.text = "" + n;
        this.grainCount = n;
    }

    getGrainCount(): number { return this.grainCount }

    isWall(): boolean { return this._isWall }

    setWall(isWall: boolean) {
        this._isWall = isWall;
        this.wallSprite.visible = isWall;
    }

    destroy() {
        this.wallSprite.destroy();
        this.grainSprite.destroy();
        this.grainText.destroy();
    }
}

