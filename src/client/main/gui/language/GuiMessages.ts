import { lm } from "../../../../tools/language/LanguageManager";

export class GuiMessages {

    /**
     * ProjectExplorer
     */
    static NewFileName = () => lm({
        "de": "Datei",
        "en": "File",
        "fr": "Fichier",
    })

    static NewWorkspaceName = () => lm({
        "de": "Workspace",
        "en": "Workspace",
        "fr": "Espace de travail",
    })

    static FilenameHasBeenTruncated = (newLength: number) => lm({
        'de': `Der Dateiname wurde auf ${newLength} Zeichen gekürzt.`,
        'en': `Filename has been truncated to ${newLength} characters.`,
        'fr': `Le nom du fichier a été tronqué à ${newLength} caractères.`,
    });

    static SynchronizeWorkspace = () => lm({
        'de': 'Workspace mit Repository synchronisieren',
        'en': 'Synchronize workspace with repository',
        'fr': 'Synchroniser workspace avec repository'
    });
    
    static cantMoveFilesToWorkspaceFolder = () => lm({
        'de': `Dateien können nicht in einen Workspace-Ordner verschoben/kopiert werden.`,
        'en': `Cannot move/copy files to workspace folder.`,
        'fr': `Impossible de déplacer/copier des fichiers vers le dossier de l'espace de travail.`,
    });
    
    static startMainProgram = () => lm({
        'de': `Starte das in dieser Datei enthaltene Hauptprogramm`,
        'en': `Start main program contained in this file`,
        'fr': `Démarrer le programme principal contenu dans ce fichier`,
    });
    

    /**
     * Main Menu
    */
    static File = () => lm({
        "de": "Datei",
        "en": "File",
        "fr": "Fichier",
    })

    static ImportWorkspace = () => lm({
        "de": "Workspace importieren",
        "en": "Import workspace",
        "fr": "Importer un espace de travail",
    })

    static ExportCurrentWorkspace = () => lm({
        "de": "Aktuellen Workspace exportieren",
        "en": "Export current workspace",
        "fr": "Exporter l'espace de travail actuel",
    })

    static NoWorkspaceSelected = () => lm({
        "de": "Kein Workspace ausgewählt.",
        "en": "No workspace selected",
        "fr": "Aucun espace de travail sélectionné.",
    })

    static ExportAllWorkspaces = () => lm({
        "de": "Alle Workspaces exportieren",
        "en": "Export all workspaces",
        "fr": "Exporter tous les espaces de travail",
    })

    static Settings = () => lm({
        "de": "Einstellungen",
        "en": "Settings",
        "fr": "Paramètres",
    })

    static SaveAndExit = () => lm({
        "de": "Speichern und beenden",
        "en": "Save and exit",
        "fr": "Enregistrer et quitter",
    })

    static Edit = () => lm({
        "de": "Bearbeiten",
        "en": "Edit",
        "fr": "Modifier",
    })

    static Undo = () => lm({
        "de": "Rückgängig (Strg + z)",
        "en": "Undo (Ctrl + z)",
        "fr": "Annuler (Ctrl + z)",
    })

    static Redo = () => lm({
        "de": "Wiederholen (Strg + y)",
        "en": "Redo (Ctrl + y)",
        "fr": "Rétablir (Ctrl + y)",
    })

    static Copy = () => lm({
        "de": "Kopieren (Strg + c)",
        "en": "Copy (Ctrl + c)",
        "fr": "Copier (Ctrl + c)",
    })

    static Cut = () => lm({
        "de": "Ausschneiden (Strg + x)",
        "en": "Cut (Ctrl + x)",
        "fr": "Couper (Ctrl + x)",
    })

    static CopyToTop = () => lm({
        "de": "Nach oben kopieren (Alt + Shift + Pfeil rauf)",
        "en": "Copy to top (Alt + Shift + Arrow up)",
        "fr": "Copier vers le haut (Alt + Maj + Flèche haut)",
    })

    static CopyToBottom = () => lm({
        "de": "Nach unten kopieren (Alt + Shift + Pfeil runter)",
        "en": "Copy to Bottom (Alt + Shift + Arrow down)",
        "fr": "Copier vers le bas (Alt + Maj + Flèche bas)",
    })

    static MoveToTop = () => lm({
        "de": "Nach oben verschieben (Alt + Pfeil rauf)",
        "en": "Move to top (Alt + Arrow up)",
        "fr": "Déplacer vers le haut (Alt + Flèche haut)",
    })

    static MoveToBottom = () => lm({
        "de": "Nach unten verschieben (Alt + Pfeil runter)",
        "en": "Move to Bottom (Alt + Arrow down)",
        "fr": "Déplacer vers le bas (Alt + Flèche bas)",
    })

    static Find = () => lm({
        "de": "Suchen... (Strg + f)",
        "en": "Find... (Ctrl + f)",
        "fr": "Rechercher... (Ctrl + f)",
    })

    static Replace = () => lm({
        "de": "Ersetzen... (Strg + h)",
        "en": "Replace... (Ctrl + h)",
        "fr": "Remplacer... (Ctrl + h)",
    })

    static ToggleComment = () => lm({
        "de": "Aus-/Einkommentieren (Strg + #)",
        "en": "Toggle comment (Ctrl + +)",
        "fr": "Activer/Désactiver le commentaire (Ctrl + #)",
    })

    static AutoFormat = () => lm({
        "de": "Dokument automatisch formatieren (Alt + Shift + f)",
        "en": "Auto format (Alt + Shift + f)",
        "fr": "Formater automatiquement (Alt + Maj + f)",
    })

    static FindCorrespondingBracket = () => lm({
        "de": "Finde zugehörige Klammer (Strg + k)",
        "en": "Find corresponding bracket (Ctrl + k)",
        "fr": "Trouver la parenthèse correspondante (Ctrl + k)",
    })

    static FoldAll = () => lm({
        "de": "Alles zusammenfalten",
        "en": "Fold all",
        "fr": "Tout replier",
    })

    static UnfoldAll = () => lm({
        "de": "Alles auffalten",
        "en": "Unfold all",
        "fr": "Tout déplier",
    })

    static TriggerSuggest = () => lm({
        "de": "Vorschlag auslösen (Strg + Leertaste)",
        "en": "Trigger suggestion (Ctrl + Space)",
        "fr": "Déclencher la suggestion (Ctrl + Espace)",
    })

    static TriggerParameterHint = () => lm({
        "de": "Parameterhilfe (Strg + Shift + Leertaste)",
        "en": "Trigger parameter hint (Ctrl + Shift + Space)",
        "fr": "Déclencher l'aide aux paramètres (Ctrl + Maj + Espace)",
    })

    static GoToDefinition = () => lm({
        "de": "Gehe zur Definition (Strg + Click)",
        "en": "Got to definition (Ctrl + click)",
        "fr": "Aller à la définition (Ctrl + Clic)",
    })

    static View = () => lm({
        "de": "Ansicht",
        "en": "View",
        "fr": "Affichage",
    })

    static Theme = () => lm({
        "de": "Theme",
        "en": "Theme",
        "fr": "Thème",
    })

    static Dark = () => lm({
        "de": "Dark",
        "en": "Dark",
        "fr": "Sombre",
    })

    static Light = () => lm({
        "de": "Light",
        "en": "Light",
        "fr": "Clair",
    })

    static HighContrastOnOff = () => lm({
        "de": "Hoher Kontrast im Editor ein/aus",
        "en": "High contrast on/off",
        "fr": "Contraste élevé dans l'éditeur activé/désactivé",
    })

    static ZoomOut = () => lm({
        "de": "Zoom out (Strg + Mausrad)",
        "en": "Zoom out (Ctrl + mouse wheel)",
        "fr": "Dézoomer (Ctrl + molette de la souris)",
    })

    static ZoomNormal = () => lm({
        "de": "Zoom normal",
        "en": "Zoom normal",
        "fr": "Zoom normal",
    })

    static ZoomIn = () => lm({
        "de": "Zoom in (Strg + Mausrad)",
        "en": "Zoom in (Ctrl + mouse wheel)",
        "fr": "Zoomer (Ctrl + molette de la souris)",
    })

    static LinebreakOnOff = () => lm({
        "de": "Automatischer Zeilenumbruch ein/aus",
        "en": "Automatic line break on/off",
        "fr": "Retour à la ligne automatique activé/désactivé",
    })

    static Repository = () => lm({
        "de": "Repository",
        "en": "Repository",
        "fr": "Dépôt",
    })

    static ConfigureOwnRepositories = () => lm({
        "de": "Eigene Repositories verwalten ...",
        "en": "Configure own repositories ...",
        "fr": "Gérer vos propres dépôts ...",
    })

    static Checkout = () => lm({
        "de": "Workspace mit Repository verbinden (checkout) ...",
        "en": "Connect workspace to repository (checkout) ...",
        "fr": "Connecter l'espace de travail au dépôt (checkout) ...",
    })

    static importRepository = () => lm({
        'de': `Repository aus Datei importieren ...`,
        'en': `Import repository from file ...`,
    });
    

    static Sprites = () => lm({
        "de": "Sprites",
        "en": "Sprites",
        "fr": "Sprites",
    })

    static AddOwnSprites = () => lm({
        "de": "Spritesheet ergänzen ...",
        "en": "Add own sprites to spritesheet ...",
        "fr": "Ajouter vos propres sprites à la feuille de sprites ...",
    })

    static SpriteCatalogue = () => lm({
        "de": "Sprite-Bilderübersicht ...",
        "en": "Sprite catalog",
        "fr": "Catalogue de sprites ...",
    })

    static Help = () => lm({
        "de": "Hilfe",
        "en": "Help",
        "fr": "Aide",
    })

    static VideoTutorials = () => lm({
        "de": "Kurze Video-Tutorials zur Bedienung dieser IDE",
        "en": "Short video tutorials about this IDE",
        "fr": "Courts tutoriels vidéo sur l'utilisation de cet IDE",
    })

    static JavaTutorial = () => lm({
        "de": "Interaktives Java-Tutorial mit vielen Beispielen",
        "en": "Interactive Java tutorial",
        "fr": "Tutoriel Java interactif avec de nombreux exemples",
    })

    static APIDoc = () => lm({
        "de": "API-Dokumentation",
        "en": "API documentation",
        "fr": "Documentation API",
    })

    static APIReference = () => lm({
        "de": "API-Verzeichnis",
        "en": "API reference",
        "fr": "Référence API",
    })

    static Shortcuts = () => lm({
        "de": "Tastaturkommandos (shortcuts)",
        "en": "Shortcuts",
        "fr": "Raccourcis clavier",
    })

    static Changelog = () => lm({
        "de": "Online-IDE Changelog",
        "en": "Online-IDE changelog",
        "fr": "Journal des modifications de l'IDE en ligne",
    })

    static Roadmap = () => lm({
        "de": "Online-IDE Roadmap",
        "en": "Online-IDE roadmap",
        "fr": "Feuille de route de l'IDE en ligne",
    })

    static EditorCommandPalette = () => lm({
        "de": "Befehlspalette (F1)",
        "en": "Editor commands (F1)",
        "fr": "Palette de commandes de l'éditeur (F1)",
    })

    static ChangePassword = () => lm({
        "de": "Passwort ändern ...",
        "en": "Change password ...",
        "fr": "Changer le mot de passe ...",
    })

    static BugReport = () => lm({
        "de": "Fehler melden ...",
        "en": "Report bug ...",
        "fr": "Signaler un bug ...",
    })

    static About = () => lm({
        "de": "Über die Online-IDE ...",
        "en": "About Online-IDE",
        "fr": "À propos de l'IDE en ligne ...",
    })

    static Imprint = () => lm({
        "de": "Impressum",
        "en": "Imprint",
        "fr": "Mentions légales",
    })

    static PrivacyPolicy = () => lm({
        "de": "Datenschutzerklärung ...",
        "en": "Privacy policy ...",
        "fr": "Politique de confidentialité ...",
    })

    static Version = () => lm({
        "de": "Version",
        "en": "Version",
        "fr": "Version",
    })

    static ClassesUserTests = () => lm({
        "de": "Klassen/Benutzer/Prüfungen ...",
        "en": "Classes/Users/Tests ...",
        "fr": "Classes/Utilisateurs/Tests ...",
    })

    static ServerStatistics = () => lm({
        "de": "Serverauslastung ...",
        "en": "Server statistics ...",
        "fr": "Statistiques du serveur ...",
    })

    static ShutdownServer = () => lm({
        "de": "Shutdown server ...",
        "en": "Shutdown server",
        "fr": "Arrêter le serveur ...",
    })

    static ReallyShutdownServer = () => lm({
        "de": "Server wirklich herunterfahren?",
        "en": "Are you sure to shutdown server?",
        "fr": "Voulez-vous vraiment arrêter le serveur ?",
    })

    static ServerShutdownDone = () => lm({
        "de": "Server erfolgreich heruntergefahren.",
        "en": "Server shutdown complete.",
        "fr": "Arrêt du serveur terminé avec succès.",
    })

    /**
     * ProgramControlButtons
     */

    static ProgramRun = () => lm({
        "de": "Start",
        "en": "Run",
        "fr": "Exécuter",
    })

    static ProgramPause = () => lm({
        "de": "Pause",
        "en": "Pause",
        "fr": "Pause",
    })

    static ProgramStop = () => lm({
        "de": "Stop",
        "en": "Stop",
        "fr": "Arrêter",
    })

    static ProgramStepOver = () => lm({
        "de": "Step over",
        "en": "Step over",
        "fr": "Pas à pas (passer)",
    })

    static ProgramStepInto = () => lm({
        "de": "Step into",
        "en": "Step into",
        "fr": "Pas à pas (entrer)",
    })

    static ProgramStepOut = () => lm({
        "de": "Step out",
        "en": "Step out",
        "fr": "Pas à pas (sortir)",
    })

    static ProgramGotoCursor = () => lm({
        "de": "Goto cursor",
        "en": "Goto cursor",
        "fr": "Aller au curseur",
    })

    static ProgramRestart = () => lm({
        "de": "Restart",
        "en": "Restart",
        "fr": "Redémarrer",
    })

    static ProgramExecuteAllTests = () => lm({
        "de": "Alle JUnit-Tests im Workspace ausführen",
        "en": "Start all JUnit tests in current workspace",
        "fr": "Exécuter tous les tests JUnit dans l'espace de travail actuel",
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
        "fr": `Avec ce bouton, vous pouvez créer des dossiers dans la liste des espaces de travail.
                    <ul>
                    <li>Les espaces de travail existants peuvent être déplacés par glisser-déposer vers des dossiers.</li>
                    <li>Si vous souhaitez placer un espace de travail au niveau supérieur, faites-le simplement glisser sur la barre "Espaces de travail".</li>
                    <li>Via le menu contextuel des dossiers, vous pouvez créer des espaces de travail et des sous-dossiers.</li>
                    </ul>`,
    })

    static HelperRepositoryButton = () => lm({
        "de": `Wenn der aktuelle Workspace mit einem Repository verknüft ist, erscheint hier der "Synchronisieren-Button". Ein Klick darauf öffnet einen Dialog, in dem die Dateien des Workspace mit denen des Repositorys abgeglichen werden können.`,
        "en": `If current workspace is connected to repository then use synchronize-button to synchronize from/to repository.`,
        "fr": `Si l'espace de travail actuel est lié à un dépôt, le bouton "Synchroniser" apparaît ici. Un clic dessus ouvre une boîte de dialogue permettant de synchroniser les fichiers de l'espace de travail avec ceux du dépôt.`,
    })

    static HelperSpeedControl = () => lm({
        "de": `Mit dem Geschwindigkeitsregler können
                            Sie einstellen, wie schnell das Programm abläuft.
                            Bei Geschwindigkeiten bis 10 Steps/s wird
                            während des Programmablaufs der Programzeiger gezeigt
                            und die Anzeige der Variablen auf der linken
                            Seite stets aktualisiert.`,
        "en": `Use speed control to adjust program execution speed. If speed is lower than 10 steps/s, then program pointer live view is enabled.`,
        "fr": `Le régulateur de vitesse vous permet de régler la rapidité d'exécution du programme. Pour des vitesses allant jusqu'à 10 étapes/s, le pointeur de programme est affiché pendant l'exécution et l'affichage des variables sur le côté gauche est toujours mis à jour.`,
    })

    static HelperNewFile = () => lm({
        "de": `Es gibt noch keine Programmdatei im Workspace. <br> Nutzen Sie den Button
                <span class='img_add-file-dark jo_inline-image'></span> um eine Programmdatei anzulegen.
                `,
        "en": `There's no file inside workspace yet. <br>Use button
               <span class='img_add-file-dark jo_inline-image'></span> to create file.
               `,
        "fr": `Il n'y a pas encore de fichier programme dans l'espace de travail. <br> Utilisez le bouton
               <span class='img_add-file-dark jo_inline-image'></span> pour créer un fichier programme.
               `,
    })

    static HelperNewWorkspace = () => lm({
        "de": `Es gibt noch keinen Workspace. <br> Nutzen Sie den Button
                        <span class='img_add-workspace-dark jo_inline-image'></span> um einen Workspace anzulegen.
                        `,
        "en": `There's no workspace yet. <br> Use button
                        <span class='img_add-workspace-dark jo_inline-image'></span> to create one.
                        `,
        "fr": `Il n'y a pas encore d'espace de travail. <br> Utilisez le bouton
                        <span class='img_add-workspace-dark jo_inline-image'></span> pour en créer un.
                        `,
    })

    static HelperHome = () => lm({
        "de": `Mit dem Home-Button <span class='img_home-dark jo_inline-image'></span> können Sie wieder zu Ihren eigenen Workspaces wechseln.`,
        "en": `Use home button <span class='img_home-dark jo_inline-image'></span> to switch back to your own workspaces.`,
        "fr": `Avec le bouton Accueil <span class='img_home-dark jo_inline-image'></span>, vous pouvez revenir à vos propres espaces de travail.`,
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
        "fr": `Avec les boutons "Pas à pas (passer)"
                        (<span class='img_step-over-dark jo_inline-image'></span>, Touche F8),
                        "Pas à pas (entrer)"
                        (<span class='img_step-into-dark jo_inline-image'></span>, Touche F7) et
                        "Pas à pas (sortir)"
                        (<span class='img_step-out-dark jo_inline-image'></span>, Touche F9)
                        vous pouvez exécuter le programme pas à pas et visualiser l'affectation des variables après chaque étape. <br>
                        <ul><li><span class='img_step-over-dark jo_inline-image'></span> "Pas à pas (passer)" exécute l'étape suivante, en particulier les appels de méthode sont effectués en une seule étape.</li>
                        <li><span class='img_step-into-dark jo_inline-image'></span> "Pas à pas (entrer)" exécute également l'étape suivante, mais lors d'appels de méthode, il entre dans la méthode et exécute également les instructions à l'intérieur de la méthode pas à pas.</li>
                        <li><span class='img_step-out-dark jo_inline-image'></span> Si l'exécution du programme se trouve à l'intérieur d'une méthode, un clic sur "Pas à pas (sortir)" fait en sorte que le reste de la méthode soit exécuté et que l'exécution du programme ne s'arrête qu'après le point d'appel de la méthode.</li>
                        </ul>
                        `,
    })

    static HelperConsole = () => lm({
        "de": `
        Hier können Sie Anweisungen oder Terme eingeben, die nach Bestätigung mit der Enter-Taste ausgeführt/ausgewertet werden. Das Ergebnis sehen Sie im Bereich über der Eingabezeile. <br>
        Falls das Programm gerade pausiert (z.B. bei Ausführung in Einzelschritten) können Sie auch auf die Variablen des aktuellen Sichtbarkeitsbereiches zugreifen.`,
        "en": `You can type statements and expressions into the console. Use enter key to execute them. Expression values are shown above edit-line. Use debugger view to inspect variables.`,
        "fr": `
        Ici, vous pouvez saisir des instructions ou des expressions qui seront exécutées/évaluées après confirmation avec la touche Entrée. Le résultat s'affiche dans la zone au-dessus de la ligne de saisie. <br>
        Si le programme est en pause (par exemple, lors d'une exécution pas à pas), vous pouvez également accéder aux variables de la portée actuelle.`,
    })

    static HelperSpritesheet = () => lm({
        "de": `Unter "Sprites -> Spritesheet ergänzen" können Sie eigene png-Grafikdateien hochladen und dann als Sprites verwenden. Die Sprites werden je Workspace bzw. je Repository gespeichert.
                    <br><br>Die Übersicht der fest in die Online-IDE integrierten Sprites finden Sie jetzt nicht mehr im Hilfe-Menü, sondern auch hier unter "Sprites->Sprite-Bilderübersicht".`,
        "en": `With "Sprites -> Add own sprites to spritesheet" you may upload png files to complement system spritesheet.`,
        "fr": `Sous "Sprites -> Ajouter à la feuille de sprites", vous pouvez télécharger vos propres fichiers graphiques png et les utiliser comme sprites. Les sprites sont enregistrés par espace de travail ou par dépôt.
                    <br><br>L'aperçu des sprites intégrés à l'IDE en ligne ne se trouve plus dans le menu d'aide, mais ici aussi sous "Sprites -> Catalogue de sprites".`,
    })

}