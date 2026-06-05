import { BaseMonacoProvider } from "../../common/monacoproviders/BaseMonacoProvider.ts";
import { Range } from "../../common/range/Range.ts";
import { AssemblyLanguage } from "../AssemblyLanguage.ts";
import { AssemblyModule } from "../AssemblyModule.ts";
import * as monaco from 'monaco-editor'


export class AssemblyReferenceProvider extends BaseMonacoProvider implements monaco.languages.ReferenceProvider {

    constructor(language: AssemblyLanguage) {
        super(language);
        monaco.languages.registerReferenceProvider(language.monacoLanguageSelector, this);
    }

    provideReferences(model: monaco.editor.ITextModel, 
        position: monaco.Position, context: monaco.languages.ReferenceContext, token: monaco.CancellationToken):
    monaco.languages.ProviderResult<monaco.languages.Location[]> {

        let editor = monaco.editor.getEditors().find(e => e.getModel() == model);
        if(!editor) return;

        let main = this.findMainForModel(model);
        if (!main) return;

        let module = <AssemblyModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
        if (module?.isMoreThanOneVersionAheadOfLastCompilation()) {
            main.getCompiler().triggerCompile();
            module = <AssemblyModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
        }

        if (!module || !(module instanceof AssemblyModule)) {
            return [];
        }

        let cpu = module.cpu;
        let labelMap = cpu.getLabelMap();

        let labelEntries = labelMap.get(position.lineNumber);
        if(!labelEntries) return [];
        
        let label = labelEntries.find(le => Range.containsPosition(le.range, position))?.label;
        if(!label) return [];

        let locations: monaco.languages.Location[] = label.usages.map(usageRange => ({
            range: usageRange,
            uri: model.uri
        }));

        return locations;
    }
}



