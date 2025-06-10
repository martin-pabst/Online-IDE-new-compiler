import { lm } from "../../tools/language/LanguageManager";

export class ImageFileMessages {
    static noFilesToImport = () => lm({
        'de': 'Keine Dateien zum Import vorhanden.',
        'en': 'No files to import.'
    });


}

export class SpriteManagerMessages {
    static heading = () => lm({
        'de': 'Sprites verwalten',
        'en': 'Manage sprites'
    });

    static stepOne = () => lm({
        'de': '1. Schritt: png-Dateien hierhin ziehen oder...',
        'en': 'Step 1: Drag png files here or...'
    });

    static filesSelected = () => lm({
        'de': ' Dateien sind ausgewählt.',
        'en': ' files are selected.'
    });

    static fileSelected = () => lm({
        'de': 'Eine Datei ist ausgewählt.',
        'en': 'One file is selected.'
    });

    static stepTwo = () => lm({
        'de': '2. Schritt: Angaben zu den Grafikdateien',
        'en': 'Step 2: Setup Details'
    });

    static rows = () => lm({
        'de': 'Zeilen:',
        'en': 'Rows:'
    });

    static columns = () => lm({
        'de': 'Spalten:',
        'en': 'Columns:'
    });

    static margin = () => lm({
        'de': 'Rand (in px)',
        'en': 'Margin (in px)'
    });

    static distance = () => lm({
        'de': 'Abstand (in px)',
        'en': 'Distance (in px)'
    });

    static series = () => lm({
        'de': 'Serie: ',
        'en': 'Series: '
    });

    static fromIndex = () => lm({
        'de': 'Ab Index: ',
        'en': 'From Index: '
    });

    static stepThree = () => lm({
        'de': '3. Schritt: importieren',
        'en': 'Step 3: import'
    });
    
    static messages = () => lm({
        'de': 'Meldungen: ',
        'en': 'Messages: '
    });
    
    static fileSize = () => lm({
        'de': 'Größe der Spritesheet-Datei: ',
        'en': 'Spritesheet-filesize: '
    });
    
    static importWholeSpritesheet = () => lm({
        'de': 'Gesamtes Spritesheet aus Datei importieren:',
        'en': 'Import whole spritesheet from file:'
    });
    
    static exportWholeSpritesheet = () => lm({
        'de': 'Spritesheet in Datei exportieren',
        'en': 'Export spritesheet to file'
    });
 
    static removeAllSprites = () => lm({
        'de': 'Alle Sprites aus dem Spritesheet entfernen',
        'en': 'Remove all sprites from spritesheet'
    });
    
    static cancel = () => lm({
        'de': 'Abbrechen',
        'en': 'Cancel'
    });
    
    static sureDelete = () => lm({
        'de': 'Ich bin mir sicher: löschen!',
        'en': "I'm sure: delete!"
    });
    
    static save = () => lm({
        'de': 'Speichern',
        'en': 'Save'
    });
    
    static nameOfSpritesheet = () => lm({
        'de': 'Name des Spritesheets?',
        'en': 'Name of spritesheet?'
    });
    
    static imagesAdded = () => lm({
        'de': ' Bilder hinzugefügt',
        'en': ' images added'
    });
    
    static index = () => lm({
        'de': 'Index: ',
        'en': 'Index: '
    });
    
    static widthHeight = (width: number, height: number) => lm({
        'de': 'Breite: ' + width + ' px, Höhe: ' + height + ' px',
        'en': 'Width: ' + width + ' px, height: ' + height + ' px'
    });
    
    static noWorkspaceSelected = () => lm({
        'de': 'Kein Workspace ausgewählt.',
        'en': 'No Workspace selected.'
    });
    
    static mangeWorkspaceSprites = (name: string) => lm({
        'de': 'Sprites des Workspace ' + name + ' verwalten',
        'en': 'Manage sprites of workspace ' + name
    });
    
    static mangeRepositorySprites = (name: string) => lm({
        'de': 'Sprites des Repositorys ' + name + ' verwalten',
        'en': 'Manage sprites of repository ' + name
    });
    
    static identifierAlreadyUsed = (identifier: string) => lm({
        'de': 'Der Bezeichner ' + identifier + ' wird schon für interne Sprites verwendet.',
        'en': 'Identifier ' + identifier + ' is used for internal sprites already.'
    });

    static seriesIndexAlreadyUsed = (series: string, index: number) => lm({
        'de': 'Serie ' + series + ', index ' + index + ' ist schon weiter oben vergeben.',
        'en': 'Series ' + series + ', index ' + index + ' already is used.'
    });
       
}

export class SpritesheetDataMessages {
    static couldntLoadSpritesheet = () => lm({
        'de': 'Konnte das Spritesheet nicht laden: ',
        'en': "Couldn't load spritesheet: "
    });
    
}