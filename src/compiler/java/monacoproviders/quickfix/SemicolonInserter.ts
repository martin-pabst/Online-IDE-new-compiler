import { GUIFile } from "../../../../client/workspace/File";
import { IMain } from "../../../common/IMain";
import { JCM } from "../../language/JavaCompilerMessages";
import { JavaCompiledModule } from "../../module/JavaCompiledModule";

export class SemicolonInserter {

    static start(module: JavaCompiledModule, main: IMain){
        if(!main) return; // in npm run test modeq

        if(!main.getSettings().getValue("editor.autoSemicolons")) return;

        if(module.errors.length > 5) return;
        let cursorLine = main.getMainEditor()?.getPosition()?.lineNumber;
        if(typeof cursorLine === "undefined") return;
        
        let semicolonErrors = module.errors.filter(error => error.message == JCM.insertSemicolonHere());
        for(let error of semicolonErrors){
            if(module.file instanceof GUIFile && Math.abs(error.range.startLineNumber - cursorLine) > 0){
                let model = module.file.getMonacoModel();
                model.applyEdits([
                    {
                        range: {
                            startLineNumber: error.range.startLineNumber,
                            startColumn: error.range.startColumn,
                            endLineNumber: error.range.startLineNumber,
                            endColumn: error.range.startColumn
                        },
                        text: ";",
                        forceMoveMarkers: true
                    }
                ])
            }
        }
    }


}