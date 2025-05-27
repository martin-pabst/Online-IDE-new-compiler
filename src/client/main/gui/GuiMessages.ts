import { lm } from "../../../tools/language/LanguageManager";

export class GuiMessages {

    /**
     * ProjectExplorer
     */
    static NewFileName = () => lm({
    "de": "Datei",
    "en": "File",
    })

    static NewWorkspaceName = () => lm({
    "de": "Workspace",
    "en": "Workspace",
    })
    
    /**
     * Main Menu
    */
    static File = () => lm({
    "de": "Datei",
    "en": "File",
    })
    
    static ImportWorkspace = () => lm({
    "de": "Workspace importieren",
    "en": "Import workspace",
    })
    
    static ExportCurrentWorkspace = () => lm({
    "de": "Aktuellen Workspace exportieren",
    "en": "Export current workspace",
    })
    
    static NoWorkspaceSelected = () => lm({
    "de": "Kein Workspace ausgewählt.",
    "en": "No workspace selected",
    })
    
    static ExportAllWorkspaces = () => lm({
    "de": "Alle Workspaces exportieren",
    "en": "Export all workspaces",
    })
    
    static SaveAndExit = () => lm({
    "de": "Speichern und beenden",
    "en": "Save and exit",
    })
    
    static Edit = () => lm({
    "de": "Bearbeiten",
    "en": "Edit",
    })
    
    static Undo = () => lm({
    "de": "Rückgängig (Strg + z)",
    "en": "Undo (Ctrl + z)",
    })
    
    static Redo = () => lm({
    "de": "Wiederholen (Strg + y)",
    "en": "Redo (Ctrl + y)",
    })
    
    static Copy = () => lm({
    "de": "Kopieren (Strg + c)",
    "en": "Copy (Ctrl + c)",
    })
    
    static Cut = () => lm({
    "de": "Ausschneiden (Strg + x)",
    "en": "Cut (Ctrl + x)",
    })
    
    static CopyToTop = () => lm({
    "de": "Nach oben kopieren (Alt + Shift + Pfeil rauf)",
    "en": "Copy to top (Alt + Shift + Arrow up)",
    })
    
    static CopyToBottom = () => lm({
    "de": "Nach unten kopieren (Alt + Shift + Pfeil runter)",
    "en": "Copy to Bottom (Alt + Shift + Arrow down)",
    })
    
    static MoveToTop = () => lm({
    "de": "Nach oben verschieben (Alt + Pfeil rauf)",
    "en": "Move to top (Alt + Arrow up)",
    })
    
    static MoveToBottom = () => lm({
    "de": "Nach unten verschieben (Alt + Pfeil runter)",
    "en": "Move to Bottom (Alt + Arrow down)",
    })
    
    static Find = () => lm({
    "de": "Suchen... (Strg + f)",
    "en": "Find... (Ctrl + f)",
    })
    
    static Replace = () => lm({
    "de": "Ersetzen... (Strg + h)",
    "en": "Replace... (Ctrl + h)",
    })
    
    static ToggleComment = () => lm({
    "de": "Aus-/Einkommentieren (Strg + #)",
    "en": "Toggle comment (Ctrl + +)",
    })
    
    static AutoFormat = () => lm({
    "de": "Dokument automatisch formatieren (Alt + Shift + f)",
    "en": "Auto format (Alt + Shift + f)",
    })
    
    static FindCorrespondingBracket = () => lm({
    "de": "Finde zugehörige Klammer (Strg + k)",
    "en": "Find corresponding bracket (Ctrl + k)",
    })
    
    static FoldAll = () => lm({
    "de": "Alles zusammenfalten",
    "en": "Fold all",
    })
    
    static UnfoldAll = () => lm({
    "de": "Alles auffalten",
    "en": "Unfold all",
    })
    
    static TriggerSuggest = () => lm({
    "de": "Vorschlag auslösen (Strg + Leertaste)",
    "en": "Trigger suggestion (Ctrl + Space)",
    })
    
    static TriggerParameterHint = () => lm({
    "de": "Parameterhilfe (Strg + Shift + Leertaste)",
    "en": "Trigger parameter hint (Ctrl + Shift + Space)",
    })    

    static GoToDefinition = () => lm({
    "de": "Gehe zur Definition (Strg + Click)",
    "en": "Got to definition (Ctrl + click)",
    })
    



}
