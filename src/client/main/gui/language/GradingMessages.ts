import { lm } from "../../../../tools/language/LanguageManager";

export class GradingMessages {
 
    static attendance = () => lm({
        'de': 'Anwesend',
        'en': 'Attendance'
    });
 
    static groupLong = () => lm({
        'de': 'Gruppe (A oder B)',
        'en': 'Group (A or B)'
    });
   
}