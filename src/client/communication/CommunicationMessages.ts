import { lm } from "../../tools/language/LanguageManager";

export class CommunicationMessages {
    static doubleLoginDuringPruefung = () => lm({
        'de': `Logout wegen Doppellogin während einer Prüfung.`,
        'en': `Logout due to double login during a test.`,
        'fr': `Déconnexion en raison d'une double connexion pendant un test.`,
    });

    static notLoggedIn = () => lm({
        'de': `Nicht eingeloggt.`,
        'en': `Not logged in.`,
        'fr': `Non connecté.`,
    });
    
}