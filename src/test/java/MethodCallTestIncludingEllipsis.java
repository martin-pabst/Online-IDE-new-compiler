/**::
 * Test ellipsis
 * { "expectedOutput": "12\nNick\nEmma\n14\n" }
 */

new A().test(12, "Nick", "Emma", "14");

class A {
   void test(int x, String... names){
      println(x);
      for(int i = 0; i < names.length; i++){
         println(names[i]);
      }
   }
}



/**::
 * Static method invocation
 */

A.a = 10;

A a = new A();
a.b = 20;

new A().test();
A.staticTest();

B.test();

new B().test1();

class A {
   static int a = 1;
   static int b = 2;

   static int staticGetA(){
      return a;
   }

   static int staticGetB(){
      return b;
   }

   void test(){
      assertEquals(10, staticGetA(), "Calling static method from non-static method of same class works");
      assertEquals(20, staticGetB(), "Calling static method from non-static method of same class works");
      assertEquals(10, a, "Accessing static fields from non-static method of same class works");
   }

   static void staticTest(){
      assertEquals(10, staticGetA(), "Calling static method from other static method of same class works");
      assertEquals(20, staticGetB(), "Calling static method from other static method of same class works");
      assertEquals(10, a, "Accessing static fields from static method of same class works");
   }

}

class B extends A {
   static void test(){
      assertEquals(10, staticGetA(), "Calling static method from static method of child class works.");
      assertEquals(10, a, "Accessing static field from static method of child class works.");
   }

   void test1(){
      assertEquals(10, staticGetA(), "Accessing static field from non-static method of child class works.");
      assertEquals(10, a, "Accessing static field from static method of child class works.");
   }
}

/**::
 * Calling methods of non-static inner classes
 */

Library library = new Library("City library");
Library.Book faust = library.addBook("Faust", 1808);
assertEquals("Faust (1808)", faust.describe(), "Call method of inner class object from outside");
assertEquals("City library: Faust (1808)", faust.describeWithLibrary(), "Inner class method calls method of outer class");
assertEquals(1, library.getBookCount(), "Outer class method");

library.addBook("Kabale und Liebe", 1784);
assertEquals(2, library.getBookCount(), "Outer class method after second call");
assertEquals("Kabale und Liebe", library.getOldestBook().getTitle(), "Outer class calls method of inner class");
assertEquals(1784, library.getOldestBook().getYear(), "Method chaining over inner class object");

library.rename("Town library");
assertEquals("Town library: Faust (1808)", faust.describeWithLibrary(), "Inner class object sees changed state of outer object");

class Library {
   private String name;
   private ArrayList<Book> books = new ArrayList<>();

   Library(String name) {
      this.name = name;
   }

   String getName() {
      return name;
   }

   void rename(String newName) {
      name = newName;
   }

   Book addBook(String title, int year) {
      Book book = new Book(title, year);
      books.add(book);
      return book;
   }

   int getBookCount() {
      return books.size();
   }

   Book getOldestBook() {
      Book oldest = books.get(0);
      for (Book b : books) {
         if (b.isOlderThan(oldest)) oldest = b;
      }
      return oldest;
   }

   class Book {
      String title;
      int year;

      Book(String title, int year) {
         this.title = title;
         this.year = year;
      }

      String getTitle() {
         return title;
      }

      int getYear() {
         return year;
      }

      boolean isOlderThan(Book other) {
         return year < other.year;
      }

      String describe() {
         return title + " (" + year + ")";
      }

      String describeWithLibrary() {
         return getName() + ": " + describe();
      }
   }
}

/**::
 * Calling methods of static nested classes and anonymous classes
 */

Counter counter = new Counter.Builder().startAt(5).step(2).build();
counter.next();
counter.next();
assertEquals(9, counter.getValue(), "Methods of object built by static nested builder class");
assertEquals(42, Counter.Builder.defaultValue(), "Static method of static nested class");

Counter.Builder builder = new Counter.Builder();
assertEquals(0, builder.build().getValue(), "Instance of static nested class created outside");

Greeter greeter = new Greeter() {
   String prefix() {
      return "Hello ";
   }

   public String greet(String name) {
      return prefix() + name + "!";
   }
};
assertEquals("Hello Anna!", greeter.greet("Anna"), "Anonymous class method calls other method of anonymous class");

interface Greeter {
   String greet(String name);
}

class Counter {
   int value;
   int step;

   Counter(int value, int step) {
      this.value = value;
      this.step = step;
   }

   void next() {
      value += step;
   }

   int getValue() {
      return value;
   }

   static class Builder {
      int start = 0;
      int step = 1;

      static int defaultValue() {
         return 42;
      }

      Builder startAt(int start) {
         this.start = start;
         return this;
      }

      Builder step(int step) {
         this.step = step;
         return this;
      }

      Counter build() {
         return new Counter(start, step);
      }
   }
}

/**::
 * Returning values of different types
 */

Calculator c = new Calculator();
assertEquals(7, c.add(3, 4), "return int");
assertEquals(2.5, c.half(5), "return double");
assertEquals(2.0, c.asDouble(2), "int return value is widened to double");
assertEquals(97, c.code('a'), "char return value is widened to int");
assertEquals("abcabc", c.repeat("abc", 2), "return String");
assertTrue(c.isEven(4), "return boolean");
assertFalse(c.isEven(5), "return boolean");
assertEquals('x', c.firstChar("xyz"), "return char");
assertEquals(5000000000L, c.big(), "return long");

int[] squares = c.squares(4);
assertEquals(4, squares.length, "return array");
assertEquals(9, squares[3], "return array");

Integer boxed = c.boxed(12);
assertEquals(12, boxed, "int value returned from method with return type Integer");
assertTrue(c.nothing() == null, "return null");

assertEquals("negative", c.sign(-5), "early return");
assertEquals("zero", c.sign(0), "early return");
assertEquals("positive", c.sign(5), "return at end of method");

assertEquals(3, c.findIndex(new int[]{4, 8, 15, 16, 23}, 16), "return from inside nested loop");
assertEquals(-1, c.findIndex(new int[]{4, 8}, 16), "return after loop");

assertEquals("big", c.size(1000), "return ternary expression");

c.log(-1);
c.log(3);
assertEquals("3", c.logText, "return statement without value leaves void method early");

assertEquals(5, c.min(c.add(2, 3), c.add(4, 4)), "return value used as parameter");
assertEquals("ABC", c.repeat("abc", 1).toUpperCase(), "method called on return value");

class Calculator {
   String logText = "";

   int add(int a, int b) {
      return a + b;
   }

   int min(int a, int b) {
      return a < b ? a : b;
   }

   double half(int x) {
      return x / 2.0;
   }

   double asDouble(int x) {
      return x;
   }

   int code(char ch) {
      return ch;
   }

   char firstChar(String s) {
      return s.charAt(0);
   }

   long big() {
      return 5000000000L;
   }

   String repeat(String s, int n) {
      String result = "";
      for (int i = 0; i < n; i++) result += s;
      return result;
   }

   boolean isEven(int n) {
      return n % 2 == 0;
   }

   int[] squares(int n) {
      int[] result = new int[n];
      for (int i = 0; i < n; i++) result[i] = i * i;
      return result;
   }

   Integer boxed(int n) {
      return n;
   }

   Object nothing() {
      return null;
   }

   String sign(int n) {
      if (n < 0) return "negative";
      if (n == 0) {
         return "zero";
      }
      return "positive";
   }

   int findIndex(int[] values, int value) {
      for (int i = 0; i < values.length; i++) {
         for (int j = 0; j < 1; j++) {
            if (values[i] == value) return i;
         }
      }
      return -1;
   }

   String size(int n) {
      return n > 100 ? "big" : "small";
   }

   void log(int n) {
      if (n < 0) return;
      logText = logText + n;
   }
}

/**::
 * Recursive methods
 */

assertEquals(120, factorial(5), "recursive top level method");
assertEquals(55, new MathUtil().fibonacci(10), "recursive instance method");
assertEquals(true, MathUtil.isEven(10), "mutually recursive static methods");
assertEquals(false, MathUtil.isEven(7), "mutually recursive static methods");

int factorial(int n) {
   if (n <= 1) return 1;
   return n * factorial(n - 1);
}

class MathUtil {
   int fibonacci(int n) {
      if (n < 2) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
   }

   static boolean isEven(int n) {
      if (n == 0) return true;
      return isOdd(n - 1);
   }

   static boolean isOdd(int n) {
      if (n == 0) return false;
      return isEven(n - 1);
   }
}

/**::
 * Primitive parameters and Strings are passed by value
 */

int number = 5;
increment(number);
assertEquals(5, number, "Changing a primitive parameter inside a method doesn't change the variable of the caller");

int a = 1;
int b = 2;
swap(a, b);
assertEquals(1, a, "swap of primitive parameters doesn't change variables of caller");
assertEquals(2, b, "swap of primitive parameters doesn't change variables of caller");

String text = "Hello";
appendWorld(text);
assertEquals("Hello", text, "Assigning a new value to a String parameter doesn't change the variable of the caller");

Integer boxedNumber = 10;
incrementBoxed(boxedNumber);
assertEquals(10, boxedNumber, "Changing an Integer parameter doesn't change the variable of the caller");

double d = 1.5;
assertEquals(3.0, doubleIt(d), "Return value of method which changed its parameter");
assertEquals(1.5, d, "Changing a double parameter inside a method doesn't change the variable of the caller");

void increment(int n) {
   n++;
   assertEquals(6, n, "Parameter is changed inside method");
}

void swap(int x, int y) {
   int temp = x;
   x = y;
   y = temp;
}

void appendWorld(String s) {
   s += " World";
   assertEquals("Hello World", s, "Parameter is changed inside method");
}

void incrementBoxed(Integer n) {
   n++;
}

double doubleIt(double x) {
   x *= 2;
   return x;
}

/**::
 * Object references are passed by value: the referenced object can be changed, but not the reference of the caller
 */

Point p = new Point(1, 2);
moveRight(p);
assertEquals(2, p.x, "Changes to the fields of an object parameter are visible to the caller");

replace(p);
assertEquals(2, p.x, "Assigning a new object to a parameter doesn't change the variable of the caller");

int[] numbers = {1, 2, 3};
doubleAll(numbers);
assertEquals(2, numbers[0], "Changes to the elements of an array parameter are visible to the caller");
assertEquals(6, numbers[2], "Changes to the elements of an array parameter are visible to the caller");

replaceArray(numbers);
assertEquals(2, numbers[0], "Assigning a new array to a parameter doesn't change the variable of the caller");

swapElements(numbers, 0, 2);
assertEquals(6, numbers[0], "Swapping elements of an array parameter is visible to the caller");
assertEquals(2, numbers[2], "Swapping elements of an array parameter is visible to the caller");

ArrayList<String> list = new ArrayList<>();
addTwice(list, "x");
assertEquals(2, list.size(), "Changes to a list parameter are visible to the caller");

Point q = p;
moveRight(q);
assertEquals(3, p.x, "Two variables referencing the same object");

Point r = new Point(0, 0);
r.copyFrom(p);
assertEquals(3, r.x, "Object passed to method of another object of the same class");
r.x = 10;
assertEquals(3, p.x, "Copy is independent of original object");

void moveRight(Point point) {
   point.x++;
}

void replace(Point point) {
   point = new Point(100, 100);
   assertEquals(100, point.x, "Parameter references new object inside method");
}

void doubleAll(int[] values) {
   for (int i = 0; i < values.length; i++) {
      values[i] *= 2;
   }
}

void replaceArray(int[] values) {
   values = new int[]{-1, -1, -1};
}

void swapElements(int[] values, int i, int j) {
   int temp = values[i];
   values[i] = values[j];
   values[j] = temp;
}

void addTwice(ArrayList<String> l, String s) {
   l.add(s);
   l.add(s);
}

class Point {
   int x;
   int y;

   Point(int x, int y) {
      this.x = x;
      this.y = y;
   }

   void copyFrom(Point other) {
      x = other.x;
      y = other.y;
   }
}

/**::
 * Overloaded methods: the most specific method is called
 */

Printer printer = new Printer();
assertEquals("int", printer.typeOf(5), "int parameter");
assertEquals("double", printer.typeOf(5.0), "double parameter");
assertEquals("String", printer.typeOf("five"), "String parameter");
assertEquals("Object", printer.typeOf(new ArrayList<String>()), "Object parameter");
assertEquals("int, int", printer.typeOf(1, 2), "two parameters");
assertEquals("long", printer.typeOf(5L), "long parameter");
assertEquals("Object", printer.typeOf((Object) "five"), "explicit cast selects overloaded method");

class Printer {
   String typeOf(int x) { return "int"; }
   String typeOf(long x) { return "long"; }
   String typeOf(double x) { return "double"; }
   String typeOf(String x) { return "String"; }
   String typeOf(Object x) { return "Object"; }
   String typeOf(int x, int y) { return "int, int"; }
}