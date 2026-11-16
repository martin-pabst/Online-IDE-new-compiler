/**::
 * Test explicit and implicit casts
 */

interface A {}

class B implements A { }

class C extends B { }

C c = new C();

B b = c;

C c1 = (C)b;

A a = c;

C c2 = (C)a;

assertCodeReached("Test explicit und implicit casts: Program should reach this statement without errors.");

/**::
 * Test compile error on implicit cast
 * { "expectedCompilationError": {"id": "cantAssignValueToLocalVariable", "line": 12}}
 */
interface A {}

class B implements A { }

class C extends B { }

B b = new B();
C c = b;

/**::
 * Downcast to wrong class throws ClassCastException at runtime
 */

class Animal { }
class Dog extends Animal { }
class Cat extends Animal { }

Animal a = new Dog();
Dog d = (Dog) a;
assertTrue(d == a, "Downcast to correct class");

try {
   Cat c = (Cat) a;
   fail("Downcast to wrong class has to throw ClassCastException");
} catch (ClassCastException e) {
   assertCodeReached("ClassCastException not thrown");
}

Object o = "Hello";
try {
   Integer i = (Integer) o;
   fail("Casting String object to Integer has to throw ClassCastException");
} catch (ClassCastException e) {
   assertCodeReached("ClassCastException not thrown when casting String to Integer");
}

/**::
 * Cast to interface at runtime
 */

interface Speaker {
   String speak();
}

class Machine {
   String name() { return "Machine"; }
}

class TalkingMachine extends Machine implements Speaker {
   public String speak() { return "Beep"; }
}

Machine r = new TalkingMachine();
Speaker s = (Speaker) r;
assertEquals("Beep", s.speak(), "Cast from class to implemented interface");

Machine r2 = new Machine();
try {
   Speaker s2 = (Speaker) r2;
   fail("Casting object to interface it doesn't implement has to throw ClassCastException");
} catch (ClassCastException e) {
   assertCodeReached("ClassCastException not thrown when casting to interface");
}

Object o = s;
TalkingMachine tr = (TalkingMachine) o;
assertEquals("Machine", tr.name(), "Cast from Object to class");

/**::
 * Casting null is allowed
 */

Object o = null;
String s = (String) o;
assertTrue(s == null, "Cast of null to String");

class A { }
A a = (A) o;
assertTrue(a == null, "Cast of null to user defined class");

/**::
 * Cast doesn't change object: overridden methods are still called dynamically
 */

class Base {
   String name() { return "Base"; }
}

class Sub extends Base {
   String name() { return "Sub"; }

   String only() { return "only in Sub"; }
}

Sub sub = new Sub();
assertEquals("Sub", ((Base) sub).name(), "Upcast and call of overridden method");

Base base = sub;
assertEquals("only in Sub", ((Sub) base).only(), "Downcast and call of subclass method");

/**::
 * Cast together with instanceof and pattern matching
 */

class Fruit { }
class Apple extends Fruit {
   String color = "red";
}
class Banana extends Fruit {
   int length = 20;
}

Fruit[] fruits = {new Apple(), new Banana(), new Apple()};
String result = "";
for (Fruit f : fruits) {
   if (f instanceof Apple) {
      result += ((Apple) f).color + " ";
   } else if (f instanceof Banana b) {
      result += b.length + " ";
   }
}
assertEquals("red 20 red ", result, "instanceof with cast and with pattern variable");

/**::
 * Cast of boxed types and Object values
 */

Object o = 42;
int i = (Integer) o;
assertEquals(42, i, "Object -> Integer -> int");

ArrayList<Object> list = new ArrayList<>();
list.add("text");
list.add(7);
String s = (String) list.get(0);
assertEquals(4, s.length(), "Element of ArrayList<Object> cast to String");
int seven = (Integer) list.get(1);
assertEquals(7, seven, "Element of ArrayList<Object> cast to Integer");

Object listObject = new ArrayList<String>();
ArrayList<String> strings = (ArrayList<String>) listObject;
strings.add("a");
assertEquals(1, strings.size(), "Cast of Object to ArrayList<String>");

/**::
 * Explicit casts of primitive types
 */

assertEquals(3, (int) 3.7, "double -> int truncates");
assertEquals(-3, (int) (-3.7), "negative double -> int truncates towards zero");
assertEquals(3L, (long) 3.99, "double -> long truncates");
assertEquals(2.5, (double) 5 / 2, "cast binds stronger than division");
assertEquals(2.0, (double) (5 / 2), "integer division in brackets is done before cast");
assertEquals(97, (int) 'a', "char -> int");
assertEquals('b', (char) ('a' + 1), "int -> char");
assertEquals(-56, (byte) 200, "int -> byte overflow");
assertEquals(4464, (short) 70000, "int -> short overflow");
assertEquals(2147483647, (int) 1e10, "double too big for int -> Integer.MAX_VALUE");
assertEquals(1, (int) 1.99f, "float -> int");
assertEquals(-1294967296, (int) 3000000000L, "long -> int overflow");

/**::
 * Explicit casts of primitive variables (values not known at compile time)
 */

double d1 = 3.7;
double d2 = -3.7;
int i200 = 200;
int iMinus200 = -200;
int i70000 = 70000;
double d70000 = 70000.5;
long l3e9 = 3000000000L;
double big = 1e10;

assertEquals(3, (int) d1, "double -> int truncates");
assertEquals(-3, (int) d2, "negative double -> int truncates towards zero");
assertEquals(-56, (byte) i200, "int -> byte overflow");
assertEquals(56, (byte) iMinus200, "negative int -> byte overflow");
assertEquals(4464, (short) i70000, "int -> short overflow");
assertEquals(4464, (short) d70000, "double -> short overflow");
assertEquals(-1294967296, (int) l3e9, "long -> int overflow");
assertEquals(2147483647, (int) big, "double too big for int -> Integer.MAX_VALUE");

/**::
 * Cast of primitive type followed by unary minus
 */

assertEquals(-3, (int) -3.7, "(int) -3.7");
double x = 2.5;
assertEquals(-2, (int) -x, "(int) -x");
assertEquals(-5L, (long) -5, "(long) -5");

/**::
 * Constant int values which fit into the range of byte, short and char can be assigned without cast
 */

byte b = 10;
short s = -300;
char c = 65;
assertEquals(10, b, "byte b = 10");
assertEquals(-300, s, "short s = -300");
assertEquals('A', c, "char c = 65");

b = 20;
assertEquals(20, b, "assignment b = 20");

byte[] bytes = {1, -2, 127};
assertEquals(-2, bytes[1], "byte array literal with int constants");

/**::
 * Error: constant int value out of range of byte can't be assigned without cast
 * { "expectedCompilationError": {"id": "cantAssignValueToLocalVariable", "line": 5}}
 */
byte b = 200;

/**::
 * Implicit widening of primitive types
 */

byte b = (byte) 10;
short sh = b;
int i = sh;
long l = i;
float f = l;
double d = f;
assertEquals(10.0, d, "byte -> short -> int -> long -> float -> double");

char c = 'A';
int ci = c;
assertEquals(65, ci, "char -> int");

double sum = 1 + 0.5;
assertEquals(1.5, sum, "int + double gives double");

long big = 2147483647;
big = big + 1;
assertEquals(2147483648L, big, "int value assigned to long doesn't overflow");

/**::
 * Error: implicit narrowing of primitive types
 * { "expectedCompilationErrors": [{"id": "cantAssignValueToLocalVariable", "line": 7}, {"id": "cantAssignValueToLocalVariable", "line": 9}]}
 */

double d = 3.5;
int i = d;
long l = 5;
int j = l;

/**::
 * Error: cast of String to int
 * { "expectedCompilationErrors": [{"id": "cantCastType", "line": 7}, {"id": "cantAssignValueToLocalVariable", "line": 7}]}
 */

String s = "5";
int i = (int) s;

