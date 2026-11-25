/**::
 * Operands of binary operators are evaluated left to right
 */
String log = "";
int g(int x) { log = log + x; return x; }
String s(String x) { log = log + x; return x; }

int sum = g(1) + g(2);
assertEquals("12", log, "g(1) + g(2)");
assertEquals(3, sum, "value of g(1) + g(2)");

log = "";
int difference = g(5) - g(3);
assertEquals("53", log, "g(5) - g(3)");
assertEquals(2, difference, "value of g(5) - g(3)");

log = "";
boolean lower = g(1) < g(2);
assertEquals("12", log, "g(1) < g(2)");
assertTrue(lower, "value of g(1) < g(2)");

log = "";
boolean equal = g(1) == g(2);
assertEquals("12", log, "g(1) == g(2)");
assertTrue(!equal, "value of g(1) == g(2)");

log = "";
String text = s("a") + s("b") + s("c");
assertEquals("abc", log, "s(a) + s(b) + s(c)");
assertEquals("abc", text, "value of s(a) + s(b) + s(c)");

log = "";
int product = g(2) * (g(3) + g(4));
assertEquals("234", log, "g(2) * (g(3) + g(4))");
assertEquals(14, product, "value of g(2) * (g(3) + g(4))");

/**::
 * Arguments of method calls, constructors and array literals are evaluated left to right
 */
String log = "";
int h(int x) { log = log + x; return x; }
int add3(int a, int b, int c) { return a + b + c; }
int sumAll(int... values) { int s = 0; for (int v : values) s += v; return s; }

class Pair {
    int a; int b;
    Pair(int a, int b) { this.a = a; this.b = b; }
}

assertEquals(6, add3(h(1), h(2), h(3)), "value of add3(h(1), h(2), h(3))");
assertEquals("123", log, "add3(h(1), h(2), h(3))");

log = "";
add3(h(1), add3(h(2), h(3), h(4)), h(5));
assertEquals("12345", log, "nested calls");

log = "";
Pair p = new Pair(h(1), h(2));
assertEquals("12", log, "new Pair(h(1), h(2))");
assertEquals(1, p.a, "p.a");
assertEquals(2, p.b, "p.b");

log = "";
assertEquals(6, sumAll(h(1), h(2), h(3)), "value of sumAll(h(1), h(2), h(3))");
assertEquals("123", log, "sumAll(h(1), h(2), h(3))");

log = "";
int[] values = {h(1), h(2), h(3)};
assertEquals("123", log, "array literal {h(1), h(2), h(3)}");
assertEquals(3, values[2], "values[2]");

/**::
 * Assignment: array, index and object on the left side are evaluated before the right side
 */
String log = "";
int h(int x) { log = log + x; return x; }

class Box {
    int value;
}

Box box = new Box();
Box getBox(int x) { log = log + x; return box; }

int[] a = new int[5];
a[h(1)] = h(2);
assertEquals("12", log, "a[h(1)] = h(2)");
assertEquals(2, a[1], "a[1]");

log = "";
getBox(1).value = h(2);
assertEquals("12", log, "getBox(1).value = h(2)");
assertEquals(2, box.value, "box.value");

/**::
 * A variable is read before a method call to its right changes it
 */
int x = 1;
int incX() { x = 10; return 0; }

int t = x + incX();
assertEquals(1, t, "x + incX()");

x = 2;
int u = x * incX() + x;
assertEquals(10, u, "x * incX() + x");

class Counter {
    int count = 1;
    int reset() { count = 100; return 0; }
    int test() { return count + reset(); }
}

assertEquals(1, new Counter().test(), "count + reset()");

/**::
 * Division and modulo with method calls as both operands
 */
int f(int x) { return x; }
double d(double x) { return x; }

assertEquals(1, f(49) / f(49), "f(49) / f(49)");
assertEquals(2, f(98) / f(49), "f(98) / f(49)");
assertEquals(-3, f(-7) / f(2), "f(-7) / f(2)");
assertEquals(1.0, d(49.0) / d(49.0), "d(49.0) / d(49.0)");
assertEquals(0.5, d(1.0) / d(2.0), "d(1.0) / d(2.0)");
assertEquals(1, f(7) % f(3), "f(7) % f(3)");
assertEquals(2, f(7) - f(5), "f(7) - f(5)");

/**::
 * Non-void methods and constructors called as statements leave nothing on the operand stack
 */
int counter = 0;
int f() { counter++; return counter; }

class Base {
    int v;
    Base(int v) { this.v = v; }
}

class Derived extends Base {
    Derived() { super(5); }
    Derived(int w) { this(); v += w; }
}

for (int i = 0; i < 100; i++) {
    f();
    new Derived(1);
}

assertEquals(100, counter, "f() called 100 times");
assertEquals(6, new Derived(1).v, "constructor chain");

/**::
 * Compound assignment reads the variable before a method call on its right side runs
 */
int x = 1;
int setX() { x = 10; return 0; }

x += setX();
assertEquals(1, x, "x += setX()");

int[] a = {1, 2};
int setA() { a[0] = 10; return 5; }
a[0] *= setA();
assertEquals(5, a[0], "a[0] *= setA()");

String s = "a";
String setS() { s = "x"; return "b"; }
s += setS();
assertEquals("ab", s, "s += setS()");

class Counter {
    int count = 3;
    int reset() { count = 100; return 2; }
    int test() { count -= reset(); return count; }
}
assertEquals(1, new Counter().test(), "count -= reset()");
