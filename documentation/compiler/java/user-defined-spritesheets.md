# user-defined spritesheets
## Goal:
Users may upload their own sprites, group them to Spritesheets and use them in their own programs like this:
```java
Sprite s = new Sprite(400, 300, SpriteLibrary.MyUserLibrary, 2);
```

## Problem
In embedded mode there may be several instances of MainEmbedded. Each of them has its own instance of JavaCompiler and therefore its on instance of type-object (that is: objects of child-classes of JavaType) for each library class/enum/interface. This is good.

Unfortunately the library runtime-classes (ObjectClass, StringClass) are shared between each embedded ide instance on a webpage, in particular class SpriteLibraryEnum. In normal Enum runtim-classes there are static fields containing the enum values so that they can be accessed in compiled code like this:
```typescript
__t.classes["EnumIdentifier"].enumValueIdentifier
```
We can't do this for user-defined enum-values of SpriteLibraryEnum as they may be different for each instance of the embedded-ide on a given webpage.

## Solution
  * When switching workspaces we 
    * delete all user-spritesheet-fields of the JavaEnum-instance corresponding to SpriteLibrary (belonging to the old workspace)
    * analyze the user-spritesheets of the new workspace and add fields to the JavaEnum-instance corresponding to JavaSpriteLibrary. That's ok as this JavaEnum-instances is specific for each instance of the embedded ide on a webpage. 
  * Each JavaEnum-instance has a field id: number with a unique value.
  * The one and only SpriteLibraryEnum class has a static field 
```typescript
    static typeIdToUserSpritesheetsMap: Map<number, Map<string, SpriteLibraryEnum>> = new Map();
```
  * It maps the ids of Java-Enum-instances to maps containing the enum-values corresponding to the user-defined spritesheets.
  * When switching workspaces we delete the map-entry for the user-defined spritesheets of the old workspace and add an entry for the user-defined spritesheets of the new one.
  * When accessing values of SpriteLibrary at runtime we don't access the static values of SpriteLibraryEnum at runtime but call static function `__t.classes["SpriteLibrary"].getSpriteLibrary(id, identifierOfEnumValue)`
```typescript
    static getSpriteLibrary(typeId: number, identifier: string) {
        let v = SpriteLibraryEnum[identifier];      // built-in spritelibrary?
        if (v) return v;

        // no => search for user-defined one:
        let map = this.getUserSpritesheetsForTypeId(typeId);
        return map.get(identifier) || null;
    }
```

## Where's all the code?
  * Switching workspaces leads to [SpritesheetData.initializeSpritesheetForWorkspace](../../../src/client/spritemanager/SpritesheetData.ts). There the user-defined spritesheets for the new workspace are analyzed and then the steps described above are taken:
```typescript
        let spriteLibraryEnum = <JavaEnum>main.getCompiler().getType("SpriteLibrary");
        
        /**
         * object klass is the same for each instance of the embedded ide on a given webpage
         */
        let klass = spriteLibraryEnum.runtimeClass;
        klass.removeUserSpritesheets(spriteLibraryEnum);
        spriteIdentifiers.forEach(identifier => klass.addEntry(identifier, spriteLibraryEnum));
```
  * In this code `klass` is the unique class-object for `SpriteLibraryEnum`, so you find the static methods `removeUserSpritesheet`and `addEntry` [there.](../../../src/compiler/java/runtime/graphics/SpriteLibraryEnum.ts)
  * As the compiled code for accessing an enum value of `SpriteLibrary` is different from other enums, there's some compiler-magic in [TermCodeGenerator.compileDereferenceAttributes](../../../src/compiler/java/codegenerator/TermCodeGenerator.ts):
  ```typescript
          if (isEnum && objectType.identifier == 'SpriteLibrary') {
            let enumType = <JavaEnum>(<StaticNonPrimitiveType>objectType).nonPrimitiveType;
            let id = enumType.id;
            let value = enumType.runtimeClass.getSpriteLibrary(id, node.attributeIdentifier);
            if (value) {
                return new StringCodeSnippet(`${Helpers.classes}["SpriteLibrary"].getSpriteLibrary(${id}, "${node.attributeIdentifier}")`, node.range, enumType);
            }
        }
  ```


