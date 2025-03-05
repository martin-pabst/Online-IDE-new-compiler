
import * as monaco from 'monaco-editor'
import { BaseMonacoProvider } from '../../../common/monacoproviders/BaseMonacoProvider.ts';
import { Language } from '../../../common/language/Language.ts';
import { Quickfix } from './Quickfix.ts';
import { JavaCompiler } from '../../JavaCompiler.ts';
import { GUIFile } from '../../../../client/workspace/GUIFile.ts';
import { JavaCompiledModule } from '../../module/JavaCompiledModule.ts';



export class JavaCodeActionProvider extends BaseMonacoProvider implements monaco.languages.CodeActionProvider {
    
    constructor(language: Language){
        super(language);
    }

    provideCodeActions(model: monaco.editor.ITextModel, range: monaco.Range, context: monaco.languages.CodeActionContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CodeActionList> {
        let codeActions: monaco.languages.CodeAction[] = [];

        let compiler = (<JavaCompiler>this.findMainForModel(model)?.getCompiler());
        if(!compiler) return undefined;
        


        let _module: JavaCompiledModule | undefined;
        for(let m of compiler.moduleManager?.modules){
            if(!(m.file instanceof GUIFile)) continue;
            if(m.file.getMonacoModel() == model){
                _module = m;
                break;
            }

        }
        if(typeof _module == 'undefined') return {
            actions: [],
            dispose: () => {}
        };

        for(let marker of context.markers){
            let javaMarkerData: Quickfix = _module.quickfixes.find(
                qf => qf.startLineNumber == marker.startLineNumber && qf.endLineNumber == marker.endLineNumber && qf.startColumn == marker.startColumn && qf.endColumn == marker.endColumn && qf.message == marker.message);
            if(!javaMarkerData) continue;
            let ca = javaMarkerData.provideCodeAction(model);
            if(ca) codeActions.push(ca);
        }

        return {
            actions: codeActions,
            dispose: () => {}
        }
    }
    
    // resolveCodeAction?(codeAction: monaco.languages.CodeAction, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CodeAction> {
    //     throw new Error('Method not implemented.');
    // }

}