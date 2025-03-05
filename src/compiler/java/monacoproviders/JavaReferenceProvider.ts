import { GUIFile } from "../../../client/workspace/GUIFile.ts";
import { IMain } from "../../common/IMain.ts";
import { BaseMonacoProvider } from "../../common/monacoproviders/BaseMonacoProvider.ts";
import { UsagePosition } from "../../common/UsagePosition.ts";
import { JavaLanguage } from "../JavaLanguage.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule.ts";
import * as monaco from 'monaco-editor'


export class JavaReferenceProvider extends BaseMonacoProvider implements monaco.languages.ReferenceProvider {

    constructor(language: JavaLanguage) {
        super(language);
        monaco.languages.registerReferenceProvider(language.monacoLanguageSelector, this);
    }

    provideReferences(model: monaco.editor.ITextModel, position: monaco.Position, context: monaco.languages.ReferenceContext, token: monaco.CancellationToken):
    monaco.languages.ProviderResult<monaco.languages.Location[]> {

        let editor = monaco.editor.getEditors().find(e => e.getModel() == model);
        if(!editor) return;

        let main = this.findMainForModel(model);
        if (!main) return;

        let usagePosition = this.getUsagePosition(main, position, editor);

        if(!usagePosition){
            return;
        }

        let locations: monaco.languages.Location[] = [];

        for(let module of main.getCompiler().getAllModules()){

            let allUsagePositions = (<JavaCompiledModule>module).getUsagePositionsForSymbol(usagePosition?.symbol);

            if(!allUsagePositions) continue;


            for(let up of allUsagePositions){
                if(up.file instanceof GUIFile){
                    if(!up.file.getMonacoModel()?.uri) continue;
                    locations.push({
                        range: up.range,
                        uri: up.file.getMonacoModel()?.uri!
                    })
                }
            }
        }

        return locations;

    }

    getUsagePosition(main: IMain, position: monaco.Position, editor: monaco.editor.ICodeEditor): UsagePosition | undefined {
        if(editor.getModel()?.getLanguageId() != 'myJava') return undefined;

        let module = <JavaCompiledModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(editor.getModel());
        if(!module) return;

        return module.compiledSymbolsUsageTracker.findSymbolAtPosition(position);
    }

}