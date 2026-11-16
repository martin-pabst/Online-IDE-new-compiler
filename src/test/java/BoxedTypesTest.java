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

/**::
 * Boolean.compareTo and Character.compareTo
 */

Boolean bTrue = true;
Boolean bTrue2 = true;
Boolean bFalse = false;

assertEquals(0, bTrue.compareTo(bTrue2), "Boolean.compareTo: equal values (different objects)");
assertTrue(bFalse.compareTo(bTrue) < 0, "Boolean.compareTo: false < true");
assertTrue(bTrue.compareTo(bFalse) > 0, "Boolean.compareTo: true > false");
assertEquals("false", bFalse.toString(), "Boolean.toString with value false");

Character cA = 'A';
Character cA2 = 'A';
Character cC = 'C';

assertEquals(0, cA.compareTo(cA2), "Character.compareTo: equal values (different objects)");
assertEquals(-2, cA.compareTo(cC), "Character.compareTo: difference of char codes");
assertEquals(2, cC.compareTo(cA), "Character.compareTo: difference of char codes");

// calls via interface Comparable
ArrayList<Character> chars = new ArrayList<>();
chars.add('x');
chars.add('B');
chars.add('a');
Collections.sort(chars);
assertEquals("[B, a, x]", chars.toString(), "Collections.sort(List<Character>)");

ArrayList<Boolean> booleans = new ArrayList<>();
booleans.add(true);
booleans.add(false);
booleans.add(true);
Collections.sort(booleans);
assertEquals("[false, true, true]", booleans.toString(), "Collections.sort(List<Boolean>)");

/**::
 * compareTo of Integer, Long, Float, Double (-1, 0, 1) and Byte, Short (difference) like in java
 */

Integer i3 = 3;
Integer i7 = 7;
assertEquals(-1, i3.compareTo(i7), "Integer.compareTo");
assertEquals(1, i7.compareTo(i3), "Integer.compareTo");
assertEquals(0, i3.compareTo(3), "Integer.compareTo");

Long l3 = 3L;
Long l7 = 7L;
assertEquals(-1, l3.compareTo(l7), "Long.compareTo");
assertEquals(1, l7.compareTo(l3), "Long.compareTo");

Double d1 = 2.5;
Double d2 = 2.25;
assertEquals(1, d1.compareTo(d2), "Double.compareTo");
assertEquals(-1, d2.compareTo(d1), "Double.compareTo");
assertEquals(0, d1.compareTo(2.5), "Double.compareTo");

Double nan = Math.sqrt(-1);
Double infinity = Double.POSITIVE_INFINITY;
assertEquals(1, nan.compareTo(infinity), "Double.compareTo: NaN is greater than infinity");
assertEquals(0, nan.compareTo(nan), "Double.compareTo: NaN equals NaN");

Float f1 = 1.5f;
Float f2 = 1.25f;
assertEquals(1, f1.compareTo(f2), "Float.compareTo");
assertEquals(-1, f2.compareTo(f1), "Float.compareTo");

Byte b3 = (byte) 3;
Byte b7 = (byte) 7;
assertEquals(-4, b3.compareTo(b7), "Byte.compareTo(Byte)");

Short s3 = (short) 3;
Short s7 = (short) 7;
assertEquals(4, s7.compareTo(s3), "Short.compareTo(Short)");

/**::
 * Byte and Short: boxing and valueOf(String)
 */

byte b = (byte) 5;
Object o = b;
assertTrue(o instanceof Byte, "Boxing of byte");

ArrayList<Byte> bytes = new ArrayList<>();
bytes.add((byte) 12);
assertEquals("[12]", bytes.toString(), "ArrayList<Byte>");

assertEquals(5, Byte.valueOf("5").intValue(), "Byte.valueOf(String)");
assertEquals(-7, Byte.valueOf("-7").intValue(), "Byte.valueOf(String)");
assertEquals(10, Byte.valueOf("a", 16).intValue(), "Byte.valueOf(String, int)");

assertEquals(5, Short.valueOf("5").intValue(), "Short.valueOf(String)");
assertEquals(-1200, Short.valueOf("-1200").intValue(), "Short.valueOf(String)");
assertEquals(255, Short.valueOf("ff", 16).intValue(), "Short.valueOf(String, int)");

/**::
 * Integer.parseInt, Integer.valueOf(String) and NumberFormatException
 */

assertEquals(0, Integer.parseInt("0"), "Integer.parseInt(\"0\")");
assertEquals(0, Integer.parseInt("-0"), "Integer.parseInt(\"-0\")");
assertEquals(0, Integer.parseInt("+0"), "Integer.parseInt(\"+0\")");
assertEquals(42, Integer.parseInt("42"), "Integer.parseInt(\"42\")");
assertEquals(42, Integer.parseInt("+42"), "Integer.parseInt(\"+42\")");
assertEquals(-42, Integer.parseInt("-42"), "Integer.parseInt(\"-42\")");
assertEquals(123, Integer.parseInt("0000000000000000000000123"), "Integer.parseInt with leading zeros");
assertEquals(Integer.MAX_VALUE, Integer.parseInt("2147483647"), "Integer.parseInt(MAX_VALUE)");
assertEquals(Integer.MIN_VALUE, Integer.parseInt("-2147483648"), "Integer.parseInt(MIN_VALUE)");

assertEquals(255, Integer.parseInt("ff", 16), "Integer.parseInt(\"ff\", 16)");
assertEquals(255, Integer.parseInt("+FF", 16), "Integer.parseInt(\"+FF\", 16)");
assertEquals(Integer.MAX_VALUE, Integer.parseInt("7fffffff", 16), "Integer.parseInt(\"7fffffff\", 16)");
assertEquals(Integer.MIN_VALUE, Integer.parseInt("-80000000", 16), "Integer.parseInt(\"-80000000\", 16)");
assertEquals(42, Integer.parseInt("101010", 2), "Integer.parseInt(\"101010\", 2)");
assertEquals(-5, Integer.parseInt("-101", 2), "Integer.parseInt(\"-101\", 2)");
assertEquals(35, Integer.parseInt("z", 36), "Integer.parseInt(\"z\", 36)");
assertEquals(-35, Integer.parseInt("-Z", 36), "Integer.parseInt(\"-Z\", 36)");

assertEquals(42, Integer.valueOf("42").intValue(), "Integer.valueOf(\"42\")");
assertEquals(255, Integer.valueOf("ff", 16).intValue(), "Integer.valueOf(\"ff\", 16)");
assertEquals(42, new Integer("42").intValue(), "new Integer(\"42\")");

String[] invalidStrings = {
    "12b", "", "+", "-", " 12", "12 ", "--1", "+-1", "12_3",
    "2147483648", "-2147483649", "99999999999999", null
};

for (String s : invalidStrings) {
    boolean caught = false;
    try {
        Integer.parseInt(s);
    } catch (NumberFormatException e) {
        caught = true;
        assertTrue(e instanceof IllegalArgumentException, "NumberFormatException must be an IllegalArgumentException");
    }
    assertTrue(caught, "NumberFormatException expected for parseInt(" + s + ")");
}

String[][] invalidRadixCases = {
    {"0x10", "16"},
    {"80000000", "16"},
    {"8", "8"},
    {"2", "2"},
    {"12", "1"},
    {"12", "37"},
    {"12", "0"},
    {"12", "-10"}
};

for (String[] testCase : invalidRadixCases) {
    boolean caught = false;
    try {
        Integer.parseInt(testCase[0], Integer.parseInt(testCase[1]));
    } catch (IllegalArgumentException e) {
        caught = true;
    }
    assertTrue(caught, "NumberFormatException expected for parseInt(" + testCase[0] + ", " + testCase[1] + ")");
}

boolean caughtValueOf = false;
try {
    Integer.valueOf("12b");
} catch (NumberFormatException e) {
    caughtValueOf = true;
}
assertTrue(caughtValueOf, "NumberFormatException expected for Integer.valueOf(\"12b\")");

boolean caughtCtor = false;
try {
    new Integer("12b");
} catch (NumberFormatException e) {
    caughtCtor = true;
}
assertTrue(caughtCtor, "NumberFormatException expected for new Integer(\"12b\")");

/**::
 * Objects of wrapper classes are immutable: ++ and -- assign new objects
 */
Integer a = 5;
Integer b = a;
a++;
assertEquals(6, a, "a++");
assertEquals(5, b, "a++ doesn't change other variable referencing the same object");

++a;
assertEquals(7, a, "++a");
assertEquals(5, b, "++a doesn't change other variable referencing the same object");

a--;
--a;
assertEquals(5, a, "a-- and --a");

Integer c = 10;
int oldValue = c++;
assertEquals(10, oldValue, "value of c++ is old value");
int newValue = ++c;
assertEquals(12, newValue, "value of ++c is new value");

Double d = 1.5;
Double e = d;
d++;
assertEquals(2.5, d, "Double d++");
assertEquals(1.5, e, "d++ doesn't change other variable referencing the same object");

Counter counter = new Counter();
Integer before = counter.count;
counter.count++;
assertEquals(1, counter.count, "field of type Integer: counter.count++");
assertEquals(0, before, "counter.count++ doesn't change other variable referencing the same object");

class Counter {
   Integer count = 0;
}