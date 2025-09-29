import { lm } from "../../../tools/language/LanguageManager";

export class JUnitTestrunnerLanguage {
    static ExecuteAllTestsInWorkspace = () => lm({
    "de": "Führt alle im aktuellen Workspace enthaltenen JUnit-Test aus.",
    "en": "Executes all JUnit-tests in current workspace.",
    })

    static allTests = () => lm({
    "de": "Alle Tests",
    "en": "All tests",
    })

    static failed = () => lm({
    "de": `schlug fehl`,
    "en": `failed`,
    })

    static expectedValue = () => lm({
    "de": "Erwarteter Wert:&nbsp;",
    "en": "Expected Value:&nbsp;",
    })

    static actualValue = () => lm({
    "de": "Erhaltener Wert:&nbsp;",
    "en": "Actual value:&nbsp;",
    })

    static runningAllTestsOfClass = (classIdentifier: string) => lm({
    "de": `Führe alle Tests der Klasse <span class="jo_junitClassIdentifier">${classIdentifier}</span> aus:`,
    "en": `Running all tests of class <span class="jo_junitClassIdentifier">${classIdentifier}</span>:`,
    })

    static runningAllTestsOfWorkspace = (workspaceIdentifier: string) => lm({
    "de": `Führe alle Tests des Workspaces <span class="jo_junitWorkspaceIdentifier">${workspaceIdentifier}</span> aus:`,
    "en": `Running all tests of workspace <span class="jo_junitWorkspaceIdentifier">${workspaceIdentifier}</span>:`,
    })

    static executingTestMethod = (classIdentifier: string, methodIdentifier: string) => lm({
    "de": `Führe <span class="jo_junitLink"><span class="jo_junitClassIdentifier">${classIdentifier}</span>.<span class="jo_junitMethodIdentifier">${methodIdentifier}</span></span> aus ...`,
    "en": `Running <span class="jo_junitLink"><span class="jo_junitClassIdentifier">${classIdentifier}</span>.<span class="jo_junitMethodIdentifier">${methodIdentifier}</span></span> ...`,
    })

    static couldntGetMainThread = () => lm({
    "de": `Fehler: Konnte den main thread nicht erhalten.`,
    "en": `Error: Couldn't get main thread.`,
    })

    static line = (line: number, column: number) => lm({
    "de": `Zeile ${line}`,
    "en": `line ${line}`,
    })

    static noTestsAvailableHtml = (exampleHtml: string) => lm({
    "de": `<div>In deinem Workspace gibt es noch keine JUnit-Tests. Wenn du wissen möchtest, was ein JUnit-Test ist und wie man einen
    schreibt, schau' dir <a target="_blank" href="https://www.learnj.de/doku.php?id=api:documentation:junit:start">die ausführliche Anleitung auf www.learnj.de</a> dazu an.</div>
    <br />
    <div style="font-weight: bold">Hier ein kurzer Beispieltest:<div>
    <div>${exampleHtml}</div>
    <br />
    <span style="font-weight: bold>Tipp: </span>
    <ul>
      <li>Jede Testmethode muss mit einer @Test-Annotation gekennzeichnet sein.</li>
      <li>Im Quelltext siehst Du links neben der Deklaration der Testmethode einen kleinen
          Button, mit dem Du diese Testmethode starten kannst.</li>
      <li>Eine Testmethode muss parameterlos sein und besitzt immer den Rückgabetyp void. </li>
      <li>Wenn Du auch die Klasse mit @Test annotierst, erhältst Du links neben ihrer
      Deklaration im Quelltext einen kleinen Button, mit dem Du alle Tests der Klasse
      gemeinsam starten kannst. </li>
    </ul>`,


    "en": `<div>There aren't any JUnit-tests in your workspace yet. If you want to know more about JUnit-Tests and how to write them,
     <a target="_blank" href="https://www.learnj.de/doku.php?id=api:documentation:junit:start">look here!</a>.</div>
    <br />
     <div style="font-weight: bold">Here a quick example:<div>
    <div>${exampleHtml}</div>
    <br />
    <span style="font-weight: bold">Hint: </span>
    <ul>
      <li>Each test-method is preceeded by a @Test-annotation.</li>
      <li>To the left of the test-method's declaration you get a small button with
      which you can start the test.</li>
      <li>A test method must be parameterless and must have return-type void. </li>
      <li>If you also preceed your Test class with @Test then you get a button left to
      it's declaration which you can use to start all tests of this class.</li>
    </ul>`,
    })

    static noTestsAvailableExampleProgram = () => lm({
    "de": `@Test
class MyFirstTestClass {

   @Test
   void testSquareRoot() {
      double squareRootOfFour = Math.sqrt(4);
      assertEquals(2.0, squareRootOfFour,
         "There semms to be something wrong with Math.sqrt!");
   }

   @Test
   void testDivision() {
      double n = 5 / 2 * 3;
      println(n);
      assertEquals(7.5, n,
         "5/2 * 3 doesn't yield 7.5 -> mysterious...");
   }
}`,
    })


    static testsFound = (count: number) => lm({
    "de": `In diesem Workspace wurden ${count} Testmethoden gefunden.
    <br />Klicke auf die Test-Buttons
    <span class="img_test-start jo_junit_imagesInline"></span>, um sie zu starten!`,

    "en": `${count} test methods found in this workspace.
    <br />Click the test-buttons <span class="img_test-start jo_junit_imagesInline"></span> to start them!`,
    })
}