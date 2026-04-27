# Compiling and storing the main-classes
## Parsing:
  * In `Parser.initializeAST` a class-node is built for each main class. Parent is the model's root ast node:
```typescript
        this.javaCompiledModule.mainClass = this.nodeFactory.buildClassNode(this.nodeFactory.buildNodeWithModifiers(EmptyRange.instance),
        { tt: TokenType.identifier, value: "$MainClass" + (Parser.mainClassCounter++), range: EmptyRange.instance }, this.javaCompiledModule.ast!, [], this.javaCompiledModule);

        this.javaCompiledModule.mainClass.range = globalRange;
        this.javaCompiledModule.mainClass.isMainClass = true;
```
  * This class gets a main method:
```typescript
        let mainMethod = this.nodeFactory.buildMethodNode(undefined, false, this.nodeFactory.buildNodeWithModifiers(EmptyRange.instance),
            { tt: TokenType.identifier, value: "main", range: EmptyRange.instance }, globalRange, [], this.javaCompiledModule.mainClass);
```
  * Alongside all other methods in global scope it is pushed to `this.javaCompiledModule.mainClass.methods`.
  * All methods in global scope are static methods.

## Resolving types:
  * `TypeResolver` builds `JavaClass` instance for main class and stores a reference to it in `classNode.resolvedType`
  * It then builds a `JavaMethod`-object for each global method and stores it in `methodNode.method`.
  * class types are stored in `TypeResolver.moduleManager.typeStore`.

## Compiling:


## JavaCompiler:
  * In `JavaCompiler.compileIfDirty()` the classObjectRegistry is populated with Main classes in it. They get keys like "$MainClass12".
```typescript
        this.moduleManager.typestore.populateClassObjectRegistry(klassObjectRegistry);
```




