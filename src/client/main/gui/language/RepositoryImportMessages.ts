import { lm } from "../../../../tools/language/LanguageManager";

export class RepositoryImportMessages {
    static importRepository = () => lm({
        'de': `Repository importieren`,
        'en': `Import repository`
    });

    static importRepositoryDescription = () => lm({
        'de': `Wählen Sie eine Datei aus, die das exportierte Repository enthält, das Sie importieren möchten.`,
        'en': `Select a file that contains the exported repository you want to import.`
    });
    
    static ok = () => lm({
        'de': `OK`,
        'en': `OK`
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