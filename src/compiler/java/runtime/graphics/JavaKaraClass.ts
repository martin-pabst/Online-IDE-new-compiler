import * as PIXI from 'pixi.js';
import { CallbackFunction } from "../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { FilledShapeClass } from "./FilledShapeClass";
import { RuntimeExceptionClass } from '../system/javalang/RuntimeException';
import { PolygonClass } from './PolygonClass';
import { PositionClass } from './PositionClass';
import { ObjectClass } from '../system/javalang/ObjectClassStringClass';
import { JRC } from '../../language/JavaRuntimeLibraryComments';

type KaraDirection = {
    index: number,
    dx: number,
    dy: number
}

type Position = {
    x: number,
    y: number
}

enum DirectionDelta {
    left = 1, right = -1, front = 0, none
}

export class JavaKaraWorldClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class JavaKaraWorld extends FilledShape", comment: JRC.JavaKaraWorldClassComment },

        { type: "field", signature: "static int NORTH", constantValue: 0 },
        { type: "field", signature: "static int WEST", constantValue: 1 },
        { type: "field", signature: "static int SOUTH", constantValue: 2 },
        { type: "field", signature: "static int EAST", constantValue: 3 },

        { type: "method", signature: "JavaKaraWorld(int sizeX, int sizeY)", java: JavaKaraWorldClass.prototype._cj$_constructor_$JavaKaraWorld$int$int, comment: JRC.JavaKaraWorldConstructorComment },

        { type: "method", signature: "final int getSizeX()", template: `§1.sizeX`, comment: JRC.JavaKaraWorldGetSizeXComment },
        { type: "method", signature: "final int getSizeY()", template: `§1.sizeY`, comment: JRC.JavaKaraWorldGetSizeYComment },
        { type: "method", signature: "final void clearAll()", native: JavaKaraWorldClass.prototype.clearAll, comment: JRC.JavaKaraWorldClearAllComment },
        { type: "method", signature: "final void setLeaf(int x, int y)", native: JavaKaraWorldClass.prototype.setOrRemoveLeaf, comment: JRC.JavaKaraWorldSetLeafComment },
        { type: "method", signature: "final void setTree(int x, int y)", native: JavaKaraWorldClass.prototype.setOrRemoveTree, comment: JRC.JavaKaraWorldSetTreeComment },
        { type: "method", signature: "final void setMushroom(int x, int y)", native: JavaKaraWorldClass.prototype.setOrRemoveMushroom, comment: JRC.JavaKaraWorldSetMushroomComment },
        { type: "method", signature: "final boolean isEmpty(int x, int y)", native: JavaKaraWorldClass.prototype.isEmpty, comment: JRC.JavaKaraWorldIsEmptyComment },
        { type: "method", signature: "final void init(string s)", native: JavaKaraWorldClass.prototype.init, comment: JRC.JavaKaraWorldInitComment },

        { type: "method", signature: "final void scale(double factor)", native: JavaKaraWorldClass.prototype.scaleNew, comment: JRC.shapeScaleComment1 },

    ]

    static type: NonPrimitiveType;

    left: number = 10;
    top: number = 10;
    sizeX!: number;
    sizeY!: number;

    cellWidth: number = 28;
    backgroundGraphics!: PIXI.Graphics;
    columns: KaraSprite[][][] = [];

    karas: KaraSprite[] = [];


    _cj$_constructor_$JavaKaraWorld$int$int(t: Thread, callback: CallbackFunction,
        sizeX: number, sizeY: number
    ) {
        this._cj$_constructor_$FilledShape$(t, () => {
            this.sizeX = sizeX;
            this.sizeY = sizeY;

            this.columns = [];
            for (let i = 0; i < sizeX; i++) {
                let columnArray: KaraSprite[][] = [];
                this.columns.push(columnArray);
                for (let j = 0; j < sizeY; j++) columnArray.push([]);
            }

            this.borderWidth = 2;
            this.fillColor = 0xb4e6b4;
            this.fillAlpha = 1.0;
            this.borderColor = 0xaaaaaa;
            this.borderAlpha = 1.0;

            this.centerXInitial = this.left + this.borderWidth / 2 + sizeX * this.cellWidth / 2;
            this.centerYInitial = this.top + this.borderWidth / 2 + sizeY * this.cellWidth / 2;

            this.container = new PIXI.Container();

            this.world.app!.stage.addChild(this.container);

            this.render();
        });   // call base class constructor


    }

    scaleNew(factor: number){
        let p = new PIXI.Point(this.left, this.top);
      this.getWorldTransform().apply(p, p);
        super._scale(factor, p.x, p.y);
    }

    isMushroom(direction: number, delta: DirectionDelta, x: number, y: number) {
        let pos = this.withDirection(direction, delta, x, y);
        if(pos.x < 0 || pos.x >= this.sizeX || pos.y < 0 || pos.y >= this.sizeY) return false;
        for (let sprite of this.columns[pos.x][pos.y]) {
            if (sprite.isMushroom()) return true;
        }
        return false;
    }

    isTree(direction: number, delta: DirectionDelta, x: number, y: number) {
        let pos = this.withDirection(direction, delta, x, y);
        if(pos.x < 0 || pos.x >= this.sizeX || pos.y < 0 || pos.y >= this.sizeY) return false;
        for (let sprite of this.columns[pos.x][pos.y]) {
            if (sprite.isTree()) return true;
        }
        return false;
    }

    isLeaf(direction: number, delta: DirectionDelta, x: number, y: number) {
        let pos = this.withDirection(direction, delta, x, y);
        if(pos.x < 0 || pos.x >= this.sizeX || pos.y < 0 || pos.y >= this.sizeY) return false;
        for (let sprite of this.columns[pos.x][pos.y]) {
            if (sprite.isLeaf()) return true;
        }
        return false;
    }

    withDirection(direction: number, delta: DirectionDelta, x: number, y: number): {x: number, y: number}{
        if(delta == DirectionDelta.none) return {x: x, y: y};
        let dirNew = KaraSprite.directions[(direction + delta) % KaraSprite.directions.length];
        x += dirNew.dx;
        y += dirNew.dy;
        return {x: x, y: y};
    }

    render(): void {

        if(this.backgroundGraphics != null) this.backgroundGraphics.destroy();

        let container = <PIXI.Container>this.container;
        this.backgroundGraphics = new PIXI.Graphics();
        container.addChild(this.backgroundGraphics);
        container.setChildIndex(this.backgroundGraphics, 0);

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

    removeSprite(sprite: KaraSprite | undefined) {
        if(!sprite) return;
        let array = this.columns[sprite.x][sprite.y];
        let index = array.indexOf(sprite);
        if (index >= 0) array.splice(index, 1);
    }

    addSprite(x: number, y: number, sprite: KaraSprite) {
        let array = this.columns[x][y];
        array.push(sprite);
    }

    moveSprite(xTo: number, yTo: number, sprite: KaraSprite) {
        this.removeSprite(sprite);
        this.addSprite(xTo, yTo, sprite);
    }

    getMushroom(x: number, y: number): KaraSprite | undefined {
        let array = this.columns[x][y];
        return array.find((s) => s.isMushroom());
    }

    isOutside(x: number, y: number) {
        return x <= 0 || y <= 0 || x >= this.sizeX || y >= this.sizeY;
    }

    put(x: number, y: number, sprite: KaraSprite) {
        if (x < 0) x = - x + this.sizeX - 1;
        if (y < 0) y = - y + this.sizeY - 1;
        x = x % this.sizeX;
        y = y % this.sizeY;
        this.columns[x][y].push(sprite);
        if (sprite.isKara()) {
            this.karas.push(sprite);
        } else {
            for (let kara of this.karas) {
                let container: PIXI.Container = <PIXI.Container>this.container;
                let highestIndex = container.children.length - 1;

                container.setChildIndex(kara.sprite, highestIndex);

            }
        }
    }

    removeLeaf(x: number, y: number) {
        let array = this.columns[x][y];
        let leaf = array.find((s) => s.isLeaf());
        this.removeSprite(leaf);
        leaf?.sprite.destroy();
    }

    removeTree(x: number, y: number) {
        let array = this.columns[x][y];
        let tree = array.find((s) => s.isTree());
        this.removeSprite(tree);
        tree?.sprite.destroy();
    }

    removeMushroom(x: number, y: number) {
        let array = this.columns[x][y];
        let mushroom = array.find((s) => s.isMushroom());
        this.removeSprite(mushroom);
        mushroom?.sprite.destroy();
    }

    clearAll() {
        for (let column of this.columns) {
            for (let cellArray of column) {
                this.emptyCellArray(cellArray);
            }
        }
    }

    emptyCellArray(cellArray: KaraSprite[]) {
        let kara: KaraSprite | undefined;
        for (let sprite of cellArray) {
            if (sprite.isKara()) {
                kara = sprite;
            } else {
                sprite.sprite.destroy();
            }
        }
        while (cellArray.length > 0) cellArray.pop();
        if (kara != null) cellArray.push(kara);
    }

    setOrRemoveLeaf(x: number, y: number) {
        if (!this.isLeaf(0, DirectionDelta.none, x, y)) { new KaraSprite(this, x, y, 3, 1); } else {
            this.removeLeaf(x, y);
        }
    }

    setOrRemoveTree(x: number, y: number) {
        if (!this.isTree(0, DirectionDelta.none, x, y)) { new KaraSprite(this, x, y, 3, 3); } else {
            this.removeTree(x, y);
        }
    }

    setOrRemoveMushroom(x: number, y: number) {
        if (!this.isMushroom(0, DirectionDelta.none, x, y)) { new KaraSprite(this, x, y, 3, 2); } else {
            this.setOrRemoveMushroom(x, y);
        }
    }

    isEmpty(x: number, y: number) {
        let a = this.columns[x][y];
        return a.length == 0;
    }

    init(s: string) {
        this.clearAll();
        let lines = s.split("\n");
        for (let y = 0; y < lines.length; y++) {
            if (y >= this.sizeY) break;
            let line = lines[y];
            for (let x = 0; x < line.length; x++) {
                if (x >= this.sizeX) break;
                let c = line.charAt(x).toLocaleLowerCase();
                switch (c) {
                    case 'l':
                        this.setOrRemoveLeaf(x, y);
                        break;
                    case 't':
                        this.setOrRemoveTree(x, y);
                        break;
                    case 'm':
                        this.setOrRemoveMushroom(x, y);
                        break;

                    default:
                        break;
                }
            }
        }
    }

    public destroy(): void {
        for (let row of this.columns) {
            for (let a of row) {
                for (let sprite of a) {
                    sprite.sprite.destroy();
                }
                while (a.length > 0) a.pop();
            }
        }

        super.destroy();
    }


}




export class JavaKaraClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Kara extends Object", comment: JRC.KaraClassComment },

        { type: "method", signature: "Kara(JavaKaraWorld world, int x, int y, int direction)", java: JavaKaraClass.prototype._cj$_constructor_$Kara$JavaKaraWorld$int$int$int, comment: JRC.KaraConstructorComment },
        { type: "method", signature: "final Position getPosition()",template: `§1.sprite.getPosition()`, comment: JRC.KaraGetPositionComment },
        { type: "method", signature: "final void move()",template: `§1.sprite.forward()`, comment: JRC.KaraMoveComment },
        { type: "method", signature: "final JavaKaraWorld getWorld()",template: `§1.world`, comment: JRC.KaraGetWorldComment },
        { type: "method", signature: "final int getDirection()",template: `§1.sprite.direction`, comment: JRC.KaraGetDirectionComment },
        { type: "method", signature: "final boolean onLeaf()", native: JavaKaraClass.prototype._onLeaf, comment: JRC.KaraOnLeafComment },
        { type: "method", signature: "final boolean treeFront()", native: JavaKaraClass.prototype._treeFront, comment: JRC.KaraTreeFrontComment },
        { type: "method", signature: "final boolean treeLeft()", native: JavaKaraClass.prototype._treeLeft, comment: JRC.KaraTreeLeftComment },
        { type: "method", signature: "final boolean treeRight()", native: JavaKaraClass.prototype._treeRight, comment: JRC.KaraTreeRightComment },
        { type: "method", signature: "final boolean mushroomFront()", native: JavaKaraClass.prototype._mushroomFront, comment: JRC.KaraMushroomFrontComment },
        { type: "method", signature: "final void turnLeft()", template: `§1.sprite.turn(1);`, comment: JRC.KaraTurnLeftComment },
        { type: "method", signature: "final void turnRight()", template: `§1.sprite.turn(-1);`, comment: JRC.KaraTurnRightComment },
        { type: "method", signature: "final void putLeaf()", template: `§1.sprite.putLeaf();`, comment: JRC.KaraPutLeafComment },
        { type: "method", signature: "final void removeLeaf()", template: `§1.sprite.removeLeaf();`, comment: JRC.KaraRemoveLeafComment },

    ]

    static type: NonPrimitiveType;
    sprite!: KaraSprite;
    world!: JavaKaraWorldClass;

    _cj$_constructor_$Kara$JavaKaraWorld$int$int$int(t: Thread, callback: CallbackFunction, world: JavaKaraWorldClass, x: number, y: number, direction: number){

        if(world == null) throw new RuntimeExceptionClass("Der Parameter javaKaraWorld darf nicht null sein.");

        this.world = world;
        this.sprite = new KaraSprite(world, x, y, direction, 0);

        t.s.push(this);
        if(callback) callback();
    }

    _onLeaf(): boolean {
        return this.world.isLeaf(this.sprite.direction, DirectionDelta.none, this.sprite.x, this.sprite.y);
    }

    _treeFront(): boolean {
        return this.world.isTree(this.sprite.direction, DirectionDelta.front, this.sprite.x, this.sprite.y);
    }

    _treeLeft(): boolean {
        return this.world.isTree(this.sprite.direction, DirectionDelta.left, this.sprite.x, this.sprite.y);
    }

    _treeRight(): boolean {
        return this.world.isTree(this.sprite.direction, DirectionDelta.right, this.sprite.x, this.sprite.y);
    }

    _mushroomFront(): boolean {
        return this.world.isMushroom(this.sprite.direction, DirectionDelta.front, this.sprite.x, this.sprite.y);
    }


}


class KaraSprite {

    static directions: KaraDirection[] = [{ index: 0, dx: 0, dy: -1 }, { index: 1, dx: -1, dy: 0 }, { index: 2, dx: 0, dy: 1 }, { index: 3, dx: 1, dy: 0 }];


    sprite: PIXI.Sprite;

    constructor(public world: JavaKaraWorldClass, public x: number, public y: number, public direction: number, public imageIndex: number) {
        let sheet = PIXI.Assets.get('spritesheet');

        let texture = sheet.textures["Kara#" + imageIndex];
        this.sprite = new PIXI.Sprite(texture);
        this.move(world.left + x * world.cellWidth, world.top + y * world.cellWidth);

        (<PIXI.Container>world.container).addChild(this.sprite);
        this.direction = 3;
        this.setDirection(direction);

        this.world.put(x, y, this);

    }

    forward() {
        let direction = KaraSprite.directions[this.direction];
        let newX = (this.x + direction.dx + this.world.sizeX) % this.world.sizeX;
        let newY = (this.y + direction.dy + this.world.sizeY) % this.world.sizeY;

        if (this.world.isTree(0, DirectionDelta.none, newX, newY)) {
            this.throwException(`An der neuen Position (${newX}, ${newY}) befindet sich ein Baumstumpf. Kara kann nicht dorthin gehen.`);
            return;
        }

        if (this.world.isMushroom(0, DirectionDelta.none, newX, newY)) {
            let nextX = newX + direction.dx;
            let nextY = newY + direction.dy;

            nextX = (nextX + this.world.sizeX) % this.world.sizeX;
            nextY = (nextY + this.world.sizeY) % this.world.sizeY;

            if (this.world.isTree(0, DirectionDelta.none, nextX, nextY)) {
                this.throwException(`An der neuen Position (${newX}, ${newY}) befindet sich ein Pilz, dahinter ein Baum. Kara kann den Pilz daher nicht schieben.`);
                return;
            }
            if (this.world.isMushroom(0, DirectionDelta.none, nextX, nextY)) {
                this.throwException(`An der neuen Position (${newX}, ${newY}) befindet sich ein Pilz, dahinter noch ein Pilz. Kara kann den Pilz daher nicht schieben.`);
                return;
            }

            let mushroom = this.world.getMushroom(newX, newY);
            mushroom?.moveToCell(nextX, nextY)
        }

        this.moveToCell(newX, newY);
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
        this.world.moveSprite(x, y, this);
    }

    setDirection(direction: number) {
        let d = (direction - this.direction + 4) % 4;
        let centerX = this.world.left + this.x * this.world.cellWidth + 14;
        let centerY = this.world.top + this.y * this.world.cellWidth + 14;

        this.sprite.localTransform.translate(-centerX, -centerY);
        this.sprite.localTransform.rotate(-d * Math.PI / 2);
        this.sprite.localTransform.translate(centerX, centerY);

        this.sprite.setFromMatrix(this.sprite.localTransform);

        this.sprite.updateLocalTransform();
        //@ts-ignore
        this.sprite._didLocalTransformChangeId = this.sprite._didChangeId;

        this.direction = direction;
    }

    isLeaf() {
        return this.imageIndex == 1;
    }

    isMushroom() {
        return this.imageIndex == 2;
    }

    isTree() {
        return this.imageIndex == 3;
    }

    isKara() {
        return this.imageIndex == 0;
    }

    getPositionFront(): Position {
        return this.getPositionInDirection(0);
    }

    getPositionLeft(): Position {
        return this.getPositionInDirection(1);
    }

    getPositionRight(): Position {
        return this.getPositionInDirection(-1);
    }

    getPositionInDirection(dirDelta: number) {
        let dir = KaraSprite.directions[(this.direction + dirDelta + 4) % 4];
        return { x: (this.x + dir.dx + this.world.sizeX) % this.world.sizeX, y: (this.y + dir.dy + this.world.sizeY) % this.world.sizeY };

    }

    putLeaf() {
        if (this.world.isLeaf(0, DirectionDelta.none, this.x, this.y)) {
            this.throwException("Unter Kara liegt schon ein Kleeblatt, es kann an dieser Position nicht  noch eines abgelegt werden.");
            return;
        }

        new KaraSprite(this.world, this.x, this.y, 3, 1);
    }

    removeLeaf() {
        if (!this.world.isLeaf(0, DirectionDelta.none, this.x, this.y)) {
            this.throwException("Unter Kara liegt kein Kleeblatt, daher kann Kara keines aufheben (Methode removeLeaf).");
            return;
        }
        this.world.removeLeaf(this.x, this.y);
    }

    setPosition(x: any, y: any) {
        if (x < 0) x = -x - 1 + this.world.sizeX;
        if (y < 0) y = -y - 1 + this.world.sizeY;
        this.moveToCell(x % this.world.sizeX, y % this.world.sizeY);
    }

    getPosition(): PositionClass {
        let p = new PositionClass();
        p.x = this.x;
        p.y = this.y;
        return p;
    }

    testDestroyed(method: string): boolean {
        if (this.sprite.destroyed) {
            this.throwException("Die Methode " + method + " eines schon zerstörten Marienkäfers wurde aufgerufen.");
            return true;
        }
        return false;
    }

}


