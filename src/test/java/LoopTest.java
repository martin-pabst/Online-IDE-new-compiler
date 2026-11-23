/**::
 * Test various loops
 */
int n = 0;
for(int i = 1; i <= 100; i++){
    n += i;
}

assertEquals(5050, n, "The sum from 1 to 100 should be 5050.");

int a = 1;
int b = 1;
while(b < 4000){
    int c = a + b;
    a = b;
    b = c;
}

assertEquals(4181, b, "Test of while-loop should yield 4181.");

int x = 1;
do {
    x = x * 2;
} while (x < 1024);

assertEquals(1024, x, "Test do-while-loop");


/**::
 * Test break, continue in for-loop
 */
int i1;
int j1;
for(int i = 0; i < 10; i++){
    i1 = i;
    for(int j = 0; j < 10; j++){
        j1 = j;
        if(j == 2) break;
    }
    if(i == 3) break;
}

assertEquals(2, j1, "Test break in for-loop");
assertEquals(3, i1, "Test break in for-loop");

int n = 0;
for(int i = 0; i < 10; i++){
    if(i < 8) continue;
    for(int j = 0; j < 10; j++){
        if(j > 2) continue;
        n++;
    }
}

assertEquals(6, n, "Test continue in for-loop");

/**::
 * Test break, continue in while-loop
 */
int i1;
int j1;

int i = 0;
while(i < 10){
    i1 = i;
    int j = 0;
    while(j < 10){
        j1 = j;
        if(j == 2) break;
        j++;
    }
    if(i == 3) break;
    i++;
}

assertEquals(2, j1, "Test break in while-loop");
assertEquals(3, i1, "Test break in while-loop");

int n = 0;
i = 0;
while(i < 10){
    i++;
    if(i < 8) continue;
    int j = 0;
    while(j < 10){
        j++;
        if(j > 2) continue;
        n++;
    }
}

assertEquals(6, n, "Test continue in while-loop");


/**::
 * Test break, continue in do...while-loop
 */
int i1;
int j1;

int i = 0;
do{
    i1 = i;

    int j = 0;
    do{
        j1 = j;
        if(j == 2) break;
        j++;
    } while(j < 10);

    if(i == 3) break;
    i++;
} while(i < 10);

assertEquals(2, j1, "Test break in do..while-loop");
assertEquals(3, i1, "Test break in do..while-loop");

int n = 0;
i = 0;
do{
    i++;
    if(i < 8) continue;
    int j = 0;
    do{
        j++;
        if(j > 2) continue;
        n++;
    } while (j < 10);
} while (i < 10);

assertEquals(6, n, "Test continue in do..while-loop");


/**::
 * for-loop with ArrayList as iterator
 * { "expectedOutput": "12\n13\n14\n" }
 */

var list = new ArrayList<Integer>();

list.add(12);
list.add(13);
list.add(14);

for (Iterator<Integer> i = list.iterator(); i.hasNext(); ) {
    println(i.next());
}

/**::
 * forever-loop
 * { "expectedOutput": "1\n2\n3\n4\n" }
 */
int i = 1;
for (;;)
{
   if(i == 5) break;
   println(i);
   i++;
}


/**::
 * Enhanced for loop
 * { "expectedOutput": "1\n2\n3\n4\n12\n13\n14\n" }
 */

int[] array = {1, 2, 3, 4};

for(var n: array){
   println(n);
}

var list = new ArrayList<Integer>();

list.add(12);
list.add(13);
list.add(14);

for(var n: list){
   println(n);
}

/**::
 * Enhanced for loop with java-Iterable using inner class
 * { "expectedOutput": "200\n201\n202\n203\n204\n" }
 */
class A implements Iterable<String> {
   Iterator<String> iterator(){
      return new Iterator<String>() {
         int counter = 200;
         boolean hasNext(){
            return counter < 205;
         }

         String next(){
            return "" + counter++;
         }
      };
   }
}

for(var n: new A()){
   println(n);
}

/**::
 * forEach with inner class as Consumer
 * {"expectedOutput": "first\nsecond\nthird\nDone!\n"}
 */
var list = new ArrayList<String>();

list.add("first");
list.add("second");
list.add("third");

var consumer = new Consumer<String>(){
   void accept(String s){
      println(s);
   }
};


list.forEach(consumer);

println("Done!");

/**::
 * forEach with lambda function as Consumer
 * {"expectedOutput": "first\nsecond\nthird\nDone!\n" }
 */
var list = new ArrayList<String>();

list.add("first");
list.add("second");
list.add("third");


list.forEach(e -> { println(e); });

println("Done!");


/**::
 * Enhanced for loop with java-Iterable using inner class
 * { "expectedOutput": "First\nSecond\n" }
 */
class A implements Iterable<String> {
   Iterator<String> iterator(){
      return new Iterator<String>() {
         int counter = 200;
         boolean hasNext(){
            return counter < 205;
         }

         String next(){
            return "" + counter++;
         }
      };
   }

   void forEach(Consumer<String> consumer){
      consumer.accept("First");
      consumer.accept("Second");
   }
}

new A().forEach((s) -> {println(s);});

/**::
 * Primzahlzwillinge
 */
int max = 10000;
boolean[] isPrime = new boolean[max];
for(int i = 0; i < max; i++) {
   isPrime[i] = true;
}

int i = 2;
while(i < max) {
   // Vielfache von i streichen
   int j = 2 * i;
   while(j < max) {
      isPrime[j] = false;
      j += i;
   }

   i++;
   while(i < max && !isPrime[i]) {
      i++;
   }
}

int k = 0;
for(int i = 0; i < max - 2; i++) {
   if(isPrime[i] && isPrime[i + 2]) {
      k++;
   }
}

assertEquals(207, k, "Suche nach Primzahlzwillingen gescheitert");

/**::
 * Loops which can't complete normally (while(true), for(;;), do...while(true) without break) need no return statement after them
 */
assertEquals(4, firstSquareAbove(10), "while(true) with return inside");
assertEquals(128, firstPowerOfTwoAbove(100), "for(;;) with return inside");
assertEquals(21, firstMultipleOfSeven(15), "do...while(true) with return inside");
assertEquals(42, returnInDoBody(), "body of do...while loop is executed at least once");

int firstSquareAbove(int limit) {
   int i = 1;
   while (true) {
      if (i * i > limit) return i;
      i++;
   }
}

int firstPowerOfTwoAbove(int limit) {
   for (int p = 1; ; p *= 2) {
      if (p > limit) return p;
   }
}

int firstMultipleOfSeven(int start) {
   int i = start;
   do {
      if (i % 7 == 0) return i;
      i++;
   } while (true);
}

int returnInDoBody() {
   do {
      return 42;
   } while (false);
}

/**::
 * Missing return: loops whose body returns may complete normally
 * { "expectedCompilationErrors": [{"id": "returnStatementMissing", "line": 7}, {"id": "returnStatementMissing", "line": 11}, {"id": "returnStatementMissing", "line": 15}, {"id": "returnStatementMissing", "line": 19}, {"id": "returnStatementMissing", "line": 26}, {"id": "returnStatementMissing", "line": 33}]}
 */

class A {
   int whileLoop(boolean c) {
      while (c) { return 1; }
   }

   int enhancedForLoop(int[] values) {
      for (int v : values) { return v; }
   }

   int forLoop(int n) {
      for (int i = 0; i < n; i++) { return i; }
   }

   int doWhileLoopWithBreak(boolean c) {
      do {
         if (c) break;
         return 1;
      } while (c);
   }

   int doWhileLoopWithContinue(boolean c) {
      do {
         if (c) continue;
         return 1;
      } while (c);
   }

   int whileTrueLoopWithBreak(boolean c) {
      while (true) {
         if (c) break;
         return 1;
      }
   }
}

/**::
 * Enhanced for loop: primitive loop variable over collection/Iterable of boxed type (unboxing, widening)
 */
ArrayList<Integer> l = new ArrayList<>();
l.add(1);
l.add(2);
l.add(3);
int sum = 0;
for (int z : l) {
   sum += z;
}
assertEquals(6, sum, "for (int z : ArrayList<Integer>)");

ArrayList<Integer> l2 = new ArrayList<>();
l2.add(2147483647);
l2.add(3);
long big = 0;
for (long z : l2) {
   big += z * 2;
}
assertEquals(4294967300L, big, "for (long z : ArrayList<Integer>): z has to be of type long");

ArrayList<Character> chars = new ArrayList<>();
chars.add('a');
int codes = 0;
for (int ch : chars) {
   codes += ch;
}
assertEquals(97, codes, "for (int ch : ArrayList<Character>)");

int sum2 = 0;
for (int z : new Numbers()) {
   sum2 += z;
}
assertEquals(3, sum2, "for (int z : Iterable<Integer>)");

class Numbers implements Iterable<Integer> {
   public Iterator<Integer> iterator() {
      ArrayList<Integer> list = new ArrayList<>();
      list.add(1);
      list.add(2);
      return list.iterator();
   }
}

/**::
 * Enhanced for loop: unboxing a null element throws NullPointerException
 * { "expectedOutput": "1NPE" }
 */
ArrayList<Integer> l = new ArrayList<>();
l.add(1);
l.add(null);
try {
   for (int z : l) {
      print(z);
   }
} catch (NullPointerException e) {
   print("NPE");
}

/**::
 * Enhanced for loop: loop variable type differs from array/collection element type (widening, boxing)
 */
int[] a = {3};
double half = 0;
for (double x : a) {
   half = x / 2;
}
assertEquals(1.5, half, "for (double x : int[]) must not use integer division");

char[] cs = {'a', 'b'};
int codes = 0;
for (int i : cs) {
   codes += i;
}
assertEquals(195, codes, "for (int i : char[])");

int[] b = {1, 2};
String r = "";
for (Integer i : b) {
   r += i.toString();
}
assertEquals("12", r, "for (Integer i : int[])");

ArrayList<String> l = new ArrayList<>();
l.add("a");
l.add("b");
String r2 = "";
for (Object o : l) {
   r2 += o.toString();
}
assertEquals("ab", r2, "for (Object o : ArrayList<String>)");

/**::
 * Enhanced for loop: String loop variable over collection of Object is an error
 * { "expectedCompilationError": {"id": "wrongCollectionElementType", "line": 7} }
 */
ArrayList<Object> l = new ArrayList<>();
l.add("a");
for (String s : l) {
   print(s);
}

/**::
 * Enhanced for loop: int loop variable over collection of Object is an error
 * { "expectedCompilationError": {"id": "wrongCollectionElementType", "line": 7} }
 */
ArrayList<Object> l = new ArrayList<>();
l.add(1);
for (int i : l) {
   print(i);
}

/**::
 * Enhanced for loop: char loop variable over int array is an error (no narrowing)
 * { "expectedCompilationError": {"id": "wrongArrayElementType", "line": 6} }
 */
int[] a = {1};
for (char c : a) {
   print(c);
}
