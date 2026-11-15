# Bug: Inner class not found
In the following program there is a compile time error in line 6: "Der Datentyp Knoten ist hier nicht definiert". This error is wrong.

Please help me fix the compiler.

```java
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

   public Warteschlange() {
      
            
   }
   
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
      }else {
         Knoten aktuellerKnoten = ersterKnoten;
         while (aktuellerKnoten.getNaechsten() != null) {
            aktuellerKnoten = aktuellerKnoten.getNaechsten();
         }
         aktuellerKnoten.setNaechsten(neuerKnoten);
      }
   }

   
}

```