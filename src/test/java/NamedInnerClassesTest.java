/**::
 * Test named inner classes
 */

A a = new A();
A.B b = a.getB();
assertEquals(10, b.getOuterI(), "Test outer class field access");
a.i = 20;
assertEquals(20, b.getOuterI(), "Test outer class field access");

A.B.C c1 = b.new A.B.C();
assertEquals(20, c1.getOuterI(), "Test outer class field access");
assertEquals(100, c1.getOuterJ(), "Test outer class field access");

A.B.C c2 = b.getC();
assertEquals(20, c2.getOuterI(), "Test outer class field access");
assertEquals(100, c2.getOuterJ(), "Test outer class field access");

class A {
   int i = 10;

   class B {

      int j = 100;

      int getOuterI(){
         return i;
      }

      C getC(){
        return new C();
      }

      class C {
        int getOuterJ(){
            return j;
        }

        int getOuterI(){
            return i;
        }
      }

   }

   B getB(){
      return new B();
   }


}

/**::
 * Inner class of generic class references itself and the outer class's generic type parameter
 */

Warteschlange<String> w = new Warteschlange<String>();
assertTrue(w.gibErsten() == null, "Empty queue");
w.neuenAufnehmen("a");
w.neuenAufnehmen("b");
w.neuenAufnehmen("c");
assertEquals("a", w.gibErsten(), "First element");
w.entferneErsten();
assertEquals("b", w.gibErsten(), "Second element");
w.entferneErsten();
assertEquals("c", w.gibErsten(), "Third element");
w.entferneErsten();
assertTrue(w.gibErsten() == null, "Queue empty again");

public class Warteschlange<Inhaltstyp> {

   private class Knoten {

      private Inhaltstyp inhalt;
      private Knoten naechster;

      public Knoten(Inhaltstyp pInhalt) {
         inhalt = pInhalt;
         naechster = null;
      }

      public Inhaltstyp getInhalt() {
         return inhalt;
      }

      public Knoten getNaechsten() {
         return naechster;
      }

      public void setNaechsten(Knoten pNaechster) {
         naechster = pNaechster;
      }

   }

   private Knoten ersterKnoten;

   public Inhaltstyp gibErsten() {
      if (ersterKnoten != null) {
         return ersterKnoten.getInhalt();
      }
      return null;
   }

   public void entferneErsten() {
      if (ersterKnoten != null) {
         ersterKnoten = ersterKnoten.getNaechsten();
      }
   }

   public void neuenAufnehmen(Inhaltstyp pNeuerInhalt) {
      Knoten neuerKnoten = new Knoten(pNeuerInhalt);
      if (ersterKnoten == null) {
         ersterKnoten = neuerKnoten;
      } else {
         Knoten aktuellerKnoten = ersterKnoten;
         while (aktuellerKnoten.getNaechsten() != null) {
            aktuellerKnoten = aktuellerKnoten.getNaechsten();
         }
         aktuellerKnoten.setNaechsten(neuerKnoten);
      }
   }

}

/**::
 * Deeply nested inner classes reference themselves, enclosing classes and siblings of enclosing classes by simple name
 */

Outer o = new Outer();
Outer.Middle m = o.createMiddle();
Outer.Middle.Inner i1 = m.createInner();
Outer.Middle.Inner i2 = m.createInner();
i1.next = i2;
assertTrue(i1.getNext() == i2, "Inner references own type");
assertTrue(i1.getMiddle() == m, "Inner references enclosing type");
assertTrue(i1.getOuter() == o, "Inner references outermost type");
assertEquals(42, i1.getSibling().value, "Inner references sibling of enclosing type");

class Outer {

   Middle createMiddle() {
      return new Middle();
   }

   Outer getOuterInstance() {
      return this;
   }

   static class Sibling {
      int value = 42;
   }

   class Middle {

      Inner createInner() {
         return new Inner();
      }

      Middle getThis() {
         return this;
      }

      class Inner {
         Inner next;

         Inner getNext() {
            return next;
         }

         Middle getMiddle() {
            return getThis();
         }

         Outer getOuter() {
            Outer outer = getOuterInstance();
            return outer;
         }

         Sibling getSibling() {
            return new Sibling();
         }
      }
   }

}

/**::
 * Static nested class can't reference generic type parameter of outer class
 * { "expectedCompilationError": {"id": "typeNotDefined", "line": 9}}
 */

class Container<T> {

   static class Holder {
      T value;
   }

}