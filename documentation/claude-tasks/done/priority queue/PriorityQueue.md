# Add class PriorityQueue<E>

## Requirements
 * In folder @src\compiler\java\runtime\system\collections you find the implementations of several interfaces and classes of the java collection framework. Use them as templates to add class `PriorityQueue<E>`. 
 * It should have these constructors:
   * `PriorityQueue()`
   * `PriorityQueue(Collection<? extends E> c)`
   * `PriorityQueue(Comparator<? super E> comparator)`
 * It should have these methods:
   * `boolean add(E e)`
   * `void clear()`
   * `boolean contains(Object o)`
   * `Iterator<E> iterator()`
   * `boolean offer (E e)`
   * `E peek()`
   * `E poll()`
   * `boolean remove(Object o)`
   * `int size()`
   * `<T> T[] toArray(T[] a)`

## Technical Aspects
  * Use identifier `PriorityQueueClass` for the new class and store it in folder @src\compiler\java\runtime\system\collections.
  * If E is `String` or a wrapper class of a primitive type (like Integer, Double, Boolean, ... see classes in Folder @src\compiler\java\runtime\system\primitiveTypes\wrappers), then comparisons at object insertion can be done synchroneously. If E is another class and no Comparator is given, then comparison can be done synchroneously too. Make a suggestion how to compare the objects in this case...
  * If a Comparator is given, then comparisons have to be done asynchroneously with callback-functions like in @src\compiler\java\runtime\system\collections\CollectionsClass.ts, method `sortListWithComparator`.
  * You may implement the priority queue with a binary tree. Or do you know a better suited data structure? Or does the javascript framework inside the browser have a native solution for a priority queue that you can use?


Ask me questions until you are 98% sure of what i need.