# When switching between dark-mode and light-mode icons
The Online-IDE has a theme manager (@src\client\main\gui\ThemeManager.ts) which can switch between
dark and light mode. This changes the color of many html-elements, but up till now it doesn't affect icons.

Please implement switching between dark and light icon sets.

## Details:
  * First step: prepare the icon files
    * All icon files reside in @assets\icons. Some of them are light variants (those with suffix '-light.svg'), all others are dark variants.
    * Make subfolders @assets\icons\dark for all dark icons, @assets\icons\light for all light icons and move the icons from @assets\icons into the appropriate subfolder. Change icons.css and other references in sourcecode accordingly
    * Strip suffixes -light and -dark from filenames. Change icons.css and other references in sourcecode accordingly.
    * For almost all of the icons there is no light variant. As many of them are taken from @material\graphics\icons\dark, you find apropriate light ones in @material\graphics\icons\light. Please copy them to @assets\icons\light and rename them if needed so that they have the same name as their dark counterparts. Perhaps the icons in @material\graphics\icons\dark are more recent variants of the dark icons in @assets\icons\dark. If this is the case, exchange the old dark ones for the new dark ones.
    * For flags: youse same icons for light and dark themes. Just copy them.
    * If you don't find appropriate light icons in @material\graphics\icons\light, are you able to derive light versions from the dark ones? 
  * Second step: implement switching algorithm
    * Icons are mostly referenced in icons.css. Is there a simple way to switch them at runtime, like implemented in ThemeManager? Please implement it. 
    * You may have to update class src\tools\components\IconButtonComponent.ts to the new switching-algorithm.

Feel free to ask me questions until your are 97 % sure about what i need.
