import * as monaco from 'monaco-editor'
import { BaseMonacoProvider } from '../../common/monacoproviders/BaseMonacoProvider.ts';
import { AssemblyLanguage } from '../AssemblyLanguage.ts';
import { AssemblyModule } from '../AssemblyModule.ts';
import { Range } from '../../common/range/Range.ts';


export class AssemblyRenameProvider extends BaseMonacoProvider implements monaco.languages.RenameProvider {

    constructor(language: AssemblyLanguage) {
        super(language);
        monaco.languages.registerRenameProvider(language.monacoLanguageSelector, this);
    }

    provideRenameEdits(model: monaco.editor.ITextModel, position: monaco.Position, newName: string, token: monaco.CancellationToken):
        monaco.languages.ProviderResult<monaco.languages.WorkspaceEdit & monaco.languages.Rejection> {

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
        if (!labelEntries) return undefined;

        let label = labelEntries.find(le => Range.containsPosition(le.range, position))?.label;
        if (!label) return undefined;

        let ranges = label.usages.slice();
        ranges.push(label.declaration);

        let edits: monaco.languages.IWorkspaceTextEdit[] = ranges.map(usageRange => ({
            resource: model.uri,
            versionId: model.getVersionId(),
            textEdit: { range: usageRange, text: newName }
        }));

        return {
            edits: edits
        };

    }

}