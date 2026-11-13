/**::
 * Test String functions for primitive string literals
 */
assertEquals("1234".length(), 4, "Wrong string literal length.");
assertEquals("Das ist ein Test Test".indexOf("Test"), 12, "string literal indexOf not working.");
assertEquals("Das ist ein Test Test".indexOf("x"), -1, "string literal indexOf not working.");
assertEquals("Das ist ein Test und noch ein Test".indexOf("Test", 3), 12, "string literal indexOf not working.");
assertEquals("Das ist ein Test und noch ein Test".indexOf("Test", 13), 30, "string literal indexOf not working.");
assertEquals("Das ist ein Test und noch ein Test".indexOf('T'), 12, "string literal indexOf not working.");
assertEquals("Das ist ein Test und noch ein Test".indexOf('T', 3), 12, "string literal indexOf not working.");
assertEquals("Das ist ein Test und noch ein Test".indexOf('T', 14), 30, "string literal indexOf not working.");
assertEquals("Martin".charAt(2), 'r', "string literal charAt not working.");
assertEquals("Alpha".compareTo("Beta"), -1, "string literal compareTo not working.");
assertEquals("Alpha".compareTo("Alpha"), 0, "string literal compareTo not working.");
assertEquals("Alpha".compareTo("alpha"), 1, "string literal compareTo not working.");
assertEquals("Alpha".compareToIgnoreCase("alpha"), 0, "string literal compareToIgnoreCase not working.");
assertEquals("Alpha".concat("beta"), "Alphabeta", "string literal concat not working.");

String other = "beta";
assertEquals("Alpha".concat(other), "Alphabeta", "string literal concat not working.");

assertTrue("Alpha".contains("ph"), "string literal contains not working.");
assertFalse("Alpha".contains("Ph"), "string literal contains not working.");
assertTrue("Alpha".endsWith("pha"), "string literal endsWith not working.");
assertFalse("Alpha".endsWith("Pha"), "string literal endsWith not working.");
assertTrue("Alpha".startsWith("Alph"), "string literal startsWith not working.");
assertFalse("Alpha".startsWith("alph"), "string literal startsWith not working.");

assertTrue("Alpha".equals("Alpha"), "string literal equals not working.");
assertTrue("Alpha".equalsIgnoreCase("alpha"), "string literal equals not working.");
assertTrue("".isEmpty(), "string literal isEmpty not working.");
assertFalse(other.isEmpty(), "string literal isEmpty not working.");

assertEquals("Das ist ein Test und noch ein Test".lastIndexOf("Test"), 30, "string literal lastIndexOf not working.");
assertEquals("Das ist ein Test und noch ein Test".lastIndexOf("Test", 20), 12, "string literal lastIndexOf not working.");

assertEquals("ABCÄÖÜß".toLowerCase(), "abcäöüß", "string literal toLowerCase not working");
assertEquals("abcäöü".toUpperCase(), "ABCÄÖÜ", "string literal toUpperCase not working");

assertEquals("Das ist ein Test".substring(4), "ist ein Test", "string literal substring not working");
assertEquals("Das ist ein Test".substring(4, 7), "ist", "string literal substring not working");

assertEquals("   Das ist ein Test   \n".trim(), "Das ist ein Test", "string literal trim not working");
assertEquals("Das ist und ist und ist nicht wahr.".replace("ist", "war"), "Das war und ist und ist nicht wahr.", "string literal replace not working.");
assertEquals("Das ist und ist und ist nicht wahr.".replaceAll("ist", "war"), "Das war und war und war nicht wahr.", "string literal replace not working.");
assertTrue("12.08.2022".matches("\\d\\d\\.\\d\\d\\.\\d\\d\\d\\d"), "string literal matches not working.");
assertEquals("12.08.2022, 01.01.2023".replaceFirst("\\d\\d\\.\\d\\d\\.\\d\\d\\d\\d", "date"), "date, 01.01.2023", "string literal matches not working.");
assertEquals("Das ist und ist und ist nicht wahr.".split("ist").length, 4, "string literal split not working.");

/**::
 * Test String functions for String objects
 */
String s1 = "1234";
assertEquals(s1.length(), 4, "Wrong string literal length.");

String s2 = "Das ist ein Test";
assertEquals(s2.indexOf("Test"), 12, "String object indexOf not working.");
assertEquals(s2.indexOf("x"), -1, "String object indexOf not working.");

String s3 = "Das ist ein Test und noch ein Test";
assertEquals(s3.indexOf("Test", 3), 12, "String object indexOf not working.");
assertEquals(s3.indexOf("Test", 13), 30, "String object indexOf not working.");
assertEquals(s3.indexOf('T'), 12, "String object indexOf not working.");
assertEquals(s3.indexOf('T', 3), 12, "String object indexOf not working.");
assertEquals(s3.indexOf('T', 14), 30, "String object indexOf not working.");
assertEquals(s3.charAt(2), 's', "String object charAt not working.");
assertEquals("Alpha".compareTo("Beta"), -1, "String object compareTo not working.");
assertEquals("Alpha".compareTo("Alpha"), 0, "String object compareTo not working.");
assertEquals("Alpha".compareTo("alpha"), 1, "String object compareTo not working.");
assertEquals("Alpha".compareToIgnoreCase("alpha"), 0, "String object compareToIgnoreCase not working.");
assertEquals("Alpha".concat("beta"), "Alphabeta", "String object concat not working.");

String alpha = "Alpha";
String other = "beta";
assertEquals("Alpha".concat(other), "Alphabeta", "String object concat not working.");

assertEquals('h', alpha.toCharArray()[3], "String.toCharArray() doesn't work.");

assertTrue(alpha.contains("ph"), "String object contains not working.");
assertFalse(alpha.contains("Ph"), "String object contains not working.");
assertTrue(alpha.endsWith("pha"), "String object endsWith not working.");
assertFalse(alpha.endsWith("Pha"), "String object endsWith not working.");
assertTrue(alpha.startsWith("Alph"), "String object startsWith not working.");
assertFalse(alpha.startsWith("alph"), "String object startsWith not working.");

assertTrue(alpha.equals("Alpha"), "String object equals not working.");
assertTrue(alpha.equalsIgnoreCase("alpha"), "String object equals not working.");

String emptyString = "";
assertTrue(emptyString.isEmpty(), "String object isEmpty not working.");
assertFalse(other.isEmpty(), "String object isEmpty not working.");

assertEquals(s3.lastIndexOf("Test"), 30, "String object lastIndexOf not working.");
assertEquals(s3.lastIndexOf("Test", 20), 12, "String object lastIndexOf not working.");

assertEquals(s2.substring(4), "ist ein Test", "String object substring not working");
assertEquals(s2.substring(4, 7), "ist", "String object substring not working");

/**::
 * Test String < string and += operator
 */

String t = "Test";
t = "NewTest";
assertEquals(t, "NewTest", "Assigning a string literal to a String variable doesn't work...");
if(t < "Zest") t += t;

assertEquals(t, "NewTestNewTest", "if-clause gone wrong...");



/**::
 * String.format, String.formatted and System.out.printf
 * { "expectedOutput": "Preis:   3.50 EUR\nMax is 12 years old.\n" }
 */
assertEquals("42", String.format("%d", 42), "String.format with %d not working.");
assertEquals("   42|42   |00042", String.format("%5d|%-5d|%05d", 42, 42, 42), "String.format with width and flags not working.");
assertEquals("2.68", String.format("%.2f", 2.675), "String.format with %.2f not working.");
assertEquals("1,234,567", String.format("%,d", 1234567), "String.format with grouping not working.");
assertEquals("Max is 12 years old.", String.format("%s is %d years old.", "Max", 12), "String.format with %s and %d not working.");
assertEquals("true A ff 1.234568e+04", String.format("%b %c %x %e", true, "A".charAt(0), 255, 12345.678), "String.format with %b %c %x %e not working.");
assertEquals("b a", String.format("%2$s %1$s", "a", "b"), "String.format with explicit argument index not working.");
assertEquals("100%", String.format("100%%"), "String.format without arguments not working.");
assertEquals("x is 3", "%s is %d".formatted("x", 3), "String.formatted not working.");

Person p = new Person("Anna");
assertEquals("Person Anna!", String.format("%s!", p), "String.format does not call toString() of user objects.");
assertEquals(" Person Anna|", String.format("%12s|", p), "String.format with width and user objects not working.");
assertEquals("null", String.format("%s", p.getFriend()), "String.format with null object not working.");
assertEquals("Anna and Person Bob", String.format("%s and %s", p.name, p.getBob()), "String.format with several user objects not working.");

System.out.printf("Preis: %6.2f EUR%n", 3.5);
System.out.printf("%s is %d years old.%n", "Max", 12);

class Person {
   String name;

   Person(String name) {
      this.name = name;
   }

   Person getFriend() {
      return null;
   }

   Person getBob() {
      return new Person("Bob");
   }

   public String toString() {
      return "Person " + name;
   }
}


/**::
 * IllegalFormatException is thrown for incompatible format specifiers and missing arguments
 */
boolean caught = false;
try {
   String s = String.format("%d", "x");
} catch (IllegalFormatException e) {
   caught = true;
   assertTrue(e.getMessage().startsWith("IllegalFormatConversionException"), "Wrong message: " + e.getMessage());
}
assertTrue(caught, "IllegalFormatException expected for %d with a String argument.");

caught = false;
try {
   String s = String.format("%s %s", "x");
} catch (IllegalArgumentException e) {
   caught = true;
}
assertTrue(caught, "IllegalFormatException (an IllegalArgumentException) expected for missing arguments.");

caught = false;
try {
   System.out.printf("%q");
} catch (RuntimeException e) {
   caught = true;
}
assertTrue(caught, "IllegalFormatException (a RuntimeException) expected for an unknown conversion.");
