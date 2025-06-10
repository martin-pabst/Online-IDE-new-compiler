import { lm } from "../../../../tools/language/LanguageManager";

export class GuiMessages {

    /**
     * ProjectExplorer
     */
    static NewFileName = () => lm({
        "de": "Datei",
        "en": "File",
    })

    static NewWorkspaceName = () => lm({
        "de": "Workspace",
        "en": "Workspace",
    })

    /**
     * Main Menu
    */
    static File = () => lm({
        "de": "Datei",
        "en": "File",
    })

    static ImportWorkspace = () => lm({
        "de": "Workspace importieren",
        "en": "Import workspace",
    })

    static ExportCurrentWorkspace = () => lm({
        "de": "Aktuellen Workspace exportieren",
        "en": "Export current workspace",
    })

    static NoWorkspaceSelected = () => lm({
        "de": "Kein Workspace ausgewählt.",
        "en": "No workspace selected",
    })

    static ExportAllWorkspaces = () => lm({
        "de": "Alle Workspaces exportieren",
        "en": "Export all workspaces",
    })

    static SaveAndExit = () => lm({
        "de": "Speichern und beenden",
        "en": "Save and exit",
    })

    static Edit = () => lm({
        "de": "Bearbeiten",
        "en": "Edit",
    })

    static Undo = () => lm({
        "de": "Rückgängig (Strg + z)",
        "en": "Undo (Ctrl + z)",
    })

    static Redo = () => lm({
        "de": "Wiederholen (Strg + y)",
        "en": "Redo (Ctrl + y)",
    })

    static Copy = () => lm({
        "de": "Kopieren (Strg + c)",
        "en": "Copy (Ctrl + c)",
    })

    static Cut = () => lm({
        "de": "Ausschneiden (Strg + x)",
        "en": "Cut (Ctrl + x)",
    })

    static CopyToTop = () => lm({
        "de": "Nach oben kopieren (Alt + Shift + Pfeil rauf)",
        "en": "Copy to top (Alt + Shift + Arrow up)",
    })

    static CopyToBottom = () => lm({
        "de": "Nach unten kopieren (Alt + Shift + Pfeil runter)",
        "en": "Copy to Bottom (Alt + Shift + Arrow down)",
    })

    static MoveToTop = () => lm({
        "de": "Nach oben verschieben (Alt + Pfeil rauf)",
        "en": "Move to top (Alt + Arrow up)",
    })

    static MoveToBottom = () => lm({
        "de": "Nach unten verschieben (Alt + Pfeil runter)",
        "en": "Move to Bottom (Alt + Arrow down)",
    })

    static Find = () => lm({
        "de": "Suchen... (Strg + f)",
        "en": "Find... (Ctrl + f)",
    })

    static Replace = () => lm({
        "de": "Ersetzen... (Strg + h)",
        "en": "Replace... (Ctrl + h)",
    })

    static ToggleComment = () => lm({
        "de": "Aus-/Einkommentieren (Strg + #)",
        "en": "Toggle comment (Ctrl + +)",
    })

    static AutoFormat = () => lm({
        "de": "Dokument automatisch formatieren (Alt + Shift + f)",
        "en": "Auto format (Alt + Shift + f)",
    })

    static FindCorrespondingBracket = () => lm({
        "de": "Finde zugehörige Klammer (Strg + k)",
        "en": "Find corresponding bracket (Ctrl + k)",
    })

    static FoldAll = () => lm({
        "de": "Alles zusammenfalten",
        "en": "Fold all",
    })

    static UnfoldAll = () => lm({
        "de": "Alles auffalten",
        "en": "Unfold all",
    })

    static TriggerSuggest = () => lm({
        "de": "Vorschlag auslösen (Strg + Leertaste)",
        "en": "Trigger suggestion (Ctrl + Space)",
    })

    static TriggerParameterHint = () => lm({
        "de": "Parameterhilfe (Strg + Shift + Leertaste)",
        "en": "Trigger parameter hint (Ctrl + Shift + Space)",
    })

    static GoToDefinition = () => lm({
        "de": "Gehe zur Definition (Strg + Click)",
        "en": "Got to definition (Ctrl + click)",
    })

    static View = () => lm({
        "de": "Ansicht",
        "en": "View",
    })

    static Theme = () => lm({
        "de": "Theme",
        "en": "Theme",
    })

    static Dark = () => lm({
        "de": "Dark",
        "en": "Dark",
    })

    static Light = () => lm({
        "de": "Light",
        "en": "Light",
    })

    static HighContrastOnOff = () => lm({
        "de": "Hoher Kontrast im Editor ein/aus",
        "en": "High contrast on/off",
    })

    static ZoomOut = () => lm({
        "de": "Zoom out (Strg + Mausrad)",
        "en": "Zoom out (Ctrl + mouse wheel)",
    })

    static ZoomNormal = () => lm({
        "de": "Zoom normal",
        "en": "Zoom normal",
    })

    static ZoomIn = () => lm({
        "de": "Zoom in (Strg + Mausrad)",
        "en": "Zoom in (Ctrl + mouse wheel)",
    })

    static LinebreakOnOff = () => lm({
        "de": "Automatischer Zeilenumbruch ein/aus",
        "en": "Automatic line break on/off",
    })

    static Repository = () => lm({
        "de": "Repository",
        "en": "Repository",
    })

    static ConfigureOwnRepositories = () => lm({
        "de": "Eigene Repositories verwalten ...",
        "en": "Configure own repositories ...",
    })

    static Checkout = () => lm({
        "de": "Workspace mit Repository verbinden (checkout) ...",
        "en": "Connect workspace to repository (checkout) ...",
    })

    static Sprites = () => lm({
        "de": "Sprites",
        "en": "Sprites",
    })

    static AddOwnSprites = () => lm({
        "de": "Spritesheet ergänzen ...",
        "en": "Add own sprites to spritesheet ...",
    })

    static SpriteCatalogue = () => lm({
        "de": "Sprite-Bilderübersicht ...",
        "en": "Sprite catalog",
    })

    static Help = () => lm({
        "de": "Hilfe",
        "en": "Help",
    })

    static VideoTutorials = () => lm({
        "de": "Kurze Video-Tutorials zur Bedienung dieser IDE",
        "en": "Short video tutorials about this IDE",
    })

    static JavaTutorial = () => lm({
        "de": "Interaktives Java-Tutorial mit vielen Beispielen",
        "en": "Interactive Java tutorial",
    })

    static APIDoc = () => lm({
        "de": "API-Dokumentation",
        "en": "API documentation",
    })

    static APIReference = () => lm({
        "de": "API-Verzeichnis",
        "en": "API reference",
    })

    static Shortcuts = () => lm({
        "de": "Tastaturkommandos (shortcuts)",
        "en": "Shortcuts",
    })

    static Changelog = () => lm({
        "de": "Online-IDE Changelog",
        "en": "Online-IDE changelog",
    })

    static Roadmap = () => lm({
        "de": "Online-IDE Roadmap",
        "en": "Online-IDE roadmap",
    })

    static EditorCommandPalette = () => lm({
        "de": "Befehlspalette (F1)",
        "en": "Editor commands (F1)",
    })

    static ChangePassword = () => lm({
        "de": "Passwort ändern ...",
        "en": "Change password ...",
    })

    static BugReport = () => lm({
        "de": "Fehler melden ...",
        "en": "Report bug ...",
    })

    static About = () => lm({
        "de": "Über die Online-IDE ...",
        "en": "About Online-IDE",
    })

    static Imprint = () => lm({
        "de": "Impressum",
        "en": "Imprint",
    })

    static PrivacyPolicy = () => lm({
        "de": "Datenschutzerklärung ...",
        "en": "Privacy policy ...",
    })

    static Version = () => lm({
        "de": "Version",
        "en": "Version",
    })

    static ClassesUserTests = () => lm({
        "de": "Klassen/Benutzer/Prüfungen ...",
        "en": "Classes/Users/Tests ...",
    })

    static ServerStatistics = () => lm({
        "de": "Serverauslastung ...",
        "en": "Server statistics ...",
    })

    static ShutdownServer = () => lm({
        "de": "Shutdown server ...",
        "en": "Shutdown server",
    })

    static ReallyShutdownServer = () => lm({
        "de": "Server wirklich herunterfahren?",
        "en": "Are you sure to shutdown server?",
    })

    static ServerShutdownDone = () => lm({
        "de": "Server erfolgreich heruntergefahren.",
        "en": "Server shutdown complete.",
    })

    /**
     * ProgramControlButtons
     */

    static ProgramRun = () => lm({
        "de": "Start",
        "en": "Run",
    })

    static ProgramPause = () => lm({
        "de": "Pause",
        "en": "Pause",
    })

    static ProgramStop = () => lm({
        "de": "Stop",
        "en": "Stop",
    })

    static ProgramStepOver = () => lm({
        "de": "Step over",
        "en": "Step over",
    })

    static ProgramStepInto = () => lm({
        "de": "Step into",
        "en": "Step into",
    })

    static ProgramStepOut = () => lm({
        "de": "Step out",
        "en": "Step out",
    })

    static ProgramRestart = () => lm({
        "de": "Restart",
        "en": "Restart",
    })

    static ProgramExecuteAllTests = () => lm({
        "de": "Alle JUnit-Tests im Workspace ausführen",
        "en": "Start all JUnit tests in current workspace",
    })

    /**
     * Helper
     */

    static HelperFolder = () => lm({
        "de": `Mit diesem Button können Sie in der Liste der Workspaces Ordner anlegen.
                    <ul>
                    <li>Bestehende Workspaces lassen sich mit der Maus in Ordner ziehen.</li>
                    <li>Wollen Sie einen Workspace in die oberste Ordnerebene bringen, so ziehen Sie ihn einfach auf den "Workspaces"-Balken.</li>
                    <li>Über das Kontextmenü der Ordner lassen sich Workspaces und Unterordner anlegen.</li>
                    </ul>`,
        "en": `Use this button to create new folders in workspace list.
                    <ul>
                    <li>Use mouse to drag/drop workspaces from folder to folder.</li>
                    <li>Move workspace to topmost folder by dragging it to "Workspaces" heading.</li>
                    <li>Create subfolders by right-click -> context menu</li>
                    </ul>`,
    })

    static HelperRepositoryButton = () => lm({
        "de": `Wenn der aktuelle Workspace mit einem Repository verknüft ist, erscheint hier der "Synchronisieren-Button". Ein Klick darauf öffnet einen Dialog, in dem die Dateien des Workspace mit denen des Repositorys abgeglichen werden können.`,
        "en": `If current workspace is connected to repository then use synchronize-button to synchronize from/to repository.`,
    })

    static HelperSpeedControl = () => lm({
        "de": `Mit dem Geschwindigkeitsregler können
                            Sie einstellen, wie schnell das Programm abläuft.
                            Bei Geschwindigkeiten bis 10 Steps/s wird
                            während des Programmablaufs der Programzeiger gezeigt
                            und die Anzeige der Variablen auf der linken
                            Seite stets aktualisiert.`,
        "en": `Use speed control to adjust program execution speed. If speed is lower than 10 steps/s, then program pointer live view is enabled.`,
    })

    static HelperNewFile = () => lm({
        "de": `Es gibt noch keine Programmdatei im Workspace. <br> Nutzen Sie den Button
                <span class='img_add-file-dark jo_inline-image'></span> um eine Programmdatei anzulegen.
                `,
        "en": `There's no file inside workspace yet. <br>Use button
               <span class='img_add-file-dark jo_inline-image'></span> to create file.
               `,
    })

    static HelperNewWorkspace = () => lm({
        "de": `Es gibt noch keinen Workspace. <br> Nutzen Sie den Button
                        <span class='img_add-workspace-dark jo_inline-image'></span> um einen Workspace anzulegen.
                        `,
        "en": `There's no workspace yet. <br> Use button
                        <span class='img_add-workspace-dark jo_inline-image'></span> to create one.
                        `,
    })

    static HelperHome = () => lm({
        "de": `Mit dem Home-Button <span class='img_home-dark jo_inline-image'></span> können Sie wieder zu Ihren eigenen Workspaces wechseln.`,
        "en": `Use home button <span class='img_home-dark jo_inline-image'></span> to switch back to your own workspaces.`,
    })

    static HelperStepButtons = () => lm({
        "de": `Mit den Buttons "Step over"
                        (<span class='img_step-over-dark jo_inline-image'></span>, Taste F8),
                        "Step into"
                        (<span class='img_step-into-dark jo_inline-image'></span>, Taste F7) und
                        "Step out"
                        (<span class='img_step-out-dark jo_inline-image'></span>, Taste F9)
                        können Sie das Programm schrittweise ausführen und sich nach jedem Schritt die Belegung der Variablen ansehen. <br>
                        <ul><li><span class='img_step-over-dark jo_inline-image'></span> Step over führt den nächsten Schritt aus, insbesondere werden Methodenaufrufe in einem Schritt durchgeführt.</li>
                        <li><span class='img_step-into-dark jo_inline-image'></span> Step into führt auch den nächsten Schritt aus, geht bei Methodenaufrufen aber in die Methode hinein und führt auch die Anweisungen innerhalb der Methode schrittweise aus.</li>
                        <li><span class='img_step-out-dark jo_inline-image'></span> Befindet sich die Programmausführung innerhalb einer Methode, so bewirkt ein Klick auf Step out, dass der Rest der Methode ausgeführt wird und die Programmausführung erst nach der Aufrufstelle der Methode anhält.</li>
                        </ul>
                        `,
        "en": `Use buttons "Step over"
                        (<span class='img_step-over-dark jo_inline-image'></span>, F8),
                        "Step into"
                        (<span class='img_step-into-dark jo_inline-image'></span>, F7) and
                        "Step out"
                        (<span class='img_step-out-dark jo_inline-image'></span>, F9)
                        to execute stepwise and inspect variables after each step.<br>
                        <ul><li><span class='img_step-over-dark jo_inline-image'></span> Step over executes next step and doesn't step into method calls.</li>
                        <li><span class='img_step-into-dark jo_inline-image'></span> Step into executes next step and steps into method calls.</li>
                        <li><span class='img_step-out-dark jo_inline-image'></span> Step out continues execution until return from current method.</li>
                        </ul>
                        `,
    })

    static HelperConsole = () => lm({
        "de": `
        Hier können Sie Anweisungen oder Terme eingeben, die nach Bestätigung mit der Enter-Taste ausgeführt/ausgewertet werden. Das Ergebnis sehen Sie im Bereich über der Eingabezeile. <br>
        Falls das Programm gerade pausiert (z.B. bei Ausführung in Einzelschritten) können Sie auch auf die Variablen des aktuellen Sichtbarkeitsbereiches zugreifen.`,
        "en": `You can type statements and expressions into the console. Use enter key to execute them. Expression values are shown above edit-line. Use debugger view to inspect variables.`,
    })

    static HelperSpritesheet = () => lm({
        "de": `Unter "Sprites -> Spritesheet ergänzen" können Sie eigene png-Grafikdateien hochladen und dann als Sprites verwenden. Die Sprites werden je Workspace bzw. je Repository gespeichert.
                    <br><br>Die Übersicht der fest in die Online-IDE integrierten Sprites finden Sie jetzt nicht mehr im Hilfe-Menü, sondern auch hier unter "Sprites->Sprite-Bilderübersicht".`,
        "en": `With "Sprites -> Add own sprites to spritesheet" you may upload png files to complement system spritesheet.`,
    })


}
