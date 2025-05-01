import { removeJavadocSyntax } from "../../../tools/StringTools.ts";
import { IMain } from "../../common/IMain.ts";
import { ValueRenderer } from "../../common/debugger/ValueRenderer.ts";
import { SchedulerState } from "../../common/interpreter/SchedulerState.ts";
import { Module } from "../../common/module/Module.ts";
import { BaseMonacoProvider } from "../../common/monacoproviders/BaseMonacoProvider.ts";
import { Range } from "../../common/range/Range.ts";
import { JavaLanguage } from "../JavaLanguage.ts";
import { JavaLocalVariable } from "../codegenerator/JavaLocalVariable.ts";
import { ReplReturnValue } from "../parser/repl/ReplReturnValue.ts";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType.ts";
import { JavaField } from "../types/JavaField.ts";
import { JavaMethod } from "../types/JavaMethod.ts";
import { JavaParameter } from "../types/JavaParameter.ts";
import { NonPrimitiveType } from "../types/NonPrimitiveType.ts";
import * as monaco from 'monaco-editor'
import { JavaSignatureHelpProvider } from "./JavaSignatureHelpProvider.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule.ts";


export class JavaHoverProvider extends BaseMonacoProvider {

    private static keywordDescriptions: { [keyword: string]: string } = {
        "print": "Die Anweisung ```print``` gibt eine Zeichenkette aus.",
        "new": "Das Schlüsselwort ```new``` bewirkt die Instanzierung (\"Erschaffung\") eines neuen Objektes einer Klasse.",
        "println": "Die Anweisung ```println``` gibt eine Zeichenkette gefolgt von einem Zeilenumbruch aus.",
        "while": "```\nwhile (Bedingung) {Anweisungen}\n```  \nbewirkt die Wiederholung der Anweisungen solange ```Bedingung == true``` ist.",
        "for": "```\nfor(Startanweisung;Solange-Bedingung;Nach_jeder_Wiederholung){Anweisungen}\n```  \n"
            + "führt zunächst die Startanweisung aus und wiederholt dann die Anweisungen solange ```Bedingung == true``` ist. Am Ende jeder wiederholung wird Nach_jeder_Wiederholung ausgeführt.",
        "if": "```\nif(Bedingung){Anweisungen_1} else {Anweisungen_2}\n```  \nwertet die Bedingung aus und führt Anweisungen_1 nur dann aus, wenn die Bedingung ```true``` ergibt, Anweisungen_2 nur dann, wenn die Bedingung ```false``` ergibt.  \nDer ```else```-Teil kann auch weggelassen werden.",
        "else": "```\nif(Bedingung){Anweisungen_1} else {Anweisungen_2}\n```  \nwertet die Bedingung aus und führt Anweisungen_1 nur dann aus, wenn die Bedingung ```true``` ergibt, Anweisungen_2 nur dann, wenn die Bedingung ```false``` ergibt.",
        "switch": "```\nswitch(Selektor){ case Wert_1: Anweisungen_1; break; case Wert_2: Anweisungen_2; break; default: Default-Anweisungen } \n```  \nwertet den Selektor-Term aus und führt abhängig vom Termwert Anweisungen_1, Anweisungen_2, ... aus. Entspricht der Termwert keinem der Werte Wert_1, Wert_2, ..., so werden die Default-Anweisungen ausgeführt.",
        "%": "```\na % b\n```  \n (sprich: 'a modulo b') berechnet den **Rest** der ganzzahligen Division a/b.",
        "|": "```\na | b\n```  \n (sprich: 'a or b') berechnet die **bitweise oder-Verknüpfung** der Werte a und b.",
        "&": "```\na & b\n```  \n (sprich: 'a und b') berechnet die **bitweise und-Verknüpfung** der Werte a und b.",
        "&&": "```\na & b\n```  \n (sprich: 'a und b') ergibt genau dann ```true```, wenn ```a``` und ```b``` den Wert ```true``` haben..",
        "^": "```\na ^ b\n```  \n (sprich: 'a xor b') berechnet die **bitweise exklusiv-oder-Verknüpfung** der Werte a und b.",
        ">>": "```\na >> b\n```  \n (sprich: 'a right shift b') berechnet den Wert, der entsteht, wenn man den Wert von a **bitweise um b Stellen nach rechts verschiebt**. Dieser Wert ist identisch mit dem nach unten abgerundeten Wert von a/(2 hoch b).",
        "<<": "```\na >> b\n```  \n (sprich: 'a left shift b') berechnet den Wert, der entsteht, wenn man den Wert von a **bitweise um b Stellen nach links verschiebt**. Dieser Wert ist identisch mit dem nach unten abgerundeten Wert von a*(2 hoch b).",
        "~": "```\n~a\n```  \n (sprich: 'nicht a') berechnet den Wert, der entsteht, wenn man **alle Bits von a umkehrt**.",
        "==": "```\na == b\n```  \nergibt genau dann ```true```, wenn ```a``` und ```b``` gleich sind.  \nSind a und b **Objekte**, so ergibt ```a == b``` nur dann ```true```, wenn ```a``` und ```b``` auf das **identische** Objekt zeigen.  \n```==``` nennt man **Vergleichsoperator**.",
        "<=": "```\na <= b\n```  \nergibt genau dann ```true```, wenn der Wert von ```a``` kleiner oder gleich dem Wert von ```b``` ist.",
        ">=": "```\na <= b\n```  \nergibt genau dann ```true```, wenn der Wert von ```a``` größer oder gleich dem Wert von ```b``` ist.",
        "!=": "```\na != b\n```  \nergibt genau dann ```true```, wenn ```a``` und ```b``` **un**gleich sind.  \nSind ```a``` und ```b``` **Objekte**, so ergibt ```a != b``` dann ```true```, wenn ```a``` und ```b``` **nicht** auf das **identische** Objekt zeigen.  \n```!=``` nennt man **Ungleich-Operator**.",
        "+=": "```\na += b\n(Kurzschreibweise für a = a + b)\n```  \nbewirkt, dass der Wert von ```a``` um den Wert von ```b``` **erhöht** wird. Das Ergebnis wird in die Variable ```a``` geschrieben.",
        "-=": "```\na -= b\n(Kurzschreibweise für a = a - b)\n```  \nbewirkt, dass der Wert von ```a``` um den Wert von ```b``` **erniedrigt** wird. Das Ergebnis wird in die Variable ```a``` geschrieben.",
        "*=": "```\na *= b\n(Kurzschreibweise für a = a * b)\n```  \nbewirkt, dass der Wert von ```a``` mit dem Wert von ```b``` **multipliziert** wird. Das Ergebnis wird in die Variable ```a``` geschrieben.",
        "/=": "```\na /= b\n(Kurzschreibweise für a = a / b)\n```  \nbewirkt, dass der Wert von ```a``` durch den Wert von ```b``` **dividiert** wird. Das Ergebnis wird in die Variable ```a``` geschrieben.",
        "++": "```\na++\n(Kurzschreibweise für a = a + 1)\n```  \nbewirkt, dass der Wert von ```a``` um eins erhöht wird.",
        "--": "```\na--\n(Kurzschreibweise für a = a - 1)\n```  \nbewirkt, dass der Wert von ```a``` um eins eniedrigt wird.",
        "=": "```\na = Term\n```  \nberechnet den Wert des Terms und weist ihn der Variablen ```a``` zu.  \n**Vorsicht:**  \nVerwechsle ```=```(**Zuweisungsoperator**) nicht mit ```==```(**Vergleichsoperator**)!",
        "!": "```\n!a\n```  \nergibt genau dann ```true```, wenn ```a``` ```false``` ergibt.  \n```!``` spricht man '**nicht**'.",
        "public": "```\npublic\n```  \nAttribute und Methoden, die als ```public``` deklariert werden, sind überall (auch außerhalb der Klasse) sichtbar.",
        "private": "```\nprivate\n```  \nAttribute und Methoden, die als ```private``` deklariert werden, sind nur innerhalb von Methoden derselben Klasse sichtbar.",
        "protected": "```\nprotected\n```  \nAttribute und Methoden, die als ```protected``` deklariert werden, sind nur innerhalb von Methoden derselben Klasse oder innerhalb von Methoden von Kindklassen sichtbar.",
        "return": "```\nreturn Term\n```  \nbewirkt, dass die Methode verlassen wird und der Wert des Terms an die aufrufende Stelle zurückgegeben wird.",
        "break": "```\nbreak;\n```  \ninnerhalb einer Schleife bewirkt, dass die Schleife sofort verlassen und mit den Anweisungen nach der Schleife fortgefahren wird.  \n" +
            "```break``` innerhalb einer ```switch```-Anweisung bewirkt, dass der Block der ```switch```-Anweisung verlassen wird.",
        "class": "```\nclass\n```  \nMit dem Schlüsselwort ```class``` werden Klassen definiert.",
        "extends": "```\nextends\n```  \n```class A extends B { ... }``` bedeutet, dass die Klasse A Unterklasse der Klasse B ist.",
        "implements": "```\nimplements\n```  \n```class A implements B { ... }``` bedeutet, dass die Klasse A das Interface B implementiert, d.h., dass sie alle Methoden besitzen muss, die in B definiert sind.",
        "this": "```\nthis\n```  \nInnerhalb einer Methodendefinition bezeichnet das Schlüsselwort ```this``` immer dasjenige Objekt, für das die Methode gerade ausgeführt wird.",
        "var": "```\nvar\n```  \nWird einer Variable beim Deklarieren sofort ein Startwert zugewiesen (z.B. Circle c = new Circle(100, 100, 10)), so kann statt des Datentyps das Schlüsselwort ```var``` verwendet werden (also var c = new Circle(100, 100, 10)).",
    }

    constructor(public language: JavaLanguage) {
        super(language);
        monaco.languages.registerHoverProvider(language.monacoLanguageSelector, this);
    }

    replReturnValueToOutput(replReturnValue: ReplReturnValue, caption: string) {
        if (typeof replReturnValue == "undefined") return caption + ": ---";
        let type: string = replReturnValue.type ? replReturnValue.type.toString() + " " : "";

        let text = ValueRenderer.renderValue(replReturnValue.value, 100);

        // //@ts-ignore#
        // if(typeof text["value"] !== "undefined") text = text.value;
        // switch (type) {
        //     case "string ":
        //     case "String ":
        //     if(replReturnValue.value){
        //         text = '"' + text + '"';
        //     } else {
        //         text = "null";
        //     }
        //         break;
        //     case "char ":
        //     case "Character ":
        //         text = "'" + text + "'";
        //         break;
        // }

        // if(text.length > 20){
        //     text = text.substring(0, 20) + " ...";
        // }

        return '```\n' + type + caption + " : " + text + '\n```'

    }

    provideHover(model: monaco.editor.ITextModel, position: monaco.Position, token: monaco.CancellationToken):
        monaco.languages.ProviderResult<monaco.languages.Hover> {

        let main = this.findMainForModel(model);
        if (!main) return;
        let module = main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
        if (!module) return;

        let contents: monaco.IMarkdownString[] = [];
        let range: monaco.IRange | undefined = undefined;


        for (let error of module.errors) {
            if (error.level == "error" && Range.containsPosition(error.range, position)) {
                return null; // Show error-tooltip and don't show hover-tooltip
            }
        }

        let usagePosition = module.findSymbolAtPosition(position);
        let symbol = usagePosition?.symbol;


        if (usagePosition && symbol && symbol.identifier != "var") {
            if (symbol instanceof NonPrimitiveType || symbol instanceof JavaMethod) {
                let declarationAsString1 = "```\n" + symbol.getDeclaration() + "\n```";
                if (symbol.documentation) {
                    declarationAsString1 += "\n" + this.formatDocumentation(symbol.getDocumentation());
                }
                range = usagePosition.range;
                contents.push({ value: declarationAsString1 });
            } else if (symbol instanceof PrimitiveType) {
                let declarationAsString2 = "```\n" + symbol.identifier + "\n```  \nprimitiver Datentyp";
                if (symbol.documentation) {
                    declarationAsString2 += "\n" + this.formatDocumentation(symbol.getDocumentation());
                }
                range = usagePosition.range;
                contents.push({ value: declarationAsString2 });

            } else if (symbol instanceof JavaLocalVariable || symbol instanceof JavaField || symbol instanceof JavaParameter) {
                // Variable

                let declarationAsString3 = "```\n" + symbol.getDeclaration() + "\n```"
                if (symbol.documentation) {
                    declarationAsString3 += "\n" + this.formatDocumentation(symbol.getDocumentation());
                }
                range = usagePosition.range;
                contents.push({ value: declarationAsString3 });

            }
        } else {
            let word = this.getWordUnderCursor(model, position);
            let desc = JavaHoverProvider.keywordDescriptions[word];
            if (desc != null) {
                contents.push({ value: desc })
            }
        }

        let state = main.getInterpreter().scheduler.state;

        if (state == SchedulerState.paused) {

            let repl = main.getRepl();

            let identifier: string | undefined = this.widenDeclaration(model, position, symbol?.identifier);

            if (!identifier) {
                return null;
            }

            let replReturnValue = repl.executeSynchronously(identifier);
            //            let resultObject: any = repl.executeSynchronously(identifier);




            // if(resultObject?.getType){
            //     // let type = (<RuntimeObject>resultObject).getType();
            //     declarationAsString = typeIdentifier + " " + identifier + ": " + ValueRenderer.renderValue(resultObject, 12);
            // } else
            if (replReturnValue != null) {
                contents.push({ value: '```\n' + this.replReturnValueToOutput(replReturnValue, identifier) + '\n```' });
            }
        }


        if (contents.length < 2) {

            let signatureHelp = JavaSignatureHelpProvider.provideSignatureHelpLater(<JavaCompiledModule>module, model, position, null, null);

            if (signatureHelp?.value) {
                let sh = signatureHelp.value;
                let signature = sh.signatures[sh.activeSignature];
                let label = signature.parameters[sh.activeParameter]?.label
                let documentation = <string>signature.parameters[sh.activeParameter]?.documentation
                if (!label) return null;
                if (Array.isArray(label)) {
                    label = signature.label.substring(label[0], label[1]);
                }
                if(signature[JavaSignatureHelpProvider.ISINTRINSIC]){
                    contents.push({ value: documentation || label });
                } else {
                    contents.push({ value: "```\n" + label + "\n```" });
                }
            }

        }


        return {
            range: range,
            contents: contents,
        }

    }

    formatDocumentation(documentation: string | undefined) {
        if (documentation?.startsWith("/*")) {
            documentation = removeJavadocSyntax(documentation, 1);
        }
        return documentation;
    }

    getWordUnderCursor(model: monaco.editor.ITextModel, position: monaco.Position)
        : string {

        let pos = model.getValueLengthInRange({
            startColumn: 0,
            startLineNumber: 0,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });

        let text = model.getValue();

        let word = "";

        let end = pos;
        while (end < text.length && this.isInsideIdentifierOrArrayDescriptor(text.charAt(end))) {
            end++;
        }

        let begin = pos;
        while (begin > 0 && this.isInsideIdentifierOrArrayDescriptor(text.charAt(begin - 1))) {
            begin--;
        }

        if (end - begin > 1) {
            word = text.substring(begin, end);
        } else {
            end = pos;
            while (end < text.length && this.isInsideOperator(text.charAt(end))) {
                end++;
            }

            begin = pos;
            while (begin > 0 && this.isInsideOperator(text.charAt(begin - 1))) {
                begin--;
            }

            if (end - begin > 0) {
                word = text.substring(begin, end);
            }
        }

        return word;

    }

    widenDeclaration(model: monaco.editor.ITextModel, position: monaco.Position,
        identifier: string | undefined): string | undefined {

        let pos = model.getValueLengthInRange({
            startColumn: 0,
            startLineNumber: 0,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });

        let text = model.getValue();

        let end = pos;
        while (end < text.length && this.isInsideIdentifierOrArrayDescriptor(text.charAt(end))) {
            end++;
        }

        let begin = pos;
        while (begin > 0 && this.isInsideIdentifierChain(text.charAt(begin - 1))) {
            begin--;
        }

        if (end - begin > length) {
            return text.substring(begin, end);
        }

        return identifier;
    }

    isInsideIdentifierChain(t: string) {

        return t.toLocaleLowerCase().match(/[a-z0-9äöüß_\[\]\.]/i);

    }

    isInsideOperator(t: string) {

        return t.toLocaleLowerCase().match(/[&|!%<>=\+\-\*\/]/i);

    }

    isInsideIdentifierOrArrayDescriptor(t: string) {

        return t.toLocaleLowerCase().match(/[a-z0-9äöüß\[\]]/i);

    }


}