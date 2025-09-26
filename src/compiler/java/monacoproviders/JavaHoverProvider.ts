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
import { HoverMessages } from "../language/HoverMessages.ts";


export class JavaHoverProvider extends BaseMonacoProvider {

    private keywordDescriptions: { [keyword: string]: string } = {
        "print": HoverMessages.print(),
        "new": HoverMessages.new(),
        "println": HoverMessages.println(),
        "while": HoverMessages.while(),
        "for": HoverMessages.for(),
        "if": HoverMessages.if(),
        "else": HoverMessages.else(),
        "switch": HoverMessages.switch(),
        "%": HoverMessages.modulo(),
        "|": HoverMessages.bitwiseOr(),
        "&": HoverMessages.bitwiseAnd(),
        "||": HoverMessages.logicalOr(),
        "&&": HoverMessages.logicalAnd(),
        "^": HoverMessages.bitwiseXor(),
        ">>": HoverMessages.rightShift(),
        "<<": HoverMessages.leftShift(),
        "~": HoverMessages.bitwiseNot(),
        "==": HoverMessages.equals(),
        "<=": HoverMessages.lessEquals(),
        ">=": HoverMessages.greaterEquals(),
        "!=": HoverMessages.notEquals(),
        "+=": HoverMessages.plusAssign(),
        "-=": HoverMessages.minusAssign(),
        "*=": HoverMessages.timesAssign(),
        "/=": HoverMessages.divAssign(),
        "++": HoverMessages.increment(),
        "--": HoverMessages.decrement(),
        "=": HoverMessages.assign(),
        "!": HoverMessages.not(),
        "public": HoverMessages.public(),
        "private": HoverMessages.private(),
        "protected": HoverMessages.protected(),
        "return": HoverMessages.return(),
        "break": HoverMessages.break(),
        "class": HoverMessages.class(),
        "extends": HoverMessages.extends(),
        "implements": HoverMessages.implements(),
        "this": HoverMessages.thisKeyword(),
        "var": HoverMessages.var(),
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

        let settings = main.getSettings();

        for (let error of module.errors) {
            if (error.level == "error" && Range.containsPosition(error.range, position)) {
                return null; // Show error-tooltip and don't show hover-tooltip
            }
        }

        let usagePosition = module.findSymbolAtPosition(position);
        let symbol = usagePosition?.symbol;


        if (usagePosition && symbol && symbol.identifier != "var") {
            if (symbol instanceof NonPrimitiveType) {
                let md = settings.getValue('editor.hoverVerbosity.showClassDeclaration');
                if (md !== 'none') {
                    let declarationAsString1 = "```\n" + symbol.getDeclaration() + "\n```";
                    if (symbol.documentation && md !== 'declarations') {
                        declarationAsString1 += "\n" + this.formatDocumentation(symbol.getDocumentation());
                    }
                    range = usagePosition.range;
                    contents.push({ value: declarationAsString1 });
                }
            } else if (symbol instanceof JavaMethod) {
                let md = settings.getValue('editor.hoverVerbosity.showMethodDeclaration');
                if (md !== 'none') {
                    let declarationAsString1 = "```\n" + symbol.getDeclaration() + "\n```";
                    if (symbol.documentation && md !== 'declarations') {
                        declarationAsString1 += "\n" + this.formatDocumentation(symbol.getDocumentation());
                    }
                    range = usagePosition.range;
                    contents.push({ value: declarationAsString1 });
                }
            }
            else if (symbol instanceof PrimitiveType && settings.getValue('editor.hoverVerbosity.showHelpOnKeywordsAndOperators')) {
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
            let desc = this.keywordDescriptions[word];
            if (desc != null && settings.getValue('editor.hoverVerbosity.showHelpOnKeywordsAndOperators')) {
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
                if (signature) {
                    let label = signature.parameters[sh.activeParameter]?.label
                    let documentation = <string>signature.parameters[sh.activeParameter]?.documentation
                    if (!label) return null;
                    if (Array.isArray(label)) {
                        label = signature.label.substring(label[0], label[1]);
                    }
                    if (signature[JavaSignatureHelpProvider.ISINTRINSIC]) {
                        contents.push({ value: documentation || label });
                    } else {
                        contents.push({ value: "```\nParameter " + label + "\n```" });
                    }
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