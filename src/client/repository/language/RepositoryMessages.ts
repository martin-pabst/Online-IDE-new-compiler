import { lm } from "../../../tools/language/LanguageManager";

export class HistoryElementMessages {
    static displayOnLeftSide = () => lm({
        'de': 'Auf der linken Seite darstellen',
        'en': 'Display on left side'
    });
    
    static displayOnRightSide = () => lm({
        'de': 'Auf der rechten Seite darstellen',
        'en': 'Display on right side'
    });
    
}

export class RepoSMessages {
    static serverTemporarilyNotReachable = () => lm({
        'de': 'Ser Server ist temporär nicht erreichbar.',
        'en': 'Server is temporarily not reachable.'
    });
    
    static chooseFile = () => lm({
        'de': 'Wählen Sie eine Datei aus!',
        'en': 'Choose a file!'
    });
    
    static yourWorkspace = () => lm({
        'de': 'Dein Workspace:',
        'en': 'Your Workspace:'
    });
    
    static withWriteAccess = () => lm({
        'de': ', mit Schreibzugriff',
        'en': ', with write access'
    });
    
    static withoutWriteAccess = () => lm({
        'de': ', ohne Schreibzugriff',
        'en': ', without write access'
    });
    
    static repoCurrentVersion = (version: string) => lm({
        'de': 'Repository (aktuelle Version ' + version + '):',
        'en': 'Repository (current Version ' + version + '):'
    });

    static synchronizeWithRepository = () => lm({
        'de': 'Synchronisieren mit Repository',
        'en': 'Synchronize with Repository'
    });
    
    static synchronizeWorkspaceWithRepository = () => lm({
        'de': 'Workspace mit Repository synchronisieren',
        'en': 'Synchronize Workspace with repository'
    });
    
    static backToCoding = () => lm({
        'de': 'Zurück zum Programmieren',
        'en': 'Back to coding'
    });
    
    static history = () => lm({
        'de': 'History:',
        'en': 'History:'
    });
    
    static repositoryCurrentVersion = () => lm({
        'de': 'Repository (aktuelle Version):',
        'en': 'Repository (current version):'
    });
    
    static showOwnWorkspace = () => lm({
        'de': 'Zeige eigenen Workspace',
        'en': 'Show own workspace'
    });

    static showCurrentRepoVersion = () => lm({
        'de': 'Zeige aktuelle Repository-Version',
        'en': 'Show current Repository version'
    });
    
    static saveWorkspaceChanges = () => lm({
        'de': 'Änderungen am Workspace (rot!) speichern',
        'en': 'Save workspace-changes (red!)'
    });
    
    static saveRepoChanges = () => lm({
        'de': 'Änderungen am Repository (rot!) speichern',
        'en': 'Save Repository changes (red!)'
    });
    
    static commitMessage = () => lm({
        'de': 'Beschreibe kurz die vorgenommenen Änderungen:',
        'en': 'Commit message:'
    });

    static OK = () => lm({
        'de': 'OK',
        'en': 'OK'
    });
    
    
}

export class SynchroListElementMessages {
    static withoutVersion = () => lm({
        'de': '(ohne Version)',
        'en': '(without version)'
    });
    
    static withChanges = () => lm({
        'de': 'mit Änderungen',
        'en': 'with changes'
    });
    
    static DELETED = () => lm({
        'de': ' - GELÖSCHT',
        'en': ' - DELETED'
    });
    
    static synchronized = () => lm({
        'de': 'synchron',
        'en': 'identical'
    });
    
    static markAsMerged = () => lm({
        'de': 'Als "merged" markieren',
        'en': 'Mark as "merged"'
    });
    
    static merged = () => lm({
        'de': 'merged',
        'en': 'merged'
    });
    
}

export class SynchroWorkspaceMessages {
    static Workspace = () => lm({
        'de': 'Workspace: ',
        'en': 'Workspace: '
    });

    static historyVersion = () => lm({
        'de': 'History-Version ',
        'en': 'History version'
    });
    
    static serverNotReachable = () => lm({
        'de': 'Der Server ist nicht erreichbar!',
        'en': 'Server not reachable!'
    });
    
}

export class RepocheckoutManagerMessages {
    static all = () => lm({
        'de': 'alle',
        'en': 'alle'
    });

    static private = () => lm({
        'de': 'private',
        'en': 'private'
    });
    
    static accessableForClass = () => lm({
        'de': 'für die Klasse freigegebene',
        'en': 'accessable for whole class'
    });

    static accessableForSchool = () => lm({
        'de': 'für die Schule freigegebene',
        'en': 'accessable for whole school'
    });
    
    static caption = () => lm({
        'de': 'Checkout Repository - Workspace mit Repository verbinden',
        'en': 'Checkout Repository - connect workspace to repository'
    });
    
    static backToCoding = () => lm({
        'de': 'Zurück zum Programmieren',
        'en': 'Back to coding'
    });
    
    static connectThisWorkspaceToRepository = () => lm({
        'de': 'Diesen Workspace mit dem Repository verbinden:',
        'en': 'Connect this workspace to repository:'
    });
    
    static inputRepositoryCode = () => lm({
        'de': 'Alternativ zur Auswahl unten Eingabe eines Repository-Codes:',
        'en': 'Provide repository code as alternative to choosing below:'
    });
    
    static showTheseRepositories = () => lm({
        'de': 'Diese Repositories anzeigen:',
        'en': 'Show these repositories:'
    });
    
    static filterSearch = () => lm({
        'de': 'Filter/Suche:',
        'en': 'Filter/search:'
    });
    
    static createNewWorkspace = () => lm({
        'de': 'Neuen Workspace erstellen',
        'en': 'Create new workspace'
    });
    
    static codeMustContainT = () => lm({
        'de': 'Der Code muss den Buchstaben T enthalten.',
        'en': 'Code has to contain character T.'
    });
    
    static digitPriorToTInsideCode = () => lm({
        'de': 'Im Code muss vor dem T eine Zahl stehen.',
        'en': 'Code has to contain a digit prior to character T.'
    });

    static newWorkspaceCreateSuccessfully = (name: string) => lm({
        'de': 'Der neue Workspace ' + name + ' wurde erfolgreich angelegt.',
        'en': 'New workspace ' + name + ' successfully created.'
    });
    
    static workspaceSuccessfullyConnectedToRepository = (name: string) => lm({
        'de': 'Der Workspace ' + name + ' wurde erfolgreich mit dem Repository verbunden.',
        'en': 'Workspace ' + name + ' successfully connected to repository.'
    });
       
}

export class RepositoryCreateManagerMessages {
    static nameOfRepository = () => lm({
        'de': 'Name des Repositorys:',
        'en': 'Name of repository:'
    });
    
    static description = () => lm({
        'de': 'Beschreibung:',
        'en': 'Description:'
    });
    
    static publishedFor = () => lm({
        'de': 'Veröffentlicht für:',
        'en': 'Published for:'
    });
    
    static privateRepository = () => lm({
        'de': 'Keine Veröffentlichung (privates Repository)',
        'en': 'Private repository (not published)'
    });

    static publishedToClassStudents = () => lm({
        'de': 'Veröffentlicht für alle Schüler/-innen der Klasse',
        'en': 'Published to students of own class'
    });

    static publishedToClasses = () => lm({
        'de': 'Veröffentlicht für alle Schüler/-innen der unterrichteten Klassen',
        'en': 'Published to all students in all of my classes'
    });
    
    static publishedToSchool = () => lm({
        'de': 'Veröffentlicht für alle Nutzer/-innen an meiner Schule',
        'en': 'Published to all users in my school'
    });
    
    static createRepositoryAndConnectToWorkspace = (name: string) => lm({
        'de': 'Repository anlegen und mit Workspae ' + name + ' verknüpfen:',
        'en': 'Create repository and connect to workspace ' + name
    });
    
}

export class RepositorySettingsMessages {
    static backToCoding = () => lm({
        'de': 'Zurück zum Programmieren',
        'en': 'Back to coding'
    });
    
    static repositories = () => lm({
        'de': 'Repositories:',
        'en': 'Respositories:'
    });
    
    static owner = () => lm({
        'de': 'Eigentümer:',
        'en': 'Owner:'
    });
    
    static codeForRepoReadAccess = () => lm({
        'de': 'Code zum lesenden Zugriff aufs Repository:',
        'en': 'Repository read access code:'
    });
    
    static codeForRepoWriteAccess = () => lm({
        'de': 'Code zum schreibenden Zugriff aufs Repository:',
        'en': 'Repository write access code:'
    });
    
    static copy = () => lm({
        'de': 'Kopieren',
        'en': 'Copy'
    });
    
    static change = () => lm({
        'de': 'Ändern',
        'en': 'Change'
    });
    
    static repositoryUsers = () => lm({
        'de': 'Benutzer, die das Repository nutzen',
        'en': 'Users using this repository'
    });
    
    static writeAccess = () => lm({
        'de': 'Schreibberechtigung',
        'en': 'Write access'
    });
    
    static saveChanges = () => lm({
        'de': 'Änderungen speichern',
        'en': 'Save changes'
    });
    
    static noRepositoryPresent = () => lm({
        'de': 'Sie haben noch keine Repositories, und\nkönnen daher keine verwalten.\nTipp: Ein Repository können Sie durch Rechtsklick auf einen Workspace anlegen.',
        'en': "There's no repository yet, therefore none to manage.\nHint: You may create a repository by right-clicking a workspace, then select 'create repository'."
    });
    
    static deleteRepository = () => lm({
        'de': 'Repository löschen...',
        'en': 'Delete Repository...'
    });
    
    static cancel = () => lm({
        'de': 'Abbrechen',
        'en': 'Cancel'
    });
    
    static sureDelete = () => lm({
        'de': 'Ich bin mir sicher: löschen!',
        'en': "I'm sure: delete!"
    });
    
    static changesNotSaved = (repoName: string) => lm({
        'de': 'Deine Änderungen am Repository ' + repoName + ' wurden nicht gespeichert.',
        'en': 'Your changes to repository ' + repoName + ' have not been saved.'
    });
    
    static transferOwnership = (repoName: string, username: string) => lm({
        'de': 'Soll die Eigentümerschaft am Repository ' + repoName + ' wirklich an ' + username + ' übertragen werden?',
        'en': 'Transfer ownership of repository ' + repoName + ' to user ' + username + '?'
    });
    
    static changesSavedSuccessfully = () => lm({
        'de': 'Die Änderungen wurden erfolgreich gespeichert.',
        'en': 'Changes have been saved successfully.'
    });

    static error = () => lm({
        'de': 'Fehler: ',
        'en': 'Fehler: '
    });
    
    static notSaved = () => lm({
        'de': 'Der Speichervorgang wurde nicht durchgeführt.',
        'en': 'Changes have not been saved.'
    });
    
    
}