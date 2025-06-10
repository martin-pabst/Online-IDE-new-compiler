import { lm } from "./LanguageManager";

export class LanguageManagerMessages {
    static alertMessage = () => lm({
        'de': 'Sie müssen sich aus- und wiedereinloggen, damit die gewählte Sprache aktiv wird.',
        'en': 'You have to logout/login to activate the selected language.'
    });
    
}