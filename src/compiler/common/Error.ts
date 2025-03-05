import { IRange } from "./range/Range";
import type * as monaco from 'monaco-editor'


export type QuickFix = {
    title: string,
    editsProvider: (uri: monaco.Uri) => monaco.languages.IWorkspaceTextEdit[]
}

export type ErrorLevel = "info" | "error" | "warning";

export type Error = {
    range: IRange,
    message: string,
    id: string,
    quickFix?: QuickFix,
    level: ErrorLevel,
    fileUniqueId?: number
}
