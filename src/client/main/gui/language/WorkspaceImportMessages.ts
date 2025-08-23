import { lm } from "../../../../tools/language/LanguageManager";

export class WorkspaceImportMessages {
    static confirmInput = (count: number) => lm({
        'de': `Wollen Sie die ${count} ausgewählten Workspaces wirklich importieren?`,
        'en': `Do you really want to import the ${count} selected workspaces?`,
        'fr': `Voulez-vous vraiment importer les ${count} workspaces sélectionnés?`,
    });

    static importWorkspace = () => lm({
        'de': 'Workspace importieren',
        'en': 'Import workspace'
    });

    static importWorkspaceDescription = () => lm({
        'de': "1. Bitte klicken Sie auf den Button 'Datei auswählen...' oder ziehen Sie eine Datei auf das gestrichelt umrahmte Feld.",
        'en': "1. Use button 'Choose file...' or drop file on dotted rectangle."
    });

    static wrongFileFormat = (filename: string) => lm({
        'de': 'Das Format der Datei ' + filename + " passt nicht.",
        'en': 'File ' + filename + " has wrong file format."
    });

    static noJson = (filename: string) => lm({
        'de': 'Die Datei ' + filename + " ist keine gültige JSON-Datei.",
        'en': 'File ' + filename + " doesn't contain JSON code."
    });

    static withFiles = (count: number) => lm({
        'de': 'mit ' + count + ' Dateien',
        'en': 'with ' + count + " files"
    });

    static dragFilesHere = () => lm({
        'de': 'Dateien hierhin ziehen',
        'en': 'Drag files here.'
    });

    static dragDropTutorial = () => lm({
        'de': '2. In der linken Baumansicht sehen Sie die Workspaces der importierten Datei. Sie können mehrere Workspaces/Ordner durch <Strg> + Click bzw. <Shift> + Click markieren. Ziehen Sie die gewünschten Workspaces in die rechte Baumansicht, um sie zu importieren.',
        'en': '2. The left tree view shows the workspaces of the imported file. You can select multiple workspaces/folders using <Ctrl> + Click or <Shift> + Click. Drag and drop the desired folders/workspaces to the right tree view to import them.',
        'fr': '2. La vue arborescente de gauche affiche les workspaces du fichier importé. Vous pouvez sélectionner plusieurs workspaces/dossiers en utilisant <Ctrl> + Clic ou <Shift> + Clic. Faites glisser et déposez les dossiers/workspaces souhaités dans la vue arborescente de droite pour les importer.'   
    });

    static cancel = () => lm({
        'de': 'Abbrechen',
        'en': 'Cancel'
    });

    static ok = () => lm({
        'de': 'OK',
        'en': 'OK'
    });

    static import = () => lm({
        'de': 'Importieren',
        'en': 'Import'
    });

    static serverNotReachable = () => lm({
        'de': 'Der Server ist nicht erreichbar.',
        'en': 'Server not reachable.'
    });


}