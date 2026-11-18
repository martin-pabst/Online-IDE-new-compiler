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