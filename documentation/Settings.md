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



Layout:


Heading

My Settings   Class Settings <DropDown>  School Settings
-----------
------------------------------------------------------------------------------
             |    MainGroup-description
MainGroup1   |    
             |    SubGroup1-Heading
MainGroup2   |    SubGroup1-description
             |    
MainGroup3   |    Setting1-Identifier
             |    Setting1-Description
...          |    ...
                  
                  SubGroup2-Heading
                  SubGroup2-Description

                  Setting1-Identifier
                  Setting1-Description
                  