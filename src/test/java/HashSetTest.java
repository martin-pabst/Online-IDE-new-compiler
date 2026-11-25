/**::
 * HashSet - Test
 * { "expectedOutput": "AnnaBertaCharlieDennis" }
 */

Set<String> s = new HashSet<String>();

s.add("Anna");
s.add("Berta");
s.add("Charlie");
s.add("Dennis");
s.add("Dennis");

assertEquals(4, s.size(), "HashSet.size");

assertTrue(s.contains("Berta"), "HashSet.contains");
assertFalse(s.contains("Tim"), "HashSet.contains");

s.forEach(element -> {print(element);});


ArrayList<String> list = new ArrayList<>();
list.add("Anna");
list.add("Charlie");
list.add("Dennis");

assertTrue(s.containsAll(list), "HashSet.containsAll");

list.add("Martin");
assertFalse(s.containsAll(list), "HashSet.containsAll");

s.addAll(list);
assertTrue(s.contains("Martin"), "HashSet.addAll");

s.remove("Dennis");
assertFalse(s.contains("Dennis"), "HashSet.remove");
assertTrue(s.remove("Anna"), "HashSet.remove returns true if set contained element");
assertFalse(s.remove("Anna"), "HashSet.remove returns false if set didn't contain element");
s.add("Anna");

s.removeAll(list);
assertTrue(s.contains("Berta"), "HashSet.removeAll");
assertFalse(s.contains("Martin"), "HashSet.removeAll");

/**::
 * HashSet.stream
 */
HashSet<String> s = new HashSet<>();
s.add("Anna");
s.add("Berta");
s.add("Charlie");
s.add("Berta");

assertEquals(3, s.stream().count(), "HashSet.stream().count");
assertEquals(2, s.stream().filter(e -> e.length() > 4).count(), "HashSet.stream().filter");
assertEquals(1, s.stream().map(e -> e.length()).filter(n -> n == 4).count(), "HashSet.stream().map");

Collection<String> c = s;
assertEquals(3, c.stream().count(), "HashSet.stream() via Collection");
