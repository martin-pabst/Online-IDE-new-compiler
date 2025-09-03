TODO:
  * files with folders
    * test Prüfung functionality
    * test if user delete also delete published databases in sql-ide and answer to bug report in github
  * better tablet integration


Done:
Treeview:
  * sollte den Prüfungsfolder anders darstellen als die anderen 
  * Prüfungsfolder und Dateien darin sollten readonly sein.
  * does Treeview.selectElement scrollIntoView?
  * WorkspaceImporter/WorkspaceExporter: export/import with folders...
  * Embedded version should use new Treeview component
  * button to shrink all folders
  * initial state: all folders closed; only folder open with current workspace
  * method select: does it open all parent folders?

============================================================
* nicht so sehr zustandsbehaftet
    * nimm const statt let
    * thread.currentprogramstate - sollte eher ein call auf `this.programStack[this.programStack.length - 1];`
      sein als jedes mal selbst setzen - letzteres ist fehlerträchtig


* _mj$getState$Thread_State$ - warum leakt hier LearnJ seine internen Thread States !?


* ToString widersprüchlich - gibt keinen String zurück, sondern ist println !?


