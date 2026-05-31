import { BaseMonacoProvider } from "../../common/monacoproviders/BaseMonacoProvider.ts";
import * as monaco from 'monaco-editor'
import { AssemblyLanguage } from "../AssemblyLanguage.ts";
import { AssemblyModule } from "../AssemblyModule.ts";
import { IRange, Range } from "../../common/range/Range.ts";
import { IMain } from "../../common/IMain.ts";
import { CPU } from "../CPU.ts";

export class AssemblyCompletionItemProvider extends BaseMonacoProvider implements monaco.languages.CompletionItemProvider {
    public triggerCharacters: string[] = ' .abcdefghijklmnopqrstuvwxyzäöüß_ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ@'.split('');

    constructor(public language: AssemblyLanguage) {
        super(language);
        monaco.languages.registerCompletionItemProvider(language.monacoLanguageSelector, this);
    }


    provideCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position,
        context: monaco.languages.CompletionContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CompletionList> {

        let main = this.findMainForModel(model);
        if (!main) return { suggestions: [] };

        let module = <AssemblyModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
        if (module?.isMoreThanOneVersionAheadOfLastCompilation()) {
            main.getCompiler().triggerCompile();
            module = <AssemblyModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
        }

        if (!module || !(module instanceof AssemblyModule)) {
            return { suggestions: [] };
        }

        let cpu = module.cpu;
        if (cpu.positionIsInsideComment(position)) {
            return { suggestions: [] };
        }

        let zeroLengthRange: IRange = Range.fromPositions(position);
        let suggestions: monaco.languages.CompletionItem[] = [];

        let textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
        let textAfterPosition = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber + 5, endColumn: 1 });

        // inside identifier?
        let identifierMatch = textUntilPosition.match(/.*[^\wöäüÖÄÜß]([\wöäüÖÄÜß]*)$/);

        if (identifierMatch == null) {
            identifierMatch = textUntilPosition.match(/^([\wöäüÖÄÜß]*)$/);
        }

        if (identifierMatch != null) {

            let line: string = model.getLineContent(position.lineNumber);

            let text = identifierMatch[1];

            let rangeToReplace: monaco.IRange =
            {
                startLineNumber: position.lineNumber, startColumn: position.column - text.length,
                endLineNumber: position.lineNumber, endColumn: position.column
            }

            return this.getCompletionItemsInsideIdentifier(cpu, main, identifierMatch, line, position, rangeToReplace, module);

        }

        return { suggestions: [] };
    }

    getCompletionItemsInsideIdentifier(cpu: CPU, main: IMain, identifierMatch: RegExpMatchArray, line: string,
        position: monaco.Position, rangeToReplace: monaco.IRange, module: AssemblyModule): monaco.languages.ProviderResult<monaco.languages.CompletionList> {

        let completionItems: monaco.languages.CompletionItem[] = cpu.getTokensWithDescription().map(token => {
            return {
                label: token.tokenIdentifier,
                kind: monaco.languages.CompletionItemKind.Keyword,
                documentation: {
                    value: token.description
                },
                insertText: token.tokenIdentifier + " ",
                range: rangeToReplace
            } as monaco.languages.CompletionItem;
        });

        let pseudoDirectiveCompletionItems: monaco.languages.CompletionItem[] = cpu.getPseudoDirectivesWithDescription().map(directive => {
            return {
                label: directive.directiveIdentifier,
                kind: monaco.languages.CompletionItemKind.Keyword,
                documentation: {
                    value: directive.description
                },
                insertText: directive.directiveIdentifier,
                range: rangeToReplace
            } as monaco.languages.CompletionItem;
        });

        let labelCompletionItems: monaco.languages.CompletionItem[] = [];

        let textUntilPosition = line.substring(0, position.column - 1);

        if (textUntilPosition.trim().length > 0 && textUntilPosition.endsWith(" ")) {
            labelCompletionItems = cpu.getLabels().map(label => {
                return {
                    label: ":" + label.identifier + (" (0x" + label.address.toString(16) + ")"),
                    filterText: label.identifier,
                    kind: monaco.languages.CompletionItemKind.Variable,
                    documentation: {
                        value: `Label at address 0x${label.address.toString(16)}`
                    },
                    insertText: label.identifier,
                    range: rangeToReplace
                } as monaco.languages.CompletionItem;
            });
        }

        return { suggestions: [...completionItems, ...pseudoDirectiveCompletionItems, ...labelCompletionItems] };


    }

}