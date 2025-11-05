import { lm } from "../../../tools/language/LanguageManager";

type JavaAnnotationType = { 
    identifier: string;
    description: string;
    beforeClass: boolean;
    beforeMethod: boolean;
    beforeMethodOfMainClass: boolean;
}

class AnnotationDescriptions {
    static fullspeed = () => lm({
        'de': `Zeigt an, dass die annotierte Methode oder alle Methoden der annotierten Klasse mit voller Geschwindigkeit ausgeführt werden sollen.`,
        'en': `Indicates that the annotated method or all methods of the annotated class should be executed in full speed mode, ignoring any speed settings.`
    });

    static override = () => lm({    
        'de': `Zeigt an, dass eine Methode eine Methode in einer Superklasse überschreiben soll.`,
        'en': `Indicates that a method is intended to override a method in a superclass.`
    });

    static test = () => lm({    
        'de': `Zeigt an, dass eine Methode eine Testmethode ist oder eine Klasse Testmethoden enthält.`,
        'en': `Indicates that a method is a test method or that a class contains test methods.`
    });
    
}

export var JavaAnnotations = {
    "Fullspeed": {
        identifier: "Fullspeed",
        description: AnnotationDescriptions.fullspeed(),
        beforeClass: true,
        beforeMethod: true,
        beforeMethodOfMainClass: true  
    },
    "Override": {
        identifier: "Override",
        description: AnnotationDescriptions.override(),
        beforeClass: false,
        beforeMethod: true,
        beforeMethodOfMainClass: false
    },
    "Test": {
        identifier: "Test",
        description: AnnotationDescriptions.test(),
        beforeClass: true,
        beforeMethod: true,
        beforeMethodOfMainClass: true
    }
};

export var JavaAnnotationsArray: JavaAnnotationType[] = Object.values(JavaAnnotations) as JavaAnnotationType[];

