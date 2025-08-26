import { info } from "console";
import { lm } from "../../../../tools/language/LanguageManager";

/**
 * RightDiv
 */
export class RightDivMessages {
    static wholeWindow = () => lm({
        'de': 'Auf Fenstergröße vergrößern',
        'en': 'Whole window'
    });

    static backToNormalSize = () => lm({
    'de': 'Auf normale Größe zurückführen',
    'en': 'Back to normal size'
    });

    static programEnd = () => lm({
        'de': 'Programm beendet',
        'en': 'Program end'
    });
    
    static inputNumber = () => lm({
        'de': 'Bitte geben Sie eine Zahl ein!',
        'en': 'Input any number!'
    });

    static classDiagram = () => lm({
        'de': 'Klassendiagramm',
        'en': 'Class diagram'
    });
    
    static output = () => lm({
        'de': 'Ausgabe',
        'en': 'Output'
    });
    
}

/**
 * BottomDiv
 */
export class BottomDivMessages {

    static code = () => lm({
        'de': 'Code',
        'en': 'Code'
    });
    
    static testRunner = () => lm({
        'de': 'Testrunner',
        'en': 'Test runner'
    });
    
    static waitForDatabase = () => lm({
        'de': 'Warten auf Datenbank...',
        'en': ''
    });
    

}

/**
 * ErrorManager
 */
export class ErrorManagerMessages {
    static errors = () => lm({
        'de': 'Fehler',
        'en': 'Errors'
    });
    
    static noErrorsFound = () => lm({
        'de': 'Keine Fehler gefunden :-)',
        'en': 'No errors found :-)'
    });
    
    static warning = () => lm({
        'de': 'Warnung',
        'en': 'Warning'
    });

    static info = () => lm({
        'de': 'Info',
        'en': 'Info'
    });
    

    
}

/**
 * Console
 */
export class ConsoleMessages {
    static console = () => lm({
        'de': 'Console',
        'en': 'Console'
    });
    
    static emptyConsole = () => lm({
        'de': 'Console leeren',
        'en': 'Empty console'
    });
    
    static copyToClipboard = () => lm({
        'de': 'Anweisungen aus der Console in die Zwischenablage kopieren',
        'en': 'Copy console statements to clipboard'
    });
    
    static error = () => lm({
        'de': 'Fehler',
        'en': 'Error'
    });
    
}

/**
 * HomeworkManager
 */
export class HomeworkManagerMessages {
    static homework = () => lm({
        'de': 'Hausaufgaben',
        'en': 'Homework'
    });

    static defaultView = () => lm({
        'de': 'Normalansicht',
        'en': 'default view'
    });
    
    static showRemarks = () => lm({
    "de": `Korrekturen zeigen`,
    "en": `Show remarks`,
    })

    static filingDays = () => lm({
        'de': 'Abgabetage',
        'en': ''
    });
    

    static givenFiles = () => lm({
        'de': 'Abgegebene Dateien',
        'en': 'Files'
    });

    static workspace = () => lm({
        'de': 'Workspace',
        'en': 'Workspace'
    });
    
    static file = () => lm({
        'de': 'Datei',
        'en': 'File'
    });
    
    static dateFiled = () => lm({
        'de': 'Abgabe',
        'en': 'Date'
    });
    

}

export class GradingManagerMessages {
    static evaluation = () => lm({
        'de': 'Bewertung',
        'en': 'Evaluation'
    });
    
    static points = () => lm({
        'de': 'Punkte',
        'en': 'Points'
    });
    
    static grade = () => lm({
        'de': 'Note',
        'en': 'Grade'
    });
    
    static attendance = () => lm({
        'de': 'Anwesenheit',
        'en': 'Attendance'
    });
    
    static remark = () => lm({
        'de': 'Bemerkung',
        'en': 'Remark'
    });
    
}

export class ProjectExplorerMessages {
    static noWorkspaceSelected = () => lm({
        'de': 'Kein Workspace ausgewählt',
        'en': 'No workspace selected'
    });
    
    static newFile = () => lm({
        'de': 'Neue Datei...',
        'en': 'New file...'
    });

    static firstChooseWorkspace = () => lm({
        'de': 'Bitte wählen Sie zuerst einen Workspace aus.',
        'en': 'Choose workspace first.'
    });
    
    static serverNotReachable = () => lm({
        'de': 'Der Server ist nicht erreichbar!',
        'en': 'Server not reachable!'
    });
    
    static noFile = () => lm({
        'de': 'Keine Datei vorhanden',
        'en': 'No file'
    });
    
    static duplicate = () => lm({
        'de': 'Duplizieren',
        'en': 'Duplicate'
    });
    
    static copy = () => lm({
        'de': 'Kopie',
        'en': 'copy'
    });
    
    static markAsAssignment = () => lm({
        'de': 'Als Hausaufgabe markieren',
        'en': 'Label as assignment'
    });

    static removeAssignmentLabel = () => lm({
        'de': 'Hausaufgabenmarkierung entfernen',
        'en': 'Remove assignment label'
    });
    
    static synchronizeWorkspaceWithRepository = () => lm({
        'de': 'Workspace mit Repository synchronisieren',
        'en': 'Synchronize workspace with repository'
    });
    
    static labeledAsAssignment = () => lm({
        'de': 'Wurde aus Hausaufgabe abgegeben',
        'en': 'Labeled as assignment'
    });

    static assignmentIsCorrected = () => lm({
        'de': 'Korrektur liegt vor',
        'en': 'Assignment is corrected',    
        'fr': 'Devoir corrigé'
    });
    

    static WORKSPACES = () => lm({
        'de': 'WORKSPACES',
        'en': 'WORKSPACES'
    });
    
    static newWorkspace = () => lm({
        'de': 'Neuer Workspace',
        'en': 'New workspace'
    });
    
    static selectWorkspace = () => lm({
        'de': 'Bitte Workspace selektieren',
        'en': 'Select workspace'
    });
    
    static error = () => lm({
        'de': 'Fehler',
        'en': 'Error'
    });
    
    static displayOwnWorkspaces = () => lm({
        'de': 'Meine eigenen Workspaces anzeigen',
        'en': 'Display own workspaces'
    });
    
    static importWorkspace = () => lm({
        'de': 'Workspace importieren',
        'en': 'Import workspace'
    });
    
    static exportFolder = () => lm({
        'de': 'Ordner exportieren',
        'en': 'Export folder'
    });
    
    static exportToFile = () => lm({
        'de': 'Als Datei exportieren',
        'en': 'Export to file'
    });
    
    static distributeToClass = () => lm({
        'de': 'An Klasse austeilen',
        'en': 'Distribute to class'
    });
    
    static workspaceDistributed = (workspaceName: string, className: string) => lm({
        'de': "Der Workspace " + workspaceName + " wurde an die Klasse " + className + " ausgeteilt. Er wird sofort in der Workspaceliste der Schüler/innen erscheinen.\n Falls das bei einer Schülerin/einem Schüler nicht klappt, bitten Sie sie/ihn, sich kurz aus- und wieder einzuloggen.",
        'en': "Workspace " + workspaceName + " gets distributed to class " + className + " . If it's not visible for a given student, she/he might logout and login to see it.",
    });
    
    static distributeToStudents = () => lm({
        'de': 'An einzelne Schüler/-innen austeilen...',
        'en': 'Distribute to individual students...'
    });
    
    static createRepository = () => lm({
        'de': 'Repository anlegen...',
        'en': 'Create repository...'
    });
    
    static detachFromRepository = () => lm({
        'de': 'Vom Repository loslösen',
        'en': 'Detach from Repository'
    });
    
    static settings = () => lm({
        'de': 'Einstellungen',
        'en': 'Settings'
    });
    
    static noWorkspace = () => lm({
        'de': 'Kein Workspace vorhanden',
        'en': 'No workspace'
    });
    
    static myWorkspaces = () => lm({
        'de': 'Meine WORKSPACES',
        'en': 'Own Workspaces'
    });
    

}

export class TeacherExplorerMessages {
    static students = () => lm({
        'de': 'Schüler/-innen',
        'en': 'Students'
    });
    
    static classes = () => lm({
        'de': 'Klassen',
        'en': 'classes'
    });
    
    static tests = () => lm({
        'de': 'Prüfungen',
        'en': 'tests'
    });
    
    static createNewTest = () => lm({
        'de': 'Prüfungen verwalten',
        'en': 'Manage tests'
    });
    
    static testIsInState = (state: string) => lm({
        'de': 'Die Prüfung befindet sich im Zustand "' + state + ", daher kann noch keine Schülerliste zur Korrektur angezeigt werden." +
                        "\nKlicken Sie auf das Zahnrad rechts oberhalb der Prüfungsliste, um zur Prüfungsverwaltung zu gelangen. Dort können Sie den Zustand der Prüfung ändern.",
        'en': 'This test is in state "' + state + ", therefore a list of participating students cannot be displayed yet." +
                        "\nClick on the cogwheel right above this list of tests to go to test administration. There you can manage each tests state.",
    });
    
    static noFile = () => lm({
        'de': 'Keine Datei vorhanden',
        'en': 'No file'
    });
    
}

export class AccordionMessages {
    static createFolderTopmostLevel = () => lm({
        'de': 'Neuen Ordner auf oberster Ebene anlegen',
        'en': 'Create folder at topmost level'
    });
    
    static cancel = () => lm({
        'de': 'Abbrechen',
        'en': 'Cancel'
    });
    

    static newFolder = () => lm({
        'de': 'Neuer Ordner',
        'en': 'New Folder'
    });
    
    static collapseAllFoders = () => lm({
        'de': 'Alle Ordner zusammenfalten',
        'en': 'Collapse all folders'
    });
    
    static rename = () => lm({
        'de': 'Umbenennen',
        'en': 'Rename'
    });
     
    static createNewFolderBelow = (name: string) => lm({
        'de': "Neuen Unterordner anlegen (unterhalb '" + name + "')...",
        'en': 'Create new folder (below ' + name + "')..."
    });
    
    static sureDelete = () => lm({
        'de': 'Ich bin mir sicher: löschen!',
        'en': "I'm sure: delete!"
    });
    
    static cannotDeleteNonEmptyFolder = () => lm({
        'de': 'Dieser Ordner kann nicht gelöscht werden, da er nicht leer ist.',
        'en': "Can't delete folder as it is not empty."
    });
    
}

export class DistributeToStudentsDialogMessages {
    static distributeWorkspaceToIndividualStudents = () => lm({
        'de': 'Austeilen eines Workspace an einzelne Schüler/-innen',
        'en': 'Distribute workspace to individual students'
    });
    
    static workspace = () => lm({
        'de': 'Workspace',
        'en': 'Workspace'
    });
    
    static filterList = () => lm({
        'de': 'Liste filtern',
        'en': 'Filter list'
    });
    
    static cancel = () => lm({
        'de': 'Abbrechen',
        'en': 'Cancel'
    });
    
    static distribute = () => lm({
        'de': 'Austeilen',
        'en': 'Distribute'
    });
    
    static studentsSelected = () => lm({
        'de': 'Schüler/-in/nen selektiert',
        'en': 'student(s) selected'
    });
    
    static workspaceDistributed = (workspaceName: string, count: string, dt: string) => lm({
        'de': `Der Workspace ${workspaceName} wurde an ${count} Schüler/innen ausgeteilt. Er wird in maximal ${dt} s bei jedem Schüler ankommen.`,
        'en': `Workspace ${workspaceName} has been distributed to ${count} students. It will be there in max ${dt} s.`,
    });
    

}

export class IssueReporterMessages {
    static reportBug = () => lm({
        'de': 'Fehler melden',
        'en': 'Report bug'
    });
    
    static bugReport = () => lm({
        'de': 'Beschreibung des Fehlers',
        'en': 'Bug report'
    });
    
    static sendCopyOfWorkspace = () => lm({
        'de': 'Der Fehlermeldung eine Kopie des aktuell offenen Workspaces beifügen',
        'en': 'Send copy of workspace'
    });

    static email = () => lm({
        'de': 'E-Mail-Adresse (für Rückfragen, optional)',
        'en': 'Mail (optional)'
    });

    static firstName = () => lm({
        'de': 'Rufname (für Rückfragen, optional)',
        'en': 'First name (optional)'
    });
    
    static lastName = () => lm({
        'de': 'Familienname (für Rückfragen, optional)',
        'en': 'Last name (optional)'
    });
    
    static cancel = () => lm({
        'de': 'Abbrechen',
        'en': 'Cancel'
    });

    static send = () => lm({
        'de': 'Senden',
        'en': 'Send'
    });
    
    static thanks = () => lm({
        'de': "Danke für die Fehlermeldung!\nDer Fehler wurde erfolgreich übermittelt.",
        'en': 'Thank you!'
    });
        
}

export class SpeedControlMessages {
    static speedControl = () => lm({
        'de': 'Geschwindigkeitsregler',
        'en': 'Speed control'
    });
    
    static stepsPerSecond = () => lm({
        'de': 'Schritte/s',
        'en': 'steps/s'
    });
    
    static maximumSpeed = () => lm({
        'de': 'Maximale Geschwindigkeit',
        'en': 'Maximum speed'
    });
    
    static millions = () => lm({
        'de': 'Millionen',
        'en': 'million'
    });
    
}

export class UserMenuMessages {
    static changePassword = () => lm({
        'de': 'Passwort ändern',
        'en': 'Change password'
    });
    
    static changePasswordDescription = () => lm({
        'de': "Bitte geben Sie Ihr bisheriges Passwort und darunter zweimal Ihr neues Passwort ein. <br> Das Passwort muss mindestens 8 Zeichen lang sein und sowohl Buchstaben als auch Zahlen oder Sonderzeichen enthalten.",
        'en': 'Please input your old password and your new one (two times). <br>Your password has to be at least 8 charachters long and must contain letters, digits and special chars.'
    });
    
    static oldPassword = () => lm({
        'de': 'Altes Passwort',
        'en': 'Old password'
    });
    
    static newPassword = () => lm({
        'de': 'Neues Passwort',
        'en': 'New password'
    });
    
    static repeatNewPassword = () => lm({
        'de': 'Neues Passwort wiederholen',
        'en': 'Repeat new password'
    });
    
    static pleaseWait = () => lm({
        'de': 'Bitte warten...',
        'en': 'Please wait...'
    });
    
    static cancel = () => lm({
        'de': 'Abbrechen',
        'en': 'Cancel'
    });
    
    static ok = () => lm({
        'de': 'OK',
        'en': 'OK'
    });
    
    static passwordsDontMatch = () => lm({
        'de': 'Die zwei eingegebenen neuen Passwörter stimmen nicht überein.',
        'en': "New passwords don't match."
    });
    
    static settingPasswordSuccessful = () => lm({
        'de': 'Das Passwort wurde erfolgreich geändert.',
        'en': 'Setting new password was successful.'
    });
    

}

export class ViewModeControllerMessages {
    static fullWidth = () => lm({
        'de': 'Editor in voller Breite',
        'en': 'Expand editor to full width'
    });
    
    static defaultWidth = () => lm({
        'de': 'Editor in normaler Breite',
        'en': 'Shrink editor to default width'
    });
    

    static presentation = () => lm({
        'de': 'Präsentation (Beamer)',
        'en': 'Presentation (Beamer)'
    });
    
    static monitor = () => lm({
        'de': 'Monitor',
        'en': 'Monitor'
    });
    

}

export class WorkspaceSettingsDialogMessages {
    static workspaceSettings = (workspaceName: string) => lm({
        'de': 'Einstellungen zum Workspace ' + workspaceName,
        'en': 'Settings for workspace ' + workspaceName
    });
    
    static usedLibraries = () => lm({
        'de': 'A. Verwendete Bibliotheken',
        'en': 'A. Used libraries'
    });
    
    static cancel = () => lm({
        'de': 'Abbrechen',
        'en': 'Cancel'
    });
    
    static OK = () => lm({
        'de': 'OK',
        'en': 'OK'
    });
    
}

