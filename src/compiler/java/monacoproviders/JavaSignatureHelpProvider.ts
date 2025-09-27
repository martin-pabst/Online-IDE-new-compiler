import { BaseMonacoProvider } from "../../common/monacoproviders/BaseMonacoProvider.ts";
import { JavaLanguage } from "../JavaLanguage.ts";
import { SignatureHelpMessages } from "../language/SignatureHelpMessages.ts";
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
            for (let kwi of keywordInfo) {
                if (!kwi.label.startsWith("print")) kwi[JavaSignatureHelpProvider.ISINTRINSIC] = true;
            }
            signatureInformationList = signatureInformationList.concat(keywordInfo);
        } else {
            let i = 0;
            for (let method of methodCallPosition.possibleMethods.sort((m1, m2) => { return Math.sign(m2.parameters.length - m1.parameters.length) })) {
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
                        label: SignatureHelpMessages.whileLabel(),
                        documentation: SignatureHelpMessages.whileDocumentation(),
                        parameters: [
                            { label: SignatureHelpMessages.whileParameter1(), documentation: SignatureHelpMessages.whileParameter1Documentation() },
                        ]
                    }];
            case "if":
                return [
                    {
                        label: SignatureHelpMessages.ifLabel(),
                        documentation: SignatureHelpMessages.ifDocumentation(),
                        parameters: [
                            { label: SignatureHelpMessages.ifParameter1(), documentation: SignatureHelpMessages.ifParameter1Documentation() },
                        ]
                    }];
            case "switch":
                return [
                    {
                        label: SignatureHelpMessages.switchLabel(),
                        documentation: SignatureHelpMessages.switchDocumentation(),
                        parameters: [
                            { label: SignatureHelpMessages.switchParameter1(), documentation: SignatureHelpMessages.switchParameter1Documentation() },
                        ]
                    }];
            case "for":
                return [
                    {
                        label: SignatureHelpMessages.forLabel(),
                        documentation: "",
                        parameters: [
                            { label: SignatureHelpMessages.forParameter1Interval(), documentation: SignatureHelpMessages.forParameter1Documentation() },
                            { label: SignatureHelpMessages.forParameter2Interval(), documentation: SignatureHelpMessages.forParameter2Documentation() },
                            { label: SignatureHelpMessages.forParameter3Interval(), documentation: SignatureHelpMessages.forParameter3Documentation() },
                        ]
                    }];
            case "print":
                let methods: monaco.languages.SignatureInformation[] =
                    [
                        {
                            label: SignatureHelpMessages.printALabel(),
                            documentation: SignatureHelpMessages.printADocumentation(),
                            parameters: [
                                { label: SignatureHelpMessages.printAParameter1Label(), documentation: SignatureHelpMessages.printAParameter1Documentation() },
                                { label: SignatureHelpMessages.printAParameter2Label(), documentation: SignatureHelpMessages.printAParameter2Documentation() },
                            ]
                        },
                        {
                            label: SignatureHelpMessages.printBLabel(),
                            documentation: SignatureHelpMessages.printBDocumentation(),
                            parameters: [
                                { label: SignatureHelpMessages.printBParameter1Label(), documentation: SignatureHelpMessages.printBParameter1Documentation() },
                                { label: SignatureHelpMessages.printBParameter2Label(), documentation: SignatureHelpMessages.printBParameter2Documentation() },
                            ]
                        },
                        {
                            label: SignatureHelpMessages.printDLabel(),
                            documentation: SignatureHelpMessages.printBDocumentation(),
                            parameters: [
                                { label: SignatureHelpMessages.printBParameter1Label(), documentation: SignatureHelpMessages.printBParameter1Documentation() },
                                { label: SignatureHelpMessages.printDParameter2Label(), documentation: SignatureHelpMessages.printDParameter2Documentation() },
                            ]
                        },
                        {
                            label: SignatureHelpMessages.printCLabel(),
                            documentation: SignatureHelpMessages.printCDocumentation(),
                            parameters: [
                                { label: SignatureHelpMessages.printCParameter1Label(), documentation: SignatureHelpMessages.printCParameter1Documentation() },
                            ]
                        },
                    ];
                return methods;
            case "println":

                return [
                    {
                        label: SignatureHelpMessages.printlnALabel(),
                        documentation: SignatureHelpMessages.printlnADocumentation(),
                        parameters: [
                            { label: SignatureHelpMessages.printlnAParameter1Label(), documentation: SignatureHelpMessages.printlnAParameter1Documentation() },
                            { label: SignatureHelpMessages.printlnAParameter2Label(), documentation: SignatureHelpMessages.printlnAParameter2Documentation() },
                        ]
                    },
                    {
                        label: SignatureHelpMessages.printlnBLabel(),
                        documentation: SignatureHelpMessages.printlnBDocumentation(),
                        parameters: [
                            { label: SignatureHelpMessages.printlnBParameter1Label(), documentation: SignatureHelpMessages.printlnBParameter1Documentation() },
                            { label: SignatureHelpMessages.printlnBParameter2Label(), documentation: SignatureHelpMessages.printlnBParameter2Documentation() },
                        ]
                    },
                    {
                        label: SignatureHelpMessages.printlnDLabel(),
                        documentation: SignatureHelpMessages.printlnBDocumentation(),
                        parameters: [
                            { label: SignatureHelpMessages.printlnBParameter1Label(), documentation: SignatureHelpMessages.printlnBParameter1Documentation() },
                            { label: SignatureHelpMessages.printlnDParameter2Label(), documentation: SignatureHelpMessages.printlnDParameter2Documentation() },
                        ]
                    },
                    {
                        label: SignatureHelpMessages.printlnCLabel(),
                        documentation: SignatureHelpMessages.printlnCDocumentation(),
                        parameters: [
                            { label: SignatureHelpMessages.printlnCParameter1Label(), documentation: SignatureHelpMessages.printlnCParameter1Documentation() },
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