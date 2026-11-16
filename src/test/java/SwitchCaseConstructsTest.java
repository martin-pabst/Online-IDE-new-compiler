/**::
 * switch with String inside a method: every branch (including default) returns, so no return statement is missing
 */
assertEquals(1, dayNumber("Monday"), "case Monday");
assertEquals(2, dayNumber("Tuesday"), "case Tuesday");
assertEquals(3, dayNumber("Wednesday"), "case Wednesday (block statement)");
assertEquals(-1, dayNumber("Sunday"), "default case");

int dayNumber(String day) {
   switch (day) {
      case "Monday": return 1;
      case "Tuesday": return 2;
      case "Wednesday": {
         return 3;
      }
      default: return -1;
   }
}

/**::
 * switch with fall-through of empty case labels: no missing return error
 */
assertEquals("workday", kindOfDay(1), "case 1 falls through to case 5");
assertEquals("workday", kindOfDay(3), "case 3 falls through to case 5");
assertEquals("workday", kindOfDay(5), "case 5");
assertEquals("weekend", kindOfDay(6), "case 6 falls through to case 7");
assertEquals("weekend", kindOfDay(7), "case 7");
assertEquals("invalid", kindOfDay(9), "default case");

String kindOfDay(int day) {
   switch (day) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
         return "workday";
      case 6:
      case 7:
         return "weekend";
      default:
         return "invalid";
   }
}

/**::
 * switch with fall-through of non-empty branches into a returning branch: no missing return error
 */
assertEquals(111, bonus(3), "case 3 falls through to cases 2 and 1");
assertEquals(11, bonus(2), "case 2 falls through to case 1");
assertEquals(1, bonus(1), "case 1");
assertEquals(0, bonus(0), "default case");

int bonus(int level) {
   int points = 0;
   switch (level) {
      case 3:
         points += 100;
      case 2:
         points += 10;
      case 1:
         points += 1;
         return points;
      default:
         return 0;
   }
}

/**::
 * switch with several constants per case label and a default branch which throws an exception
 */
assertEquals("small", size(1), "case 1, 2, 3");
assertEquals("small", size(3), "case 1, 2, 3");
assertEquals("medium", size(5), "case 4, 5, 6");

try {
   size(10);
   fail("default branch has to throw an exception");
} catch (IllegalArgumentException e) {
   assertEquals("n out of range: 10", e.getMessage(), "message of exception thrown in default branch");
}

String size(int n) {
   switch (n) {
      case 1, 2, 3: return "small";
      case 4, 5, 6: return "medium";
      default: throw new IllegalArgumentException("n out of range: " + n);
   }
}

/**::
 * switch branches with if...else and nested switch which return in every path
 */
Classifier c = new Classifier();
assertEquals("a0 b+", c.classify(0, 5), "if-branch inside case");
assertEquals("a0 b-", c.classify(0, -5), "else-branch inside case");
assertEquals("a1 b0", c.classify(1, 0), "nested switch case");
assertEquals("a1 b?", c.classify(1, 7), "nested switch default");
assertEquals("other", c.classify(2, 0), "outer default");

class Classifier {
   String classify(int a, int b) {
      switch (a) {
         case 0:
            if (b > 0) {
               return "a0 b+";
            } else {
               return "a0 b-";
            }
         case 1:
            switch (b) {
               case 0: return "a1 b0";
               default: return "a1 b?";
            }
         default:
            return "other";
      }
   }
}

/**::
 * switch with break statements and return statement after switch block
 */
assertEquals("I", roman(1), "case 1");
assertEquals("V", roman(5), "case 5");
assertEquals("X", roman(10), "case 10");
assertEquals("?", roman(7), "default");

String roman(int n) {
   String result;
   switch (n) {
      case 1: result = "I"; break;
      case 5: result = "V"; break;
      case 10: result = "X"; break;
      default: result = "?";
   }
   return result;
}

/**::
 * switch with return inside a loop and return statement after the loop
 */
assertEquals(7, indexOfFirstVowel("rhythm and blues"), "loop with switch which returns");
assertEquals(-1, indexOfFirstVowel("xyz"), "return after loop");

int indexOfFirstVowel(String s) {
   for (int i = 0; i < s.length(); i++) {
      switch (s.charAt(i)) {
         case 'a', 'e', 'i', 'o', 'u':
            return i;
         default:
            break;
      }
   }
   return -1;
}

/**::
 * switch with enum in method of class: unqualified enum constants as case labels
 */
Compass compass = new Compass();
assertTrue(compass.turnRight(Heading.NORTH) == Heading.EAST, "NORTH -> EAST");
assertTrue(compass.turnRight(Heading.EAST) == Heading.SOUTH, "EAST -> SOUTH");
assertTrue(compass.turnRight(Heading.SOUTH) == Heading.WEST, "SOUTH -> WEST");
assertTrue(compass.turnRight(Heading.WEST) == Heading.NORTH, "WEST -> NORTH");
assertEquals("horizontal", compass.axis(Heading.EAST), "enum switch with several constants per case label");
assertEquals("vertical", compass.axis(Heading.SOUTH), "enum switch with several constants per case label");

enum Heading { NORTH, EAST, SOUTH, WEST }

class Compass {
   Heading turnRight(Heading d) {
      switch (d) {
         case NORTH: return Heading.EAST;
         case EAST: return Heading.SOUTH;
         case SOUTH: return Heading.WEST;
         default: return Heading.NORTH;
      }
   }

   String axis(Heading d) {
      switch (d) {
         case NORTH, SOUTH:
            return "vertical";
         default:
            return "horizontal";
      }
   }
}

/**::
 * switch with char, switch on computed expression and switch on result of method call
 */
String text = "Hello World";
int vowels = 0;
int others = 0;
for (int i = 0; i < text.length(); i++) {
   switch (text.charAt(i)) {
      case 'a': case 'e': case 'i': case 'o': case 'u':
         vowels++;
         break;
      default:
         others++;
   }
}
assertEquals(3, vowels, "switch on char");
assertEquals(8, others, "switch on char (default)");

String rest = "";
for (int i = 0; i < 6; i++) {
   switch (i % 3) {
      case 0: rest += "a"; break;
      case 1: rest += "b"; break;
      case 2: rest += "c"; break;
   }
}
assertEquals("abcabc", rest, "switch on computed expression");

String answer = "YES";
switch (answer.toLowerCase()) {
   case "yes": assertCodeReached("switch on result of method call"); break;
   default: fail("default branch must not be reached");
}

/**::
 * break inside switch only leaves the switch, continue inside switch continues the enclosing loop
 */
String s = "";
for (int i = 0; i < 5; i++) {
   switch (i) {
      case 1: continue;
      case 3: s += "three"; break;
      default: s += "" + i;
   }
   s += ",";
}
assertEquals("0,2,three,4,", s, "break and continue inside switch");

int count = 0;
int j = 0;
while (j < 10) {
   j++;
   switch (j) {
      case 5: break;
      default: count++;
   }
}
assertEquals(9, count, "break inside switch doesn't leave while loop");

/**::
 * switch without matching case and without default branch executes nothing
 */
int x = 42;
switch (x) {
   case 1: fail("case 1 must not be reached"); break;
   case 2: fail("case 2 must not be reached"); break;
}
assertCodeReached("code after switch without matching case not reached");

/**::
 * switch with static final constants of the same class as case labels
 */
assertEquals("low", Level.describe(1), "case LOW");
assertEquals("high", Level.describe(3), "case HIGH");
assertEquals("unknown", Level.describe(2), "default");

class Level {
   static final int LOW = 1;
   static final int HIGH = 3;

   static String describe(int level) {
      switch (level) {
         case LOW: return "low";
         case HIGH: return "high";
         default: return "unknown";
      }
   }
}

/**::
 * default branch in the middle of the switch block: fall-through follows source order
 */
assertEquals("1d2", trace(1), "case 1 falls through to default and case 2");
assertEquals("2", trace(2), "case 2");
assertEquals("3", trace(3), "case 3");
assertEquals("d2", trace(7), "default falls through to case 2");

String trace(int x) {
   String s = "";
   switch (x) {
      case 1: s += "1";
      default: s += "d";
      case 2: s += "2"; break;
      case 3: s += "3";
   }
   return s;
}

/**::
 * switch on wrapper types Integer and Character (unboxing)
 */
Integer boxedInt = 2;
switch (boxedInt) {
   case 1: fail("case 1 must not be reached"); break;
   case 2: assertCodeReached("switch on Integer"); break;
   default: fail("default must not be reached");
}

Character boxedChar = 'b';
switch (boxedChar) {
   case 'a': fail("case 'a' must not be reached"); break;
   case 'b': assertCodeReached("switch on Character"); break;
   default: fail("default must not be reached");
}

/**::
 * Missing return: switch without default branch whose cases all return
 * { "expectedCompilationError": {"id": "returnStatementMissing", "line": 7}}
 */

class A {
   int f(int x) {
      switch (x) {
         case 1: return 10;
         case 2: return 20;
      }
   }
}

/**::
 * Missing return: one case branch ends with break
 * { "expectedCompilationError": {"id": "returnStatementMissing", "line": 7}}
 */

class A {
   int f(int x) {
      switch (x) {
         case 1: return 10;
         case 2: break;
         default: return 30;
      }
   }
}

/**::
 * Missing return: last branch completes without return
 * { "expectedCompilationError": {"id": "returnStatementMissing", "line": 7}}
 */

class A {
   int f(int x) {
      switch (x) {
         case 1: return 10;
         default: x++;
      }
   }
}

/**::
 * Missing return: return only inside if-branch of a case without else
 * { "expectedCompilationError": {"id": "returnStatementMissing", "line": 7}}
 */

class A {
   int f(int x) {
      switch (x) {
         case 1:
            if (x > 0) return 10;
         default:
            if (x < 0) return 20;
      }
   }
}

/**::
 * Case constant has wrong type
 * { "expectedCompilationError": {"id": "caseValueDoesntFitToSwitchValue", "line": 9}}
 */

int x = 1;
switch (x) {
   case 1: break;
   case "two": break;
}

/**::
 * Case label must be constant
 * { "expectedCompilationError": {"id": "constantValueExpectedAfterCase", "line": 10}}
 */

int x = 1;
int y = 2;
switch (x) {
   case 1: break;
   case y: break;
}

/**::
 * switch on double is not allowed
 * { "expectedCompilationError": {"id": "switchOnlyFeasibleForTypes", "line": 7}}
 */

double d = 1.0;
switch (d) {
   default: break;
}
