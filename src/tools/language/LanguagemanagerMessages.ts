import { lm } from "./LanguageManager";

export class LanguageManagerMessages {
    static alertMessage = () => lm({
        'de': 'Sie müssen die Seite neu laden, damit die gewählte Sprache aktiv wird.',
        'en': 'You have to reload this page to activate the selected language.'
    });
    
}