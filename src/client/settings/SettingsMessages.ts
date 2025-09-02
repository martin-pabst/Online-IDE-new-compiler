import { lm } from "../../tools/language/LanguageManager";

export class SettingsMessages {

    static Saving = () => lm({
        'de': 'Speichere...',
        'en': 'saving...',
        'fr': 'enregistrement...'
    });
    
    static Saved = () => lm({
        'de': 'Gespeichert',
        'en': 'saved',
        'fr': 'enregistré'
    });
    

    static OptionDefault = () => lm({
        'de': 'Standard',
        'en': 'default',
        'fr': 'par défaut'
    });

    static OptionTrue = () => lm({
        'de': 'Ja',
        'en': 'true',
        'fr': 'Oui'
    });

    static OptionFalse = () => lm({
        'de': 'Nein',
        'en': 'false',
        'fr': 'Non'
    });
    

    static CloseButton = () => lm({
        'de': 'Schließen',
        'en': 'Close',
        'fr': 'Fermer'
    });

    static SettingsHeading = () => lm({
        'de': 'Einstellungen',
        'en': 'Settings',
        'fr': 'Paramètres'
    })

    static UserSettingsTabHeading = () => lm({
        'de': 'Meine Einstellungen',
        'en': 'My Settings',
        'fr': 'Mes paramètres'
    });

    static ClassSettingsTabHeading = () => lm({
        'de': 'Klassen-Einstellungen für ',
        'en': 'Class Settings for ',
        'fr': 'Paramètres de la classe pour '
    });

    static SchoolSettingsTabHeading = () => lm({
        'de': 'Schul-Einstellungen',
        'en': 'School Settings',
        'fr': 'Paramètres de l\'école'
    });

    static ScopeUser = () => lm({
        'de': 'Benutzer',
        'en': 'User',
        'fr': 'Utilisateur'
    });

    static ScopeClass = () => lm({
        'de': 'Klasse',
        'en': 'Class',
        'fr': 'Classe'
    });

    static ScopeSchool = () => lm({
        'de': 'Schule',
        'en': 'School',
        'fr': 'École'
    }); 

    static EditorSettingsName = () => lm({
        'de': 'Editoreinstellungen',
        'en': 'Editor Settings',
        'fr': 'Paramètres de l\'éditeur'
    });

    static EditorSettingsDescription = () => lm({
        'de': 'Hier können Sie die Einstellungen des Editors anpassen.',
        'en': 'Here you can adjust the editor settings.',
        'fr': 'Ici, vous pouvez ajuster les paramètres de l\'éditeur.'
    });

    static HoverVerbosityName = () => lm({
        'de': 'Texte beim Hovern über Code',
        'en': 'Hover-Verbosity',
        'fr': 'Verbosité des infobulles'
    });

    static HoverVerbosityDescription = () => lm({
        'de': 'Menge an Informationen, die in Hover-Infoballons angezeigt werden.',
        'en': 'Information amount displayed in hover tooltips.',
        'fr': 'Quantité d\'informations affichées dans les infobulles.'
    });

    static ShowHelpOnKeywordsAndOperators = () => lm({
        'de': 'Hilfstexte für Schlüsselwörter und Operatoren anzeigen',
        'en': 'Show help texts for keywords and operators',
        'fr': 'Afficher les textes d\'aide pour les mots-clés et les opérateurs'
    });
    
    static ShowMethodDeclaration = () => lm({
        'de': 'Methodendeklarationen anzeigen',
        'en': 'Show method declarations',
        'fr': 'Afficher les déclarations de méthodes'
    });

    static None = () => lm({
        'de': 'Keine',
        'en': 'None',
        'fr': 'Aucun'
    });

    static Declarations = () => lm({
        'de': 'Deklarationen',
        'en': 'Declarations',
        'fr': 'Déclarations'
    });

    static DeclarationsAndComments = () => lm({
        'de': 'Deklarationen und Kommentare',
        'en': 'Declarations and Comments',
        'fr': 'Déclarations et commentaires'
    });

    static ShowClassDeclaration = () => lm({
        'de': 'Klassendeklarationen anzeigen',
        'en': 'Show class declaration',
        'fr': 'Afficher la déclarations de la classes'
    });
    
    static TypingAssistanceName = () => lm({
        'de': 'Unterstützung bei der Eingabe von Code',
        'en': 'Typing Assistance',
        'fr': 'Assistance à la saisie de code'
    });

    static TypingAssistanceDescription = () => lm({
        'de': 'Hier können Sie die Eingabeunterstützung des Editors anpassen.',
        'en': 'Here you can adjust the typing assistance of the editor.',
        'fr': 'Ici, vous pouvez ajuster l\'assistance à la saisie de l\'éditeur.'
    });
    
    static AutoClosingBracketsName = () => lm({
        'de': 'Automatisches Schließen von Klammern',
        'en': 'Auto Closing Brackets',
        'fr': 'Fermeture automatique des parenthèses'
    });

    static AutoClosingBracketsDescription = () => lm({
        'de': 'Bei Eingabe von öffnenden Klammern wird automatisch die schließende Klammer hinzugefügt.',
        'en': 'Automatically add closing brackets when typing opening brackets.',
        'fr': 'Ajoute automatiquement les parenthèses fermantes lors de la saisie des parenthèses ouvrantes.'
    });
    
    static AutoClosingBracketsAlways = () => lm({
        'de': 'Immer',
        'en': 'Always',
        'fr': 'Toujours'
    });

    static AutoClosingBracketsNever = () => lm({
        'de': 'Nie',
        'en': 'Never',
        'fr': 'Jamais'
    });

    static AutoClosingBracketsBeforeWhitespace = () => lm({
        'de': 'Nur vor Leerzeichen',
        'en': 'Only before whitespace',
        'fr': 'Seulement avant les espaces'
    });
    
    static ClassDiagramSettingsName = () => lm({
        'de': 'Klassendiagramm',
        'en': 'Class Diagram',
        'fr': 'Diagramme de classes'
    });

    static ClassDiagramSettingsDescription = () => lm({
        'de': 'Hier können Sie die Einstellungen für das Klassendiagramm anpassen.',
        'en': 'Here you can adjust the settings for the class diagram.',
        'fr': 'Ici, vous pouvez ajuster les paramètres du diagramme de classes.'
    });

    static ClassDiagramTypeConventionName = () => lm({
        'de': 'Darstellungsweise von Datentypen',
        'en': 'Type Representation',
        'fr': 'Représentation des types'
    });
    
    static ClassDiagramBackground = () => lm({
        'de': 'Hintergrund beim Exportieren als png-Datei',
        'en': 'Background when exporting as png file',
        'fr': 'Arrière-plan lors de l\'exportation en fichier png'
    });

    static ClassDiagramBackgroundDescription = () => lm({
        'de': `Legt fest, ob der Hintergrund des Klassendiagramms beim Exportieren als png-Datei transparent oder weiß sein soll.`,
        'en': `Determines whether the background of the class diagram should be transparent or white when exporting as a png file.`,
        'fr': `Détermine si l'arrière-plan du diagramme de classes doit`
    });
    

    static ClassDiagramTypeConventionDescription = () => lm({
        'de': 'Wenn Datentypen im Klassendiagramm angezeigt werden, kann dies entweder in der Art von Java (z.B. String name) erfolgen oder in der Art von Pascal (name: String).',
        'en': 'If data types are displayed in the class diagram, they can be shown in either Java style (e.g., String name) or Pascal style (name: String).',
        'fr': 'Si les types de données sont affichés dans le diagramme de classes, ils peuvent être présentés dans le style Java (par exemple, String name) ou dans le style Pascal (name: String).'
    });
    
    static ClassDiagramTypeConventionJava = () => lm({
        'de': 'Java-Stil (z.B. String name)',
        'en': 'Java Style (e.g., String name)',
        'fr': 'Style Java (par exemple, String name)'
    });

    static ClassDiagramTypeConventionPascal = () => lm({
        'de': 'Pascal-Stil (name: String)',
        'en': 'Pascal Style (name: String)',
        'fr': 'Style Pascal (name: String)'
    });
    
    static ClassDiagramBackgroundTransparent = () => lm({
        'de': `durchsichtig`,
        'en': `transparent`,
        'fr': `transparent`
    });

    static ClassDiagramBackgroundWhite = () => lm({
        'de': `weiß`,
        'en': `white`,
        'fr': `blanc`
    });
        
    static ExplorerSettingsName = () => lm({
        'de': `Explorer-Einstellungen`,
        'en': `Explorer settings`
    });

    static ExplorerSettingsDescription = () => lm({
        'de': `Einstellungen für den Datei- und Workspaceexplorer (im Hauptfenster links).`,
        'en': `Settings for file- and workspace explorer (in the main window on the left).`
    });
    
    static ExplorerFileOrderName = () => lm({
        'de': `Sortierung des Dateibaums`,
        'en': `Order of file treeview`
    });

    static ExplorerFileOrderDescription = () => lm({
        'de': `Hier können Sie einstellen, ob der Dateibaum grundsätzlich alphabetisch sortiert werden soll oder der Nutzer durch drag and drop eine davon abweichende Sortierung festlegen kann.`,
        'en': `You can set here whether the file tree should be sorted alphabetically by default or whether the user can define a different sorting by drag and drop.`
    });
    
    static ExplorerWorkspaceOrderName = () => lm({
        'de': `Sortierung des Workspacebaums`,
        'en': `Order of workspace treeview`
    });

    static ExplorerWorkspaceOrderDescription = () => lm({
        'de': `Hier können Sie einstellen, ob der Workspacebaum grundsätzlich alphabetisch sortiert werden soll oder der Nutzer durch drag and drop eine davon abweichende Sortierung festlegen kann.`,
        'en': `You can set here whether the workspace tree should be sorted alphabetically by default or whether the user can define a different sorting by drag and drop.`
    });
    
    static ExplorerOrderComparator = () => lm({
        'de': `Immer alphabetisch`,
        'en': `Always alphabetical`,
        'fr': `Toujours alphabétique`
    });

    static ExplorerOrderUserDefined = () => lm({
        'de': `Nutzerdefinierte Sortierung`,
        'en': `User-defined order`,
        'fr': `Ordre défini par l'utilisateur`
    });
    

}