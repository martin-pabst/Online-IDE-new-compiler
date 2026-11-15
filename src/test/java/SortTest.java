/**::
 * Sort ArrayList with java Comparator
 * { "expectedOutput": "abcdf" }
 */

ArrayList<String> list = new ArrayList<>();

list.add("c");
list.add("b");
list.add("a");
list.add("f");
list.add("d");

class StringComparator implements Comparator<String> {
   int compare(String s1, String s2){
      return s1.compareTo(s2);
   }
}

list.sort(new StringComparator());

list.forEach((s) -> {print(s);});

/**::
 * Collections.sort with variables of interface type List (generic method type parameter is inferred from List<T>)
 */
List<String> strings = new ArrayList<>();
strings.add("c");
strings.add("a");
strings.add("b");

Collections.sort(strings);
assertEquals("[\"a\", \"b\", \"c\"]", strings.toString(), "Collections.sort(List<String>)");

Collections.sort(strings, (a, b) -> b.compareTo(a));
assertEquals("[\"c\", \"b\", \"a\"]", strings.toString(), "Collections.sort(List<String>, lambda)");

Comparator<String> naturalOrder = (a, b) -> a.compareTo(b);
Collections.sort(strings, naturalOrder);
assertEquals("[\"a\", \"b\", \"c\"]", strings.toString(), "Collections.sort(List<String>, Comparator<String>)");

List<Integer> integers = new ArrayList<>();
integers.add(3);
integers.add(1);
integers.add(2);
Collections.sort(integers, (a, b) -> b - a);
assertEquals("[3, 2, 1]", integers.toString(), "Collections.sort(List<Integer>, lambda)");

List<SortTestRole> roles = new ArrayList<>();
roles.add(SortTestRole.WEREWOLF);
roles.add(SortTestRole.VILLAGER);
roles.add(SortTestRole.SEER);
Collections.sort(roles, (a, b) -> a.ordinal() - b.ordinal());
assertEquals("[VILLAGER, WEREWOLF, SEER]", roles.toString(), "Collections.sort(List<enum>, lambda)");

enum SortTestRole { VILLAGER, WEREWOLF, SEER }
