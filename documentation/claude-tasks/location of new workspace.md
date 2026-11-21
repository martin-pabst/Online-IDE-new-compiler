# Optimize location of new workspace inside workspace treeview
In the full IDE, if you add a new Workspace, it seems to land anywhere. Please help me implement a algorithm where to put the new workspace inside the workspace tree that seems logical to the user.

I'd suggest:
  * The treeview stores which workspace or folder was the last one selected.
  * If the last one selected was a folder and the user clicks on "new Workspace" or "new Folder", then place it as the first item inside the folder.
  * If the last one selected was a workspace, then place it in the same folder, directly below the last one selected.

Or do you have a better idea?