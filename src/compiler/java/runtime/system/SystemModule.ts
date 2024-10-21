import { CodeFragment } from "../../../common/disassembler/CodeFragment.ts";
import { Program } from "../../../common/interpreter/Program";
import { Klass } from "../../../common/interpreter/StepFunction.ts";
import { JavaLibraryModule, LibraryKlassType } from "../../module/libraries/JavaLibraryModule";
import { Box3dClass } from "../graphics/3d/Box3dClass.ts";
import { Light3dClass } from "../graphics/3d/lights/Light3dClass.ts";
import { PointLight3dClass } from "../graphics/3d/lights/PointLight3dClass.ts";
import { BasicMaterial3dClass } from "../graphics/3d/materials/BasicMaterial3dClass.ts";
import { LambertMaterial3dClass } from "../graphics/3d/materials/LambertMaterial3dClass.ts";
import { Material3dClass } from "../graphics/3d/materials/Material3dClass.ts";
import { PhongMaterial3dClass } from "../graphics/3d/materials/PhongMaterial3dClass.ts";
import { PhysicallyBasedMaterial3dClass } from "../graphics/3d/materials/PhysicallyBasedMaterial3d.ts";
import { Mesh3dClass } from "../graphics/3d/Mesh3dClass.ts";
import { Object3dClass } from "../graphics/3d/Object3dClass.ts";
import { Sphere3dClass } from "../graphics/3d/Sphere3dClass.ts";
import { Vector3Class } from "../graphics/3d/Vector3Class.ts";
import { World3dClass } from "../graphics/3d/World3dClass.ts";
import { ActorClass } from "../graphics/ActorClass.ts";
import { AlignmentEnum } from "../graphics/AlignmentEnum.ts";
import { ArcClass } from "../graphics/ArcClass.ts";
import { BitmapClass } from "../graphics/BitmapClass.ts";
import { CircleClass } from "../graphics/CircleClass.ts";
import { CollisionPairClass } from "../graphics/CollisionPairClass.ts";
import { ColorClass } from "../graphics/ColorClass.ts";
import { DirectionEnum } from "../graphics/DirectionEnum.ts";
import { EllipseClass } from "../graphics/EllipseClass.ts";
import { FilledShapeClass } from "../graphics/FilledShapeClass.ts";
import { GroupClass } from "../graphics/GroupClass.ts";
import { ButtonClass } from "../graphics/gui/ButtonClass.ts";
import { ChangeListenerInterface } from "../graphics/gui/ChangeListenerInterface.ts";
import { CheckboxClass } from "../graphics/gui/CheckboxClass.ts";
import { GuiComponentClass } from "../graphics/gui/GuiComponentClass.ts";
import { GuiTextComponentClass } from "../graphics/gui/GuiTextComponentClass.ts";
import { RadiobuttonClass } from "../graphics/gui/RadiobuttonClass.ts";
import { TextFieldClass } from "../graphics/gui/TextfieldClass.ts";
import { JavaHamsterClass, JavaHamsterWorldClass } from "../graphics/JavaHamsterClass.ts";
import { JavaKaraClass, JavaKaraWorldClass } from "../graphics/JavaKaraClass.ts";
import { LineClass } from "../graphics/LineClass.ts";
import { MouseListenerInterface } from "../graphics/MouseListenerInterface.ts";
import { PolygonClass } from "../graphics/PolygonClass.ts";
import { PositionClass } from "../graphics/PositionClass.ts";
import { PAppletClass } from "../graphics/processing/PAppletClass.ts";
import { RectangleClass } from "../graphics/RectangleClass.ts";
import { RepeatTypeEnum } from "../graphics/RepeatTypeEnum.ts";
import { RobotClass } from "../graphics/robot/RobotClass.ts";
import { RobotWorldClass } from "../graphics/robot/RobotWorldClass.ts";
import { RoundedRectangleClass } from "../graphics/RoundedRectangleClass.ts";
import { ScaleModeEnum } from "../graphics/ScaleModeEnum.ts";
import { SectorClass } from "../graphics/SectorClass.ts";
import { ShapeClass } from "../graphics/ShapeClass.ts";
import { SpriteClass, TileImageClass } from "../graphics/SpriteClass.ts";
import { SpriteLibraryEnum } from "../graphics/SpriteLibraryEnum.ts";
import { TextClass } from "../graphics/TextClass.ts";
import { TriangleClass } from "../graphics/TriangleClass.ts";
import { TurtleClass } from "../graphics/TurtleClass.ts";
import { WorldClass } from "../graphics/WorldClass.ts";
import { HttpClientClass } from "../network/HttpClientClass.ts";
import { HttpHeaderClass } from "../network/HttpHeaderClass.ts";
import { HttpRequestClass } from "../network/HttpRequestClass.ts";
import { HttpResponseClass } from "../network/HttpResponseClass.ts";
import { JsonElementClass } from "../network/JsonElementClass.ts";
import { JsonParserClass } from "../network/JsonParserClass.ts";
import { URLEncoder as URLEncoderClass } from "../network/URLEncoderClass.ts";
import { WebSocketClass } from "../network/WebSocketClass.ts";
import { WebSocketClientClass } from "../network/WebSocketClientClass.ts";
import { AssertionsClass } from "../unittests/AssertionsClass.ts";
import { ConsoleClass } from "./additional/ConsoleClass.ts";
import { FilesClass } from "./additional/FilesClass.ts";
import { GamepadClass } from "./additional/GamepadClass.ts";
import { InputClass } from "./additional/InputClass.ts";
import { JavaScriptClass } from "./additional/JavaScriptClass.ts";
import { KeyClass } from "./additional/KeyClass.ts";
import { KeyListenerInterface } from "./additional/KeyListenerInterface.ts";
import { MathToolsClass } from "./additional/MathToolsClass.ts";
import { SoundClass } from "./additional/SoundClass.ts";
import { SystemToolsClass } from "./additional/SystemToolsClass.ts";
import { TimerClass } from "./additional/TimerClass.ts";
import { Vector2Class } from "./additional/Vector2Class.ts";
import { ArrayListClass } from "./collections/ArrayListClass.ts";
import { CollectionInterface } from "./collections/CollectionInterface.ts";
import { CollectionsClass } from "./collections/CollectionsClass.ts";
import { ComparableInterface } from "./collections/ComparableInterface.ts";
import { ComparatorInterface } from "./collections/ComparatorInterface.ts";
import { DequeInterface } from "./collections/DequeueInterface.ts";
import { EmptyStackExceptionClass } from "./collections/EmptyStackException.ts";
import { HashMapClass } from "./collections/HashMapClass.ts";
import { HashSetClass } from "./collections/HashSetClass.ts";
import { IterableInterface } from "./collections/IterableInterface.ts";
import { IteratorInterface } from "./collections/IteratorInterface.ts";
import { LinkedListClass } from "./collections/LinkedListClass.ts";
import { ListInterface } from "./collections/ListInterface.ts";
import { MapInterface } from "./collections/MapInterface.ts";
import { QueueInterface } from "./collections/QueueInterface.ts";
import { SetInterface } from "./collections/SetInterface.ts";
import { StackClass } from "./collections/StackClass.ts";
import { VectorClass } from "./collections/VectorClass.ts";
import { DayOfWeekEnum } from "./DayOfWeekEnum.ts";
import { BiConsumerInterface } from "./functional/BiConsumerInterface.ts";
import { ConsumerInterface } from "./functional/ConsumerInterface.ts";
import { FunctionInterface } from "./functional/FunctionInterface.ts";
import { ArithmeticExceptionClass } from "./javalang/ArithmeticExceptionClass.ts";
import { BigIntegerClass } from "./javalang/BigIntegerClass.ts";
import { ClassCastExceptionClass } from "./javalang/ClassCastExceptionClass.ts";
import { DecimalFormatClass } from "./javalang/DecimalFormatClass.ts";
import { EnumClass } from "./javalang/EnumClass.ts";
import { ExceptionClass } from "./javalang/ExceptionClass.ts";
import { IllegalMonitorStateExceptionClass } from "./javalang/IllegalMonitorSateExceptionClass.ts";
import { IndexOutOfBoundsExceptionClass } from "./javalang/IndexOutOfBoundsExceptionClass.ts";
import { LocalDateTimeClass } from "./javalang/LocalDateTimeClass.ts";
import { MathClass } from "./javalang/MathClass.ts";
import { MethodOfDestroyedGOExceptionClass } from "./javalang/MethodOfDestroyedGOExceptionClass.ts";
import { NullPointerExceptionClass } from "./javalang/NullPointerExceptionClass.ts";
import { ObjectClass, StringClass } from "./javalang/ObjectClassStringClass";
import { OptionalClass } from "./javalang/OptionalClass.ts";
import { PrimitiveStringClass } from "./javalang/PrimitiveStringClass.ts";
import { RandomClass } from "./javalang/RandomClass.ts";
import { RunnableInterface } from "./javalang/RunnableInterface.ts";
import { RuntimeExceptionClass } from "./javalang/RuntimeException.ts";
import { SemaphoreClass } from "./javalang/SemaphoreClass.ts";
import { PrintStreamClass, SystemClass } from "./javalang/SystemClass.ts";
import { ThreadClass, ThreadStateClass as ThreadStateEnum } from "./javalang/ThreadClass.ts";
import { ThrowableClass } from "./javalang/ThrowableClass.ts";
import { BooleanPrimitiveType } from "./primitiveTypes/BooleanPrimitiveType";
import { BytePrimitiveType } from "./primitiveTypes/BytePrimitiveType";
import { CharPrimitiveType } from "./primitiveTypes/CharPrimitiveType";
import { DoublePrimitiveType } from "./primitiveTypes/DoublePrimitiveType";
import { FloatPrimitiveType } from "./primitiveTypes/FloatPrimitiveType";
import { IntPrimitiveType } from "./primitiveTypes/IntPrimitiveType";
import { LongPrimitiveType } from "./primitiveTypes/LongPrimitiveType";
import { NullType } from "./primitiveTypes/NullType.ts";
import { ShortPrimitiveType } from "./primitiveTypes/ShortPrimitiveType.ts";
import { StringPrimitiveType } from "./primitiveTypes/StringPrimitiveType.ts";
import { VoidPrimitiveType } from "./primitiveTypes/VoidPrimitiveType";
import { BooleanClass } from "./primitiveTypes/wrappers/BooleanClass.ts";
import { CharacterClass } from "./primitiveTypes/wrappers/CharacterClass.ts";
import { DoubleClass } from "./primitiveTypes/wrappers/DoubleClass.ts";
import { FloatClass } from "./primitiveTypes/wrappers/FloatClass.ts";
import { IntegerClass } from "./primitiveTypes/wrappers/IntegerClass";
import { LongClass } from "./primitiveTypes/wrappers/LongClass.ts";
import { NumberClass } from "./primitiveTypes/wrappers/NumberClass";
import { ShortClass } from "./primitiveTypes/wrappers/ShortClass.ts";

export class SystemModule extends JavaLibraryModule {

    public primitiveStringClass: Klass & LibraryKlassType = PrimitiveStringClass;

    constructor() {
        super();
        this.types.push(
            new BooleanPrimitiveType(this),
            new CharPrimitiveType(this),
            new BytePrimitiveType(this),
            new ShortPrimitiveType(this),
            new IntPrimitiveType(this),
            new LongPrimitiveType(this),
            new FloatPrimitiveType(this),
            new DoublePrimitiveType(this),
            new StringPrimitiveType(this),
            new VoidPrimitiveType(this),
            new NullType(this)
        )

        ColorClass._initPredefinedColors();

        this.classes.push(
            ComparableInterface, ComparatorInterface,

            ObjectClass, StringClass, EnumClass,                  // These two MUST come first!

            //additional system classes
            KeyClass, LocalDateTimeClass, DayOfWeekEnum, PositionClass, BigIntegerClass,
            ConsoleClass, Vector2Class, MathToolsClass, PrintStreamClass, SystemClass,
            GamepadClass, KeyListenerInterface, SystemToolsClass, InputClass, SoundClass, FilesClass,

            // Functional
            ConsumerInterface, BiConsumerInterface, FunctionInterface,

            NumberClass, IntegerClass, LongClass, FloatClass, DoubleClass, ShortClass, BooleanClass, CharacterClass,  // boxed primitive types

            OptionalClass,

            MathClass, RandomClass, DecimalFormatClass,
            ThrowableClass, ExceptionClass, RuntimeExceptionClass, ArithmeticExceptionClass, NullPointerExceptionClass,
            ClassCastExceptionClass, IndexOutOfBoundsExceptionClass, IllegalMonitorStateExceptionClass,
            EmptyStackExceptionClass,

            // Collections
            IteratorInterface, IterableInterface, CollectionInterface, ListInterface, ArrayListClass,

            CollectionsClass,
            QueueInterface, DequeInterface, LinkedListClass,
            SetInterface, MapInterface, HashMapClass, HashSetClass,
            VectorClass, StackClass,

            // Thread
            RunnableInterface, ThreadClass, ThreadStateEnum, SemaphoreClass,

            // Timer
            TimerClass,

            // Assertions
            AssertionsClass,

            // HttpClient
            HttpHeaderClass,
            HttpRequestClass,
            HttpResponseClass,
            HttpClientClass,
            JsonElementClass,
            JsonParserClass,
            URLEncoderClass,


            // Graphics
            ColorClass, DirectionEnum, AlignmentEnum,
            MouseListenerInterface,
            WorldClass, ActorClass, ShapeClass, FilledShapeClass, RectangleClass, 
            CollisionPairClass, GroupClass,
            ScaleModeEnum, RepeatTypeEnum, SpriteLibraryEnum, TileImageClass, SpriteClass, // Sprite
            CircleClass, EllipseClass, ArcClass, SectorClass,
            PolygonClass, TriangleClass, LineClass, BitmapClass, TextClass, RoundedRectangleClass,
            TurtleClass, 
            MethodOfDestroyedGOExceptionClass,

            // Graphics 3D
            Vector3Class, Material3dClass, BasicMaterial3dClass, LambertMaterial3dClass, PhongMaterial3dClass, PhysicallyBasedMaterial3dClass,
            World3dClass, Object3dClass, Mesh3dClass, Box3dClass, Sphere3dClass, Light3dClass, PointLight3dClass,

            // Processing
            PAppletClass,

            // Java Kara
            JavaKaraWorldClass, JavaKaraClass,

            // Java Hamster
            JavaHamsterWorldClass, JavaHamsterClass,

            // Gui components
            ChangeListenerInterface, GuiComponentClass, GuiTextComponentClass, ButtonClass, CheckboxClass,
            RadiobuttonClass, TextFieldClass,

            // Database

            // WebSocket
            WebSocketClass, WebSocketClientClass,

            // Robot
            RobotClass, RobotWorldClass,

            // JavaScript
            JavaScriptClass
        );


    }

    getMainProgram(): Program | undefined {
        return undefined;
    }

    isReplModule(): boolean {
        return false;
    }

    getCodeFragments(): CodeFragment[] {
        return [];
    }
}