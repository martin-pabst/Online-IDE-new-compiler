import { lm } from "../../../tools/language/LanguageManager";

type PLData = {
    name: string,
    monacoLanguageSelector: string,
    fileEndingWithOutDot: string,
    translatedName: () => string,
    workspaceCssClass: (withRepository: boolean) => string
}

export var ProgrammingLanguageData: Record<"Java" | "ByAssembly", PLData> = {
    Java: {
        name: "Java",
        monacoLanguageSelector: "myJava",
        fileEndingWithOutDot: "java",
        translatedName: () => "Java",
        workspaceCssClass: (withRepository: boolean) => withRepository ? "img_workspace-java-repository" : "img_workspace-java"
    },
    ByAssembly: {
        name: "ByAssembly",
        monacoLanguageSelector: "ByAssembly",
        fileEndingWithOutDot: "asm",
        translatedName: () => lm({
            //"de": "Einfache Maschinensprache (Assembler, wie im Bayern-ABI)",
            "de": "Einfache Maschinensprache (Assembler)",
            "en": "Simple Machine language (Assembler)",
            "fr": "Langage machine simple (assembleur)"
        }),
        workspaceCssClass: (withRepository: boolean) => withRepository ? "img_workspace-assembly-repository" : "img_workspace-assembly"
    }
};

