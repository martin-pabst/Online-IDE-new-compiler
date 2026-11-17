/**::
 * Test correct handling of exceptions
 * { "expectedOutput": "finally-block reached\nCode in catch block reached!\nAfter exception handling\n" }
 */

Test t = new Test();

t.t1();

class Test {
   void t1() {
      t2();
   }

   void t2() {
      try {
         t3();
         println("This statement must not be reached.");
      } catch(Exception ex){
         assertCodeReached("Code inside catch block not reached!");
         println("Code in catch block reached!");
      }
      assertCodeReached("Code after exception handling not reached!");
      println("After exception handling");
   }

   void t3() {
    try {
      throw new Exception("Hello!");
      println("This statement must not be reached.");

    } finally {
      println("finally-block reached");
      assertCodeReached("Code in finally block not reached!");
    }
   }

}

/**::
 * try-catch statement returns if try block and all catch blocks return
 */
assertEquals(5, checkedDivide(10, 2), "try block returns");
assertEquals(-1, checkedDivide(10, 0), "catch block returns");

int checkedDivide(int a, int b) {
   try {
      if (b == 0) throw new ArithmeticException("division by zero");
      return a / b;
   } catch (ArithmeticException e) {
      return -1;
   }
}

/**::
 * Missing return: catch block doesn't return
 * { "expectedCompilationError": {"id": "returnStatementMissing", "line": 7}}
 */

class A {
   int f(int a, int b) {
      try {
         return a / b;
      } catch (ArithmeticException e) {
         println("division by zero");
      }
   }
}
