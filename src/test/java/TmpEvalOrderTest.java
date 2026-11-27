/**::
 * eval order: side effect in first argument
 */
int i = 0;
assertEquals(i++, i - 1, "assertEquals evaluates arguments right to left");

/**::
 * eval order: side effect in second argument
 */
int j = 0;
assertEquals(j, j++, "assertEquals evaluates arguments right to left (2)");

/**::
 * eval order: side effect in message
 */
int k = 5;
assertEquals(5, k, "" + (k++));
