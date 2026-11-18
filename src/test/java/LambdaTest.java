/**::
 * Lambda syntax variants: no parameters, one parameter without brackets, typed parameters, expression and block body
 */

Supplier fortyTwo = () -> 42;
assertEquals(42, fortyTwo.get(), "lambda without parameters");

IntOperation doubleIt = x -> x * 2;
assertEquals(14, doubleIt.apply(7), "one parameter without brackets");

IntOperation square = (x) -> x * x;
assertEquals(49, square.apply(7), "one parameter with brackets");

IntBinaryOperation add = (int a, int b) -> a + b;
assertEquals(5, add.apply(2, 3), "typed parameters");

IntBinaryOperation max = (a, b) -> {
   if (a > b) {
      return a;
   }
   return b;
};
assertEquals(9, max.apply(9, 4), "block body with several statements");
assertEquals(8, max.apply(3, 8), "block body with several statements");

interface Supplier {
   int get();
}

interface IntOperation {
   int apply(int x);
}

interface IntBinaryOperation {
   int apply(int a, int b);
}

/**::
 * Lambdas with built-in functional interfaces Function, Predicate, Consumer, BiConsumer, Comparator and Runnable
 */

Function<Integer, Integer> plusOne = n -> n + 1;
assertEquals(6, plusOne.apply(5), "Function<Integer, Integer>");

Function<String, Integer> length = s -> s.length();
assertEquals(5, length.apply("Hello"), "Function<String, Integer>");

Predicate<String> isEmpty = s -> s.length() == 0;
assertTrue(isEmpty.test(""), "Predicate<String>");
assertFalse(isEmpty.test("x"), "Predicate<String>");

ArrayList<String> collected = new ArrayList<>();
Consumer<String> collector = s -> {
   collected.add(s);
};
collector.accept("a");
collector.accept("b");
assertEquals(2, collected.size(), "Consumer<String>");

HashMap<String, Integer> map = new HashMap<>();
BiConsumer<String, Integer> putter = (k, v) -> {
   map.put(k, v);
};
putter.accept("one", 1);
assertEquals(1, map.get("one"), "BiConsumer<String, Integer>");

Comparator<String> byLength = (s1, s2) -> s1.length() - s2.length();
assertTrue(byLength.compare("ab", "abc") < 0, "Comparator<String>");

int[] runCount = {0};
Runnable r = () -> {
   runCount[0]++;
};
r.run();
r.run();
assertEquals(2, runCount[0], "Runnable");

/**::
 * Lambdas capture local variables, parameters and fields of the enclosing object
 */

int base = 10;
IntOperation addBase = x -> x + base;
assertEquals(15, addBase.apply(5), "capture local variable");

Multiplier m = new Multiplier(3);
IntOperation times = m.createOperation(2);
assertEquals(30, times.apply(5), "capture parameter of enclosing method and field of enclosing object");

m.factor = 4;
assertEquals(40, times.apply(5), "lambda reads current value of field of enclosing object");

assertEquals(12, m.applyTwice(x -> x + m.factor), "lambda passed as parameter");

Holder h = new Holder();
Runnable incrementer = () -> {
   h.value++;
};
incrementer.run();
incrementer.run();
assertEquals(2, h.value, "lambda changes field of captured object");

interface IntOperation {
   int apply(int x);
}

class Holder {
   int value = 0;
}

class Multiplier {
   int factor;

   Multiplier(int factor) {
      this.factor = factor;
   }

   IntOperation createOperation(int extra) {
      IntOperation op = x -> x * factor * extra;
      return op;
   }

   int applyTwice(IntOperation op) {
      return op.apply(op.apply(4));
   }
}

/**::
 * Lambda inside a method calls methods of the enclosing object
 */

Greeter g = new Greeter("Hello");
assertEquals("Hello Anna!", g.greeting().apply("Anna"), "lambda calls method of enclosing object");

class Greeter {
   String word;

   Greeter(String word) {
      this.word = word;
   }

   String punctuate(String s) {
      return s + "!";
   }

   Function<String, String> greeting() {
      Function<String, String> f = name -> punctuate(word + " " + name);
      return f;
   }
}

/**::
 * Each lambda created inside a loop captures its own value
 */

ArrayList<Supplier> suppliers = new ArrayList<>();
for (int i = 0; i < 3; i++) {
   int copy = i;
   suppliers.add(() -> copy * 10);
}
assertEquals(0, suppliers.get(0).get(), "first lambda");
assertEquals(10, suppliers.get(1).get(), "second lambda");
assertEquals(20, suppliers.get(2).get(), "third lambda");

interface Supplier {
   int get();
}

/**::
 * Lambdas returned from methods (higher order functions)
 */

IntOperation add5 = makeAdder(5);
IntOperation add7 = makeAdder(7);
assertEquals(15, add5.apply(10), "lambda returned from method");
assertEquals(17, add7.apply(10), "second lambda returned from same method has its own captured value");

IntOperation composed = compose(add5, x -> x * 2);
assertEquals(30, composed.apply(10), "composition of lambdas");

IntOperation makeAdder(int n) {
   IntOperation adder = x -> x + n;
   return adder;
}

IntOperation compose(IntOperation f, IntOperation g) {
   IntOperation composition = x -> g.apply(f.apply(x));
   return composition;
}

interface IntOperation {
   int apply(int x);
}

/**::
 * Lambda expression directly inside return statement
 */

assertEquals(35, new Factory().times7().apply(5), "return lambda without captured variables");
assertEquals(15, new Factory().adder(5).apply(10), "return lambda which captures parameter");
assertEquals(12, timesThree().apply(4), "top level method returns lambda");

IntOperation timesThree() {
   return x -> x * 3;
}

interface IntOperation {
   int apply(int x);
}

class Factory {
   IntOperation times7() {
      return x -> x * 7;
   }

   IntOperation adder(int n) {
      return x -> x + n;
   }
}

/**::
 * Lambda returning lambda
 */

CurriedAdder curriedAdd = a -> b -> a + b;
IntOperation add3 = curriedAdd.add(3);
assertEquals(7, add3.apply(4), "lambda returning lambda");
assertEquals(13, curriedAdd.add(10).apply(3), "lambda returning lambda");

interface IntOperation {
   int apply(int x);
}

interface CurriedAdder {
   IntOperation add(int a);
}

/**::
 * Lambdas stored in fields and collections
 */

Calculator calc = new Calculator();
assertEquals(7, calc.calculate("+", 3, 4), "lambda stored in HashMap");
assertEquals(12, calc.calculate("*", 3, 4), "lambda stored in HashMap");
assertEquals(-1, calc.calculate("-", 3, 4), "lambda stored in HashMap");
assertEquals(9, calc.defaultOperation.apply(4, 5), "lambda in field initializer");

IntOperation[] ops = new IntOperation[2];
ops[0] = x -> x + 1;
ops[1] = x -> x * x;
assertEquals(16, ops[1].apply(ops[0].apply(3)), "lambdas stored in array elements");

interface IntOperation {
   int apply(int x);
}

interface BinaryOperation {
   int apply(int a, int b);
}

class Calculator {
   HashMap<String, BinaryOperation> operations = new HashMap<>();
   BinaryOperation defaultOperation = (a, b) -> a + b;

   Calculator() {
      operations.put("+", (a, b) -> a + b);
      operations.put("-", (a, b) -> a - b);
      operations.put("*", (a, b) -> a * b);
   }

   int calculate(String operator, int a, int b) {
      return operations.get(operator).apply(a, b);
   }
}

/**::
 * Lambdas inside array literal
 */

IntOperation[] ops = {x -> x + 1, x -> x * x, x -> -x};
assertEquals(3, ops.length, "length of array literal with lambdas");
int value = 3;
for (IntOperation op : ops) {
   value = op.apply(value);
}
assertEquals(-16, value, "lambdas stored in array literal");

interface IntOperation {
   int apply(int x);
}

/**::
 * Generic functional interface and functional interface with default method
 */

Transformer<String, Integer> parser = s -> Integer.parseInt(s);
assertEquals(42, parser.transform("42"), "generic functional interface");

Transformer<Integer, String> stars = n -> {
   String s = "";
   for (int i = 0; i < n; i++) s = s + "*";
   return s;
};
assertEquals("***", stars.transform(3), "generic functional interface with block body");

Check positive = n -> n > 0;
assertTrue(positive.check(5), "lambda implements abstract method");
assertTrue(positive.negate(-5), "default method of functional interface calls lambda");

interface Transformer<T, R> {
   R transform(T t);
}

interface Check {
   boolean check(int n);

   default boolean negate(int n) {
      return !check(n);
   }
}

/**::
 * Lambdas with collections: forEach, sort and stream
 */

ArrayList<String> names = new ArrayList<>();
names.add("Charlie");
names.add("Al");
names.add("Bob");

ArrayList<String> upper = new ArrayList<>();
names.forEach(name -> {
   upper.add(name.toUpperCase());
});
assertEquals("CHARLIE", upper.get(0), "forEach with lambda");

names.sort((a, b) -> a.length() - b.length());
assertEquals("Al", names.get(0), "sort with lambda");
assertEquals("Charlie", names.get(2), "sort with lambda");

assertEquals(2, names.stream().filter(n -> n.length() <= 3).count(), "stream filter with lambda");

/**::
 * Lambda with expression body for functional interface with return type void
 */

Counter counter = new Counter();
Runnable increment = () -> counter.increment();
increment.run();
increment.run();
assertEquals(2, counter.value, "expression body calls method with return type void");

ArrayList<String> list = new ArrayList<>();
Consumer<String> adder = s -> list.add(s);
adder.accept("x");
assertEquals(1, list.size(), "expression body calls method with return value which is discarded");

class Counter {
   int value = 0;

   void increment() {
      value++;
   }
}

/**::
 * Error: lambda has wrong number of parameters
 * { "expectedCompilationError": {"id": "lambdaFunctionWrongParameterCount", "line": 5}}
 */
IntOperation op = (a, b) -> a + b;

interface IntOperation {
   int apply(int x);
}

/**::
 * Error: lambda is assigned to variable whose type is no functional interface
 * { "expectedCompilationError": {"id": "lambdaFunctionHereNotPossible", "line": 5}}
 */
String s = x -> x;

/**::
 * Error: type of lambda parameter doesn't fit to functional interface
 * { "expectedCompilationError": {"id": "lambdaFunctionWrongParameterType", "line": 5}}
 */
IntOperation op = (String x) -> 1;

interface IntOperation {
   int apply(int x);
}

/**::
 * Error: lambda returns value of wrong type
 * { "expectedCompilationError": {"id": "wrongReturnValueType", "line": 5}}
 */
IntOperation op = x -> "text";

interface IntOperation {
   int apply(int x);
}

/**::
 * Error: lambda with block body misses return statement
 * { "expectedCompilationError": {"id": "returnStatementMissing"}}
 */
IntOperation op = x -> {
   int y = x * 2;
};

interface IntOperation {
   int apply(int x);
}

/**::
 * print/println as expression body of a lambda whose functional interface method returns void
 * { "expectedOutput": "Hello\n42 ", "expectedWarnings": [] }
 */
Runnable r = () -> println("Hello");
r.run();

IntPrinter p = x -> print(x + " ");
p.printInt(42);

interface IntPrinter {
   void printInt(int x);
}
