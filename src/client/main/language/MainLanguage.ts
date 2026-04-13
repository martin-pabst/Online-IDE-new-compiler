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
    
    static webGLNotSupported = () => lm({
        'de': "Von diesem Browser wird WebGL nicht unterstützt. Es kann daher sein, dass die Grafikfunktionen der Online-IDE nicht oder nur eingeschränkt funktionieren. Bitte verwenden Sie einen aktuellen Browser wie Chrome, Firefox, Edge oder Safari.",
        'en': 'WebGL is not supported by this browser. Therefore, the graphics functions of the online IDE may not work or only work to a limited extent. Please use a modern browser such as Chrome, Firefox, Edge or Safari.'
    });

}