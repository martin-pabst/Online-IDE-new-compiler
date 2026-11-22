/**::
 * Class without constructor: default constructor, default values and initial values of fields
 */

Defaults d = new Defaults();
assertEquals(0, d.i, "default value of int field");
assertEquals(0.0, d.dbl, "default value of double field");
assertFalse(d.b, "default value of boolean field");
assertTrue(d.s == null, "default value of String field");
assertTrue(d.o == null, "default value of object field");
assertEquals(0, d.c, "default value of char field");
assertEquals(42, d.initialized, "field with initial value");
assertEquals("Hello", d.greeting, "String field with initial value");
assertEquals(84, d.computed, "initial value which depends on other field");

class Defaults {
   int i;
   double dbl;
   boolean b;
   String s;
   Object o;
   char c;
   int initialized = 42;
   String greeting = "Hello";
   int computed = initialized * 2;
}

/**::
 * Constructors with and without arguments, overloaded constructors
 */

Rect r1 = new Rect();
assertEquals(1, r1.width, "constructor without arguments");
assertEquals(1, r1.height, "constructor without arguments");

Rect r2 = new Rect(5);
assertEquals(5, r2.width, "constructor with one argument");
assertEquals(5, r2.height, "constructor with one argument");

Rect r3 = new Rect(3, 4);
assertEquals(3, r3.width, "constructor with two arguments");
assertEquals(4, r3.height, "constructor with two arguments");
assertEquals(12, r3.area(), "method uses fields set in constructor");

Rect r4 = new Rect(r3);
assertEquals(3, r4.width, "copy constructor");
r4.width = 10;
assertEquals(3, r3.width, "copy is independent of original");

assertEquals(4, Rect.count, "constructors increment static counter");

class Rect {
   static int count = 0;
   int width;
   int height;

   Rect() {
      this(1, 1);
   }

   Rect(int side) {
      this(side, side);
   }

   Rect(int width, int height) {
      this.width = width;
      this.height = height;
      count++;
   }

   Rect(Rect other) {
      this(other.width, other.height);
   }

   int area() {
      return width * height;
   }
}

/**::
 * Order of initialization: field initializers and instance initializer blocks run before the constructor body
 * { "expectedOutput": "field initializer\ninitializer block\nconstructor: 2\n" }
 */

Order o = new Order();

class Order {
   int value = log("field initializer", 1);

   {
      println("initializer block");
      value++;
   }

   Order() {
      println("constructor: " + value);
   }

   int log(String message, int v) {
      println(message);
      return v;
   }
}

/**::
 * Static initializer block and static fields shared by all objects
 */

assertEquals(100, IdGenerator.start, "static initializer block");
IdGenerator g1 = new IdGenerator();
IdGenerator g2 = new IdGenerator();
assertEquals(100, g1.id, "first id");
assertEquals(101, g2.id, "second id");
assertEquals(102, IdGenerator.next, "static field shared by all objects");

class IdGenerator {
   static int start;
   static int next;
   int id;

   static {
      start = 100;
      next = start;
   }

   IdGenerator() {
      id = next;
      next++;
   }
}

/**::
 * this: parameters shadow fields, this as parameter and as return value
 */

Node n1 = new Node("first");
Node n2 = new Node("second");
n1.append(n2);
assertTrue(n1.next == n2, "this.next = next");
assertTrue(n2.previous == n1, "this passed as argument to other object");
assertEquals("second", n1.next.name, "field access over reference");
assertTrue(n1.self() == n1, "return this");
assertEquals("first", n1.setName("first").name, "this.name = name");
assertEquals("renamed", n1.setName("renamed").name, "method returns this");

class Node {
   String name;
   Node next;
   Node previous;

   Node(String name) {
      this.name = name;
   }

   void append(Node next) {
      this.next = next;
      next.setPrevious(this);
   }

   void setPrevious(Node previous) {
      this.previous = previous;
   }

   Node self() {
      return this;
   }

   Node setName(String name) {
      this.name = name;
      return this;
   }
}

/**::
 * Subclass constructor implicitly calls parameterless constructor of base class
 * { "expectedOutput": "Animal()\nMammal()\nDog()\n" }
 */

Dog dog = new Dog();

class Animal {
   Animal() {
      println("Animal()");
   }
}

class Mammal extends Animal {
   Mammal() {
      println("Mammal()");
   }
}

class Dog extends Mammal {
   Dog() {
      println("Dog()");
   }
}

/**::
 * Subclass without constructor calls parameterless constructor of base class
 * { "expectedOutput": "Base()\n" }
 */

Derived d = new Derived();
assertEquals(7, d.value, "field initialized in base class constructor");
assertEquals(8, d.other, "field of subclass");

class Base {
   int value;

   Base() {
      value = 7;
      println("Base()");
   }
}

class Derived extends Base {
   int other = 8;
}

/**::
 * super(...) calls constructor of base class with arguments
 */

Employee e = new Employee("Ada", 36, 5000);
assertEquals("Ada", e.name, "field set by base class constructor");
assertEquals(36, e.age, "field set by base class constructor");
assertEquals(5000, e.salary, "field set by subclass constructor");
assertEquals("Ada (36), salary: 5000", e.toString(), "overridden toString calls super.toString()");
assertEquals("Ada (36), salary: 5000", "" + e, "overridden toString used in string concatenation");

class Person {
   String name;
   int age;

   Person(String name, int age) {
      this.name = name;
      this.age = age;
   }

   public String toString() {
      return name + " (" + age + ")";
   }
}

class Employee extends Person {
   int salary;

   Employee(String name, int age, int salary) {
      super(name, age);
      this.salary = salary;
   }

   public String toString() {
      return super.toString() + ", salary: " + salary;
   }
}

/**::
 * Subclasses inherit fields and methods, overridden methods are called dynamically
 */

Figure2[] shapes = {new Disc(1), new Square(2), new Square(3)};
double sum = 0;
for (Figure2 shape : shapes) {
   sum += shape.area();
}
assertEquals(Math.PI + 4 + 9, sum, "overridden method called via base class reference");

Figure2 s = new Square(2);
assertEquals("Square with area 4", s.describe(), "base class method calls overridden method");
assertEquals("Square", s.name, "inherited field set by base class constructor");
assertEquals(2, ((Square) s).side, "field of subclass");
assertEquals("Figure2", new Figure2("Figure2").describe().substring(0, 7), "base class method on base class object");

class Figure2 {
   String name;

   Figure2(String name) {
      this.name = name;
   }

   double area() {
      return 0;
   }

   String describe() {
      return name + " with area " + (int) area();
   }
}

class Disc extends Figure2 {
   double radius;

   Disc(double radius) {
      super("Disc");
      this.radius = radius;
   }

   double area() {
      return Math.PI * radius * radius;
   }
}

class Square extends Figure2 {
   int side;

   Square(int side) {
      super("Square");
      this.side = side;
   }

   double area() {
      return side * side;
   }
}

/**::
 * Method of base class calls overridden method of subclass (template method), super.method() calls base class version
 */

Beverage tea = new Tea();
assertEquals("boil water, steep tea, add lemon", tea.prepare(), "template method calls overridden methods");
Beverage coffee = new Coffee();
assertEquals("boil water, brew coffee, add milk and sugar", coffee.prepare(), "super.addCondiments() inside overriding method");

abstract class Beverage {
   String prepare() {
      return "boil water, " + brew() + ", " + addCondiments();
   }

   abstract String brew();

   String addCondiments() {
      return "add milk";
   }
}

class Tea extends Beverage {
   String brew() {
      return "steep tea";
   }

   String addCondiments() {
      return "add lemon";
   }
}

class Coffee extends Beverage {
   String brew() {
      return "brew coffee";
   }

   String addCondiments() {
      return super.addCondiments() + " and sugar";
   }
}

/**::
 * Protected fields and methods are accessible in subclasses
 */

Car car = new Car();
car.drive(50);
car.drive(30);
assertEquals(80, car.getKilometers(), "subclass uses protected field of base class");
assertEquals("Car: 80 km", car.report(), "subclass calls protected method of base class");

class Vehicle {
   protected int kilometers = 0;

   protected String format() {
      return kilometers + " km";
   }

   int getKilometers() {
      return kilometers;
   }
}

class Car extends Vehicle {
   void drive(int km) {
      kilometers += km;
   }

   String report() {
      return "Car: " + format();
   }
}

/**::
 * Interfaces with default methods, class implementing several interfaces
 */

Duck duck = new Duck();
assertEquals("Duck flies", duck.fly(), "method of first interface");
assertEquals("Duck swims", duck.swim(), "method of second interface");
assertEquals("Duck flies and lands", duck.flyAndLand(), "default method calls implemented method");

Flyer f = duck;
assertEquals("Duck flies", f.fly(), "method called via interface reference");

interface Flyer {
   String fly();

   default String flyAndLand() {
      return fly() + " and lands";
   }
}

interface Swimmer {
   String swim();
}

class Duck implements Flyer, Swimmer {
   public String fly() {
      return "Duck flies";
   }

   public String swim() {
      return "Duck swims";
   }
}

/**::
 * Overridden equals method
 */

Money m1 = new Money(5, "EUR");
Money m2 = new Money(5, "EUR");
Money m3 = new Money(5, "USD");
assertTrue(m1.equals(m2), "equals with same values");
assertFalse(m1.equals(m3), "equals with different values");
assertFalse(m1 == m2, "== compares references");
assertFalse(m1.equals("5 EUR"), "equals with object of other class");

class Money {
   int amount;
   String currency;

   Money(int amount, String currency) {
      this.amount = amount;
      this.currency = currency;
   }

   public boolean equals(Object o) {
      if (!(o instanceof Money)) return false;
      Money other = (Money) o;
      return amount == other.amount && currency.equals(other.currency);
   }
}

/**::
 * Overridden method called from base class constructor sees subclass fields with default values
 * { "expectedOutput": "Sub.init: 0\nSub(): 5\n" }
 */

new Sub();

class Super {
   Super() {
      init();
   }

   void init() {
      println("Super.init");
   }
}

class Sub extends Super {
   int x = 5;

   Sub() {
      println("Sub(): " + x);
   }

   void init() {
      println("Sub.init: " + x);
   }
}

/**::
 * Error: constructor with wrong parameters
 * { "expectedCompilationError": {"id": "cantFindConstructor", "line": 5}}
 */
Box b = new Box("wrong");

class Box {
   Box(int size) { }
}

/**::
 * Error: no parameterless constructor exists if another constructor is declared
 * { "expectedCompilationError": {"id": "cantFindConstructor", "line": 5}}
 */
Box b = new Box();

class Box {
   Box(int size) { }
}

/**::
 * Error: subclass constructor has to call super(...) if base class has no parameterless constructor
 * { "expectedCompilationError": {"id": "superCallInConstructorMissing"}}
 */

class Base {
   Base(int x) { }
}

class Derived extends Base {
   Derived() {
      int y = 1;
   }
}

/**::
 * Error: super(...) has to be first statement in constructor
 * { "expectedCompilationErrors": [{"id": "superCallInsideConstructorAfterFirstStatement", "line": 13}, {"id": "superCallInConstructorMissing", "line": 11}]}
 */

class Base {
   Base(int x) { }
}

class Derived extends Base {
   Derived() {
      int y = 1;
      super(y);
   }
}

/**::
 * Error: this(...) has to be first statement in constructor
 * { "expectedCompilationError": {"id": "thisCallInsideConstructorAfterFirstStatement", "line": 11}}
 */

class A {
   A(int x) { }

   A() {
      int y = 1;
      this(y);
   }
}

/**::
 * Error: objects of abstract classes can't be instantiated
 * { "expectedCompilationError": {"id": "cantInstantiateFromAbstractClass", "line": 5}}
 */
Figure f = new Figure();

abstract class Figure {
   abstract double area();
}

/**::
 * Error: subclass has to implement abstract methods of base class
 * { "expectedCompilationError": {"id": "abstractMethodsNotImplemented"}}
 */

abstract class Figure {
   abstract double area();
}

class Hexagon extends Figure {
}

/**::
 * Abstract class doesn't have to implement the methods of its interface; they can be called on it
 * { "expectedOutput": "MySquare: 9\n" }
 */
MySquare s = new MySquare(3);
Figure f = s;
Measurable m = s;
assertEquals(9, f.area(), "Call of interface method via abstract class");
assertEquals(9, m.area(), "Call of interface method via interface");
println(f.describe());

// subclass declared before its abstract base class
class MySquare extends Figure {
   int a;
   MySquare(int a) { this.a = a; }
   public int area() { return a * a; }
   public String name() { return "MySquare"; }
}

interface Measurable {
   int area();
   String name();
}

abstract class Figure implements Measurable {
   // calls interface methods which this abstract class doesn't implement
   public String describe() { return name() + ": " + area(); }
}

/**::
 * Error: concrete subclass has to implement the interface methods its abstract base classes don't implement
 * { "expectedCompilationError": {"id": "abstractMethodsNotImplemented", "line": 15}}
 */
interface Measurable {
   int area();
}

abstract class Figure implements Measurable {
}

abstract class Shape2D extends Figure {
}

class Hexagon extends Shape2D {
}

/**::
 * Abstract class implementing generic interfaces without implementing their methods
 */
ArrayList<Item> items = new ArrayList<>();
items.add(new Item(3));
items.add(new Item(1));
items.add(new Item(2));
Collections.sort(items);
assertEquals(1, items.get(0).value, "Collections.sort calls compareTo implemented in subclass");
assertEquals(3, items.get(2).value, "Collections.sort calls compareTo implemented in subclass");
assertTrue(items.get(0).isSmallerThan(items.get(1)), "Abstract class calls compareTo of Comparable<Base>");

Item item = new Item(7);
assertEquals("77", item.twice(), "Abstract class calls method of generic user interface");
Converter<String> converter = item;
assertEquals("7", converter.convert(), "Call via generic interface");

class Item extends Base {
   Item(int value) { this.value = value; }
   public int compareTo(Base other) { return value - other.value; }
   public String convert() { return "" + value; }
}

interface Converter<T> {
   T convert();
}

abstract class Base implements Comparable<Base>, Converter<String> {
   int value;
   boolean isSmallerThan(Base other) { return compareTo(other) < 0; }
   String twice() { return convert() + convert(); }
}

/**::
 * Generic abstract class implementing a generic interface without implementing its method
 */
NamedBox box = new NamedBox();
assertEquals("box!", box.shout(), "Generic abstract class calls interface method");
Supplier2<String> supplier = box;
assertEquals("box", supplier.supply(), "Call via generic interface");

class NamedBox extends Box<String> {
   public String supply() { return "box"; }
   String shout() { return first() + "!"; }
}

interface Supplier2<T> {
   T supply();
}

abstract class Box<T> implements Supplier2<T> {
   T first() { return supply(); }
}

/**::
 * Error: class has to implement the methods of the super-interfaces of its interfaces
 * { "expectedCompilationError": {"id": "interfaceMethodsNotImplemented", "line": 11}}
 */
interface HasName {
   String name();
}

interface HasNameAndAge extends HasName { }

class Pupil implements HasNameAndAge { }

/**::
 * Methods and default methods of super-interfaces
 */
Pupil p = new Pupil();
HasNameAndAge hnaa = p;
HasName hn = p;
assertEquals("Max", hn.name(), "Call via super-interface");
assertEquals("Max", hnaa.name(), "Call of super-interface method via sub-interface");
assertEquals(15, hnaa.age(), "Call of sub-interface method");
assertEquals("Hello Max", p.greet(), "Default method of super-interface via class");
assertEquals("Hello Max", hnaa.greet(), "Default method of super-interface via sub-interface");
Describable d = p;
assertEquals("Max (15)", d.describe(), "Default method of sub-interface implements method of super-interface");

class Pupil implements HasNameAndAge {
   public String name() { return "Max"; }
   public int age() { return 15; }
}

interface Describable {
   String describe();
}

interface HasName extends Describable {
   String name();
   default String greet() { return "Hello " + name(); }
}

interface HasNameAndAge extends HasName {
   int age();
   default String describe() { return name() + " (" + age() + ")"; }
}

/**::
 * Interface inherited via two sub-interfaces (diamond)
 */
Machine m = new Machine();
assertEquals("Device on", m.info(), "Default method of common super-interface");
Movable mo = m;
Switchable sw = m;
assertEquals("on", mo.state(), "Call via first sub-interface");
assertEquals("Device on", sw.info(), "Default method via second sub-interface");

class Machine implements Movable, Switchable {
   public String state() { return "on"; }
}

interface Device {
   String state();
   default String info() { return "Device " + state(); }
}

interface Movable extends Device { }

interface Switchable extends Device { }

/**::
 * Generic super-interface
 */
TextBox t = new TextBox();
Container<String> c = t;
TextContainer tc = t;
assertEquals("text", c.get(), "Call via generic super-interface");
assertEquals("text", tc.get(), "Call via sub-interface");
assertEquals("text!", tc.loud(), "Default method of generic super-interface");

class TextBox implements TextContainer {
   public String get() { return "text"; }
}

interface Container<T> {
   T get();
   default String loud() { return get() + "!"; }
}

interface TextContainer extends Container<String> { }

/**::
 * Default methods of generic interface, also with type parameter in signature and with lambda
 */
TextBox t = new TextBox();
assertEquals("text!", t.loud(), "Default method via class");
assertEquals("text", t.self(), "Default method with type parameter as return type via class");
assertEquals("Y", t.echo("Y"), "Default method with type parameter as parameter type via class");
Container<String> c = t;
assertEquals("text!", c.loud(), "Default method via interface");
assertEquals("text", c.self(), "Default method with type parameter as return type via interface");
assertEquals("X", c.echo("X"), "Default method with type parameter as parameter type via interface");

Container<Integer> lambda = () -> 42;
assertEquals("42!", lambda.loud(), "Default method of lambda object");
assertEquals(42, lambda.self(), "Default method with type parameter of lambda object");

class TextBox implements Container<String> {
   public String get() { return "text"; }
}

interface Container<T> {
   T get();
   default String loud() { return get() + "!"; }
   default T self() { return get(); }
   default T echo(T value) { return value; }
}

/**::
 * Error: interface with generic super-interface can't cast to variant with other type argument
 * { "expectedCompilationError": {"id": "cantAssignValueToLocalVariable", "line": 7}}
 */
TextContainer tc = new TextBox();
Container<String> c1 = tc;
Container<Integer> c2 = tc;

class TextBox implements TextContainer {
   public String get() { return "text"; }
}

interface Container<T> {
   T get();
}

interface TextContainer extends Container<String> { }

/**::
 * Abstract class implementing a sub-interface calls a method of the super-interface
 */
assertEquals(1, new Impl().g(), "Abstract class calls method of super-interface");

class Impl extends AbstractBase {
   public int f() { return 1; }
}

interface Fi {
   int f();
}

interface Gi extends Fi { }

abstract class AbstractBase implements Gi {
   int g() { return f(); }
}

/**::
 * Error: concrete subclass of abstract class has to implement methods of super-interface
 * { "expectedCompilationError": {"id": "abstractMethodsNotImplemented", "line": 13}}
 */
interface Fi {
   int f();
}

interface Gi extends Fi { }

abstract class AbstractBase implements Gi { }

class Impl extends AbstractBase { }

/**::
 * Error: final classes can't be subclassed (nested classes)
 * { "expectedCompilationError": {"id": "cantExtendFinalClass"}}
 */

class Outer {
   final class Constant {
   }

   class Variable extends Constant {
   }
}
/**::
 * Explicit super(...) call: field initializers and initializer blocks of subclass run after the base class constructor
 * { "expectedOutput": "Base(3)\nshow: 0 null\nfield initializer\ninitializer block\nDerived(): 7 text\n" }
 */

new Derived();

class Base {
   Base(int x) {
      println("Base(" + x + ")");
      show();
   }

   void show() { }
}

class Derived extends Base {
   int value = compute();
   String name = "text";

   {
      println("initializer block");
   }

   Derived() {
      super(3);
      println("Derived(): " + value + " " + name);
   }

   int compute() {
      println("field initializer");
      return 7;
   }

   void show() {
      println("show: " + value + " " + name);
   }
}

/**::
 * Field initializer of inner class uses field of outer object
 */

Outer outer = new Outer();
assertEquals(15, outer.createInner().value, "field initializer of inner class reads field of outer object");

class Outer {
   int base = 10;

   Inner createInner() {
      return new Inner(5);
   }

   class Inner {
      int value = base;

      Inner(int add) {
         value += add;
      }
   }
}

/**::
 * Error: top level class with identifier of a class of the API (here: class Robot of package robot)
 * { "expectedCompilationError": {"id": "typenameUsedInLibrary", "line": 5}}
 */
class Robot {
}

/**::
 * Method with covariant return type implements abstract method of base class (issue #125)
 * { "expectedWarnings": [] }
 */
CovBase b = new CovSub();
assertEquals("CovSub", b.create().name(), "call via base class reference");

CovSub s = new CovSub();
CovSub created = s.create();
assertEquals("CovSub", created.name(), "call via subclass reference yields subclass type");

abstract class CovBase {
   abstract CovBase create();

   String name() {
      return "CovBase";
   }
}

class CovSub extends CovBase {
   @Override
   CovSub create() {
      return new CovSub();
   }

   String name() {
      return "CovSub";
   }
}

/**::
 * Methods with covariant return types are called dynamically, also over several levels and via super
 */
Level1 o1 = new Level1();
assertEquals("Level1", o1.copy().name(), "base class object");
Level1 o2 = new Level2();
assertEquals("Level2", o2.copy().name(), "Level2 object via Level1 reference");
Level1 o3 = new Level3();
assertEquals("Level3", o3.copy().name(), "Level3 object via Level1 reference");
Level2 o4 = new Level3();
Level2 copy4 = o4.copy();
assertEquals("Level3", copy4.name(), "Level3 object via Level2 reference");
Level3 o5 = new Level3();
Level3 copy5 = o5.copy();
assertEquals("Level3", copy5.name(), "Level3 object via Level3 reference");
assertEquals("Level2", o5.copyOfSuper().name(), "super.copy()");
Level1 o6 = new Level4();
assertEquals("Level3", o6.copy().name(), "subclass without overriding method inherits it");

class Level1 {
   Level1 copy() {
      return new Level1();
   }

   String name() {
      return "Level1";
   }
}

class Level2 extends Level1 {
   Level2 copy() {
      return new Level2();
   }

   String name() {
      return "Level2";
   }
}

class Level3 extends Level2 {
   Level3 copy() {
      return new Level3();
   }

   Level2 copyOfSuper() {
      return super.copy();
   }

   String name() {
      return "Level3";
   }
}

class Level4 extends Level3 {
}

/**::
 * Method with covariant return type overrides method of base class and implements interface method with other return type
 */
CovI i1 = new CovC("");
assertEquals("CovC.get", ((CovA) i1.get()).label, "CovC object via interface reference");
CovA a1 = new CovC("");
assertEquals("CovC.get", a1.get().label, "CovC object via base class reference");
CovI i2 = new CovD("");
assertEquals("CovD.get", ((CovA) i2.get()).label, "CovD object via interface reference");
CovA a2 = new CovD("");
assertEquals("CovD.get", a2.get().label, "CovD object via base class reference");
CovC c2 = new CovD("");
assertEquals("CovD.get", c2.get().label, "CovD object via CovC reference");

interface CovI {
   Object get();
}

class CovA {
   String label;

   CovA(String label) {
      this.label = label;
   }

   CovA get() {
      return new CovA("CovA.get");
   }
}

class CovC extends CovA implements CovI {
   CovC(String label) {
      super(label);
   }

   CovC get() {
      return new CovC("CovC.get");
   }
}

class CovD extends CovC {
   CovD(String label) {
      super(label);
   }

   CovD get() {
      return new CovD("CovD.get");
   }
}

/**::
 * Covariant return types: interface method inherited by abstract class, generic base class, arrays
 */
Copyable c1 = new Letter();
assertEquals("Letter", ((Letter) c1.copy()).kind(), "via interface reference");
Doc d1 = new Letter();
assertEquals("Letter", ((Letter) d1.copy()).kind(), "via abstract class reference");

Holder<String> h = new StringHolder("x");
assertEquals("S:x", (String) h.get(), "generic base class");

ArrA arr = new ArrB();
assertEquals(2, arr.items().length, "array return type");
assertEquals("b", ((ArrItem) arr.items()[1]).name, "array return type");

interface Copyable {
   Object copy();
}

abstract class Doc implements Copyable {
}

class Letter extends Doc {
   Letter copy() {
      return new Letter();
   }

   String kind() {
      return "Letter";
   }
}

class Holder<T> {
   T value;

   Holder(T value) {
      this.value = value;
   }

   Object get() {
      return value;
   }
}

class StringHolder extends Holder<String> {
   StringHolder(String value) {
      super(value);
   }

   String get() {
      return "S:" + value;
   }
}

class ArrA {
   Object[] items() {
      return new Object[0];
   }
}

class ArrB extends ArrA {
   ArrItem[] items() {
      return new ArrItem[]{new ArrItem("a"), new ArrItem("b")};
   }
}

class ArrItem {
   String name;

   ArrItem(String name) {
      this.name = name;
   }
}

/**::
 * Method with same signature as library method with return type string (Thread.getName) doesn't cause errors
 */
MyNamedThread t = new MyNamedThread();
assertEquals("mine", t.getName(), "own method");

class MyNamedThread extends Thread {
   String getName() {
      return "mine";
   }
}

/**::
 * Error: overriding method with incompatible return type
 * { "expectedCompilationErrors": [{"id": "overridingMethodHasIncompatibleReturnType", "line": 12}, {"id": "overridingMethodHasIncompatibleReturnType", "line": 13}, {"id": "overridingMethodHasIncompatibleReturnType", "line": 14}, {"id": "overridingMethodHasIncompatibleReturnType", "line": 22}]}
 */
class RetA {
   int value() { return 1; }
   RetA self() { return this; }
   String text() { return ""; }
}

class RetB extends RetA {
   double value() { return 2; }
   String self() { return ""; }
   void text() { }
}

class RetC extends RetA {
   RetC self() { return this; }
}

class RetD extends RetC {
   RetA self() { return this; }
}