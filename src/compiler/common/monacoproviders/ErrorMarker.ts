import { GUIFile } from "../../../client/workspace/File.ts";
import { Error, ErrorLevel } from "../Error.ts";
import { Module } from "../module/Module.ts";
import * as monaco from 'monaco-editor'

export class ErrorMarker {

    monacoModelToDeltaDecorationsMap: Map<monaco.editor.IModel, any[]> = new Map();

    markErrors(errors: Error[], monacoModel: monaco.editor.IModel) {
        let markers: monaco.editor.IMarkerData[] = errors.map((error) => ({
            startLineNumber: error.range.startLineNumber,
            startColumn: error.range.startColumn,
            endLineNumber: error.range.endLineNumber,
            endColumn: error.range.endColumn,
            message: error.message,
            severity: this.errorLevelToMarkerSeverity(error.level)

        })
        );

        monaco.editor.setModelMarkers(monacoModel, "martin", markers);

        let decorations: monaco.editor.IModelDeltaDecoration[] = errors.map((error) => {
            return {
                range: error.range,
                options: {
                    linesDecorationsClassName: this.getLinesDecorationsClassName(error.level),
                    minimap: {
                        position: monaco.editor.MinimapPosition.Inline,
                        color: this.getMinimapColor(error.level),
                        darkColor: this.getMinimapColor(error.level)
                    }
                }
            }
        });

        let oldDecorations = this.monacoModelToDeltaDecorationsMap.get(monacoModel) || [];
        this.monacoModelToDeltaDecorationsMap.set(monacoModel, monacoModel.deltaDecorations(oldDecorations, decorations));

    }

    markErrorsOfModule(module: Module) {
        if (module.file instanceof GUIFile) {
            this.markErrors(module.errors, module.file.getMonacoModel()!);
        }

    }

    errorLevelToMarkerSeverity(errorlevel: ErrorLevel): monaco.MarkerSeverity {
        switch (errorlevel) {
            case "info": return monaco.MarkerSeverity.Info;
            case "warning": return monaco.MarkerSeverity.Warning;
            case "error": return monaco.MarkerSeverity.Error;
        }
    }

    getLinesDecorationsClassName(errorLevel: ErrorLevel): string {
        switch (errorLevel) {
            case "error": return 'jo_revealErrorLine';
            case "warning": return 'jo_revealWarningLine';
            case "info": return 'jo_revealInfoLine';
        }
    }

    getBorderLeftClassName(errorLevel: ErrorLevel): string {
        switch (errorLevel) {
            case "error": return "jo_borderLeftError";
            case "warning": return "jo_borderLeftWarning";
            case "info": return "jo_borderLeftInfo";
        }
    }

    getMinimapColor(errorLevel: ErrorLevel): string {
        switch (errorLevel) {
            case "error": return "#bc1616";
            case "warning": return "#cca700";
            case "info": return "#75beff";
        }

    }

}