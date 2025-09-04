
import * as monaco from 'monaco-editor'
import { BaseMonacoProvider } from '../../../common/monacoproviders/BaseMonacoProvider.ts';
import { Language } from '../../../common/Language.ts';
import { Quickfix } from './Quickfix.ts';
import { JavaCompiler } from '../../JavaCompiler.ts';
import { GUIFile } from '../../../../client/workspace/File.ts';
import { JavaCompiledModule } from '../../module/JavaCompiledModule.ts';
import { Range } from '../../../common/range/Range.ts';
import { IPosition } from '../../../common/range/Position.ts';



export class JavaCodeActionProvider extends BaseMonacoProvider implements monaco.languages.CodeActionProvider {

    constructor(language: Language) {
        super(language);
    }

    provideCodeActions(model: monaco.editor.ITextModel, range: monaco.Range, context: monaco.languages.CodeActionContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CodeActionList> {
        let codeActions: monaco.languages.CodeAction[] = [];

        let compiler = (<JavaCompiler>this.findMainForModel(model)?.getCompiler());
        if (!compiler) return undefined;



        let _module: JavaCompiledModule | undefined;
        for (let m of compiler.moduleManager?.modules) {
            if (!(m.file instanceof GUIFile)) continue;
            if (m.file.getMonacoModel() == model) {
                _module = m;
                break;
            }

        }
        if (typeof _module == 'undefined') return {
            actions: [],
            dispose: () => { }
        };

        for (let marker of context.markers) {
            let quickfixes = _module.quickfixes.filter(qf => {
                if(!qf.error) return false;
                return qf.error.message == marker.message;
            }); 
            codeActions = quickfixes.map(qf => qf.provideCodeAction(model))
        }


        if (codeActions.length == 0 && range.startLineNumber == range.endLineNumber && range.startColumn == range.endColumn) {
            let position: IPosition = { lineNumber: range.startLineNumber, column: range.startColumn };
            let quickfixes = _module.quickfixes.filter(
                qf => Range.containsPosition(qf.range, position)
            )

            codeActions = quickfixes.map(qf => qf.provideCodeAction(model))

        } 


        return {
            actions: codeActions,
            dispose: () => { }
        }
    }

    // resolveCodeAction?(codeAction: monaco.languages.CodeAction, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CodeAction> {
    //     throw new Error('Method not implemented.');
    // }

}