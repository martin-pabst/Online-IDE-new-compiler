/**::
 * Instantiate generic object
 */

ArrayList<String> list = new ArrayList<String>();
List<String> list1 = new ArrayList<>();

List<String> list2 = list;

list.add("First");
list.add("Second");

assertEquals("Second", list.get(1), "Error instantiating ArrayList<String>");
assertEquals("Second", list2.get(1), "Error assigning ArrayList<String> to List<String>");

/**::
 * Diamond operator: type arguments are inferred from local variable type (lambda parameters get inferred type)
 */

PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> b - a);
pq.add(3);
pq.add(17);
pq.add(5);
assertEquals(17, pq.poll(), "Diamond: local variable of same class");

Queue<String> queue = new PriorityQueue<>((s1, s2) -> s1.length() - s2.length());
queue.add("ccc");
queue.add("a");
queue.add("bb");
assertEquals("a", queue.poll(), "Diamond: local variable of implemented interface");

// a % 10 only compiles if a has inferred type Integer
Collection<? super Integer> coll = new PriorityQueue<>((a, b) -> a % 10 - b % 10);
coll.add(29);
coll.add(31);
assertEquals("[31, 29]", coll.toString(), "Diamond: local variable with wildcard type argument");

PriorityQueue<Integer> fromList = new PriorityQueue<>(new ArrayList<>());
fromList.add(2);
assertEquals(1, fromList.size(), "Diamond: nested diamond operator as constructor parameter");

Object o = new ArrayList<>();
assertTrue(o != null, "Diamond: target type without type arguments");

Box<String> box = new Box<>(s -> s.toUpperCase() + "!");
assertEquals("HELLO!", box.apply("hello"), "Diamond: user defined generic class");

class Box<T> {
   Function<T, String> function;

   Box(Function<T, String> function) {
      this.function = function;
   }

   String apply(T value) {
      return function.apply(value);
   }
}

/**::
 * Diamond operator: type arguments are inferred in field initialization, assignment and return statement
 */

Scheduler scheduler = new Scheduler();
scheduler.jobs.add(new Job("write", 2));
scheduler.jobs.add(new Job("test", 1));
assertEquals("test", scheduler.jobs.poll().name, "Diamond: field initialization");

PriorityQueue<String> pq;
pq = new PriorityQueue<>((s1, s2) -> s2.compareTo(s1));
pq.add("Anna");
pq.add("Zoe");
assertEquals("Zoe", pq.poll(), "Diamond: assignment");

PriorityQueue<String> byLength = Scheduler.createQueueByLength();
byLength.add("ccc");
byLength.add("a");
assertEquals("a", byLength.poll(), "Diamond: return statement");

class Job {
   String name;
   int priority;

   Job(String name, int priority) {
      this.name = name;
      this.priority = priority;
   }
}

class Scheduler {
   PriorityQueue<Job> jobs = new PriorityQueue<>((j1, j2) -> j1.priority - j2.priority);

   static PriorityQueue<String> createQueueByLength() {
      return new PriorityQueue<>((s1, s2) -> s1.length() - s2.length());
   }
}

/**::
 * Wildcard with lower bound: primitive values can be passed to parameters of type ? super X
 */

Collection<? super Integer> coll = new ArrayList<Integer>();
coll.add(5);
coll.add(7);
assertEquals(2, coll.size(), "Collection<? super Integer>.add(int)");
assertTrue(coll.contains(7), "Collection<? super Integer>.contains(int)");

Comparator<? super Integer> comparator = (a, b) -> a - b;
assertTrue(comparator.compare(3, 5) < 0, "Comparator<? super Integer>.compare(int, int)");

/**::
 * Wildcard with upper bound: adding a value is not allowed (like in java)
 * { "expectedCompilationError": {"id": "cantCastType", "line": 7}}
 */
ArrayList<Integer> integers = new ArrayList<>();
Collection<? extends Number> numbers = integers;
numbers.add(5);



/**::
 * Wildcard with lower bound which is an interface, an enum or a generic type parameter
 */
List<Object> objects = new ArrayList<>();
List<? super LowerBoundShape> shapes = objects;
shapes.add(new LowerBoundCircle());
assertEquals(1, objects.size(), "List<? super LowerBoundShape>");

List<Number> numbers = new ArrayList<>();
List<? super Integer> integers = numbers;
integers.add(4);
Collection<? super Integer> integerCollection = integers;
assertEquals(1, integerCollection.size(), "List<Number> -> List<? super Integer>");

List<? super LowerBoundColor> colors = new ArrayList<LowerBoundColor>();
colors.add(LowerBoundColor.RED);
assertEquals(1, colors.size(), "List<? super LowerBoundColor>");

LowerBoundBox<String> box = new LowerBoundBox<>();
List<Object> target = new ArrayList<>();
box.value = "abc";
box.copyTo(target);
assertEquals(1, target.size(), "copyTo(List<? super T>)");

enum LowerBoundColor { RED, GREEN }

interface LowerBoundShape { }

class LowerBoundCircle implements LowerBoundShape { }

class LowerBoundBox<T> {
   T value;

   void copyTo(List<? super T> list) {
      list.add(value);
   }
}

/**::
 * Wildcard with lower bound: type argument has to be a supertype of the lower bound
 * { "expectedCompilationErrors": [{"id": "cantAssignValueToLocalVariable", "line": 7}, {"id": "cantAssignValueToLocalVariable", "line": 10}]}
 */
List<Integer> integerList = new ArrayList<>();
List<String> stringList = new ArrayList<>();
List<? super Number> numbers = integerList;
List<? super Integer> integers = integerList;
List<? extends Number> extendsNumber = integerList;
List<? super Integer> integers2 = stringList;

/**::
 * Static fields, static methods and static initializers can't use generic type parameter of their class
 * { "expectedCompilationErrors": [{"id": "typeParameterInStaticContext", "line": 6}, {"id": "typeParameterInStaticContext", "line": 7}, {"id": "typeParameterInStaticContext", "line": 8}, {"id": "typeParameterInStaticContext", "line": 9}, {"id": "typeParameterInStaticContext", "line": 10}, {"id": "typeParameterInStaticContext", "line": 11}, {"id": "typeParameterInStaticContext", "line": 12}]}
 */
class Box<T> {
   static T field1;
   static List<T> field2;
   static T m1() { return null; }
   static List<? super T> m2() { return null; }
   static void m3(T t) { }
   static void m4() { T t = null; }
   static { T t = null; }
}

/**::
 * Generic type parameters remain usable in non-static members, generic static methods use their own type parameters
 */

Pair<String> p = new Pair<String>("a", "b");
assertEquals("b", p.getSecond(), "Instance method uses class type parameter");
assertEquals("x", Pair.identity("x"), "Static generic method uses own type parameter");
assertEquals(2, Pair.count(), "Static method without type parameter");

class Pair<T> {
   private static int counter = 0;
   private T first;
   private T second;

   Pair(T first, T second) {
      this.first = first;
      this.second = second;
      counter++;
      counter++;
   }

   T getSecond() {
      T result = second;
      return result;
   }

   static <T> T identity(T t) {
      return t;
   }

   static int count() {
      return counter;
   }
}

/**::
 * Generic methods: type parameters of the method can be used inside its return type and inside bounds of its type parameters
 */
List<String> l = GenericMethods.wrap("a");
assertEquals("a", l.get(0), "<E> List<E> wrap(E e)");

Map<String, Integer> m = GenericMethods.mapOf("x", 5);
assertEquals(5, m.get("x"), "<K, V> Map<K, V> mapOf(K k, V v)");

String[] arr = GenericMethods.make("a");
assertTrue(arr == null, "<E> E[] make(E e)");

assertEquals("b", GenericMethods.max("a", "b"), "<E extends Comparable<E>> E max(E a, E b) with String");
assertEquals(3, GenericMethods.max(1, 3), "<E extends Comparable<E>> E max(E a, E b) with Integer");

KeyHolder<String> h = new KeyHolder<>("k");
Map<String, Integer> m2 = h.pairWith(7);
assertEquals(7, m2.get("k"), "<U> Map<T, U> pairWith(U u) in generic class");

class GenericMethods {
   public static <E> List<E> wrap(E e) {
      List<E> list = new ArrayList<>();
      list.add(e);
      return list;
   }

   public static <K, V> Map<K, V> mapOf(K k, V v) {
      Map<K, V> map = new HashMap<>();
      map.put(k, v);
      return map;
   }

   public static <E> E[] make(E e) {
      return null;
   }

   public static <E extends Comparable<E>> E max(E a, E b) {
      return a.compareTo(b) > 0 ? a : b;
   }
}

class KeyHolder<T> {
   T key;

   KeyHolder(T key) {
      this.key = key;
   }

   <U> Map<T, U> pairWith(U u) {
      Map<T, U> map = new HashMap<>();
      map.put(key, u);
      return map;
   }
}

/**::
 * Wildcard with generic type parameter as upper bound (? extends T)
 */
WildcardBox<Number> b = new WildcardBox<>();
List<Integer> ints = new ArrayList<>();
ints.add(1);
ints.add(2);
b.addAll(ints);
assertEquals(2, b.items.size(), "void addAll(List<? extends T> other)");
Number n = b.firstOf(ints);
assertEquals(1, n.intValue(), "T firstOf(List<? extends T> l)");
assertEquals(3, b.sum(ints), "for (Number x : List<? extends Number>)");

List<String> strings = new ArrayList<>();
strings.add("x");
strings.add("y");
String s = WildcardMethods.firstOf(strings);
assertEquals("x", s, "<T> T firstOf(List<? extends T> list)");
assertEquals("y", WildcardMethods.maxOf(strings), "<T extends Comparable<T>> T maxOf(List<? extends T> list)");

class WildcardBox<T> {
   List<T> items = new ArrayList<>();

   void addAll(List<? extends T> other) {
      for (T t : other) {
         items.add(t);
      }
   }

   T firstOf(List<? extends T> l) {
      T first = l.get(0);
      return first;
   }

   int sum(List<? extends Number> numbers) {
      int sum = 0;
      for (Number x : numbers) {
         sum += x.intValue();
      }
      return sum;
   }
}

class WildcardMethods {
   static <T> T firstOf(List<? extends T> list) {
      return list.get(0);
   }

   static <T extends Comparable<T>> T maxOf(List<? extends T> list) {
      T max = list.get(0);
      for (T t : list) {
         if (t.compareTo(max) > 0) max = t;
      }
      return max;
   }
}

/**::
 * Wildcard with generic type parameter as upper bound: incompatible type argument
 * { "expectedCompilationError": {"id": "cantFindMethod", "line": 7}}
 */
IntegerSink<Integer> sink = new IntegerSink<>();
List<String> strs = new ArrayList<>();
sink.addAll(strs);

class IntegerSink<T> {
   void addAll(List<? extends T> other) { }
}
