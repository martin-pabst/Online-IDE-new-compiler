# Ideas for settings module
  * store each setting as value or undefined ( == "default")
  * setting data types:
    * boolean
    * int
    * float
    * literal type, e.g. "slow" | "fast" | "lightspeed"
      * each value has written form with translations
  * store settings for (with descending priority)
    * user
    * class
    * school
    * default values
  * use lower priority only if higher priority is stored as undefined ( == "default")
  * GUI: Add "Settings"-Section to existing administration-module
  * Ad the top: Setings for <dropdown with "me:", "class:", "school:"> <dropdown with username | classes of teacher | school of schooladmin>
  * default setting-values are hard-coded
  * Meta-structure defines
   * possible settings
   * translation-functions for name, description, values
   * group of settings with translation-function for name, description

