Treeview:
  * sollte den Prüfungsfolder anders darstellen als die anderen 
  * Prüfungsfolder und Dateien darin sollten readonly sein.
  * WorkspaceImporter
  * WorkspaceImporterExporter.ts
  * does Treeview.selectElement scrollIntoView?


============================================================
* nicht so sehr zustandsbehaftet
    * nimm const statt let
    * thread.currentprogramstate - sollte eher ein call auf `this.programStack[this.programStack.length - 1];`
      sein als jedes mal selbst setzen - letzteres ist fehlerträchtig


* _mj$getState$Thread_State$ - warum leakt hier LearnJ seine internen Thread States !?


* ToString widersprüchlich - gibt keinen String zurück, sondern ist println !?


