# Bugfix: Can't shuffle ArrayList with Enums

In the following test program the compiler issues a compile time error on line 12: "Es konnte keine passende Methode mit diesem Bezeichner/dieser Signatur gefunden werden." This is wrong. Method shuffle should work with an ArrayList containing enums. Please help me fix this compiler error.

```java
enum Rollen { WERWOLF, DORFBEWOHNER }

public class Test {
   public static void main(String[] args) {
        
      
      List<Rollen> rollen = new ArrayList<>();
      rollen.add(Rollen.WERWOLF);
      rollen.add(Rollen.DORFBEWOHNER);

        
      Collections.shuffle(rollen);
      System.out.println(rollen.toString());


      List<String> spieler = new ArrayList<>();
      Collections.shuffle(spieler);
      spieler.add("Kaspar");
      spieler.add("Theo");
      System.out.println(spieler.toString());
   }
}
```

