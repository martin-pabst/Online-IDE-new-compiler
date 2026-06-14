import { BaseMonacoProvider } from "../../common/monacoproviders/BaseMonacoProvider";
import * as monaco from 'monaco-editor'
import { ByAssemblyLanguage } from "../byassembly/ByAssemblyLanguage";
import { AssemblyModule } from "../AssemblyModule";
import { Position } from "../../common/range/Position";
import { Range } from "../../common/range/Range";

export class AssemblyDefinitionProvider extends BaseMonacoProvider implements monaco.languages.DefinitionProvider {

    constructor(language: ByAssemblyLanguage) {
        super(language);
        monaco.languages.registerDefinitionProvider(language.monacoLanguageSelector, this);
    }

    count: number = 0;

    provideDefinition(model: monaco.editor.ITextModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {

        let editor = monaco.editor.getEditors().find(e => e.getModel() == model);
        if (!editor) return;

        let main = this.findMainForModel(model);
        if (!main) return;

        let module = <AssemblyModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
        if (module?.isMoreThanOneVersionAheadOfLastCompilation()) {
            main.getCompiler().triggerCompile();
            module = <AssemblyModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
        }

        if (!module || !(module instanceof AssemblyModule)) {
            return undefined;
        }

        let cpu = module.cpu;
        let labelMap = cpu.getLabelMap();
        let labelEntries = labelMap.get(position.lineNumber);
        if(!labelEntries) return undefined;

        let label = labelEntries.find(le => Range.containsPosition(le.range, position))?.label;
        if(!label) return undefined;


        /**
         * bug in monaco-editor:
         * if model is current model then cursor is set to definition position but view doesn't scroll
         * to cursor, so:
         */
        setTimeout(() => {
            let currentEditorPosition = editor!.getPosition();
            if (currentEditorPosition) {
                if (Position.equals(editor.getPosition(), Range.getStartPosition(label.declaration))) {
                    editor!.revealPositionInCenterIfOutsideViewport(currentEditorPosition);
                }

            }
        }, 200);

        return {
            range: label.declaration,
            uri: model.uri
        }

    }

}
