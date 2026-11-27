/**::
 * test switch case with int
 * { "expectedOutput": "Here!" }
 */
    int x = 1;

    switch(x) {
        case 0: fail("Case 0 must not be reached."); break;
        case 1: assertCodeReached("Didn't reach case 1");
        case 2: assertCodeReached("Didn't reach case 2"); break;
        default: fail("Default case must not be reached."); break;
    }
    assertCodeReached("Code after switch...case-block not reached.");

    print("Here!");

/**::
 * Test switch case with constant
 * { "expectedOutput": "Here!" }
 */

  public class A {
    public static final String a = "ABC";
    public static final int x = 5;
  }

  String b = "DEF";
  int y = 4;

  switch(b) {
      case A.a: fail("Case A.a must not be reached."); break;

      default: switch(y) {
        case 4:
        case 5: assertCodeReached("Didn't reache case 5."); break;
        default: fail("Default case must not be reached."); break;
      }
  }
  assertCodeReached("Code after switch...case-block not reached.");

  print("Here!");

/**::
 * switch...case-statement with enum
 */
enum Test {
   eins, zwei, drei
}

Test t = Test.zwei;

switch(t){
   case eins: fail("case 'eins' must not be reached.");
   case Test.zwei: assertCodeReached("Didn't reach case 'Test.zwei'.");
}

assertCodeReached("Code after switch...case-block not reached.");

/**::
 * case label with parenthesized constant expression
 * { "expectedOutput": "seven" }
 */
int x = 7;

switch(x) {
   case (3 + 4): print("seven"); break;
   case (2 * 4): fail("case (2 * 4) must not be reached."); break;
   default: fail("Default case must not be reached."); break;
}

/**::
 * case labels with constant expressions
 * { "expectedOutput": "seven minus-one ab" }
 */
int x = 7;

switch(x) {
   case 2 * 4: fail("case 2 * 4 must not be reached."); break;
   case 3 + 4: print("seven"); x = x > 5 ? 1 : 2; break;
   default: fail("Default case must not be reached."); break;
}
assertEquals(1, x, "ternary operator after case label");

int y = -1;
switch(y) {
   case -2: fail("case -2 must not be reached."); break;
   case 1 - 2: print(" minus-one"); break;
}

String s = "ab";
switch(s) {
   case "a" + "b": print(" ab"); break;
   default: fail("Default case must not be reached."); break;
}
