import { JRC } from "../../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { EnumClass } from "../../../system/javalang/EnumClass";

import earth2k from "/assets/graphics/textures/celestial/2k_earth_daymap.jpg";
import jupiter2k from "/assets/graphics/textures/celestial/2k_jupiter.jpg";
import mars2k from "/assets/graphics/textures/celestial/2k_mars.jpg";
import mercury2k from "/assets/graphics/textures/celestial/2k_mercury.jpg";
import moon2k from "/assets/graphics/textures/celestial/2k_moon.jpg";
import neptune2k from "/assets/graphics/textures/celestial/2k_neptune.jpg";
import saturn2k from "/assets/graphics/textures/celestial/2k_saturn.jpg";
import stars2k from "/assets/graphics/textures/celestial/2k_stars.jpg";
import stars8k from "/assets/graphics/textures/celestial/8k_stars.jpg";
import stars_milky_way2k from "/assets/graphics/textures/celestial/2k_stars_milky_way.jpg";
import stars_milky_way8k from "/assets/graphics/textures/celestial/8k_stars_milky_way.jpg";
import sun2k from "/assets/graphics/textures/celestial/2k_sun.jpg";
import uranus2k from "/assets/graphics/textures/celestial/2k_uranus.jpg";
import venus_atmosphere2k from "/assets/graphics/textures/celestial/2k_venus_atmosphere.jpg";

export class TextureEnum extends EnumClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "enum Texture", comment: JRC.TexturesEnumComment },

    ]

    static type: NonPrimitiveType;

    static count = 0;

    static values = [
        new TextureEnum("earth2k", this.count++, earth2k),
        new TextureEnum("jupiter2k", this.count++, jupiter2k),
        new TextureEnum("mars2k", this.count++, mars2k),
        new TextureEnum("mercury2k", this.count++, mercury2k),
        new TextureEnum("moon2k", this.count++, moon2k),
        new TextureEnum("neptune2k", this.count++, neptune2k),
        new TextureEnum("saturn2k", this.count++, saturn2k),
        new TextureEnum("stars2k", this.count++, stars2k),
        new TextureEnum("stars8k", this.count++, stars8k),
        new TextureEnum("stars_milky_way2k", this.count++, stars_milky_way2k),
        new TextureEnum("stars_milky_way8k", this.count++, stars_milky_way8k),
        new TextureEnum("sun2k", this.count++, sun2k),
        new TextureEnum("uranus2k", this.count++, uranus2k),
        new TextureEnum("venus_atmosphere2k", this.count++, venus_atmosphere2k),
    ]


    constructor(name: string, ordinal: number, public path: string){
        super(name, ordinal)
    }

}