# Create Formatter class
Write method format in class @src\tools\formatter\Formatter.ts
  * It should take a format string and a variable number of arguments, and return a formatted string.
  * It should support the same format specifiers as the original Java Formatter class.
  * The arguments after the format string may have these types:
    * string
    * String (see @src\compiler\java\runtime\system\javalang\ObjectClassStringClass.ts)
    * number
    * boolean
    * null
    * Wrapper classes Boolean, Integer, Long, Double, Float, Short, Byte, Character (see folder @src\compiler\java\runtime\system\primitiveTypes\wrappers)
    * a subclass of Object (see @src\compiler\java\runtime\system\javalang\ObjectClassStringClass.ts)
  * The method should throw 
    * a RuntimeException if the number of arguments does not match the number of format specifiers in the format string.
    * an IllegalFormatException if a format string contains an illegal syntax, a format specifier that is incompatible with the given arguments, insufficient arguments given the format string, or other illegal conditions.
  * Place helper methods in the same class or in separate classes in the same folder @src\tools\formatter if needed.

  Ask me Questions if you are unsure about the requirements.
