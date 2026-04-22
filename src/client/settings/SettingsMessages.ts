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

    static ShowStructureStatementHelp = () => lm({
        'de': `Hilfe für Strukturanweisungen anzeigen`,
        'en': `Show help for structure statements`,
        'fr': `Afficher l'aide pour les instructions de structure`
    });
    

    static TypingAssistanceName = () => lm({
        'de': 'Unterstützung bei der Eingabe von Code',
        'en': 'Typing Assistance',
        'fr': 'Assistance à la saisie de code'
    });

    static EditorQuickFixSettingsName = () => lm({
        'de': 'Quick-Fix-Einstellungen',
        'en': 'Quick Fix Settings',
        'fr': 'Paramètres de correction rapide'
     });

     static EditorQuickFixSettingsDescription = () => lm({
        'de': 'Hier können Sie einstellen, welche Quick-Fixes angeboten werden sollen. Im Gegensatz zu den meisten anderen Einstellungen gilt hier: Klasseneinstellung vor Schuleinstellung vor User-Einstellung.',
        'en': 'Here you can set which quick fixes should be offered. In contrast to most other settings, here class setting takes precedence over school setting which takes precedence over user setting.',
        'fr': 'Ici, vous pouvez définir les corrections rapides qui doivent être proposées. Contrairement à la plupart des autres paramètres, ici la configuration de la classe a la priorité sur la configuration de l\'école qui a la priorité sur la configuration de l\'utilisateur.'
     });

     static EditorQuickFixGetterSetterName = () => lm({
        'de': 'Automatische Erstellung von Getter- und Setter-Methoden',
        'en': 'Automatic generation of getter and setter methods',
        'fr': 'Génération automatique des méthodes getter et setter'
     });

        static EditorQuickFixGetterSetterDescription = () => lm({
        'de': 'Befindet sich der Cursor in einem Attribut einer Klasse, so erscheint daneben eine Glühbirne, über die angeboten wird, automatisch eine Getter- und Setter-Methode für dieses Attribut zu erstellen.',
        'en': 'If the cursor is on an attribute of a class, a light bulb appears next to it, offering to automatically create a getter and setter method for that attribute.',
        'fr': 'Si le curseur se trouve sur un attribut d\'une classe, une ampoule apparaît à côté, offrant de créer automatiquement une méthode getter et setter pour cet attribut.'
    });

    static offer = () => lm({
        'de': 'Anbieten',
        'en': 'Offer',
        'fr': 'Proposer'
    });

    static dontOffer = () => lm({
        'de': 'Nicht anbieten',
        'en': 'Do not offer',
        'fr': 'Ne pas proposer'
    });

    static EditorQuickFixGenerateConstructorName = () => lm({
        'de': 'Automatische Erstellung von Konstruktoren',
        'en': 'Automatic generation of constructors',
        'fr': 'Génération automatique des constructeurs'
     });

        static EditorQuickFixGenerateConstructorDescription = () => lm({
            'de': 'Befindet sich der Cursor in einer Klasse, aber nicht in einer Methode, so erscheint in der kontextsensitiven Hilfe (<Strg> + <Leertaste>) ein Menüpunkt zur automatischen Erstellung eines Konstruktors.',
            'en': 'If the cursor is in a class but not in a method, a menu item for automatically creating a constructor appears in the context-sensitive help (<Ctrl> + <Space>).',
            'fr': 'Si le curseur se trouve dans une classe mais pas dans une méthode, un élément de menu pour créer automatiquement un constructeur apparaît dans l\'aide contextuelle (<Ctrl> + <Espace>).'
        })


    static EditorViewSettings = () => lm({
        'de': `Anzeigeeinstellungen des Editors`,
        'en': `Editor View Settings`,
        'fr': `Paramètres d'affichage de l'éditeur`
    });

    static EditorViewSettingsDescription = () => lm({
        'de': `Hier können Sie die Anzeigeeinstellungen des Editors anpassen.`,
        'en': `You can adjust the editor view settings here.`,
        'fr': `Vous pouvez ajuster les paramètres d'affichage de l'éditeur ici.`
    });    

    static EditorFormatterSettings = () => lm({
        'de': `Code-Formatter-Einstellungen`,
        'en': `Editor Formatter Settings`,
        'fr': `Paramètres du formateur de code`
    });

    static EditorFormatterSettingsDescription = () => lm({
        'de': `Hier können Sie die Einstellungen für den Code-Formatter anpassen.`,
        'en': `Here you can adjust the settings for the code formatter.`,
        'fr': `Ici, vous pouvez ajuster les paramètres du formateur de code.`
    });

    static ForceSpacesAfterIfForWhileDoName = () => lm({
        'de': `Anzahl von Leerzeichen nach if, for, while und do erzwingen`,
        'en': `Force number of spaces after if, for, while and do`,
        'fr': `Forcer le nombre d'espaces après if, for, while et do`
    });

    static ForceSpacesAfterIfForWhileDoDescription = () => lm({
        'de': `Erzwinge eine bestimmte Anzahl von Leerzeichen nach if, for, while und do`,
        'en': `Force a specific number of spaces after if, for, while and do`,
        'fr': `Forcer un nombre spécifique d'espaces après if, for, while et do`
    });

    static one = () => lm({
        'de': `1`,
        'en': `1`,
        'fr': `1`
    });

    static zero = () => lm({
        'de': `0`,
        'en': `0`,
        'fr': `0`
    });

    static no = () => lm({
        'de': `Nein, nicht erzwingen`,
        'en': `No, do not force`,
        'fr': `Non, ne pas forcer`
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

    static BracketPairLines = () => lm({
        'de': `Linien zwischen Klammerpaaren anzeigen`,
        'en': `Display lines between bracket pairs`,
        'fr': `Afficher les lignes entre les paires de parenthèses`
    });

    static StickyScroll = () => lm({
        'de': `Sticky Scroll`,
        'en': `Sticky Scroll`,
        'fr': `Défilement fixe`
    }); 

    static StickyScrollDescription = () => lm({
        'de': `Zeigt die aktuellen Blocküberschriften (z.B. Methoden- oder Klassennamen) immer oben im Editor an, auch wenn diese nicht mehr im sichtbaren Bereich sind.`,
        'en': `Always displays the current block headers (e.g., method or class names) at the top of the editor, even when they are no longer in the visible area.`,
        'fr': `Affiche toujours les en-têtes de bloc actuels (par exemple, les noms de méthodes ou de classes) en haut de l'éditeur, même lorsqu'ils ne sont plus dans la zone visible.`
    });

    static BracketPairLinesDescription = () => lm({
        'de': `Vertikale Linien zwischen passenden Klammerpaaren anzeigen, gegebenfalls um Unterstreichung des Scope-Beginns.`,
        'en': `Display vertical lines between matching bracket pairs, possibly with underlined scope-start.`,
        'fr': `Afficher des lignes verticales entre les paires de parenthèses correspondantes, éventuellement avec le début du scope souligné.`
    });

    static BracketPairLinesOff = () => lm({
        'de': `Keine Linien anzeigen`,
        'en': `Do not display lines`,
        'fr': `Ne pas afficher de lignes`
    });

    static BracketPairLinesVertical = () => lm({
        'de': `Vertikale Linien anzeigen (entspricht Scope)`,
        'en': `Display vertical lines (according to scope)`,
        'fr': `Afficher des lignes verticales (selon le scope)`
    });

    static BracketPairLinesVerticalAndUnderlined = () => lm({
        'de': `Vertikale Linien und Unterstreichung anzeigen`,
        'en': `Display vertical lines and underline`,
        'fr': `Afficher des lignes verticales et souligner`
    });
    
    static AutoSemicolonsName = () => lm({
        'de': `Automatisches Ergänzen von Strichpunkten`,
        'en': `Auto Semicolons`,
        'fr': `Point-virgules automatiques`
    });

    static AutoSemicolonsDescription = () => lm({
        'de': `Fehlende Strichpunkte am Ende der Zeile werden in den meisten Fällen automatisch ergänzt.`,
        'en': `Missing semicolons at the end of the line are automatically added in most cases.`,
        'fr': `Les points-virgules manquants à la fin de la ligne sont automatiquement ajoutés dans la plupart des cas.`
    });
    
    static On = () => lm({
        'de': `Ein`,
        'en': `On`,
        'fr': `Activé`
    });

    static Off = () => lm({
        'de': `Aus`,
        'en': `Off`,
        'fr': `Désactivé`
    });
    

    static AutoClosingQuotesName = () => lm({
        'de': 'Automatisches Schließen von Anführungszeichen',
        'en': 'Auto Closing Quotes',
        'fr': 'Fermeture automatique des guillemets'
    });

    static AutoClosingBracketsDescription = () => lm({
        'de': 'Bei Eingabe von öffnenden Klammern wird automatisch die schließende Klammer hinzugefügt.',
        'en': 'Automatically add closing brackets when typing opening brackets.',
        'fr': 'Ajoute automatiquement les parenthèses fermantes lors de la saisie des parenthèses ouvrantes.'
    });
    
    static AutoClosingQuotesDescription = () => lm({
        'de': 'Bei Eingabe eines Anführungszeichens wird automatisch ein zweites hinter dem Cursor hinzugefügt.',
        'en': 'Automatically add a second quote behind the cursor when typing a quote.',
        'fr': 'Ajoute automatiquement un deuxième guillemet derrière le curseur lors de la saisie d\'un guillemet.'
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

    static classDiagramOmitVoidReturnType = () => lm({
        'de': 'Rückgabetyp "void" im Klassendiagramm weglassen',
        'en': 'Omit "void" return type in class diagram',
        'fr': 'Omettre le type de retour "void" dans le diagramme de classes'
    });

    static ClassDiagramOmitVoidReturnTypeDescription = () => lm({
        'de': `Legt fest, ob im Klassendiagramm bei Methoden der Rückgabetyp "void" weggelassen werden soll.`,
        'en': `Determines whether the return type "void" should be omitted in the class diagram for methods.`,
        'fr': `Détermine si le type de retour "void" doit être omis dans le diagramme de classes pour les méthodes.`
    });

    static show = () => lm({
        'de': `anzeigen`,
        'en': `show`,
        'fr': `afficher`
    });

    static omit = () => lm({
        'de': `weglassen`,
        'en': `omit`,
        'fr': `omettre`
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
        
    static CompilerSettingsName = () => lm({
        'de': `Compiler-Einstellungen`,
        'en': `Compiler settings`
    });

    static CompilerSettingsDescription = () => lm({
        'de': `Hier können Sie die Einstellungen des Compilers vornehmen.`,
        'en': `Here you can adjust the compiler settings.`
    });

    static ExplorerSettingsName = () => lm({
        'de': `Explorer-Einstellungen`,
        'en': `Explorer settings`
    });

    static ExplorerSettingsDescription = () => lm({
        'de': `Einstellungen für den Datei- und Workspaceexplorer (im Hauptfenster links).`,
        'en': `Settings for file- and workspace explorer (in the main window on the left).`
    });
    
    static CompilerShadowedSymbolErrorLevelName = () => lm({
        'de': `Errorlevel bei verdeckten Symbolen`,
        'en': `Error level for shadowed symbols`
    });

    static CompilerShadowedSymbolErrorLevelDescription = () => lm({
        'de': `Welches Errorlevel soll der Fehler haben, wenn eine Variable in einem inneren Scope eine andere gleichnamige Variable in einem äußeren Scope verdeckt?`,
        'en': `What error level should the error have if a variable in an inner scope shadows another variable with the same name in an outer scope?`
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
    
    static ErrorLevelIgnore = () => lm({    
        'de': `Ignorieren`,
        'en': `Ignore`,
        'fr': `Ignorer`
    });

    static ErrorLevelWarning = () => lm({    
        'de': `Warnung`,
        'en': `Warning`,
        'fr': `Avertissement`
    });

    static ErrorLevelError = () => lm({    
        'de': `Fehler`,
        'en': `Error`,
        'fr': `Erreur`
    }); 

    static ErrorLevelInfo = () => lm({    
        'de': `Info`,
        'en': `Info`,
        'fr': `Info`
    });
    static ContextSensitiveHelpName = () => lm({
        'de': `Kontextsensitive Hilfe`,
        'en': `Context-sensitive help`
    });
    
    static ContextSensitiveHelpDescription = () => lm({
        'de': `Hier können Sie einstellen, ob in bestimmten Bereichen der Anwendung kontextsensitive Hilfetexte angezeigt werden sollen.`,
        'en': `Here you can set whether context-sensitive help texts should be displayed in certain areas of the application.`
    });

    static ContextSensitiveHelpParameterHintsName = () => lm({
        'de': `Parameterhinweise`,
        'en': `Parameter hints`
    });

    static ContextSensitiveHelpParameterHintsDescription = () => lm({
        'de': `Hier können Sie einstellen, ob dann, wenn sich der Cursor in einem Methodenaufruf befindet, Hinweise zu den Parametern dieser Methode angezeigt werden sollen. <br>`,
        'en': `Here you can set whether hints about the parameters of a method should be displayed whenever the cursor is inside a method call.`
    });
    static ClassDiagramDrawCompositionDiamond = () => lm({
        'de': `Kompositionsbeziehungen mit Raute darstellen`,
        'en': `Draw composition relationships with diamond`,
        'fr': `Dessiner les relations de composition avec un losange`
    });
    
    static ClassDiagramDrawCompositionDiamondDescription = () => lm({
        'de': `Hier können Sie einstellen, ob Kompositionsbeziehungen mit einer Raute dargestellt werden sollen oder nur als einfache Linien.`,
        'en': `Here you can set whether composition relationships should be displayed with a diamond or as simple lines.`,
        'fr': `Ici, vous pouvez définir si les relations de composition doivent être affichées avec un losange ou sous forme de lignes simples.`
    });
    static CompositionDiamondYes = () => lm({
        'de': `Ja, als Raute darstellen`,
        'en': `Yes, display with diamond`,
        'fr': `Oui, afficher avec un losange`
    });
    static CompositionDiamondNo = () => lm({
        'de': `Nein, nur einfache Linien`,
        'en': `No, display as simple lines`,
        'fr': `Non, afficher sous forme de lignes simples`
    });
}