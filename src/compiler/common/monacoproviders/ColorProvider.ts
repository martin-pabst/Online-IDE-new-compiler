import * as monaco from 'monaco-editor'
import { BaseMonacoProvider } from "./BaseMonacoProvider.ts";
import { JavaLanguage } from "../../java/JavaLanguage.ts";


export class ColorProvider extends BaseMonacoProvider implements monaco.languages.DocumentColorProvider {


    constructor(language: JavaLanguage) {
        super(language);
        monaco.languages.registerColorProvider(language.monacoLanguageSelector, this);
    }

    async provideDocumentColors(model: monaco.editor.ITextModel, token: monaco.CancellationToken): Promise<monaco.languages.IColorInformation[]> {
        let main = this.findMainForModel(model);
        if (!main) return;

        let file = main.getCurrentWorkspace()?.getFileForMonacoModel(model);
        if(!file) return;

        let compiler = main.getCompiler();
        if(!compiler.findModuleByFile(file)){
            await compiler.eventManager.waitFor('compilationFinishedWithNewExecutable');
        }

        let module = main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
        if (!module) return;

        if (module.isDirty()) {
            await main.getCompiler().waitTillCompilationFinished();
            // await main.getCompiler().interruptAndStartOverAgain(false);
        }

        return module.colorInformation;

    }

    provideColorPresentations(model: monaco.editor.ITextModel, colorInfo: monaco.languages.IColorInformation, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.IColorPresentation[]> {
        var color = colorInfo.color;
        var oldColor: string = model.getValueInRange(colorInfo.range);

        var red256 = Math.round(color.red * 255);
        var green256 = Math.round(color.green * 255);
        var blue256 = Math.round(color.blue * 255);
        var label;

        let hex6Digits = this.toHex2Digits(red256) + this.toHex2Digits(green256) + this.toHex2Digits(blue256);
        let rgbCommaSeparated = red256 + ', ' + green256 + ', ' + blue256;

        if (oldColor.startsWith('#')) {
            label = '#' + hex6Digits;
        } else if (oldColor.startsWith('0x')) {
            label = '0x' + hex6Digits;
        } else if (oldColor.startsWith('rgb')) {
            if (color.alpha < 0.999) {
                label = 'rgba(' + rgbCommaSeparated + ', ' + color.alpha + ')';
            } else {
                label = 'rgb(' + rgbCommaSeparated + ')';
            }
        } else if (oldColor.startsWith("new") || oldColor.startsWith('Color')) {
            label = 'new Color(' + rgbCommaSeparated + ')';
        }

        return [
            {
                label: label!
            }
        ];
    }

    toHex2Digits(n: number) {
        let hex = n.toString(16);
        while (hex.length < 2) {
            hex = '0' + hex;
        }
        return hex;
    }
}