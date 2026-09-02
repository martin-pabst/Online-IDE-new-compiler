# User-Libraries
## Idea:
  * Every user can publish her/his workspaces as libraries
    * Name
    * Description
    * published_to
      * school
      * own classes
      * private
  * A user can delete a library. It continues to be visible inside all workspaces that use it.
  * Other users can combine libraries published to them with their own workspaces. 
  * You may use `package`-Declaration inside library files.
  * Only classes declared `public` are visible outside the library
## Implementation
  * In workspace-settings there are two panels:
    * Use library -> List of all visible libraries with checkboxes
    * Publish as library
      * fields Name, Description, published_to
      * button "Publish" (if not yet publish) or "Update published version" and "Withdraw publication" (if published)
  * School administrator gets new panel "orphaned libraries". She/he can set one of the teachers as new owner or delete orphaned libraries.
  * Help -> Libraries helps to find libraries and browse APIs
  * In main menu: Sprites, Repository -> (Workspace -> Sprites, Libraries, Repository)
  * Compiler/IDE handling:
    * Library-files are not visible among workspace files
    * Library-Methods are executed with max speed and you cannot trace into them
    * Main programs inside library files are not executed
    * Tests inside library files are not visible inside test-runner
    * Libraries are loaded lazily the first time a workspace is selected or when used libaries for a workspace change.
  * Database:
    * New Entity Library
      * id
      * source_workspace_id
      * files: longText (json-Array with files (Name, text)); Compressed String!
      * deleted: boolean
      * used_standard_libraries: string like "[gng, ...]" or "[]"
      * published_to   (Numbers like repository...)
    * New Entity LibraryWorkspace
      * id
      * library_id   (one-to-many)
      * workspace_id (one-to-many)
    * WorkspaceDAO.delete: don't forget to delete entries in LibraryWorkspace
    * LibraryDAO.delete: don't forget to delete entries in LibraryWorkspace