import { BaseMonacoProvider } from "../../common/monacoproviders/BaseMonacoProvider.ts";
import { JavaLanguage } from "../JavaLanguage.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule.ts";
import * as monaco from 'monaco-editor'


export class JavaInlayHintsProvider extends BaseMonacoProvider implements monaco.languages.InlayHintsProvider {

    constructor(language: JavaLanguage) {
        super(language);
        monaco.languages.registerInlayHintsProvider(language.monacoLanguageSelector, this);
    }

    displayName?: string = "JavaOnline-InlayHints";

    onDidChangeInlayHints?: monaco.IEvent<void>;
    
    provideInlayHints(model: monaco.editor.ITextModel, range: monaco.Range, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.InlayHintList> {
        let editor = monaco.editor.getEditors().find(e => e.getModel() == model);
        if(!editor) return;

        let main = this.findMainForModel(model);
        if (!main) return;

        if (editor.getModel()?.getLanguageId() != 'myJava') return undefined;

        let module = <JavaCompiledModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(editor.getModel());
        if (!module) return;

        return {
            hints: module.inlayHints,
            dispose: () => {}
        }


    }
    
    resolveInlayHint?(hint: monaco.languages.InlayHint, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.InlayHint> {
        throw new Error("Method not implemented.");
    }

}