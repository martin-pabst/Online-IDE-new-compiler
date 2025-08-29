TODO:
  * files with folders
    * remove filters... -> OK!
    * Treeview-configuration -> OK!
    * handler for "new folder" -> OK!
    * handler for file moving -> OK!
    * compiler: filter-out folders -> OK!
    * repository: create needed folders
    * if file inside repository is in other folder than file in workspace: offer to correct this
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


