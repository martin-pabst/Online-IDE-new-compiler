/**::
 * Test if...else
 */
String g = "";
String u = "";
for(int i = 1; i <= 10; i++){
    if(i % 2 == 0) g += "" + i; else u += "" + i;
}

assertEquals("246810", g, "if...else not working.");
assertEquals("13579", u, "if...else not working.");

String g1 = "";
String u1 = "";

for(int i = 1; i <= 10; i++){
    if(i % 2 == 0){
      g1 += "" + i; 
    } else { 
      u1 += "" + i;
    }
}

assertEquals("246810", g1, "if...else not working (version with {}).");
assertEquals("13579", u1, "if...else not working (version with {}).");

/**::
 * test the ternary operator
 * { "expectedOutput": "12\n14\nx\nx\n12y\n14y\n16y\n18y\n" }
 */

String f1(String s){
   fail("Function f1 called with argument: " + s);
   return s;
}

String f2(String s){
   return s;
}

for(int i = 12; i <= 14; i += 2){
    println(i % 2 == 0 ? i + "" : f1(i + ""));
}

for(int i = 16; i <= 18; i += 2){
    println(i % 2 != 0 ? f1(i + "") : "x");
}

for(int i = 12; i <= 14; i += 2){
    println(i % 2 != 0 ? i + "" : f2(i + "y"));
}

for(int i = 16; i <= 18; i += 2){
    println(i % 2 == 0 ? f2(i + "y") : "x");
}


