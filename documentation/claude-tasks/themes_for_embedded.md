# Themes for embedded version
In the GUI version the user can switch between a dark and a light theme. In the embedded version the them should be set by a parameter theme in the configuration object which can have the values 'dark' and light (see field config in class MainEmbedded inside @src\client\embedded\MainEmbedded.ts).

Technical details:
  * class ThemeManager (@src\client\main\gui\ThemeManager.ts) should be usable for both embedded version and GUI version.
  * Please beware that a html page can contain several instances of the embedded version with different values for config.theme. I put two instances into embedded_java.html so that you can test using this file.

Please ask me questions until you are 98 % sure about what i need.
