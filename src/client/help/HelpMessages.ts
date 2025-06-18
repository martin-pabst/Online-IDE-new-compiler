import { lm } from "../../tools/language/LanguageManager";

export class HelpMessages {
    static apiDocNone = () => lm({
    "de": "Keine",
    "en": "None",
    })

    static apiDocClasses= () => lm({
    "de": "Klassen",
    "en": "Classes",
    })

    static apiDocInterfaces = () => lm({
    "de": "Interfaces",
    "en": "Interfaces",
    })

    static apiDocEnums = () => lm({
    "de": "Enums",
    "en": "enums",
    })

    static apiDocConstructors = () => lm({
        'de': 'Konstruktoren',
        'en': 'Constructors'
    });

    static apiDocMethods = () => lm({
        'de': 'Methoden',
        'en': 'Methods'
    });
    
    static apiDocFields = () => lm({
        'de': 'Attribute',
        'en': 'Fields'
    });
    
    static apiDocInheritedFrom = () => lm({
        'de': 'geerbt von',
        'en': 'inherited from'
    });
    
    static apiDocDownloadForAIPrompt = () => lm({
        'de': 'Download (für AI-Prompt)',
        'en': 'Download (for AI-prompt)'
    });
    

    static apiDocMainHeading = () => lm({
    "de": "Online-IDE: Dokumentation der Java-API",
    "en": "Online-IDE: Java-API documentation",
    })

    static spriteLibraryHeading = () => lm({
        'de': 'Spritelibrary-Einträge',
        'en': 'Spritelibrary entries'
    });

    static spriteLibraryCodeExample = () => lm({
        'de': 'Codebeispiel:',
        'en': 'Code example:'
    });
    
    static spriteLibraryDescription = () => lm({
        'de': '(Instanziert ein Sprite-Objekt an der Position (100, 150). Als Bild wird Bild Nr. 3 der Reihe "Minesweeper" gesetzt.)',
        'en': '(Instantiates a Sprite object at position (100, 150) with image number 3 in series "Minesweeper".)'
    });
    
    
}