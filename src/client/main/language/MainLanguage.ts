import { lm } from "../../../tools/language/LanguageManager";

export class LoginMessages {
    static pleaseWaitWhileSaving = () => lm({
        'de': 'Bitte warten, der letzte Bearbeitungsstand wird noch gespeichert ...',
        'en': 'Saving last edits -> please wait ...'
    });
    
    static wrongUsernameOrPassword = () => lm({
        'de': 'Fehler: Benutzername und/oder Passwort ist falsch.',
        'en': 'Error: Wrong username and/or password'
    });
    
    static pleaseWait = () => lm({
        'de': 'Bitte warten ...',
        'en': 'Please wait ...'
    });
    
    static loginFailed = () => lm({
        'de': 'Login gescheitert: ',
        'en': 'Login failed: '
    });
    
    static done = () => lm({
        'de': 'fertig!',
        'en': 'Done!'
    });
    
    

}