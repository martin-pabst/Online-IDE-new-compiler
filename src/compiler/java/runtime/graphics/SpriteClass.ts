import * as PIXI from 'pixi.js';
import { convexhull } from '../../../../tools/ConvexHull';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from '../system/javalang/ObjectClassStringClass';
import { RuntimeExceptionClass } from '../system/javalang/RuntimeException';
import { GroupClass } from './GroupClass';
import { HitPolygonStore } from './HitPolygonStore';
import { RepeatType, RepeatTypeEnum } from './RepeatTypeEnum';
import { ScaleMode, ScaleModeEnum } from './ScaleModeEnum';
import { ShapeClass } from './ShapeClass';
import { SpriteLibraryEnum } from './SpriteLibraryEnum';
import { JRC } from '../../language/JavaRuntimeLibraryComments';
import { ExceptionPrinter } from '../../../common/interpreter/ExceptionPrinter';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';

export class SpriteClass extends ShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Sprite extends Shape", comment: JRC.spriteClassComment },

        { type: "method", signature: "Sprite(double x, double y, SpriteLibrary spriteLibraryEntry, int index, ScaleMode scalemode)", java: SpriteClass.prototype._cj$_constructor_$Sprite$double$double$SpriteLibrary$int$ScaleMode, comment: JRC.spriteConstructorComment1 },
        { type: "method", signature: "Sprite(double x, double y, SpriteLibrary spriteLibraryEntry, int index)", java: SpriteClass.prototype._cj$_constructor_$Sprite$double$double$SpriteLibrary$int, comment: JRC.spriteConstructorComment1 },
        { type: "method", signature: "Sprite(double x, double y, SpriteLibrary spriteLibraryEntry)", java: SpriteClass.prototype._cj$_constructor_$Sprite$double$double$SpriteLibrary, comment: JRC.spriteConstructorComment1 },
        { type: "method", signature: "Sprite(Shape shape, ScaleMode scalemode)", java: SpriteClass.prototype._cj$_constructor_$Sprite$Shape$ScaleMode, comment: JRC.spriteConstructorComment2 },
        { type: "method", signature: "Sprite(Shape shape)", java: SpriteClass.prototype._cj$_constructor_$Sprite$Shape, comment: JRC.spriteConstructorComment2 },
        { type: "method", signature: "void setImage(SpriteLibrary spriteLibrary, int imageIndex)", template: `§1.setTexture(§2.name, §3)`, comment: JRC.spriteSetImageComment },
        { type: "method", signature: "void setImageIndex(int imageIndex)", template: `§1.setTexture(§1.textureName, §2)`, comment: JRC.spriteSetImageIndexComment },
        { type: "method", signature: "void playAnimation(int[] imageIndexArray, RepeatType repeatType, int imagesPerSecond)", native: SpriteClass.prototype._playAnimation, comment: JRC.spritePlayAnimationComment },
        { type: "method", signature: "void playAnimation(int fromIndex, int toIndex, RepeatType repeatType, int imagesPerSecond)", native: SpriteClass.prototype._playAnimation1, comment: JRC.spritePlayAnimationComment },
        { type: "method", signature: "void stopAnimation()", native: SpriteClass.prototype._stopAnimation, comment: JRC.spriteStopAnimationComment },
        { type: "method", signature: "void pauseAnimation()", native: SpriteClass.prototype._pauseAnimation, comment: JRC.spritePauseAnimationComment },
        { type: "method", signature: "void resumeAnimation()", native: SpriteClass.prototype._resumeAnimation, comment: JRC.spriteResumeAnimationComment },
        { type: "method", signature: "void setAsBackgroundImage()", native: SpriteClass.prototype._setAsBackgroundImage, comment: JRC.spriteSetAsBackgroundImageComment },
        { type: "method", signature: "void setAlpha(double alphaValue)", native: SpriteClass.prototype._setAlpha, comment: JRC.spriteSetAlphaComment },
        { type: "method", signature: "Sprite copy()", java: SpriteClass.prototype._mj$copy$Sprite$, comment: JRC.spriteCopyComment },
        { type: "method", signature: "double getWidth()", native: SpriteClass.prototype._getWidth, comment: JRC.spriteGetWidthComment },
        { type: "method", signature: "double getHeight()", native: SpriteClass.prototype._getHeight, comment: JRC.spriteGetHeightComment },
        { type: "method", signature: "int getImageIndex()", template: `§1.imageIndex`, comment: JRC.spriteGetImageIndexComment },
        { type: "method", signature: "void makeTiling(double width, double height)", native: SpriteClass.prototype.makeTiling, comment: JRC.spriteMakeTilingComment1 },
        { type: "method", signature: "void makeTiling(double width, double height, double gapX, double gapY)", native: SpriteClass.prototype.makeTiling, comment: JRC.spriteMakeTilingComment2 },
        { type: "method", signature: "TileImage getTileImage()", native: SpriteClass.prototype.getTileImage, comment: JRC.spriteGetTileImageComment },

    ]

    static type: NonPrimitiveType;

    static linearScalemodeTextures: Record<string, PIXI.Texture> = {};

    animationIndices: number[] = [];
    animationRuns: boolean = false;
    imagesPerMillisecond: number = 1;
    animationTime: number = 0;
    animationPaused: boolean = false;

    repeatTypeOrdinal: RepeatType = RepeatType.once;  // ordinal of enum RepeatType
    scaleModeOrdinal!: ScaleMode;  // ordinal of enum ScaleMode
    textureName: string = "";

    isTileSprite: boolean = false;

    x!: number;
    y!: number;
    spriteLibrary!: string;
    imageIndex: number = 0;    // If you change this identifier then you have to change corresponding declaration in class ShapeClass

    _cj$_constructor_$Sprite$double$double$SpriteLibrary$int$ScaleMode(t: Thread, callback: CallbackParameter,
        x: number, y: number, spriteLibrary: string | SpriteLibraryEnum | undefined, imageIndex: number,
        scaleMode?: ScaleModeEnum, copyFromOtherShape?: ShapeClass
    ) {
        this._cj$_constructor_$Shape$(t, async () => {
            this.x = x;
            this.y = y;
            this.scaleModeOrdinal = scaleMode?.ordinal || ScaleMode.nearest_neighbour;

            if (copyFromOtherShape == null) {
                this.spriteLibrary = (typeof spriteLibrary == "string") ? spriteLibrary : spriteLibrary!.name;
                this.imageIndex = imageIndex;
                this.setTexture(undefined, imageIndex);
            } else {
                this.copyBitmapFromShape(copyFromOtherShape);
                let bounds = copyFromOtherShape.container.getBounds();
                let p = new PIXI.Point(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
                p = this.world.app.stage.localTransform.applyInverse(p);
                this.x = p.x;
                this.y = p.y;
            }

            let sprite = <PIXI.Sprite>this.container;

            this.container.localTransform.translate(this.x - sprite.width / 2, this.y - sprite.height / 2);
            this.container.setFromMatrix(this.container.localTransform);
            //@ts-ignore
            this.container._didLocalTransformChangeId = this.container._didChangeId;


            this.world.app.stage.addChild(sprite);

            this.centerXInitial = sprite.width / 2;
            this.centerYInitial = sprite.height / 2;

            this.addToDefaultGroupAndSetDefaultVisibility();

            if (callback) callback();

        });   // call base class constructor

    }

    _cj$_constructor_$Sprite$double$double$SpriteLibrary$int(t: Thread, callback: CallbackParameter,
        x: number, y: number, spriteLibrary: string | SpriteLibraryEnum | undefined, imageIndex: number
    ) {
        return this._cj$_constructor_$Sprite$double$double$SpriteLibrary$int$ScaleMode(t, callback, x, y, spriteLibrary, imageIndex, undefined);
    }

    _cj$_constructor_$Sprite$double$double$SpriteLibrary(t: Thread, callback: CallbackParameter,
        x: number, y: number, spriteLibrary: string | SpriteLibraryEnum | undefined
    ) {
        return this._cj$_constructor_$Sprite$double$double$SpriteLibrary$int$ScaleMode(t, callback, x, y, spriteLibrary, 0, undefined);
    }

    _cj$_constructor_$Sprite$Shape$ScaleMode(t: Thread, callback: CallbackParameter, shape: ShapeClass, scaleMode?: ScaleModeEnum) {

        if (!shape) {
            throw new RuntimeExceptionClass(JRC.spriteShapeIsNullError());
        }

        return this._cj$_constructor_$Sprite$double$double$SpriteLibrary$int$ScaleMode(
            t, callback, 0, 0, undefined, 0, scaleMode, shape
        );
    }

    _cj$_constructor_$Sprite$Shape(t: Thread, callback: CallbackParameter, shape: ShapeClass) {

        return this._cj$_constructor_$Sprite$Shape$ScaleMode(
            t, callback, shape, undefined
        );
    }

    oldTexture: PIXI.Texture | null = null;

    makeTiling(width: number, height: number, gapX: number = 0, gapY: number = 0) {
        width /= this.scaleFactor;
        height /= this.scaleFactor;
        let sprite: PIXI.Sprite = <PIXI.Sprite>this.container;

        if (this.oldTexture == null) this.oldTexture = sprite.texture;

        let texture = this.oldTexture;
        if (gapX > 0 || gapY > 0) {
            texture = this.generateGapTexture(texture, gapX, gapY);
        }

        // TODO:texture.mipmap = PIXI.MIPMAP_MODES.OFF;
        // pixi v8: RenderTexture.create({width:100, height:100, autoGenerateMipmaps:false})

        let tileSprite = new PIXI.TilingSprite({
            texture: texture,
            width: width,
            height: height
        })

        sprite.parent.addChild(tileSprite);

        tileSprite.setFromMatrix(sprite.localTransform);
        tileSprite.updateLocalTransform();

        // tileSprite.clampMargin = -0.5;
        this.container = tileSprite;
        this.centerXInitial += -sprite.width / 2 + width / 2;
        this.centerYInitial += -sprite.height / 2 + height / 2;
        let left = this.centerXInitial - width / 2;
        let top = this.centerYInitial - height / 2;
        let right = left + width;
        let bottom = top + height;
        this.hitPolygonInitial = [
            { x: left, y: top }, { x: right, y: top }, { x: right, y: bottom }, { x: left, y: bottom }
        ];
        this.hitPolygonDirty = true;
        sprite.destroy();
        this.isTileSprite = true;
    }

    generateGapTexture(texture: PIXI.Texture, gapx: number, gapy: number) {
        const gapBox = new PIXI.Graphics()
        const originSprite = new PIXI.Sprite(texture)
        gapBox.rect(0, 0, originSprite.width + gapx, originSprite.height + gapy)
        gapBox.stroke({
            width: 1,
            color: 0x0,
            alpha: 0.01
        })
        gapBox.addChild(originSprite)
        //@ts-ignore
        return this.world.app.renderer.generateTexture(gapBox);
    }

    setTileOffset(x: number, y: number) {
        if (this.isTileSprite) {
            let tileSprite: PIXI.TilingSprite = <PIXI.TilingSprite>this.container;
            tileSprite.tilePosition.set(x, y);
        }
    }


    copyBitmapFromShape(copyFromOtherShape: ShapeClass) {

        let bounds = copyFromOtherShape.container.getBounds();

        let width = bounds.width;
        let height = bounds.height;

        // const brt = new PIXI.Texture(
        //     {
        //         scaleMode: this.scaleMode == "nearest_neighbour" ? PIXI.SCALE_MODES.NEAREST : PIXI.SCALE_MODES.LINEAR,
        //         width: width,
        //         height: height
        //     }
        // );
        // let rt: PIXI.RenderTexture = new PIXI.RenderTexture(brt);

        let scaleMode: PIXI.SCALE_MODE = this.scaleModeOrdinal == ScaleMode.nearest_neighbour ? "nearest" : "linear"

        const rt = PIXI.RenderTexture.create({
            width: width,
            height: height,
            minFilter: scaleMode,
            magFilter: scaleMode
        })

        let dob = copyFromOtherShape.container;
        this.world.app.renderer.render({
            container: dob,
            target: rt,
            transform: new PIXI.Matrix().translate(-bounds.left, -bounds.top).append(dob.worldTransform)
        });

        let points: convexhull.Point[] = [];
        points = this.extractPoints(copyFromOtherShape, points);

        for (let p of points) {
            p.x -= bounds.left;
            p.y -= bounds.top;
        }

        this.hitPolygonInitial = points;
        this.hitPolygonInitial = convexhull.makeHull(points);

        this.hitPolygonDirty = true;

        this.container = new PIXI.Sprite(rt);

        copyFromOtherShape.hitPolygonDirty = true;

    }

    extractPoints(shape: ShapeClass, points: convexhull.Point[]): convexhull.Point[] {
        if (shape instanceof GroupClass) {
            for (let sh of shape.shapes) {
                points = this.extractPoints(sh, points);
            }
            return points;
        } else {
            if (shape.hitPolygonDirty) shape.transformHitPolygon();
            return points.concat(shape.hitPolygonTransformed.map(function (punkt) { return { x: punkt.x, y: punkt.y } }));

        }
    }

    _setAsBackgroundImage(){
        let sprite = <PIXI.Sprite>this.container;
        let ownRatio = sprite.width/sprite.height;
        let worldRatio = this.world.currentWidth/this.world.currentHeight;
        let factor = (ownRatio > worldRatio) ? this.world.height/sprite.height : this.world.width/sprite.width;
        this._setScale(factor);
        this._moveTo(this.world.currentLeft + this.world.currentWidth/2, this.world.currentTop + this.world.currentHeight/2);
        this._sendToBack();
    }

    _getWidth(): number {
        let sprite = <PIXI.Sprite>this.container;
        return sprite.width * this.scaleFactor;
    }

    _getHeight(): number {
        let sprite = <PIXI.Sprite>this.container;
        return sprite.height * this.scaleFactor;
    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$Sprite$(t, callback);
    }

    _mj$copy$Sprite$(t: Thread, callback: CallbackParameter) {
        let copy = new SpriteClass();
        copy._cj$_constructor_$Sprite$double$double$SpriteLibrary$int$ScaleMode(
            t, callback, this.x, this.y, SpriteLibraryEnum.values.find(v => v.name == this.spriteLibrary)!,
            this.imageIndex, ScaleModeEnum.values[this.scaleModeOrdinal]
        )
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if (callback) callback();
    }


    _setAlpha(alpha: number) {
        this.container.alpha = alpha;
    }

    setTexture(spriteLibrary?: string, imageIndex?: number) {

        if(this.container?.destroyed) return;

        if (spriteLibrary == this.spriteLibrary && imageIndex == this.imageIndex) return;
        if (spriteLibrary == null) spriteLibrary = this.spriteLibrary;

        if (imageIndex == null) imageIndex = 0;
        this.imageIndex = imageIndex;

        this.textureName = spriteLibrary;

        let sheet: PIXI.Spritesheet = PIXI.Assets.get('spritesheet');

        let nameWithIndex = spriteLibrary + "#" + imageIndex;
        let texture: PIXI.Texture | undefined = sheet.textures[nameWithIndex];
        if (texture == null) {
            sheet = this.world.interpreter?.graphicsManager?.pixiUserSpritesheet;
            texture = sheet?.textures[nameWithIndex];
        }

        if (texture != null) {

            if (this.scaleModeOrdinal == ScaleMode.linear) {

                let t = SpriteClass.linearScalemodeTextures[nameWithIndex];

                if (t == null) {
                    let sprite = new PIXI.Sprite(texture);

                    let dynamicTexture1 = PIXI.RenderTexture.create({
                        width: sprite.width,
                        height: sprite.height,
                        minFilter: "linear",
                        magFilter: "linear"
                    });

                    this.world.app.renderer.render({
                        container: sprite,
                        target: dynamicTexture1
                    })

                    SpriteClass.linearScalemodeTextures[nameWithIndex] = dynamicTexture1;
                    t = dynamicTexture1;
                }

                texture = t;
                if (texture == null) texture = sheet.textures[nameWithIndex];

            }

            let sprite: PIXI.Sprite = <PIXI.Sprite>this.container;
            if (sprite == null) {
                sprite = new PIXI.Sprite(texture);
                this.container = sprite;
            } else {
                sprite.texture = texture; // sheet.textures[nameWithIndex];
            }

            if (!this.isTileSprite) {
                this.hitPolygonInitial = HitPolygonStore.getPolygonForTexture(spriteLibrary, imageIndex, this, new PIXI.Sprite(sheet.textures[nameWithIndex]));
                this.hitPolygonDirty = true;
            }

            let oldCenterX = this.centerXInitial;
            let oldCenterY = this.centerYInitial;

            this.centerXInitial = sprite.width / 2;
            this.centerYInitial = sprite.height / 2;

            let dx = oldCenterX - this.centerXInitial;
            let dy = oldCenterY - this.centerYInitial;


            if(this.belongsToGroup && dx*dx + dy*dy > 1e-10){

                this.container.setFromMatrix(this.container.localTransform.append(new PIXI.Matrix().translate(oldCenterX - this.centerXInitial, oldCenterY - this.centerYInitial)));

                this.container.updateLocalTransform();
                //@ts-ignore
                this.container._didLocalTransformChangeId = this.container._didChangeId;

                this.setWorldTransformAndHitPolygonDirty();

            }


        } else {
            throw new RuntimeExceptionClass(JRC.spriteErrorImageNotFound(spriteLibrary, imageIndex));
        }


    }

    render(): void {

    };

    _playAnimation1(fromIndex: number, toIndex: number, repeatType: RepeatTypeEnum, imagesPerSecond: number) {
        let animationArray: number[] = [];
        for(let i = fromIndex; i <= toIndex; i++){
            animationArray.push(i);
        }
        this._playAnimation(animationArray, repeatType, imagesPerSecond);
    }


    _playAnimation(indexArray: number[], repeatType: RepeatTypeEnum, imagesPerSecond: number) {
        this._stopAnimation(false);
        this.animationIndices = indexArray;
        this.repeatTypeOrdinal = repeatType.ordinal;
        this.imagesPerMillisecond = imagesPerSecond / 1000;
        this.animationTime = 0;
        this.animationRuns = true;

        this.world.app.ticker.add(this.tick, this);

    }

    _stopAnimation(setInvisible: boolean) {
        if (this.animationRuns) {
            this.world.app.ticker.remove(this.tick, this);
        }
        this.animationRuns = false;
        if (setInvisible) this._setVisible(false);
    }

    public destroy(): void {
        this._stopAnimation(false);
        super.destroy();
    }

    _pauseAnimation() {
        this.animationPaused = true;
    }

    _resumeAnimation() {
        this.animationPaused = false;
    }

    tick(ticker: PIXI.Ticker) {

        if (this.animationPaused) return;

        let image: number;

        switch (this.repeatTypeOrdinal) {
            case RepeatType.backAndForth:
                let period2 = this.animationIndices.length * 2 / this.imagesPerMillisecond;
                let numberOfPeriodsDone = Math.trunc(this.animationTime / period2);
                let timeIntoPeriod = this.animationTime - numberOfPeriodsDone * period2;
                image = this.imagesPerMillisecond * timeIntoPeriod;
                if (image >= this.animationIndices.length) {
                    image = Math.max(2 * this.animationIndices.length - 0.1 - image, 0);
                }
                image = Math.trunc(image);
                break;
            case RepeatType.loop:
                let period = this.animationIndices.length / this.imagesPerMillisecond;
                let numberOfPeriodsDone1 = Math.trunc(this.animationTime / period);
                let timeIntoPeriod1 = this.animationTime - numberOfPeriodsDone1 * period;
                image = this.imagesPerMillisecond * timeIntoPeriod1;
                image = Math.trunc(image);
                image = Math.trunc(image);
                break;
            case RepeatType.once:
                image = Math.trunc(this.imagesPerMillisecond * this.animationTime);
                if (image >= this.animationIndices.length) {
                    this._stopAnimation(true);
                    this.destroy();
                    return;
                }
                break;
        }

        this.animationTime += ticker.deltaMS;
        // console.log(this.animationTime);
        // console.log(image);

        // this method is called by PIXI.Ticker, not by Thread.run, so we have to catch
        // the exception ourselves...
        try {
            this.setTexture(this.textureName, this.animationIndices[image]);
        } catch (exception: any){
            this.world.interpreter.stop(false);
            this.world.interpreter.printManager.printHtmlElement(ExceptionPrinter.getHtmlWithLinks(exception, [], this.world.interpreter.getMain()));
            this._stopAnimation(false);
        }
    }

    getTileImage(): TileImageClass {

        if (!this.isTileSprite) {
            throw new RuntimeExceptionClass(JRC.spriteSpriteIsNoTiledSpriteError());
        }

        return new TileImageClass(this);
    }

}

export class TileImageClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class TileImage extends Object", comment: JRC.tileClassComment },

        { type: "method", signature: "private TileImage()", native: TileImageClass.prototype._constructor1 },
        { type: "method", signature: "void move(double x, double y)", native: TileImageClass.prototype._move, comment: JRC.tileMoveComment },
        { type: "method", signature: "void scale(double factor)", native: TileImageClass.prototype._scale, comment: JRC.tileScaleComment },
        { type: "method", signature: "void mirrorX()", native: TileImageClass.prototype._mirrorX, comment: JRC.tileMirrorXComment },
        { type: "method", signature: "void mirrorY()", native: TileImageClass.prototype._mirrorY, comment: JRC.tileMirrorYComment },
    ]

    static type: NonPrimitiveType;

    constructor(private sprite: SpriteClass) {
        super();
    }

    _constructor1() {

    }

    _move(dx: number, dy: number) {
        let tileSprite: PIXI.TilingSprite = <PIXI.TilingSprite>this.sprite.container;
        tileSprite.tilePosition.x += dx;
        tileSprite.tilePosition.y += dy;
    }

    _scale(fx: number, fy?: number) {
        fy = fy || fx;
        let tileSprite: PIXI.TilingSprite = <PIXI.TilingSprite>this.sprite.container;
        tileSprite.tileScale.x *= fx;
        tileSprite.tileScale.y *= fy;
    }

    _mirrorX() {
        this._scale(-1, 1);
    }

    _mirrorY() {
        this._scale(1, -1);
    }



}

