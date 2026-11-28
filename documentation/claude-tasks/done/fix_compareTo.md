#Fix compareTo-method of classes String and string

A collegue sent me this program:
```java
int compare(String s1, String s2){
    return s1.compareTo(s2);
}

@Test
void test(){
    assertEquals(compare("a", "b"), -1, "String.compare not working");
    assertEquals(compare("b", "a"), 1, "String.compare not working");
    assertEquals(compare("a", "A"), 32, "String.compare not working");
    assertEquals(compare("A", "a"), -32, "String.compare not working");
    assertEquals(compare("Anna", "anna"), -32, "String.compare not working");
    assertEquals(compare("Zoo", "Alm"), 25, "String.compare not working");
    assertEquals(compare("Alm", "Zoo"), -25, "String.compare not working");
    assertEquals(compare("Z", "Z"), 0, "String.compare not working");

    assertEquals("a".compareTo("b"), -1, "String.compare not working");
    assertEquals("b".compareTo("a"), 1, "String.compare not working");
    assertEquals("a".compareTo("A"), 32, "String.compare not working");
    assertEquals("A".compareTo("a"), -32, "String.compare not working");
    assertEquals("Anna".compareTo("anna"), -32, "String.compare not working");
    assertEquals("Zoo".compareTo("Alm"), 25, "String.compare not working");
    assertEquals("Alm".compareTo("Zoo"), -25, "String.compare not working");
    assertEquals("Z".compareTo("Z"), 0, "String.compare not working");    
}
```
If i start 


src\compiler\java\runtime\system\javalang\ObjectClassStringClass.ts
src\compiler\java\runtime\system\javalang\PrimitiveStringClass.ts

