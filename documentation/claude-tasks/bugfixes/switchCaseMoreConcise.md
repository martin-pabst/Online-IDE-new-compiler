# Make switch/case logic in compiler more concise
Currently, in ASTSwitchCaseNode is not directoy stored at which position inside the list of case nodes the default case is located. Instead, the compiler uses the source code position of the default case to find this out, see @src\compiler\java\codegenerator\StatementCodeGenerator.ts. This is a bad design, because the compiler does this while being already in the code generation phase. Therefore please make the following changes:

 * Add a field isDefaultNode in ASTCaseNode
 * Store the default node in array ASTSwitchCaseNode.caseNodes in the position corresponding to the order of the case nodes in the source code. This way, the compiler can directly access the default case without having to search for it based on its source code position.
 * remove ASTSwitchCaseNode.defaultNode
 * Update parser and code generator accordingly.

 
