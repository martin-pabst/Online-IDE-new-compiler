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


