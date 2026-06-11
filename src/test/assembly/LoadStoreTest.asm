/**::
 * load and store values
 */
loadi 100
store 10
load 10
addi 20
store 11
.assert {10:[100, 120], message: "Error performing load/store operations"}
hold

