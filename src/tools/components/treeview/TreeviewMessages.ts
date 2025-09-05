import { lm } from "../../language/LanguageManager";

export class TreeviewMessages {
    static caption = () => lm({
        'de': 'Überschrift',
        'en': 'Caption'
    });

    static newElement = () => lm({
        'de': 'Neues Element anlegen...',
        'en': 'Create new element...',
    });

    static newFolder = (parentFolder: string) => lm({
        'de': "Neuen Ordner anlegen (unterhalb " + parentFolder + ")",
        'en': 'Create new folder (as subfolder of ' + parentFolder + ')...',
    });
    
    static rename = () => lm({
        'de': 'Umbenennen',
        'en': 'Rename'
    });

    static delete = () => lm({
        'de': `Löschen`,
        'en': `Delete`
    });
    
    static confirmDelete = () => lm({
        'de': `Wirklich löschen?`,
        'en': `Are you sure to delete this elements/folders?`
    });
    
    
    static addElements = () => lm({
        'de': 'Elemente hinzufügen',
        'en': 'Add elements'
    });
    
    static addFolder = () => lm({
        'de': 'Ordner hinzufügen (auf oberster Ebene)',
        'en': 'Add folder (at root level)',
    });
    
    static collapseAll = () => lm({
        'de': 'Alle Ordner zusammenfalten',
        'en': 'Collapse all folders'
    });

    static elementsFolders = () => lm({
        'de': 'Elemente/Ordner',
        'en': 'elements/folders'
    });
    
    
    
}