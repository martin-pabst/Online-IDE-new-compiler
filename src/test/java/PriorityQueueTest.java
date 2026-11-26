/**::
 * PriorityQueue with natural ordering of Integer
 */

PriorityQueue<Integer> pq = new PriorityQueue<>();

assertTrue(pq.isEmpty(), "PriorityQueue.isEmpty");
assertTrue(pq.peek() == null, "PriorityQueue.peek on empty queue");
assertTrue(pq.poll() == null, "PriorityQueue.poll on empty queue");

assertTrue(pq.add(5), "PriorityQueue.add");
assertTrue(pq.offer(1), "PriorityQueue.offer");
pq.add(8);
pq.add(3);
pq.add(1);
pq.add(-4);

assertFalse(pq.isEmpty(), "PriorityQueue.isEmpty");
assertEquals(6, pq.size(), "PriorityQueue.size");
assertEquals(-4, pq.peek(), "PriorityQueue.peek");
assertEquals(6, pq.size(), "PriorityQueue.peek must not remove element");
assertEquals(-4, pq.element(), "PriorityQueue.element");
assertEquals("[-4, 1, 1, 3, 5, 8]", pq.toString(), "PriorityQueue.toString");

assertEquals(-4, pq.poll(), "PriorityQueue.poll");
assertEquals(1, pq.remove(), "PriorityQueue.remove()");
assertEquals(1, pq.poll(), "PriorityQueue.poll");
assertEquals(3, pq.poll(), "PriorityQueue.poll");
assertEquals(2, pq.size(), "PriorityQueue.size");

pq.clear();
assertTrue(pq.isEmpty(), "PriorityQueue.clear");
assertEquals("[]", pq.toString(), "PriorityQueue.toString of empty queue");

/**::
 * PriorityQueue: natural ordering of Double, Character, Boolean
 */

PriorityQueue<Double> doubles = new PriorityQueue<>();
doubles.add(2.5);
doubles.add(-1.25);
doubles.add(2.0);
assertEquals(-1.25, doubles.poll(), "PriorityQueue<Double>.poll");
assertEquals(2.0, doubles.poll(), "PriorityQueue<Double>.poll");
assertEquals(2.5, doubles.poll(), "PriorityQueue<Double>.poll");

PriorityQueue<Character> chars = new PriorityQueue<>();
chars.add('x');
chars.add('B');
chars.add('a');
assertEquals('B', chars.poll(), "PriorityQueue<Character>.poll");
assertEquals('a', chars.poll(), "PriorityQueue<Character>.poll");
assertEquals('x', chars.poll(), "PriorityQueue<Character>.poll");

PriorityQueue<Boolean> booleans = new PriorityQueue<>();
booleans.add(true);
booleans.add(false);
assertEquals(false, booleans.poll(), "PriorityQueue<Boolean>.poll");
assertEquals(true, booleans.poll(), "PriorityQueue<Boolean>.poll");

/**::
 * PriorityQueue: natural ordering of String uses String.compareTo (uppercase letters before lowercase letters)
 */

PriorityQueue<String> names = new PriorityQueue<>();
names.add("Charlie");
names.add("anton");
names.add("Bert");
names.add("Dora");

assertEquals(4, names.size(), "PriorityQueue<String>.size");
assertEquals("[\"Bert\", \"Charlie\", \"Dora\", \"anton\"]", names.toString(), "PriorityQueue<String>.toString");

String order = "";
for (String name : names) {
   order += name + " ";
}
assertEquals("Bert Charlie Dora anton ", order, "for-each loop over PriorityQueue");

order = "";
Iterator<String> it = names.iterator();
while (it.hasNext()) {
   order += it.next() + " ";
}
assertEquals("Bert Charlie Dora anton ", order, "PriorityQueue.iterator");

ArrayList<String> collected = new ArrayList<>();
names.forEach(s -> { collected.add(s); });
assertEquals("[\"Bert\", \"Charlie\", \"Dora\", \"anton\"]", collected.toString(), "PriorityQueue.forEach");

Object[] array = names.toArray();
assertEquals(4, array.length, "PriorityQueue.toArray");
assertEquals("Bert", array[0], "PriorityQueue.toArray");
assertEquals("anton", array[3], "PriorityQueue.toArray");

assertEquals(2, names.stream().filter(s -> s.length() > 4).count(), "PriorityQueue.stream");

assertTrue(names.contains("Bert"), "PriorityQueue.contains");
assertFalse(names.contains("Emil"), "PriorityQueue.contains");
assertTrue(names.remove("Bert"), "PriorityQueue.remove(Object)");
assertFalse(names.remove("Bert"), "PriorityQueue.remove(Object)");
assertEquals("Charlie", names.poll(), "PriorityQueue.poll");
assertEquals("Dora", names.poll(), "PriorityQueue.poll");

/**::
 * PriorityQueue with Comparator (lambda and class)
 */

PriorityQueue<Integer> maxQueue = new PriorityQueue<>((a, b) -> b - a);
maxQueue.add(3);
maxQueue.add(17);
maxQueue.add(-2);
maxQueue.add(8);

assertEquals("[17, 8, 3, -2]", maxQueue.toString(), "PriorityQueue with comparator: toString");
assertEquals(17, maxQueue.poll(), "PriorityQueue with comparator: poll");
assertEquals(8, maxQueue.poll(), "PriorityQueue with comparator: poll");

PriorityQueue<String> byLength = new PriorityQueue<>(new LengthComparator());
byLength.add("ccc");
byLength.add("a");
byLength.add("bb");
byLength.add("x");      // same length as "a" => behind "a"
byLength.add("dddd");

assertEquals("[\"a\", \"x\", \"bb\", \"ccc\", \"dddd\"]", byLength.toString(), "PriorityQueue with comparator class: toString");
assertEquals("a", byLength.poll(), "PriorityQueue with comparator class: poll");
assertEquals("x", byLength.poll(), "PriorityQueue with comparator class: poll");
assertEquals("bb", byLength.poll(), "PriorityQueue with comparator class: poll");

class LengthComparator implements Comparator<String> {
   public int compare(String s1, String s2) {
      return s1.length() - s2.length();
   }
}

/**::
 * PriorityQueue with Comparable user class: equal priorities come out in insertion order
 */

PriorityQueue<Task> tasks = new PriorityQueue<>();
tasks.add(new Task("wash", 3));
tasks.add(new Task("cook", 1));
tasks.add(new Task("read", 2));
tasks.add(new Task("shop", 1));
tasks.add(new Task("call", 3));
tasks.offer(new Task("pay", 1));

assertEquals("[cook(1), shop(1), pay(1), read(2), wash(3), call(3)]", tasks.toString(), "PriorityQueue<Comparable>.toString");

assertTrue(tasks.contains(new Task("read", 2)), "PriorityQueue.contains uses equals");
assertFalse(tasks.contains(new Task("read", 1)), "PriorityQueue.contains uses equals");
assertTrue(tasks.remove(new Task("shop", 1)), "PriorityQueue.remove(Object) uses equals");
assertEquals(5, tasks.size(), "PriorityQueue.remove(Object)");

String done = "";
while (!tasks.isEmpty()) {
   done += tasks.poll().name + " ";
}
assertEquals("cook pay read wash call ", done, "PriorityQueue<Comparable>.poll");

class Task implements Comparable<Task> {
   String name;
   int priority;

   Task(String name, int priority) {
      this.name = name;
      this.priority = priority;
   }

   public int compareTo(Task other) {
      return priority - other.priority;
   }

   public boolean equals(Object o) {
      if (o instanceof Task) {
         Task t = (Task) o;
         return t.name.equals(name) && t.priority == priority;
      }
      return false;
   }

   public String toString() {
      return name + "(" + priority + ")";
   }
}

/**::
 * PriorityQueue: constructor with collection, addAll, containsAll, removeAll
 */

ArrayList<Integer> list = new ArrayList<>();
list.add(9);
list.add(4);
list.add(7);
list.add(4);

PriorityQueue<Integer> fromList = new PriorityQueue<>(list);
assertEquals("[4, 4, 7, 9]", fromList.toString(), "PriorityQueue(Collection)");

PriorityQueue<Integer> maxQueue = new PriorityQueue<>((a, b) -> b - a);
maxQueue.addAll(list);

Integer[] integers = maxQueue.toArray(new Integer[0]);
assertEquals(4, integers.length, "PriorityQueue.toArray(T[])");
assertEquals(9, integers[0], "PriorityQueue.toArray(T[])");
assertEquals(4, integers[3], "PriorityQueue.toArray(T[])");
assertEquals("[9, 7, 4, 4]", maxQueue.toString(), "PriorityQueue.addAll");

PriorityQueue<Integer> copy = new PriorityQueue<>(maxQueue);
copy.add(8);
assertEquals("[9, 8, 7, 4, 4]", copy.toString(), "PriorityQueue(PriorityQueue) takes comparator");

HashSet<Integer> set = new HashSet<>();
set.add(1);
set.add(12);
assertTrue(copy.addAll(set), "PriorityQueue.addAll(HashSet)");
assertEquals("[12, 9, 8, 7, 4, 4, 1]", copy.toString(), "PriorityQueue.addAll(HashSet)");

ArrayList<Integer> check = new ArrayList<>();
check.add(12);
check.add(4);
assertTrue(copy.containsAll(check), "PriorityQueue.containsAll");
check.add(5);
assertFalse(copy.containsAll(check), "PriorityQueue.containsAll");

assertTrue(copy.removeAll(check), "PriorityQueue.removeAll");
assertEquals("[9, 8, 7, 1]", copy.toString(), "PriorityQueue.removeAll removes all occurrences");
assertFalse(copy.removeAll(check), "PriorityQueue.removeAll");

ArrayList<Integer> sorted = new ArrayList<>(copy);
assertEquals("[9, 8, 7, 1]", sorted.toString(), "ArrayList(PriorityQueue)");

/**::
 * PriorityQueue used via interfaces Queue and Collection
 */

Queue<String> queue = new PriorityQueue<>();
queue.offer("Paula");
queue.add("Emil");
queue.offer("Zoe");
assertEquals("Emil", queue.peek(), "Queue.peek");
assertEquals("Emil", queue.poll(), "Queue.poll");
assertEquals("Paula", queue.remove(), "Queue.remove()");

Collection<String> coll = queue;
coll.add("Anna");
assertEquals(2, coll.size(), "Collection.size");
assertTrue(coll.contains("Anna"), "Collection.contains");
assertTrue(coll.remove("Zoe"), "Collection.remove");
assertFalse(coll.isEmpty(), "Collection.isEmpty");
assertEquals("Anna", queue.poll(), "Queue.poll");
assertTrue(coll.isEmpty(), "Collection.isEmpty");

/**::
 * PriorityQueue: exceptions
 */

PriorityQueue<Integer> empty = new PriorityQueue<>();
try {
   empty.remove();
   fail("PriorityQueue.remove() on empty queue: NoSuchElementException expected");
} catch (NoSuchElementException e) {
   assertCodeReached("NoSuchElementException on remove()");
}

try {
   empty.element();
   fail("PriorityQueue.element() on empty queue: NoSuchElementException expected");
} catch (NoSuchElementException e) {
   assertCodeReached("NoSuchElementException on element()");
}

try {
   empty.add(null);
   fail("PriorityQueue.add(null): NullPointerException expected");
} catch (NullPointerException e) {
   assertCodeReached("NullPointerException on add(null)");
}

PriorityQueue<Point> points = new PriorityQueue<>();
try {
   points.add(new Point());
   fail("PriorityQueue.add of non-comparable element: ClassCastException expected");
} catch (ClassCastException e) {
   assertCodeReached("ClassCastException on non-comparable element");
}
assertTrue(points.isEmpty(), "Non-comparable element must not be added");

PriorityQueue<Point> pointsWithComparator = new PriorityQueue<>((p1, p2) -> p1.x - p2.x);
Point p = new Point();
p.x = 3;
pointsWithComparator.add(p);
pointsWithComparator.add(new Point());
assertEquals(0, pointsWithComparator.poll().x, "PriorityQueue with comparator for non-comparable class");
assertTrue(pointsWithComparator.contains(p), "PriorityQueue.contains uses identity if equals is not overridden");

PriorityQueue<Object> mixed = new PriorityQueue<>();
mixed.add(5);
try {
   mixed.add("five");
   fail("PriorityQueue.add of incomparable types: ClassCastException expected");
} catch (ClassCastException e) {
   assertCodeReached("ClassCastException on incomparable types");
}

class Point {
   int x;
}

/**::
 * PriorityQueue: many elements
 */

ArrayList<Integer> numbers = new ArrayList<>();
for (int i = 0; i < 20000; i++) {
   numbers.add((i * 7919) % 20000);
}

PriorityQueue<Integer> big = new PriorityQueue<>(numbers);
assertEquals(20000, big.size(), "PriorityQueue(Collection) with many elements");

ArrayList<Integer> someNumbers = new ArrayList<>();
for (int i = 0; i < 20000; i += 97) {
   someNumbers.add(i);
}
assertTrue(big.containsAll(someNumbers), "PriorityQueue.containsAll with many elements");

boolean ok = true;
for (int i = 0; i < 20000; i++) {
   if (big.poll() != i) ok = false;
}
assertTrue(ok, "PriorityQueue.poll with many elements");

PriorityQueue<Integer> bigWithComparator = new PriorityQueue<>((a, b) -> b - a);
for (int i = 0; i < 1000; i++) {
   bigWithComparator.add((i * 7919) % 1000);
}
ok = true;
for (int i = 999; i >= 0; i--) {
   if (bigWithComparator.poll() != i) ok = false;
}
assertTrue(ok, "PriorityQueue with comparator and many elements");
