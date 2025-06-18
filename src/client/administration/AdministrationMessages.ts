import { lm } from "../../tools/language/LanguageManager";

export class AdminMessages {
    static schoolsWithAdmins = () => lm({
        'de': 'Schulen mit Administratoren',
        'en': 'Schools with admins'
    });

    static schools = () => lm({
        'de': 'Schulen',
        'en': 'Schools'
    });
    
    static identifier = () => lm({
        'de': 'Bezeichnung',
        'en': 'Identifier'
    });
    
    static abbreviation = () => lm({
        'de': 'Kürzel',
        'en': 'Abbr.'
    });
    
    static vidisID = () => lm({
        'de': 'Vidis-Kennung',
        'en': 'Vidis-id'
    });
    
    static classes = () => lm({
        'de': 'Klassen',
        'en': 'classes'
    });
    
    static users = () => lm({
        'de': 'Users',
        'en': 'Users'
    });
    
    static teachers = () => lm({
        'de': 'Lehrkräfte',
        'en': 'Teachers'
    });
    
    static changePassword = () => lm({
        'de': 'Passwort ändern...',
        'en': 'Change password...'
    });
    
    static moveToSchool = () => lm({
        'de': 'Versetzen in Schule...',
        'en': 'Move to school...'
    });
    
    static username = () => lm({
        'de': 'Benutzername',
        'en': 'Username'
    });
    
    static firstName = () => lm({
        'de': 'Rufname',
        'en': 'First name'
    });
    
    static lastName = () => lm({
        'de': 'Familienname',
        'en': 'Last name'
    });
    
    static vidisAbbreviation = () => lm({
        'de': 'Vidis-Kürzel',
        'en': 'Vidis-Abbr.'
    });

    static isAdmin = () => lm({
        'de': 'Admin',
        'en': 'Admin'
    });
    
    static locked = () => lm({
        'de': 'Locked',
        'en': 'Locked'
    });
    
    static selectTeacherToMove = () => lm({
        'de': "Zum Verschieben in eine andere Schule muss genau eine Lehrkraft ausgewählt werden.",
        'en': 'Select teacher to move.'
    });

    static schoolsIdenticalThereforeNothingToDo = () => lm({
        'de': "Die gewählte Schule stimmt mit der bisherigen Schule überein, es wird daher nichts verändert.",
        'en': 'Selected school is equal to old school, therefore nothing to do.'
    });
    
    static errorMovingTeacher = () => lm({
        'de': 'Fehler beim Versetzen der Lehrkraft: ',
        'en': 'Error moving teacher to other school: '
    });
    
    static chooseAdminToChangePassword = () => lm({
        'de': "Zum Ändern eines Passworts muss genau ein Admin ausgewählt werden.",
        'en': 'Select one admin to change her/his password.'
    });
    
    static pleaseWaitForPasswordHashing = () => lm({
        'de': "Bitte warten, das Hashen <br> des Passworts kann <br>bis zu 1 Minute<br> dauern...",
        'en': 'Please wait. Password hashing <br> may take up to 1 minute.'
    });
    
    static passwordChangedSuccessfully = (firstname: string, lastname: string, username: string) => lm({
        'de': 'Das Passwort für ' + firstname + " " + lastname + " (" + username + ") wurde erfolgreich geändert.",
        'en': ''
    });
 
    static errorSettingPassword = () => lm({
        'de': 'Fehler beim Ändern des Passworts: ',
        'en': 'Error when setting password: '
    });

    static nameOfSchool = () => lm({
        'de': 'Name der Schule',
        'en': 'Name of school'
    });
    
    static teachersOfSchool = () => lm({
        'de': 'Lehrkräfte der Schule ',
        'en': 'Teachers of school '
    });
    
    static errorFetchingData = () => lm({
        'de': 'Fehler beim Holen der Daten: ',
        'en': 'Error fetching data: '
    });
    
    static selectSchoolToAddTeachers = () => lm({
        'de': "Wenn Sie Lehrkräfte hinzufügen möchten, muss links genau eine Schule ausgewählt sein.",
        'en': 'Select a school (in left table) to add teachers.'
    });
    
    static classesWithStudents = () => lm({
        'de': 'Klassen mit Schülern',
        'en': 'Classes with students'
    });
    
    static count = () => lm({
        'de': 'Anz.',
        'en': 'Count'
    });
    
    static teacher = () => lm({
        'de': 'Lehrkraft',
        'en': 'Teacher'
    });
    
    static secondTeacher = () => lm({
        'de': 'Zweitlehrkraft',
        'en': 'Second teacher'
    });
    
    static noSecondTeacher = () => lm({
        'de': 'Keine Zweitlehrkraft',
        'en': 'No second teacher'
    });
    
    static students = () => lm({
        'de': 'Schüler/-innen',
        'en': 'Students'
    });
    
    static changeClass = () => lm({
        'de': 'Klasse ändern...',
        'en': 'Change class...'
    });
    
    static classWord = () => lm({
        'de': 'Klasse',
        'en': 'class'
    });
    
    static nickname = () => lm({
        'de': 'Nickname (kein Klartext!)',
        'en': 'Nickname (not real name!)'
    });

    static vidisClass = () => lm({
        'de': 'Vidis-Klasse',
        'en': 'Vidis-class'
    });
    
    static movedStudentsSuccessfully = (classIdentifier: string) => lm({
        'de': 'Die Schüler/-innen wurden erfolgreich in die Klasse ' + classIdentifier + ' verschoben.',
        'en': 'Successfully moved students to class ' + classIdentifier + '.'
    });
    
    static errorMovingStudents = () => lm({
        'de': 'Fehler beim Versetzen der Schüler/-innen: ',
        'en': 'Error moving students to other class: '
    });
    
    static selectStudentToSetPassword = () => lm({
        'de': 'Zum Ändern eines Passworts muss genau ein Schüler ausgewählt werden.',
        'en': 'Select student to set password.'
    });
    
    static errorDeletingStudents = () => lm({
        'de': 'Fehler beim Löschen der Schüler/-innen: ',
        'en': 'Error deleting students: '
    });
    
    static selectClassToAddStudents = () => lm({
        'de': 'Bitte wählen Sie links die Klasse aus, der die Schülerin/der Schüler hinzugefügt werden soll.',
        'en': 'Select class (in table on left side) to which new student belongs to.'
    });
    
    static errorCreatingUser = () => lm({
        'de': 'Beim Anlegen des Benutzers ist ein Fehler aufgetreten: ',
        'en': 'Error adding user: '
    });

    static newClass = () => lm({
        'de': 'Neue Klasse: ',
        'en': 'New Class: '
    });
    
    static cancel = () => lm({
        'de': 'Abbrechen',
        'en': 'Cancel'
    });
    
    static ok = () => lm({
        'de': 'OK',
        'en': 'OK'
    });
    
    static chooseNewClass = () => lm({
        'de': 'Neue Klasse wählen',
        'en': 'Choose new class'
    });
    
    static exportImportSchools = () => lm({
        'de': 'Schulen exportieren/importieren',
        'en': 'Export/import schools'
    });
    
    static exportSelectedSchools = () => lm({
        'de': 'Selektierte Schulen exportieren',
        'en': 'Export selected schools'
    });
    
    static importSchools = () => lm({
        'de': 'Schulen importieren:',
        'en': 'Import schools:'
    });
    
    static pleaseWaitForDataUpload = () => lm({
        'de': 'Die Daten werden hochgeladen. Bitte warten...',
        'en': 'Please wait for data to upload...'
    });
    
    static errorSendingFiles = () => lm({
        'de': 'Fehler beim Senden der Dateien.',
        'en': 'Error sending files.'
    });
    
    static moveTeacher = () => lm({
        'de': 'Lehrkraft verschieben: ',
        'en': 'Move teacher: '
    });
    
    static oldSchool = () => lm({
        'de': 'Bisherige Schule',
        'en': 'Current school'
    });

    static newSchool = () => lm({
        'de': 'Neue Schule',
        'en': 'New school'
    });
    
    static nameOfTest = () => lm({
        'de': 'Name der Prüfung: ',
        'en': 'Test name: '
    });

    static templateWorkspace = () => lm({
        'de': 'Vorlage-Workspace',
        'en': 'Template workspace'
    });
    
    static createNewTest = () => lm({
        'de': 'Neue Prüfung anlegen',
        'en': 'Create new test'
    });
    
    static newPassword = () => lm({
        'de': 'Neues Passwort:',
        'en': 'New Password:'
    });
    
    static setPasswordFor = () => lm({
        'de': 'Passwort setzen für: ',
        'en': 'Set password for: '
    });

    static manageTests = () => lm({
        'de': 'Prüfungen verwalten',
        'en': 'Manage tests'
    });
    
    static noTemplateWorkspace = () => lm({
        'de': 'Kein Vorlage-Workspace',
        'en': 'No template workspace'
    });
    
    static pruefungen = () => lm({
        'de': 'Prüfungen',
        'en': 'Tests'
    });
    
    static date = () => lm({
        'de': 'Datum',
        'en': 'Date'
    });
    
    static state = () => lm({
        'de': 'Zustand',
        'en': 'State'
    });
    
    static mark = () => lm({
        'de': 'Note',
        'en': 'Mark'
    });
    
    static points = () => lm({
        'de': 'Punkte',
        'en': 'Points'
    });
    
    static attendance = () => lm({
        'de': 'anwesend',
        'en': 'attendance'
    });
 
    static stateOfSelectedTest = () => lm({
        'de': 'Zustand der ausgewählten Prüfung:',
        'en': 'State of selected test:'
    });
    
    static preparation = () => lm({
        'de': 'Vorbereitung',
        'en': 'Preparation'
    });
    
    static testRunning = () => lm({
        'de': 'Prüfung läuft',
        'en': 'Test running'
    });
    
    static correction = () => lm({
        'de': 'Korrektur',
        'en': 'Correction'
    });
    
    static issueTest = () => lm({
        'de': 'Herausgabe',
        'en': 'Issue test'
    });
    
    static stateBack = () => lm({
        'de': 'Zustand zurück',
        'en': 'State back'
    });
    
    static stateForward = () => lm({
        'de': 'Zustand vor',
        'en': 'State forward'
    });
    
    static cantSetTestToState = (state: string) => lm({
        'de': 'Die Prüfung läuft schon. Sie kann nicht mehr in den Zustand ' + state + ' versetzt werden.',
        'en': "Test is already running, therefore it can't be set to state " + state + "."
    });
    
    static sureToStartTestAgain = () => lm({
        'de': 'Soll die Prüfung wirklich sofort erneut gestartet werden?',
        'en': 'Are you sure to start test again?'
    });
    
    static sureToStartTest = () => lm({
        'de': 'Soll die Prüfung wirklich sofort gestartet werden?',
        'en': 'Are you sure to start test?'
    });
    
    static actionsForSelectedTest = () => lm({
        'de': 'Aktionen für die ausgewählte Prüfung:',
        'en': 'Actions for selected test:'
    });
    
    static printAll = () => lm({
        'de': 'Alle Arbeiten drucken...',
        'en': 'Print all student tests...'
    });
    
    static file = () => lm({
        'de': 'Datei: ',
        'en': 'File: '
    });
    
    static studentsFile = () => lm({
        'de': 'Datei der Schülerin/des Schülers:',
        'en': "Student's file"
    });
    
    static alterClassOnlyInStatePreparation = () => lm({
        'de': 'Die Klasse kann nur im Zustand "Vorbereitung" noch geändert werden.',
        'en': 'You can alter class only in state "Preparation".'
    });
    
    static alterTemplateWorkspaceOnlyInStatePreparation = () => lm({
        'de': 'Der Vorlagenworkspace kann nur im Zustand "Vorbereitung" noch geändert werden.',
        'en': 'You can alter template workspace only in state "Preparation".'
    });
    
    static noTestSelected = () => lm({
        'de': 'Keine Prüfung ausgewählt.',
        'en': 'No test selected.'
    });
    
    static nextUpdatein = () => lm({
        'de': 'Nächstes Update in ',
        'en': 'Next update in '
    });
    
    static error = () => lm({
        'de': 'Es ist ein Fehler aufgetreten: ',
        'en': 'Error: '
    });
    
    static importStudents = () => lm({
        'de': 'Schülerdatenimport',
        'en': 'Import students'
    });

    static password = () => lm({
        'de': 'Passwort',
        'en': 'Password'
    });
    
    static step4Description = (klass: string) => lm({
        'de': `Die Schüler/innen wurden erfolgreich angelegt und der Klasse/den Klassen (ersatzweise: ${klass}) zugeordnet.
        Eine Liste der Zugangsdaten zum Ausdrucken erhalten Sie durch Klick auf den Button "Drucken...".
        `,
        'en': `Student accounts have been successfully created and moved to given class (default: ${klass}).
        Click "Print..." to get a list of credentials.`
    });

    static step4Done = () => lm({
        'de': 'Schritt 4: Fertig!',
        'en': 'Step 4: Done!'
    });
    
    static printDots = () => lm({
        'de': 'Drucken...',
        'en': 'Print...'
    });
    
    static name = () => lm({
        'de': 'Name',
        'en': 'Name'
    });
    
    static step3Description = (klass: string) => lm({
        'de': `Die Schüler/innen können jetzt angelegt und der Klasse ${klass} zugeordnet werden.`,
        'en': `Ready to create student accounts and connect them to class ${klass}.`
    });

    static step3Heading = () => lm({
        'de': 'Schritt 3: Benutzer anlegen',
        'en': 'Step 3: Create users'
    });
    
    static back = () => lm({
        'de': 'Zurück',
        'en': 'Back'
    });
    
    static createUsers = () => lm({
        'de': 'Benutzer anlegen',
        'en': 'Create users'
    });
    
    static waitForUserCreation = () => lm({
        'de': 'Die Benutzer werden angelegt. Bitte warten...',
        'en': 'Creating user accounts. Please wait...'
    });

    static step2Description = () => lm({
        'de': `Bitte wählen Sie im Auswahlfeld die Klasse aus, in die die Schülerdaten importiert werden sollen, 
        für die in den Eingabedaten keine Klasse angegeben ist. Sie können die Daten in der Tabelle noch bearbeiten, bevor Sie sie zur Überprüfung (noch kein Import!) absenden.`,
        'en': `Please choose class to import users to if no class is specified in input data. You may edit user data in table left before its imported.`
    });
    
    static step2heading = () => lm({
        'de': 'Schritt 2: Daten überprüfen',
        'en': 'Step 2: Check data'
    });
        
    static checkingData = () => lm({
        'de': 'Daten überprüfen...',
        'en': 'Checking data...'
    });
    
    static errorLog = () => lm({
        'de': 'Fehlerprotokoll',
        'en': 'Error log'
    });
    
    static step1description = () => lm({
        'de': `
        Zum Importieren wird eine Tabelle mit den Spalten Rufname, Familienname, Username, (optional:) Klasse und (ebenso optional:) Passwort benötigt,
        wobei die Daten in den Zellen jeweils mit Tab-Zeichen getrennt sind. Sie erhalten dieses Format beispielsweise,
        indem Sie eine Tabelle in Excel in die Zwischenablage kopieren. <br> Falls die erste Zeile Spaltenköpfe mit
        den korrekten Bezeichnern (Klasse, Rufname, Familienname, Username, Passwort) enthält, kümmert sich der Import-Algorithmus
        um die richtige Reihenfolge und blendet ggf. auch überflüssige Spalten aus. Falls eine Zeile kein Passwort enthält,
        setzt die Online-IDE ein Zufallspasswort.<br>
        Bitte fügen Sie den Inhalt der Tabelle per Copy-Paste in dieses Eingabefeld ein:`,
        'en': `To import student data you need a tab-separated table with colums FirstName, LastName, Username, Class (optional) and password(optional).<br>
        You get this format from Excel or other spreadsheet software by copying to clipboard.<br>
        Column order is arbitrary if you provide a first row with header-identifiers given above. Random passwords are generated for each student without one.<br>
        Please insert table in textfield below by copy/paste.`
    });
    
    static step1heading = () => lm({
        'de': 'Schritt 1: Daten einlesen',
        'en': 'Step 1: Import data per copy/paste'
    });
    
    static continue = () => lm({
        'de': 'Weiter',
        'en': 'Continue'
    });
    
    static usernamesAlreadyUsed = () => lm({
        'de': 'Diese Benutzernamen sind schon anderen Benutzern zugeordnet und können daher nicht verwendet werden:',
        'en': 'These usernames are already in use and are therefore not possible:'
    });
    
    
    
}