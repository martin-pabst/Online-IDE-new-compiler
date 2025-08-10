import { lm } from "../../tools/language/LanguageManager";

export class HelpMessages {
    static apiDocNone = () => lm({
        "de": "Keine",
        "en": "None",
        "fr": "Aucun"
    })

    static apiDocClasses= () => lm({
        "de": "Klassen",
        "en": "Classes",
        "fr": "Classes"
    })

    static apiDocInterfaces = () => lm({
        "de": "Interfaces",
        "en": "Interfaces",
        "fr": "Interfaces"
    })

    static apiDocEnums = () => lm({
        "de": "Enums",
        "en": "enums",
        "fr": "Énumérations"
    })

    static apiDocConstructors = () => lm({
        'de': 'Konstruktoren',
        'en': 'Constructors',
        'fr': 'Constructeurs'
    });

    static apiDocMethods = () => lm({
        'de': 'Methoden',
        'en': 'Methods',
        'fr': 'Méthodes'
    });
    
    static apiDocFields = () => lm({
        'de': 'Attribute',
        'en': 'Fields',
        'fr': 'Champs'
    });
    
    static apiDocInheritedFrom = () => lm({
        'de': 'geerbt von',
        'en': 'inherited from',
        'fr': 'hérité de'
    });
    
    static apiDocDownloadForAIPrompt = () => lm({
        'de': 'Download (für AI-Prompt)',
        'en': 'Download (for AI-prompt)',
        'fr': 'Télécharger (pour AI-prompt)'
    });
    

    static apiDocMainHeading = () => lm({
        "de": "Online-IDE: Dokumentation der Java-API",
        "en": "Online-IDE: Java-API documentation",
        "fr": "Online-IDE : Documentation de l’API Java"
    })

    static spriteLibraryHeading = () => lm({
        'de': 'Spritelibrary-Einträge',
        'en': 'Spritelibrary entries',
        'fr': 'Entrées de la bibliothèque de sprites'
    });

    static spriteLibraryCodeExample = () => lm({
        'de': 'Codebeispiel:',
        'en': 'Code example:',
        'fr': 'Exemple de code :'
    });
    
    static spriteLibraryDescription = () => lm({
        'de': '(Instanziert ein Sprite-Objekt an der Position (100, 150). Als Bild wird Bild Nr. 3 der Reihe "Minesweeper" gesetzt.)',
        'en': '(Instantiates a Sprite object at position (100, 150) with image number 3 in series "Minesweeper".)',
        'fr': '(Instancie un objet Sprite à la position (100, 150) avec l’image numéro 3 de la série "Minesweeper".)'
    });
    
    
}