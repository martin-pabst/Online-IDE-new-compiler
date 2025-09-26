import { lm } from "../../../tools/language/LanguageManager";

export class HoverMessages {
        static print  = () => lm({
        "de": "Die Anweisung ```print``` gibt eine Zeichenkette aus.",
        "en": "Statement ```print``` outputs a string.",
        "fr": "L'instruction ```print``` affiche une chaîne de caractères.",
        })
    
        static new = () => lm({
        "de": "Das Schlüsselwort ```new``` bewirkt die Instanzierung (\"Erschaffung\") eines neuen Objektes einer Klasse.",
        "en": "Statement ```new``` creates a new instance of a class.",
        "fr": "L'instruction ```new``` crée une nouvelle instance d'une classe.",
        })
    
        static println = () => lm({
        "de": "Die Anweisung ```println``` gibt eine Zeichenkette gefolgt von einem Zeilenumbruch aus.",
        "en": "Statement ```println``` outputs a string followed by a newline.",
        "fr": "L'instruction ```println``` affiche une chaîne de caractères suivie d'un saut de ligne.",
        })
    
        static while = () => lm({
        "de": "```\nwhile (Bedingung) {Anweisungen}\n```  \nbewirkt die Wiederholung der Anweisungen solange ```Bedingung == true``` ist.",
        "en": "```\nwhile (condition) {statements}\n```  \nrepeats the statements as long as ```condition == true```.",
        "fr": "```\nwhile (condition) {instructions}\n```  \nrépète les instructions tant que ```condition == true```.",
        })
    
        static for = () => lm({
        "de": "```\nfor(Startanweisung;Solange-Bedingung;Nach_jeder_Wiederholung){Anweisungen}\n```  \n"
        + "führt zunächst die Startanweisung aus und wiederholt dann die Anweisungen solange ```Bedingung == true``` ist. Am Ende jeder wiederholung wird Nach_jeder_Wiederholung ausgeführt.",
        "en": "```\nfor(initialization;condition;after_each_iteration){statements}\n```  \n" 
        + "first executes the initialization and then repeats the statements as long as ```condition == true```. At the end of each iteration, after_each_iteration is executed.",
        "fr": "```\nfor(initialisation;condition;après_chaque_itération){instructions}\n```  \n"
        + "exécute d'abord l'initialisation, puis répète les instructions tant que ```condition == true```. À la fin de chaque itération, après_chaque_itération est exécuté.",
        })
    
        static if = () => lm({
        "de": "```\nif(Bedingung){Anweisungen_1} else {Anweisungen_2}\n```  \nwertet die Bedingung aus und führt Anweisungen_1 nur dann aus, wenn die Bedingung ```true``` ergibt, Anweisungen_2 nur dann, wenn die Bedingung ```false``` ergibt.  \nDer ```else```-Teil kann auch weggelassen werden.",
        "en": "```\nif(condition){statements_1} else {statements_2}\n```  \nevaluates the condition and executes statements_1 only if the condition is ```true```, statements_2 only if the condition is ```false```.  \nThe ```else``` part can also be omitted.",
        "fr": "```\nif(condition){instructions_1} else {instructions_2}\n```  \névalue la condition et exécute instructions_1 uniquement si la condition est ```true```, instructions_2 uniquement si la condition est ```false```.  \nLa partie ```else``` peut également être omise.",
        })
    
        static else = () => lm({
        "de": "```\nif(Bedingung){Anweisungen_1} else {Anweisungen_2}\n```  \nwertet die Bedingung aus und führt Anweisungen_1 nur dann aus, wenn die Bedingung ```true``` ergibt, Anweisungen_2 nur dann, wenn die Bedingung ```false``` ergibt.",
        "en": "```\nif(condition){statements_1} else {statements_2}\n```  \nevaluates the condition and executes statements_1 only if the condition is ```true```, statements_2 only if the condition is ```false```.",
        "fr": "```\nif(condition){instructions_1} else {instructions_2}\n```  \névalue la condition et exécute instructions_1 uniquement si la condition est ```true```, instructions_2 uniquement si la condition est ```false```.",
        })
    
        static switch = () => lm({
        "de": "```\nswitch(Selektor){ case Wert_1: Anweisungen_1; break; case Wert_2: Anweisungen_2; break; default: Default-Anweisungen } \n```  \nwertet den Selektor-Term aus und führt abhängig vom Termwert Anweisungen_1, Anweisungen_2, ... aus. Entspricht der Termwert keinem der Werte Wert_1, Wert_2, ..., so werden die Default-Anweisungen ausgeführt.",
        "en": "```\nswitch(selector){ case value_1: statements_1; break; case value_2: statements_2; break; default: default-statements } \n```  \nevaluates the selector term and executes statements_1, statements_2, ... depending on the term value. If the term value does not match any of the values value_1, value_2, ..., the default statements are executed.",
        "fr": "```\nswitch(sélecteur){ case valeur_1: instructions_1; break; case valeur_2: instructions_2; break; default: instructions_par_défaut } \n```  \névalue le terme sélecteur et exécute instructions_1, instructions_2, ... en fonction de la valeur du terme. Si la valeur du terme ne correspond à aucune des valeurs valeur_1, valeur_2, ..., les instructions par défaut sont exécutées.",
        })
    
        static modulo = () => lm({
        "de": "```\na % b\n```  \n (sprich: 'a modulo b') berechnet den **Rest** der ganzzahligen Division a/b.",
        "en": "```\na % b\n```  \n (read: 'a modulo b') calculates the **remainder** of the integer division a/b.",
        "fr": "```\na % b\n```  \n (lire : 'a modulo b') calcule le **reste** de la division entière a/b.",
        })
    
        static bitwiseOr = () => lm({
        "de": "```\na | b\n```  \n (sprich: 'a or b') berechnet die **bitweise oder-Verknüpfung** der Werte a und b.",
        "en": "```\na | b\n```  \n (read: 'a or b') calculates the **bitwise or operation** of the values a and b.",
        "fr": "```\na | b\n```  \n (lire : 'a or b') calcule l'**opération OU bit à bit** des valeurs a et b.",
        })
    
        static bitwiseAnd = () => lm({
        "de": "```\na & b\n```  \n (sprich: 'a und b') berechnet die **bitweise und-Verknüpfung** der Werte a und b.",
        "en": "```\na & b\n```  \n (read: 'a and b') calculates the **bitwise and operation** of the values a and b.",
        "fr": "```\na & b\n```  \n (lire : 'a and b') calcule l'**opération ET bit à bit** des valeurs a et b.",
        })
    
        static logicalAnd = () => lm({
        "de": "```\na & b\n```  \n (sprich: 'a und b') ergibt genau dann ```true```, wenn ```a``` und ```b``` den Wert ```true``` haben..",
        "en": "```\na & b\n```  \n (read: 'a and b') is ```true``` if and only if both ```a``` and ```b``` are ```true```.",
        "fr": "```\na & b\n```  \n (lire : 'a and b') est ```true``` si et seulement si à la fois ```a``` et ```b``` sont ```true```.",
        })
    
        static logicalOr = () => lm({
        "de": "```\na | b\n```  \n (sprich: 'a oder b') ergibt genau dann ```true```, wenn ```a``` oder ```b``` den Wert ```true``` haben..",
        "en": "```\na | b\n```  \n (read: 'a or b') is ```true``` if and only if either ```a``` or ```b``` is ```true```.",
        "fr": "```\na | b\n```  \n (lire : 'a or b') est ```true``` si et seulement si soit ```a``` soit ```b``` est ```true```.",
        })
    
        static bitwiseXor = () => lm({
        "de": "```\na ^ b\n```  \n (sprich: 'a xor b') berechnet die **bitweise exklusiv-oder-Verknüpfung** der Werte a und b.",
        "en": " ```\na ^ b\n```  \n (read: 'a xor b') calculates the **bitwise exclusive or operation** of the values a and b.",
        "fr": "```\na ^ b\n```  \n (lire : 'a xor b') calcule l'**opération OU exclusif bit à bit** des valeurs a et b.",
        })
    
        static rightShift = () => lm({
        "de": "```\na >> b\n```  \n (sprich: 'a right shift b') berechnet den Wert, der entsteht, wenn man den Wert von a **bitweise um b Stellen nach rechts verschiebt**. Dieser Wert ist identisch mit dem nach unten abgerundeten Wert von a/(2 hoch b).",
        "en": "```\na >> b\n```  \n (read: 'a right shift b') calculates the value obtained by **shifting the bits of a to the right by b positions**. This value is identical to the value of a/(2 to the power of b) rounded down.",
        "fr": "```\na >> b\n```  \n (lire : 'a right shift b') calcule la valeur obtenue en **décalant les bits de a vers la droite de b positions**. Cette valeur est identique à la valeur de a/(2 puissance b) arrondie à l'entier inférieur.",
        })
    
        static leftShift = () => lm({
        "de": "```\na >> b\n```  \n (sprich: 'a left shift b') berechnet den Wert, der entsteht, wenn man den Wert von a **bitweise um b Stellen nach links verschiebt**. Dieser Wert ist identisch mit dem nach unten abgerundeten Wert von a*(2 hoch b).",
        "en": "```\na << b\n```  \n (read: 'a left shift b') calculates the value obtained by **shifting the bits of a to the left by b positions**. This value is identical to the value of a*(2 to the power of b) rounded down.",
        "fr": "```\na << b\n```  \n (lire : 'a left shift b') calcule la valeur obtenue en **décalant les bits de a vers la gauche de b positions**. Cette valeur est identique à la valeur de a*(2 puissance b) arrondie à l'entier inférieur.",
        })
    
        static bitwiseNot = () => lm({
        "de": "```\n~a\n```  \n (sprich: 'nicht a') berechnet den Wert, der entsteht, wenn man **alle Bits von a umkehrt**.",
        "en": "```\n~a\n```  \n (read: 'not a') calculates the value obtained by **inverting all bits of a**.",
        "fr": "```\n~a\n```  \n (lire : 'not a') calcule la valeur obtenue en **inversant tous les bits de a**.",
        })
    
        static equals = () => lm({
        "de": "```\na == b\n```  \nergibt genau dann ```true```, wenn ```a``` und ```b``` gleich sind.  \nSind a und b **Objekte**, so ergibt ```a == b``` nur dann ```true```, wenn ```a``` und ```b``` auf das **identische** Objekt zeigen.  \n```==``` nennt man **Vergleichsoperator**.",
        "en": "```\na == b\n```  \nis ```true``` if and only if ```a``` and ```b``` are equal.  \nIf a and b are **objects**, then ```a == b``` is ```true``` only if ```a``` and ```b``` point to the **same** object.  \n```==``` is called a **comparison operator**.",
        "fr": "```\na == b\n```  \nest ```true``` si et seulement si ```a``` et ```b``` sont égaux.  \nSi a et b sont des **objets**, alors ```a == b``` est ```true``` uniquement si ```a``` et ```b``` pointent vers le **même** objet.  \n```==``` est appelé un **opérateur de comparaison**.",
        })
    
        static lessEquals = () => lm({
        "de": "```\na <= b\n```  \nergibt genau dann ```true```, wenn der Wert von ```a``` kleiner oder gleich dem Wert von ```b``` ist.",
        "en": "```\na <= b\n```  \nis ```true``` if and only if the value of ```a``` is less than or equal to the value of ```b```.",
        "fr": "```\na <= b\n```  \nest ```true``` si et seulement si la valeur de ```a``` est inférieure ou égale à la valeur de ```b```.",
        })
    
        static greaterEquals = () => lm({
        "de": "```\na >= b\n```  \nergibt genau dann ```true```, wenn der Wert von ```a``` größer oder gleich dem Wert von ```b``` ist.",
        "en": "```\na >= b\n```  \nis ```true``` if and only if the value of ```a``` is greater than or equal to the value of ```b```.",
        "fr": "```\na >= b\n```  \nest ```true``` si et seulement si la valeur de ```a``` est supérieure ou égale à la valeur de ```b```.",
        })
    
        static notEquals = () => lm({
            "de": "```\na != b\n```  \nergibt genau dann ```true```, wenn ```a``` und ```b``` **un**gleich sind.  \nSind ```a``` und ```b``` **Objekte**, so ergibt ```a != b``` dann ```true```, wenn ```a``` und ```b``` **nicht** auf das **identische** Objekt zeigen.  \n```!=``` nennt man **Ungleich-Operator**.",
            "en": "```\na != b\n```  \nis ```true``` if and only if ```a``` and ```b``` are **not** equal.  \nIf ```a``` and ```b``` are **objects**, then ```a != b``` is ```true``` if ```a``` and ```b``` do **not** point to the **same** object.  \n```!=``` is called a **not-equal operator**.",
            "fr": "```\na != b\n```  \nest ```true``` si et seulement si ```a``` et ```b``` ne sont pas égaux.  \nSi ```a``` et ```b``` sont des **objets**, alors ```a != b``` est ```true``` si ```a``` et ```b``` ne pointent pas vers le **même** objet.  \n```!=``` est appelé un **opérateur de non-égalité**.",
        })

        static plusAssign = () => lm({
            "de": "```\na += b\n(Kurzschreibweise für a = a + b)\n```  \nbewirkt, dass der Wert von ```a``` um den Wert von ```b``` **erhöht** wird. Das Ergebnis wird in die Variable ```a``` geschrieben.",
            "en": "```\na += b\n(short for a = a + b)\n```  \ncauses the value of ```a``` to be **increased** by the value of ```b```. The result is written to the variable ```a```.",
            "fr": "```\na += b\n(court pour a = a + b)\n```  \nfait que la valeur de ```a``` est **augmentée** de la valeur de ```b```. Le résultat est écrit dans la variable ```a```.",
        })

        static minusAssign = () => lm({
            "de": "```\na -= b\n(Kurzschreibweise für a = a - b)\n```  \nbewirkt, dass der Wert von ```a``` um den Wert von ```b``` **erniedrigt** wird. Das Ergebnis wird in die Variable ```a``` geschrieben.",
            "en": "```\na -= b\n(short for a = a - b)\n```  \ncauses the value of ```a``` to be **decreased** by the value of ```b```. The result is written to the variable ```a```.",
            "fr": "```\na -= b\n(court pour a = a - b)\n```  \nfait que la valeur de ```a``` est **diminuée** de la valeur de ```b```. Le résultat est écrit dans la variable ```a```. ",
        })

        static timesAssign = () => lm({
            "de": "```\na *= b\n(Kurzschreibweise für a = a * b)\n```  \nbewirkt, dass der Wert von ```a``` mit dem Wert von ```b``` **multipliziert** wird. Das Ergebnis wird in die Variable ```a``` geschrieben.",
            "en": "```\na *= b\n(short for a = a * b)\n```  \ncauses the value of ```a``` to be **multiplied** by the value of ```b```. The result is written to the variable ```a```.",
            "fr": "```\na *= b\n(court pour a = a * b)\n```  \nfait que la valeur de ```a``` est **multipliée** par la valeur de ```b```. Le résultat est écrit dans la variable ```a```.",
        })

        static divAssign = () => lm({
            "de": "```\na /= b\n(Kurzschreibweise für a = a / b)\n```  \nbewirkt, dass der Wert von ```a``` durch den Wert von ```b``` **dividiert** wird. Das Ergebnis wird in die Variable ```a``` geschrieben.",
            "en": "```\na /= b\n(short for a = a / b)\n```  \ncauses the value of ```a``` to be **divided** by the value of ```b```. The result is written to the variable ```a```.",
            "fr": "```\na /= b\n(court pour a = a / b)\n```  \nfait que la valeur de ```a``` est **divisée** par la valeur de ```b```. Le résultat est écrit dans la variable ```a```.",
        })

        static increment = () => lm({
            "de": "```\na++\n(Kurzschreibweise für a = a + 1)\n```  \nbewirkt, dass der Wert von ```a``` um eins erhöht wird.",
            "en": "```\na++\n(short for a = a + 1)\n```  \ncauses the value of ```a``` to be increased by one.",
            "fr": "```\na++\n(court pour a = a + 1)\n```  \nfait que la valeur de ```a``` est augmentée de un.",
        })

        static decrement = () => lm({
            "de": "```\na--\n(Kurzschreibweise für a = a - 1)\n```  \nbewirkt, dass der Wert von ```a``` um eins eniedrigt wird.",
            "en": "```\na--\n(short for a = a - 1)\n```  \ncauses the value of ```a``` to be decreased by one.",
            "fr": "```\na--\n(court pour a = a - 1)\n```  \nfait que la valeur de ```a``` est diminuée de un.",
        })

        static assign = () => lm({
            "de": "```\na = Term\n```  \nberechnet den Wert des Terms und weist ihn der Variablen ```a``` zu.  \n**Vorsicht:**  \nVerwechsle ```=```(**Zuweisungsoperator**) nicht mit ```==```(**Vergleichsoperator**)!",
            "en": "```\na = term\n```  \nevaluates the value of the term and assigns it to the variable ```a```.  \n**Caution:**  \nDo not confuse ```=```(**assignment operator**) with ```==```(**comparison operator**)!",
            "fr": "```\na = terme\n```  \névalue la valeur du terme et l'assigne à la variable ```a```.  \n**Attention :**  \nNe confondez pas ```=```(**opérateur d'affectation**) avec ```==```(**opérateur de comparaison**)!",
        })

        static not = () => lm({
            "de": "```\n!a\n```  \nergibt genau dann ```true```, wenn ```a``` ```false``` ergibt.  \n```!``` spricht man '**nicht**'.",
            "en": "```\n!a\n```  \nis ```true``` if and only if ```a``` is ```false```.  \n```!``` is read as '**not**'.",
            "fr": "```\n!a\n```  \nest ```true``` si et seulement si ```a``` est ```false```.  \n```!``` se lit '**not**'.",
        })

        static public = () => lm({
            "de": "```\npublic\n```  \nAttribute und Methoden, die als ```public``` deklariert werden, sind überall (auch außerhalb der Klasse) sichtbar.",
            "en": "```\npublic\n```  \nAttributes and methods declared as ```public``` are visible everywhere (even outside the class)."  ,
            "fr": "```\npublic\n```  \nLes attributs et les méthodes déclarés comme ```public``` sont visibles partout (même en dehors de la classe).",
        })

        static private = () => lm({
            "de": "```\nprivate\n```  \nAttribute und Methoden, die als ```private``` deklariert werden, sind nur innerhalb von Methoden derselben Klasse sichtbar.",
            "en": "```\nprivate\n```  \nAttributes and methods declared as ```private``` are only visible within methods of the same class."  ,
            "fr": "```\nprivate\n```  \nLes attributs et les méthodes déclarés comme ```private``` ne sont visibles que dans les méthodes de la même classe.",
        })

        static protected = () => lm({
            "de": "```\nprotected\n```  \nAttribute und Methoden, die als ```protected``` deklariert werden, sind nur innerhalb von Methoden derselben Klasse oder innerhalb von Methoden von Kindklassen sichtbar.",
            "en": "```\nprotected\n```  \nAttributes and methods declared as ```protected``` are only visible within methods of the same class or within methods of child classes."  ,
            "fr": "```\nprotected\n```  \nLes attributs et les méthodes déclarés comme ```protected``` ne sont visibles que dans les méthodes de la même classe ou dans les méthodes des classes enfants.",
        })

        static return = () => lm({
            "de": "```\nreturn Term\n```  \nbewirkt, dass die Methode verlassen wird und der Wert des Terms an die aufrufende Stelle zurückgegeben wird.",
            "en": "```\nreturn term\n```  \ncauses the method to be exited and the value of the term to be returned to the calling location.",
            "fr": "```\nreturn terme\n```  \nfait que la méthode est quittée et que la valeur du terme est renvoyée à l'emplacement d'appel.",
        })

        static break = () => lm({
            "de": "```\nbreak;\n```  \ninnerhalb einer Schleife bewirkt, dass die Schleife sofort verlassen und mit den Anweisungen nach der Schleife fortgefahren wird.  \n" +
            "```break``` innerhalb einer ```switch```-Anweisung bewirkt, dass der Block der ```switch```-Anweisung verlassen wird.",

            "en": " ```\nbreak;\n```  \nwithin a loop causes the loop to be exited immediately and execution to continue with the statements after the loop.  \n" +
            "```break``` within a ```switch``` statement causes the block of the ```switch``` statement to be exited.",

            "fr": " ```\nbreak;\n```  \ndans une boucle, fait que la boucle est quittée immédiatement et que l'exécution se poursuit avec les instructions après la boucle.  \n" +
            "```break``` dans une instruction ```switch``` fait que le bloc de l'instruction ```switch``` est quitté.",
        })

        static class = () => lm({
            "de": "```\nclass\n```  \nMit dem Schlüsselwort ```class``` werden Klassen definiert.",
            "en": "```\nclass\n```  \nThe keyword ```class``` is used to define classes.",
            "fr": "```\nclass\n```  \nLe mot-clé ```class``` est utilisé pour définir des classes.",
        })

        static extends = () => lm({
            "de": "```\nextends\n```  \n```class A extends B { ... }``` bedeutet, dass die Klasse A Unterklasse der Klasse B ist.",
            "en": "```\nextends\n```  \n```class A extends B { ... }``` means that class A is a subclass of class B.",
            "fr": "```\nextends\n```  \n```class A extends B { ... }``` signifie que la classe A est une sous-classe de la classe B.",
        })

        static implements = () => lm({
            "de": "```\nimplements\n```  \n```class A implements B { ... }``` bedeutet, dass die Klasse A das Interface B implementiert, d.h., dass sie alle Methoden besitzen muss, die in B definiert sind.",
            "en": "```\nimplements\n```  \n```class A implements B { ... }``` means that class A implements the interface B, i.e., that it must have all the methods defined in B.",
            "fr": "```\nimplements\n```  \n```class A implements B { ... }``` signifie que la classe A implémente l'interface B, c'est-à-dire qu'elle doit posséder toutes les méthodes définies dans B.",
        })

        static thisKeyword = () => lm({
            "de": "```\nthis\n```  \nInnerhalb einer Methodendefinition bezeichnet das Schlüsselwort ```this``` immer dasjenige Objekt, für das die Methode gerade ausgeführt wird.",
            "en": "```\nthis\n```  \nWithin a method definition, the keyword ```this``` always refers to the object for which the method is currently being executed.",
            "fr": "```\nthis\n```  \nDans une définition de méthode, le mot-clé ```this``` fait toujours référence à l'objet pour lequel la méthode est en cours d'exécution.",
        })

        static var = () => lm({
            "de": "```\nvar\n```  \nWird einer Variable beim Deklarieren sofort ein Startwert zugewiesen (z.B. Circle c = new Circle(100, 100, 10)), so kann statt des Datentyps das Schlüsselwort ```var``` verwendet werden (also var c = new Circle(100, 100, 10)).",
            "en": "```\nvar\n```  \nIf a variable is assigned an initial value when it is declared (e.g., Circle c = new Circle(100, 100, 10)), the keyword ```var``` can be used instead of the data type (i.e., var c = new Circle(100, 100, 10)).",
            "fr": "```\nvar\n```  \nSi une variable se voit attribuer une valeur initiale lors de sa déclaration (par exemple, Circle c = new Circle(100, 100, 10)), le mot-clé ```var``` peut être utilisé à la place du type de données (c'est-à-dire var c = new Circle(100, 100, 10)).",
        })

}