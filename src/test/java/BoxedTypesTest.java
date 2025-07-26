/**::
 * Boxed types
 */


Integer i1 = Integer.valueOf(12);

assertEquals(22, i1 + 10, "Add int to Integer");
assertEquals("12", i1 + "", "Integer.toString");

Integer i2 = 12;
assertEquals(22, i2 + 10, "Add int to Integer");
assertEquals("12", i2 + "", "Integer.toString");

int test1(int a, Integer b){
    return a + b;
}

Integer i3 = null;
try {
    test1(i3, 12);
} catch (NullPointerException ex){
    assertCodeReached("Cast von Integer nach int sollte bei null-value eine Exception werfen.");
}

int i5 = 10;

assertEquals(3, test1(1, 2), "Call method expeceting Integer with int-literal");
assertEquals(14, test1(i2, 2), "Call method expeceting int with Integer");
assertEquals(12, test1(2, i5), "Call method expeceting Integer with int-variable");
assertEquals(14, test1(2, i2), "Call method expeceting Integer with Integer-variable");

Integer test2(int a, int b){
    return a + b;
}
assertTrue(test2(1, 2) instanceof Integer, "Boxed int as result from function is Integer");
assertEquals(14, test2(i2, 2).intValue(), "Boxed int as result from function has correct value");

ArrayList<Integer> list = new ArrayList<>();
list.add(i1);
list.add(10);

assertEquals("[12, 10]", list.toString(), "add Integer and int to ArrayList<Integer>");

assertTrue(list.get(1) instanceof Integer, "Boxed int is Integer");

Integer i6 = 1;
assertTrue(i6 instanceof Integer, "Boxed int is Integer");
assertEquals(10, list.get(i6), "Pass boxed Integer to library function expecting int");


Double d = 12;

d++;

assertEquals(13, d, "++ -Operator doesn't work with Double value.");
assertEquals(14, ++d, "++ -Operator doesn't work with Double value.");

Integer i4 = 20 - i5;  // 10
i4--;
assertEquals(9, i4, "-- -Operator doesn't work with Double value.");
assertEquals(8, --i4, "-- -Operator doesn't work with Double value.");