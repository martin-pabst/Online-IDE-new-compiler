import { Klass } from '../../../common/interpreter/StepFunction.js';
import { EmptyRange } from '../../../common/range/Range';
import { TokenType } from '../../TokenType';
import { JRC } from '../../language/JavaRuntimeLibraryComments.js';
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { JavaEnum } from '../../types/JavaEnum';
import { JavaField } from '../../types/JavaField';
import { EnumClass } from '../system/javalang/EnumClass';

//@ts-ignore
import { SpriteLibrary } from "./SpriteLibrary.js";

declare var SpriteLibrary: { index: number, name: string }[];

export class SpriteLibraryEnum extends EnumClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "enum SpriteLibrary", comment: JRC.spriteLibraryComment },

    ]

    static type: JavaEnum;

    static values: SpriteLibraryEnum[] = SpriteLibraryEnum.initValues();
    static typeIdToUserSpritesheetsMap: Map<number, Map<string, SpriteLibraryEnum>> = new Map();

    constructor(name: string, index: number, isUserSpritesheet: boolean = false) {
        super(name, index);
    }

    static initValues(): SpriteLibraryEnum[] {
        let i: number = 0;

        return SpriteLibrary.filter(
            (sle) => {
                return sle.index == null || sle.index == 0
            }
        ).map((sle) => {
            return new SpriteLibraryEnum(sle.name, i++);
        })
    }

    private static getUserSpritesheetsForTypeId(typeId: number): Map<string, SpriteLibraryEnum> {
        let map: Map<string, SpriteLibraryEnum> | undefined = this.typeIdToUserSpritesheetsMap.get(typeId);
        if (!map) {
            map = new Map();
            this.typeIdToUserSpritesheetsMap.set(typeId, map);
        }
        return map;
    }

    /**
     * See user-defined-spritesheets.md
     */
    static addEntry(name: string, type: JavaEnum) {
        let userSpritesheets = SpriteLibraryEnum.getUserSpritesheetsForTypeId(type.id);

        let value = new SpriteLibraryEnum(name, SpriteLibraryEnum.values.length + userSpritesheets.size);

        userSpritesheets.set(name, value);

        let field = new JavaField(name, EmptyRange.instance,
            type.module, type, TokenType.keywordPublic
        );
        field._isStatic = true;
        field._isFinal = true;
        field.type = type
        field.classEnum = type;

        type.fields.push(field);

    }

    /**
     * See user-defined-spritesheets.md
     */
    static removeUserSpritesheets(type: JavaEnum) {
        let userSpritesheets = SpriteLibraryEnum.getUserSpritesheetsForTypeId(type.id);

        userSpritesheets.forEach((enumValue, identifier) => {
            type.removeField(identifier);
        })

        this.typeIdToUserSpritesheetsMap.delete(type.id);
    }

    /**
     * See user-defined-spritesheets.md
     */
    static getSpriteLibrary(typeId: number, identifier: string) {
        //@ts-ignore
        let v = SpriteLibraryEnum[identifier];      // built-in spritelibrary?
        if (v) return v;

        // no => search for user-defined one:
        let map = this.getUserSpritesheetsForTypeId(typeId);
        return map.get(identifier) || null;
    }

}

