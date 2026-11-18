/**::
 * Definite assignment: branches which can't complete normally don't count where control flow paths meet
 * { "expectedWarnings": [] }
 */
assertEquals(1, returnInThenBranch(false), "return in then branch");
assertEquals(1, throwInElseBranch(true), "throw in else branch");
assertEquals(3, assignmentInDoWhileBodyBeforeCondition(), "do-while condition is evaluated after the body");
assertEquals(2, assignmentBeforeBreakInWhileTrueLoop(), "while(true) is only left by break");
assertEquals(5, assignmentInEveryStatementGroupOfSwitchWithDefault(2), "switch with default");
assertEquals(4, assignmentInTryAndCatchBlock(), "assignment in try and catch block");
assertEquals(7, assignmentInFinallyBlock(), "assignment in finally block");
assertEquals(6, forLoopUpdateReadsVariableAssignedInBody(), "update of for loop is executed after the body");

int returnInThenBranch(boolean c) {
   int x;
   if (c) {
      return 0;
   } else {
      x = 1;
   }
   return x;
}

int throwInElseBranch(boolean c) {
   int x;
   if (c) x = 1;
   else throw new RuntimeException("c is false");
   return x;
}

int assignmentInDoWhileBodyBeforeCondition() {
   int x;
   int i = 0;
   do {
      x = i;
      i++;
   } while (x < 3);
   return x;
}

int assignmentBeforeBreakInWhileTrueLoop() {
   int x;
   while (true) {
      x = 2;
      break;
   }
   return x;
}

int assignmentInEveryStatementGroupOfSwitchWithDefault(int k) {
   int x;
   switch (k) {
      case 1: x = 1; break;
      case 2: x = 5; break;
      default: x = 0;
   }
   return x;
}

int assignmentInTryAndCatchBlock() {
   int x;
   try {
      x = 4;
   } catch (Exception e) {
      x = -1;
   }
   return x;
}

int assignmentInFinallyBlock() {
   int x;
   try {
      assertCodeReached("try block");
   } finally {
      x = 7;
   }
   return x;
}

int forLoopUpdateReadsVariableAssignedInBody() {
   int step;
   int sum = 0;
   for (int i = 0; i < 6; i += step) {
      step = 2;
      sum = sum + i;
   }
   return sum;
}

/**::
 * Definite assignment: variable may be read before it has been assigned a value
 * { "expectedWarnings": [{"id": "variableNotInitialized", "line": 10}, {"id": "variableNotInitialized", "line": 16}, {"id": "variableNotInitialized", "line": 20}, {"id": "variableNotInitialized", "line": 29}, {"id": "variableNotInitialized", "line": 37}, {"id": "variableNotInitialized", "line": 44}, {"id": "variableNotInitialized", "line": 55}, {"id": "variableNotInitialized", "line": 65}, {"id": "variableNotInitialized", "line": 70}]}
 */

class A {
   void whileLoop(boolean c) {
      int x;
      while (c) { x = 1; }
      println(x);
   }

   void forLoops(int[] values) {
      int x;
      for (int i = 0; i < values.length; i++) { x = i; }
      println(x);

      int y;
      for (int v : values) { y = v; }
      println(y);
   }

   void switchWithoutDefault(int k) {
      int x;
      switch (k) {
         case 1: x = 1; break;
         case 2: x = 2; break;
      }
      println(x);
   }

   void catchAndFinallyBlocks() {
      int x;
      try {
         x = 1;
      } catch (Exception e) {
         println(x);
      }

      int y;
      try {
         y = 1;
      } finally {
         println(y);
      }
   }

   void breakBeforeAssignment(boolean c) {
      int x;
      while (true) {
         if (c) break;
         x = 1;
         break;
      }
      println(x);
   }

   void anonymousClassWithInstanceInitializer() {
      int x;
      Object o = new Object() {
         {
            int y = 1;
         }
      };
      println(x);
   }

   void lambdaCapturesVariable() {
      int x;
      Runnable r = () -> println(x);
   }
}

/**::
 * Unreachable statements
 * { "expectedWarnings": [{"id": "unreachableStatement", "line": 9}, {"id": "unreachableStatement", "line": 14}, {"id": "unreachableStatement", "line": 20}, {"id": "unreachableStatement", "line": 27}, {"id": "unreachableStatement", "line": 33}, {"id": "unreachableStatement", "line": 38}]}
 */

class A {
   void afterReturn() {
      return;
      println("never");
   }

   void afterInfiniteLoop() {
      while (true) { }
      println("never");
   }

   void afterBreak() {
      while (true) {
         break;
         println("never");
      }
   }

   void afterContinue(int n) {
      for (int i = 0; i < n; i++) {
         continue;
         println("never");
      }
   }

   void afterIfWhoseBranchesBothReturn(boolean c) {
      if (c) return; else return;
      println("never");
   }

   void onlyFirstUnreachableStatementIsReported(int x) {
      throw new RuntimeException();
      println("never");
      println("never");
      if (x > 0) { println("never"); }
   }

   void emptyStatementIsNotReported() {
      return;;
   }
}

/**::
 * Missing return: end of method body is reachable via break out of an infinite loop inside try block
 * { "expectedCompilationError": {"id": "returnStatementMissing", "line": 7}}
 */

class A {
   int f(boolean c) {
      try {
         while (true) {
            if (c) break;
         }
      } catch (Exception e) {
         return 1;
      }
   }
}

/**::
 * No missing return: neither try block nor catch blocks complete normally
 */
assertEquals(1, tryReturnsCatchThrows(), "try block returns");

int tryReturnsCatchThrows() {
   try {
      return 1;
   } catch (Exception e) {
      throw new RuntimeException("caught exception");
   }
}
