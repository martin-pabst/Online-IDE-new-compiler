import { lm } from "../../../../tools/language/LanguageManager";

export class RepositoryImportMessages {
    static importRepository = () => lm({
        'de': `Repository importieren`,
        'en': `Import repository`
    });

    static importRepositoryDescription = () => lm({
        'de': `1. Wählen Sie eine Datei aus, die das exportierte Repository enthält, das Sie importieren möchten, oder ziehen Sie sie in das gestrichelte Rechteck.`,
        'en': `1. Select a file that contains the exported repository you want to import or drag them into the dashed rectangle.`
    });

    static renameDescription = () => lm({
        'de': `2. Optional: Geben Sie einen neuen Namen für das Repository ein. Wenn Sie keinen Namen angeben, wird der Name aus der Exportdatei verwendet.`,
        'en': `2. Optional: Enter a new name for the repository. If you do not provide a name, the name from the export file will be used.`
    });

    static newName = () => lm({
        'de': `Neuer Name`,
        'en': `New name`
    });
    
    static import = () => lm({
        'de': `Importieren`,
        'en': `Import`
    });

    static cancel = () => lm({
        'de': `Abbrechen`,
        'en': `Cancel`
    });

    static noFilesSelected = () => lm({
        'de': `Es wurden keine Dateien ausgewählt. Bitte wählen Sie eine Datei aus.`,
        'en': `No files selected. Please select a file.`
    });

    static wrongFileFormat = (fileName: string) => lm({
        'de': `Die Datei "${fileName}" ist keine gültige Exportdatei für ein Repository. Bitte wählen Sie eine gültige Datei aus.`,
        'en': `The file "${fileName}" is not a valid export file for a repository. Please select a valid file.`
    });

    static importSuccessfully = (fileName: string) => lm({
        'de': `Das Repository aus der Datei "${fileName}" wurde erfolgreich importiert.`,
        'en': `The repository from the file "${fileName}" has been successfully imported.`
    });
}