/**::
 * Test methods outside class definition
 * { "expectedOutput": "Success!\n" }
 */
test();

void test(){
   test1("Success!");
}


void test1(String s){
   println(s);
}

/**::
 * Methods outside classes read and write variables of the main program
 */

int counter = 0;
String log = "";

increment();
increment();
assertEquals(2, counter, "method outside class changes variable of main program");

addToLog("a");
addToLog("b");
assertEquals("a,b,", log, "method outside class changes String variable of main program");

counter = 10;
assertEquals(10, getCounter(), "method outside class reads current value of variable");

void increment() {
   counter++;
}

void addToLog(String s) {
   log = log + s + ",";
}

int getCounter() {
   return counter;
}

/**::
 * Variable of main program without initialization has default value
 */

int number;
boolean flag;
String text;

assertEquals(0, number, "default value of int variable");
assertFalse(flag, "default value of boolean variable");
assertTrue(text == null, "default value of String variable");

setNumber();
assertEquals(5, number, "method sets variable of main program");

void setNumber() {
   number = 5;
}

/**::
 * Methods outside classes: parameters, return values, recursion, overloading and calls between each other
 */

assertEquals(10, sum(new int[]{1, 2, 3, 4}), "array parameter and return value");
assertEquals(6, max(3, 6), "two parameters");
assertEquals(7.5, max(7.5, 2.0), "overloaded method with double parameters");
assertEquals("cc", max("a", "cc"), "overloaded method with String parameters");
assertEquals(8, power(2, 3), "recursive method");
assertEquals(14, sumOfSquares(1, 2, 3), "method calls other methods");
assertEquals("[1, 2, 3]", toText(range(1, 3)), "method returns array");

int sum(int[] values) {
   int s = 0;
   for (int v : values) s += v;
   return s;
}

int max(int a, int b) {
   return a > b ? a : b;
}

double max(double a, double b) {
   return a > b ? a : b;
}

String max(String a, String b) {
   return a.length() > b.length() ? a : b;
}

int power(int base, int exponent) {
   if (exponent == 0) return 1;
   return base * power(base, exponent - 1);
}

int square(int x) {
   return x * x;
}

int sumOfSquares(int a, int b, int c) {
   return square(a) + square(b) + square(c);
}

int[] range(int from, int to) {
   int[] result = new int[to - from + 1];
   for (int i = 0; i < result.length; i++) result[i] = from + i;
   return result;
}

String toText(int[] values) {
   String s = "[";
   for (int i = 0; i < values.length; i++) {
      if (i > 0) s = s + ", ";
      s = s + values[i];
   }
   return s + "]";
}

/**::
 * Variable of main program is initialized with return value of method outside class
 */

int start = computeStart();
assertEquals(42, start, "initialization with method call");

int doubled = twice(start);
assertEquals(84, doubled, "initialization with method call which gets variable as parameter");

int computeStart() {
   return 6 * 7;
}

int twice(int x) {
   return 2 * x;
}

/**::
 * Variables inside blocks of the main program are local: same identifier can be used in different blocks
 */

int total = 0;
for (int i = 0; i < 3; i++) {
   int square = i * i;
   total += square;
}
for (int i = 0; i < 3; i++) {
   int square = i;
   total += square;
}
if (total > 0) {
   String message = "positive";
   assertEquals("positive", message, "local variable inside if block");
} else {
   String message = "not positive";
   fail("else branch must not be reached");
}
assertEquals(8, total, "local variables inside loops");

/**::
 * Several variables in one declaration, var declarations and arrays in main program
 */

int a = 1, b = 2, c;
c = a + b;
assertEquals(3, c, "several variables in one declaration");

var list = new ArrayList<String>();
list.add("x");
assertEquals(1, list.size(), "var declaration");

var pi = 3.14;
assertEquals(3.14, pi, "var with double value");

int[] values = {3, 1, 2};
fillWithZero(values);
assertEquals(0, values[1], "array variable of main program passed to method");

int[][] matrix = new int[2][3];
matrix[1][2] = 5;
assertEquals(5, matrix[1][2], "two-dimensional array in main program");

void fillWithZero(int[] v) {
   for (int i = 0; i < v.length; i++) v[i] = 0;
}

/**::
 * Statements of main program before and after class declarations are executed in order
 * { "expectedOutput": "1\n2\n3\n" }
 */

int step = 1;
println(step);

class Helper {
   static int next(int x) {
      return x + 1;
   }
}

step = Helper.next(step);
println(step);

void printNext() {
   println(Helper.next(step));
}

printNext();

/**::
 * Methods outside classes use classes and create objects
 */

Item apple = createItem("apple", 3);
Item pear = createItem("pear", 5);
assertEquals(8, totalAmount(apple, pear), "objects as parameters of methods outside classes");
assertEquals("apple", apple.name, "object created in method outside class");

Item createItem(String name, int amount) {
   return new Item(name, amount);
}

int totalAmount(Item i1, Item i2) {
   return i1.amount + i2.amount;
}

class Item {
   String name;
   int amount;

   Item(String name, int amount) {
      this.name = name;
      this.amount = amount;
   }
}

/**::
 * Methods outside classes with modifiers public and private
 */

assertEquals(1, one(), "public method");
assertEquals(2, two(), "private method");

public int one() {
   return 1;
}

private int two() {
   return 2;
}

/**::
 * Variable with nested generic type in main program
 */

ArrayList<ArrayList<String>> table = new ArrayList<>();
table.add(new ArrayList<String>());
table.get(0).add("cell");
assertEquals("cell", table.get(0).get(0), "ArrayList<ArrayList<String>>");

HashMap<String, ArrayList<Integer>> map = new HashMap<>();
map.put("a", new ArrayList<Integer>());
map.get("a").add(5);
assertEquals(5, map.get("a").get(0), "HashMap<String, ArrayList<Integer>>");

HashMap<String, ArrayList<ArrayList<String>>> deep = new HashMap<>();
deep.put("k", new ArrayList<ArrayList<String>>());
deep.get("k").add(new ArrayList<String>());
deep.get("k").get(0).add("deep");
assertEquals("deep", deep.get("k").get(0).get(0), "three closing brackets >>>");

ArrayList<ArrayList<String>> createTable() {
   ArrayList<ArrayList<String>> t = new ArrayList<>();
   return t;
}
assertEquals(0, createTable().size(), "method with nested generic return type");

int shifted = 64 >> 2;
assertEquals(16, shifted, "shift operator still works");
assertEquals(3, -8 >>> 30, "unsigned shift operator still works");

/**::
 * Error: method outside class misses return statement
 * { "expectedCompilationError": {"id": "returnStatementMissing", "line": 8}}
 */

int x = f(3);

int f(int a) {
   if (a > 0) return 1;
}

/**::
 * Error: call of method outside class with wrong parameters
 * { "expectedCompilationError": {"id": "cantFindMethod", "line": 5}}
 */
int x = g("text");

int g(int a) {
   return a;
}
