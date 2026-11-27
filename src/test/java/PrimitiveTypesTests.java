/**::
 * Test casting primitive types
 */

char c = 'A';
int i = c;

assertEquals(65, i, "Casting char to int doesn't work.");
assertEquals(65, (int)c, "Casting char to int doesn't work.");

char c1 = (char)i;
assertEquals('A', c1, "Casting int to char doesn't work.");
assertEquals('A', (char)65, "Casting int to char doesn't work.");
assertEquals(77, (char)65 + 12, "Casting int to char doesn't work.");


/**::
 * modulo for chars
 */

char c = 'A';
assertEquals(5, c % 10, "char modulo int failed");
assertEquals(16, c % '1' ,"char modulo char failed");

/**::
 * Parenthesized constant expressions are constant expressions (implicit narrowing needs a constant)
 */
byte b = (100 + 27);
assertEquals(127, b, "byte b = (100 + 27)");
byte b2 = (3 + 4) * 2;
assertEquals(14, b2, "byte b2 = (3 + 4) * 2");
char c = ('A');
assertEquals('A', c, "char c = ('A')");