import { lm } from "../../../../../tools/language/LanguageManager";

export class ClassDiagramMessages {

static showSystemClasses = () => lm({
    'de': `Systemklassen einblenden`,
    'en': `Show system classes`,
    'fr': `Afficher les classes système`
});
    
static hideSystemClasses = () => lm({
    'de': `Systemklassen ausblenden`,
    'en': `Hide system classes`,
    'fr': `Masquer les classes système`
});

static showParameters = () => lm({
    'de': `Parameter einblenden`,
    'en': `show parameters`,
    'fr': `Afficher les paramètres`
});

static hideParameters = () => lm({
    'de': `Parameter ausblenden`,
    'en': `hide parameters`,
    'fr': `Masquer les paramètres` 
});

static connectionsColored = () => lm({
    'de': `Verbindungen farbig`,
    'en': `Colored connections`,
    'fr': `Connexions colorées`
});

static connectionsBlack = () => lm({
    'de': `Verbindungen schwarz`,
    'en': `Black connections`,
    'fr': `Connexions noires` 
});

static downloadAsPng = () => lm({
    'de': `Klassendiagramm als PNG-Datei herunterladen`,
    'en': `Download class diagram as PNG file`,
    'fr': `Télécharger le diagramme de classes au format PNG`
});

static classDiagram = () => lm({
    'de': `Klassendiagramm`,
    'en': `Class_Diagram`,
    'fr': `Diagramme_de_classes`
});


}