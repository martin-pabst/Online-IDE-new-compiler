import { BaseMonacoProvider } from "../../common/monacoproviders/BaseMonacoProvider";
import * as monaco from 'monaco-editor'
import { AssemblyLanguage } from "../AssemblyLanguage";
import { AssemblyModule } from "../AssemblyModule";
import { Range } from "../../common/range/Range";
import { AssemblyMonacoProvidersMessages } from "./AssemblyMonacoProvidersMessages";

export class AssemblyHoverProvider extends BaseMonacoProvider implements monaco.languages.HoverProvider {

    constructor(language: AssemblyLanguage) {
        super(language);
        monaco.languages.registerHoverProvider(language.monacoLanguageSelector, this);
    }
    provideHover(model: monaco.editor.ITextModel, position: monaco.Position, 
        token: monaco.CancellationToken, 
        context?: monaco.languages.HoverContext<monaco.languages.Hover>): monaco.languages.ProviderResult<monaco.languages.Hover> {
        let main = this.findMainForModel(model);
        if (!main) return;

        let module = <AssemblyModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);

        if (!module || !(module instanceof AssemblyModule)) {
            return undefined;
        }

        let cpu = module.cpu;

        let instruction = cpu.getInstructionMap().get(position.lineNumber)?.find(i => Range.containsPosition(i.range, position))?.instruction;
        if(instruction){
            let description = instruction.description();
            let colonIndex = description.indexOf(':');
            if(colonIndex > 0 && colonIndex < 30){
                let descriptionRight = description.substring(colonIndex + 1).trim();
                let descriptionLeft = description.substring(0, colonIndex).trim();
                description = "```\n" + descriptionLeft + "\n//" + descriptionRight + "\n//" + AssemblyMonacoProvidersMessages.Opcode(instruction.OpCode);
            }

            return {
                contents: [{ 
                    value: `${description}` 
                }]
            };
        }

        let labelMap = cpu.getLabelMap();

        let labelEntries = labelMap.get(position.lineNumber);
        if(labelEntries){
            let label = labelEntries.find(le => Range.containsPosition(le.range, position))?.label;
            if(label){
                return {
                    contents: [{ 
                        value: AssemblyMonacoProvidersMessages.LabelHoverDescription(label.identifier,label.address)
                    }]
                };
            }

        }

        let hoverEntries = cpu.getHoverEntries().get(position.lineNumber);
        if(hoverEntries){
            let entry = hoverEntries.find(e => Range.containsPosition(e.range, position));
            if(entry){
                return {
                    contents: [{ 
                        value: entry.text
                    }]
                };
            }
        }

        return undefined;

    }
}