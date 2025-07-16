import { BaseMonacoProvider } from "../../common/monacoproviders/BaseMonacoProvider.ts";
import { JavaLanguage } from "../JavaLanguage.ts";
import { JavaCompiledModule, JavaMethodCallPosition } from "../module/JavaCompiledModule.ts";
import { JavaArrayType } from "../types/JavaArrayType.ts";
import { JavaMethod } from "../types/JavaMethod.ts";
import * as monaco from 'monaco-editor'


export class JavaSignatureHelpProvider extends BaseMonacoProvider implements monaco.languages.SignatureHelpProvider {

    public static ISINTRINSIC: string = "isIntrinsic";

    constructor(language: JavaLanguage) {
        super(language);
        monaco.languages.registerSignatureHelpProvider(language.monacoLanguageSelector, this);
    }

    signatureHelpTriggerCharacters?: readonly string[] = ['(', ',', ';', '<', '>', '=']; // semicolon, <, >, = for for-loop, if, while, ...
    signatureHelpRetriggerCharacters?: readonly string[] = [' '];

    provideSignatureHelp(model: monaco.editor.ITextModel, position: monaco.Position, token: monaco.CancellationToken, context: monaco.languages.SignatureHelpContext):
        monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult> {

        let that = this;
        if (model.getLanguageId() != 'myJava') return undefined;

        let main = this.findMainForModel(model);
        if (!main) return;

        let module: JavaCompiledModule;


        let onlineIDEConsole = main.getBottomDiv()?.console;
        if (onlineIDEConsole?.editor?.getModel() == model) {
            onlineIDEConsole.compile();
            module = main.getRepl().getCurrentModule();
        } else {
            module = <JavaCompiledModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
        }

        if (!module) return;


        return new Promise(async (resolve, reject) => {

                await main.getCurrentWorkspace()?.ensureModuleIsCompiled(module);

                resolve(JavaSignatureHelpProvider.provideSignatureHelpLater(module, model, position, token, context));

        });

    }

    static provideSignatureHelpLater(module: JavaCompiledModule, model: monaco.editor.ITextModel,
        position: monaco.Position,
        token: monaco.CancellationToken,
        context: monaco.languages.SignatureHelpContext):
        monaco.languages.SignatureHelpResult {

        let methodCallPositions = module.methodCallPositions[position.lineNumber];

        if (methodCallPositions == null) return null;

        let methodCallPosition: JavaMethodCallPosition | undefined = undefined;
        let rightMostPosition: number = -1;

        for (let i = methodCallPositions.length - 1; i >= 0; i--) {
            let mcp = methodCallPositions[i];
            if (mcp.identifierRange.endColumn < position.column
                && mcp.identifierRange.startColumn > rightMostPosition) {
                if (mcp.rightBracketPosition == null ||
                    (position.lineNumber <= mcp.rightBracketPosition.lineNumber && position.column <= mcp.rightBracketPosition.column)
                    || (position.lineNumber < mcp.rightBracketPosition.lineNumber)) {
                    methodCallPosition = mcp;
                    rightMostPosition = mcp.identifierRange.startColumn;
                }
            }
        }

        if (methodCallPosition == null) return null;

        return JavaSignatureHelpProvider.getSignatureHelp(methodCallPosition, position);

    }

    static getSignatureHelp(methodCallPosition: JavaMethodCallPosition,
        position: monaco.Position): monaco.languages.SignatureHelpResult {

        let parameterIndex: number = 0;

        for (let cp of methodCallPosition.commaPositions) {
            if (cp.lineNumber < position.lineNumber || (cp.lineNumber == position.lineNumber && cp.column < position.column)) {
                parameterIndex++;
            }
        }

        let signatureInformationList: monaco.languages.SignatureInformation[] = [];

        let activeSignature: number = 0;

        if (typeof methodCallPosition.possibleMethods == "string") {
            let keywordInfo: monaco.languages.SignatureInformation[] = JavaSignatureHelpProvider.makeIntrinsicSignatureInformation(<string>methodCallPosition.possibleMethods, parameterIndex);
            for(let kwi of keywordInfo) {
                if(!kwi.label.startsWith("print")) kwi[JavaSignatureHelpProvider.ISINTRINSIC] = true;
            }
            signatureInformationList = signatureInformationList.concat(keywordInfo);
        } else {
            let i = 0;
            for (let method of methodCallPosition.possibleMethods.sort((m1, m2) => { return Math.sign(m2.parameters.length - m1.parameters.length)})) {
                let m = <JavaMethod>method;
                if (parameterIndex == 0 || m.parameters.length > parameterIndex) {

                    signatureInformationList.push(JavaSignatureHelpProvider.makeSignatureInformation(m));
                    if (m == methodCallPosition.bestMethod && m.parameters.length > 0) {
                        activeSignature = i;
                    }
                    i++;
                }
            }
        }

        return {
            value: {
                activeParameter: parameterIndex,
                activeSignature: activeSignature,
                signatures: signatureInformationList
            },
            dispose: () => { }
        };
    }

    static makeIntrinsicSignatureInformation(method: string, parameterIndex: number): monaco.languages.SignatureInformation[] {

        switch (method) {
            case "while":
                return [
                    {
                        label: "while(Bedingung){ Anweisungen }",
                        documentation: "Wiederholung mit Anfangsbedingung (while-loop)",
                        parameters: [
                            { label: "Bedingung der while-loop", documentation: "Die Bedingung wird vor jeder Wiederholung ausgewertet. Ist sie erfüllt ist (d.h. hat sie den Wert true), so werden die Anweisungen in {} erneut ausgeführt, ansonsten wird mit der nächsten Anweisung nach { } fortgefahren." },
                        ]
                    }];
            case "if":
                return [
                    {
                        label: "if(Bedingung){ Anweisungen1 } else { Anweisungen2 }",
                        documentation: "Bedingung (else... ist optional)",
                        parameters: [
                            { label: "Bedingung im if-statement", documentation: "Ist die Bedingung erfüllt (d.h. hat sie den Wert true), so werden die Anweisungen1 ausgeführt. Trifft die Bedingung nicht zu (d.h. hat sie den Wert false), so werden die Anweisungen2 ausgeführt." },
                        ]
                    }];
            case "switch":
                return [
                    {
                        label: "switch(Selektor){case Wert_1: Anweisungen1; break; case Wert_2 Anweisungen2; break; default: Defaultanweisungen; break;}",
                        documentation: "Bedingung (else... ist optional)",
                        parameters: [
                            { label: "Selektor des switch-statements", documentation: "Der Wert des Selektor-Terms wird ausgewertet. Hat er den Wert Wert_1, so werden die Anweisungen1 ausgeführt. Hat er den Wert Wert_2, so werden die Anweisungen2 ausgeführt usw. Hat er keinen der bei case... aufgeführten Werte, so werden die Defaultanweisungen ausgeführt." },
                        ]
                    }];
            case "for":
                return [
                    {
                        label: "for(Startanweisung; Bedingung; Anweisung am Ende jeder Wiederholung){ Anweisungen }",
                        documentation: "Wiederholung mit for (for-loop)",
                        parameters: [
                            { label: [4, 18], documentation: "Startanweisung der for-loop: Anweisung wird vor der ersten Wiederholung einmal ausgeführt." },
                            { label: [20, 29], documentation: "Die Bedingung der for-loop wird vor jeder Wiederholung ausgewertet. Ist sie erfüllt ist (d.h. hat sie den Wert true), so werden die Anweisungen in {} erneut ausgeführt, ansonsten wird mit der nächsten Anweisung nach { } fortgefahren." },
                            { label: [31, 67], documentation: "Diese Anweisung wird stets am Ende jeder Wiederholung der for-loop ausgeführt." },
                        ]
                    }];
            case "print":
                let methods: monaco.languages.SignatureInformation[] =
                    [
                        {
                            label: "print(text: String, color: String)",
                            documentation: "Gibt Text farbig in der Ausgabe aus",
                            parameters: [
                                { label: "text: String", documentation: "text: Text, der ausgegeben werden soll" },
                                { label: "color: String", documentation: "Farbe (englischer Name oder #ffffff oder rgb(255,255,255)) oder statisches Attribut der Klasse Color, z.B. Color.red" }
                            ]
                        },
                        {
                            label: "print(text: String, color: int)",
                            documentation: "Gibt Text farbig in der Ausgabe aus",
                            parameters: [
                                { label: "text: String", documentation: "text: Text, der ausgegeben werden soll" },
                                { label: "color: String", documentation: "Farbe als int-Wert kodiert, z.B. 0xff00ff" },
                            ]
                        },
                        {
                            label: "print(text: String)",
                            documentation: "Gibt Text in der Ausgabe aus",
                            parameters: [
                                { label: "text: String", documentation: "text: Text, der ausgegeben werden soll" }
                            ]
                        }
                    ];
                return methods;
            case "println":

                return [
                    {
                        label: "println(text: String, color: String)",
                        documentation: "Gibt Text farbig in der Ausgabe aus. Der nächste Text landet eine Zeile tiefer.",
                        parameters: [
                            { label: "text: String", documentation: "text: Text, der ausgegeben werden soll" },
                            { label: "color: String", documentation: "Farbe (englischer Name oder #ffffff oder rgb(255,255,255) oder statisches Attribut der Klasse Color, z.B. Color.red)" }
                        ]
                    },
                    {
                        label: "println(text: String, color: int)",
                        documentation: "Gibt Text farbig in der Ausgabe aus. Der nächste Text landet eine Zeile tiefer.",
                        parameters: [
                            { label: "text: String", documentation: "text: Text, der ausgegeben werden soll" },
                            { label: "color: int", documentation: "Farbe als int-kodierter Wert, z.B. 0xffffff" }
                        ]
                    },
                    {
                        label: "println(text: String)",
                        documentation: "Gibt Text farbig in der Ausgabe aus. Der nächste Text landet eine Zeile tiefer.",
                        parameters: [
                            { label: "text: String", documentation: "text: Text, der ausgegeben werden soll" }
                        ]
                    },
                ];
        }

        return [];

    }


    static makeSignatureInformation(method: JavaMethod): monaco.languages.SignatureInformation {

        let label: string = "";

        if (method.returnParameterType != null && !method.isConstructor) {
            label += method.returnParameterType.toString() + " ";
        }

        label += method.identifier + "(";

        let parameterInformationList: monaco.languages.ParameterInformation[] = [];

        let pl = method.parameters;

        for (let i = 0; i < pl.length; i++) {

            let p = pl[i];
            let posFrom = label.length;
            let type = p.type;
            if (p.isEllipsis) {
                type = (<JavaArrayType>type).getElementType();
            }

            let pLabel = type.toString() + (p.isEllipsis ? "..." : "") + " " + p.identifier;
            label += pLabel;
            let posTo = label.length;

            if (i < pl.length - 1) {
                label += ", ";
            }

            let pi: monaco.languages.ParameterInformation = {
                label: [posFrom, posTo],
                documentation: "" //Test: Parameter documentation"
            };

            parameterInformationList.push(pi);

        }



        label += ")";

        return {
            label: label,
            parameters: parameterInformationList,
            documentation: method.documentation == null ? "" : (typeof method.documentation == "string") ? method.documentation : method.documentation()
        }

    }

}