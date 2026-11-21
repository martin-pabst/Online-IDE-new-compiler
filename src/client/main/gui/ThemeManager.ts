import * as monaco from 'monaco-editor'

export type ThemeName = "dark" | "light";

export type Theme = {
    name: ThemeName,
    monacoTheme: string,
    cssColors: { [color: string]: string }
}

/**
 * Applies a theme (dark/light) to the html elements of one IDE instance: it sets the css variables
 * of the theme (cssColors) and the css class jo_theme-<name> (switches icon sets, see assets/css/icons.css).
 *
 * The Online-IDE (GUI version) has one instance (root element: body), the embedded version has one
 * instance per embedded IDE. Several embedded IDEs on one page may use different themes.
 *
 * Monaco editors can't have individual themes: Monaco has only one page-global theme. It is
 * set by the ThemeManager which was created first on the page.
 */
export class ThemeManager {

    private static themes: Theme[] | undefined;

    /**
     * The first ThemeManager on the page sets the page-global theme of all Monaco editors.
     */
    private static monacoThemeOwner: ThemeManager | undefined;

    currentTheme: Theme;

    /**
     * Root element of the IDE instance and elements outside of it which belong to the IDE instance
     * (e.g. the whole-window div in fullpage mode)
     */
    private themedElements: HTMLElement[] = [];

    constructor(rootElement: HTMLElement) {
        if (!ThemeManager.themes) {
            ThemeManager.themes = ThemeManager.createThemes();
            ThemeManager.defineEditorThemes();
        }
        if (!ThemeManager.monacoThemeOwner) ThemeManager.monacoThemeOwner = this;

        this.themedElements.push(rootElement);
        this.currentTheme = ThemeManager.themes[0];
    }

    static isThemeName(name: string): name is ThemeName {
        return name == "dark" || name == "light";
    }

    switchTheme(name: string) {
        for (let theme of ThemeManager.themes) {
            if (theme.name == name) {
                this.internalSwitchTheme(theme);
                break;
            }
        }
    }

    private internalSwitchTheme(theme: Theme) {
        this.currentTheme = theme;

        if (ThemeManager.monacoThemeOwner == this) {
            monaco.editor.setTheme(theme.monacoTheme);
        }

        for (const element of this.themedElements) {
            this.applyThemeToElement(element);
        }
    }

    /**
     * Applies this IDE instance's theme to an element outside of its root element, e.g. the
     * whole-window div in fullpage mode. Gives it css class joeCssFence, too, as the icon sets in
     * assets/css/icons.css need .joeCssFence.jo_theme-light on the same element.
     * Does nothing if element is inside an element which already has this theme (e.g. in the
     * GUI version, where the root element is body).
     */
    addThemedElement(element: HTMLElement) {
        if (this.themedElements.some(themedElement => themedElement.contains(element))) return;
        this.themedElements.push(element);
        element.classList.add("joeCssFence");
        this.applyThemeToElement(element);
    }

    removeThemedElement(element: HTMLElement) {
        let index = this.themedElements.indexOf(element);
        if (index > 0) this.themedElements.splice(index, 1);   // never remove root element (index 0)
    }

    private applyThemeToElement(element: HTMLElement) {
        const theme = this.currentTheme;

        for (const key of Object.keys(theme.cssColors)) {
            element.style.setProperty(key, theme.cssColors[key]);
        }

        // switches icon sets: assets/css/icons.css overrides the (dark) icons for .jo_theme-light
        for (const t of ThemeManager.themes) {
            element.classList.toggle("jo_theme-" + t.name, t == theme);
        }
    }

    private static createThemes(): Theme[] {

        let themes: Theme[] = [];

        themes.push({
            name: "dark",
            monacoTheme: "myCustomThemeDark",
            cssColors: {
                "--defaultPrintColor": "#ffffff",
                "--backgroundDark": "#1e1e1e",
                "--backgroundLight": "#252526",
                "--backgroundHeading": "#37373d",
                "--backgroundSelected": "#2a2d2e",
                "--fontColorNormal": "#c2cccc",
                "--fontColorLight": "#e7e7e7",
                "--slider": "#414141",
                "--loginButtonBackgrond": "#59a15d",
                "--loginButtonFontColor": "#000000",
                "--loginMessageColor": "rgb(122, 48, 48)",
                "--loginButtonHover": "#63a867",
                "--loginButtonActive": "#94ffd1",
                "--scrollbar": "#1e1e1e",
                "--scrollbar-thumb": "#3e3e3e",
                "--scrollbar-thumb-hover": "#5e5e5e",
                "--scrollbar-thumb-active": "#7e7e7e",
                "--submenu-hover": "#094771",
                "--submenu-color": "#ffffff",
                "--menuitemsdivider": "#616162",
                "--file-hover": "hsla(0, 0%, 38%, 0.125)",
                "--file-active": "#094771",
                "--file-active-hover": "rgba(9, 71, 113, 0.827)",
                "--file-active-border": "#007fd4",
                "--file-errorcount": "rgb(224, 93, 93)",
                "--treeview-selected-background": "#114c74c0",
                "--treeview-selected-hover-background": "#2a4658c0",
                "--treeview-focus-border": "#66b6ecab",
                "--inplace-editor": "blue",
                "--contextmenu-background": "#3c3c3c",
                "--contextmenu-color": "rgb(212,212,212)",
                "--contextmenu-hover-background": "#094771",
                "--contextmenu-hover-color": "#ffffff",
                "--error-filename": "#2a709e",
                "--error-line-ative": "#094771",
                "--error-line-hover": "rgba(96, 96, 96, 0.125)",
                "--error-position": "#c0802d",
                "--linecolumn": "#14c714",
                "--reveal-error": "rgba(253, 101, 101, 0.745)",
                "--reveal-method": "#2b2b7d2f",
                "--reveal-errorline-background": "red",
                "--reveal-error-whole-line": "rgba(255, 0, 0, 0.555)",
                "--reveal-programpointer": "rgba(111, 214, 27, 0.337)",
                "--reveal-syntaxelement": "rgba(122, 122, 122, 0.61)",
                "--margin-breakpoint": "rgba(255, 0, 0, 0.623)",
                "--speedcontrol-bar": "#9d9d9d",
                "--speedcontrol-grip": "#588555",
                "--speedcontrol-grip-hover": "#89d185",
                "--speedcontrol-display-background": "#383838",
                "--speedcontrol-display-border": "#9d9d9d",
                "--editorTooltip-background": "#252526",
                "--editorTooltip-border": "#454545",

                "--renameInput-color": "#ffffff",

                // embedded version: button "Code Reset"
                "--codeResetButton-background": "#464646c7",
                "--codeResetButton-color": "#c2cccc",
                "--codeResetDialog-background": "rgba(46, 46, 46, 0.849)",
                "--codeResetDialog-color": "#c2cccc",
                "--codeResetDialog-button-color": "#c2cccc",
                "--codeResetDialog-cancelButton-background": "rgb(15, 104, 15)",
                "--codeResetDialog-okButton-background": "rgb(128, 33, 33)",

                //bottomDiv
                "--bottomdiv-tabheading-hover": "white",
                "--bottomdiv-tabheading-active": "rgb(97,97,255)",
                "--noErrorMessage": "rgb(37, 211, 37)",
                "--console-top-borderbottom": "#c4c4c4",
                "--console-top-background": "#1e1e1e",
                "--consoleEntry-withBorder": "#303030",
                "--consoleEntryValue": "white",
                "--consoleEntryIdentifier": "rgb(156, 156, 235)",
                "--consoleEntryNoValue": "gray",
                "--consoleEntryCaption": "white",
                "--error-Caption": "rgb(166, 165, 176)",
                "--console-error": "rgb(155, 51, 51)",

                // Debugger
                "--deIdentifier": "rgb(156, 156, 235)",
                "--deValue": "white",
                "--debugger-fieldIdentifier": "#e6e92c",
                "--debugger-localVariableIdentifier": "#4ffa2c",
                "--memorytab-tableheadings": "#a7afe2",


                // Helper
                "--helper-background-color": "#383838",
                "--helper-border-color": "#d4d4d4",
                "--arrowBoxButtonOuter-background": "#59a15d",
                "--arrowBoxButtonOuter-border": "#3d3d3d",
                "--arrowBoxButtonOuter-color": "black",
                "--arrowBoxButtonOuter-button-hover": "#63a867",
                "--arrowBox-after": "rgba(136, 183, 213, 0)",
                "--arrowBox-before": "rgba(194, 225, 245, 0)",

                //run
                "--defaultOutputColor": "#ffffff",
                "--runInputColor": "#ffffff",
                "--runBackgroundColor": "rgba(255, 255, 255, 0.2)",

                //console
                "--console-fieldidentifier": "#e6e92c",

                //junit
                "--junit-details-color": "#a0a0a0",
                "--junit-expected-color": "#2fed4f",
                "--junit-actual-color": "#e06d4d",

            }
        });

        let highlightColor = "#8080ff";

        themes.push({
            name: "light",
            monacoTheme: "myCustomThemeLight",
            cssColors: {
                "--defaultPrintColor": "#000000",
                "--backgroundDark": "white",
                "--backgroundLight": "#f3f3f3",
                "--backgroundHeading": "#dcdcdc",
                "--backgroundSelected": "#e8e8e8",
                "--fontColorNormal": "#000",
                "--fontColorLight": "#303030",
                "--slider": "#b0b0b0",
                "--loginButtonBackgrond": "#59a15d",
                "--loginButtonFontColor": "#000000",
                "--loginMessageColor": "rgb(122, 48, 48)",
                "--loginButtonHover": "#63a867",
                "--loginButtonActive": "#94ffd1",
                "--scrollbar": "#e3e3e3",
                "--scrollbar-thumb": "#bababa",
                "--scrollbar-thumb-hover": "#8e8e8e",
                "--scrollbar-thumb-active": "#616161",
                "--submenu-hover": highlightColor,
                "--submenu-color": "#ffffff",
                "--menuitemsdivider": "#cfcfcf",
                "--file-hover": "#e8e8e8",
                "--file-active": "rgba(171, 231, 255, 0.74)",
                "--file-active-hover": "rgba(203, 212, 253, 0.61)",
                "--file-active-border": "rgba(76, 204, 255, 0.74)",
                "--file-errorcount": "red",
                "--treeview-selected-background": "rgba(171, 231, 255, 0.74)",
                "--treeview-selected-hover-background": "rgba(203, 212, 253, 0.61)",
                "--treeview-focus-border": "rgba(76, 204, 255, 0.74)",
                "--inplace-editor": "white",
                "--contextmenu-background": "white",
                "--contextmenu-color": "#756161",
                "--contextmenu-hover-background": highlightColor,
                "--contextmenu-hover-color": "#a0a0ff",
                "--error-filename": "#ff0000",
                "--error-line-ative": "#ffa0a0",
                "--error-line-hover": "#ffc0c0",
                "--error-position": "#804040",
                "--linecolumn": "#14c714", // TODO
                "--reveal-error": "rgba(253, 101, 101, 0.745)",
                "--reveal-method": "#babaec80",
                "--reveal-errorline-background": "red",
                "--reveal-error-whole-line": "rgba(255, 0, 0, 0.555)",
                "--reveal-programpointer": "rgba(111, 214, 27, 0.337)",
                "--reveal-syntaxelement": "rgba(244, 255, 96, 0.61)",
                "--margin-breakpoint": "rgba(255, 0, 0, 0.623)",
                "--speedcontrol-bar": "#9d9d9d",
                "--speedcontrol-grip": "#588555",
                "--speedcontrol-grip-hover": "#89d185",
                "--speedcontrol-display-background": "#e0e0e0",
                "--speedcontrol-display-border": "#9d9d9d",
                "--editorTooltip-background": "#e0e0e0",
                "--editorTooltip-border": "#9d9d9d",

                "--renameInput-color": "#000000",

                // embedded version: button "Code Reset"
                "--codeResetButton-background": "#e0e0e0",
                "--codeResetButton-color": "#000000",
                "--codeResetDialog-background": "rgba(243, 243, 243, 0.92)",
                "--codeResetDialog-color": "#000000",
                "--codeResetDialog-button-color": "#000000",
                "--codeResetDialog-cancelButton-background": "rgb(140, 210, 140)",
                "--codeResetDialog-okButton-background": "rgb(240, 140, 140)",


                //bottomDiv
                "--bottomdiv-tabheading-hover": "#424242",
                "--bottomdiv-tabheading-active": "#424242",
                "--noErrorMessage": "rgb(17, 180, 17)",
                "--console-top-borderbottom": "#c4c4c4",
                "--console-top-background": "white",
                "--consoleEntry-withBorder": "#dbdbdbff",
                "--consoleEntryValue": "#0000a0",
                "--consoleEntryIdentifier": "black",
                "--consoleEntryNoValue": "gray",
                "--consoleEntryCaption": "#756161",
                "--error-Caption": "rgb(166, 165, 176)",
                "--console-error": "rgb(155, 21, 21)",

                // Debugger
                "--deIdentifier": "black",
                "--deValue": "#0000a0",
                "--debugger-fieldIdentifier": "#855c27ff",
                "--debugger-localVariableIdentifier": "#25940fff",
                "--memorytab-tableheadings": "#5364d8",

                // Helper
                "--helper-background-color": "#f3f3f3",
                "--helper-border-color": "#606060",
                "--arrowBoxButtonOuter-background": "#59a15d",
                "--arrowBoxButtonOuter-border": "#3d3d3d",
                "--arrowBoxButtonOuter-color": "black",
                "--arrowBoxButtonOuter-button-hover": "#63a867",
                "--arrowBox-after": "rgba(136, 183, 213, 0)",
                "--arrowBox-before": "rgba(194, 225, 245, 0)",

                //run
                "--defaultOutputColor": "#303030",
                "--runInputColor": "#000000",
                "--runBackgroundColor": "rgba(0, 0, 0, 0.2)",

                //console
                "--console-fieldidentifier": "#b37c35ff",

                //junit
                "--junit-details-color": "#6d6c6c",
                "--junit-expected-color": "#1a8f2e",
                "--junit-actual-color": "#964731",

            }
        });

        return themes;
    }

    private static defineEditorThemes() {
        monaco.editor.defineTheme('myCustomThemeDark', {
            base: 'vs-dark', // can also be vs-dark or hc-black
            inherit: true, // can also be false to completely replace the builtin rules
            rules: [
                { token: 'method', foreground: '#e7e543', fontStyle: 'italic' },
                { token: 'print', foreground: '#e7e543', fontStyle: 'italic bold' },
                { token: 'class', foreground: '#3DC9B0' },
                { token: 'number', foreground: '#9ce870' },
                { token: 'number.immediate', foreground: '#e0e0e0', fontStyle: 'italic' },
                { token: 'type', foreground: '#a566cd' },
                { token: 'identifier', foreground: '#668aff' },
                { token: 'identifier.pseudodirective', foreground: '#92929294' },
                // { token: 'identifier.tag', foreground: '#a566cd' },
                { token: 'statement', foreground: '#ca5c5c', fontStyle: 'bold' },
                { token: 'keyword', foreground: '#f78e17' },
                { token: 'datadirective', foreground: '#91720c93', fontStyle: 'bold' },
                { token: 'string3', foreground: '#ff0000' },

                // { token: 'comment.js', foreground: '008800', fontStyle: 'bold italic underline' },

                // semantic tokens:
                { token: 'property', foreground: 'ffffff', fontStyle: 'bold' },
            ],
            colors: {
                "editor.background": "#1e1e1e",
                "jo_highlightMethod": "#2b2b7d",
                // "editorInlayHint.foreground": "#ffffffff",
                // "editorInlayHint.background": "#b3b3b3ba",
            }
        });

        monaco.editor.defineTheme('myCustomThemeLight', {
            base: 'vs', // can also be vs-dark or hc-black
            inherit: true, // can also be false to completely replace the builtin rules
            rules: [
                { token: 'method', foreground: '#694E16', fontStyle: 'italic bold' },
                { token: 'print', foreground: '#811f3f', fontStyle: 'italic bold' },
                { token: 'class', foreground: '#a03030' },
                { token: 'number', foreground: '#505050' },
                { token: 'number.immediate', foreground: '#202020', fontStyle: 'italic' },
                { token: 'type', foreground: '#a566cd', fontStyle: 'bold' },
                { token: 'identifier', foreground: '#001080' },
                { token: 'identifier.pseudodirective', foreground: '#85858594' },
                // { token: 'identifier.tag', foreground: '#7c34a9' },
                { token: 'statement', foreground: '#8000e0', fontStyle: 'bold' },
                { token: 'keyword', foreground: '#00a000', fontStyle: 'bold' },
                { token: 'datadirective', foreground: '#91720c93', fontStyle: 'bold' },
                { token: 'comment', foreground: '#808080', fontStyle: 'italic' },
            ],
            colors: {
                "editor.background": "#FFFFFF",
                "editor.foreground": "#000000",
                "editor.inactiveSelectionBackground": "#E5EBF1",
                "editorIndentGuide.background": "#D3D3D3",
                "editorIndentGuide.activeBackground": "#939393",
                "editor.selectionHighlightBackground": "#ADD6FF80",
                "editorSuggestWidget.background": "#F3F3F3",
                "activityBarBadge.background": "#007ACC",
                "sideBarTitle.foreground": "#6F6F6F",
                "list.hoverBackground": "#E8E8E8",
                "input.placeholderForeground": "#767676",
                "searchEditor.textInputBorder": "#CECECE",
                "settings.textInputBorder": "#CECECE",
                "settings.numberInputBorder": "#CECECE",
                "statusBarItem.remoteForeground": "#FFF",
                "statusBarItem.remoteBackground": "#16825D",
                "jo_highlightMethod": "#babaec"
            }
        });

    }


}