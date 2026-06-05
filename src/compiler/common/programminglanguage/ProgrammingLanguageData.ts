import { lm } from "../../../tools/language/LanguageManager";

type PLData = {
    name: string,
    monacoLanguageSelector: string,
    fileEndingWithOutDot: string,
    translatedName: () => string,
    workspaceCssClass: (withRepository: boolean) => string
}

export var ProgrammingLanguageData: { [key: string]: PLData } = {
    "Java": {
        name: "Java",
        monacoLanguageSelector: "myJava",
        fileEndingWithOutDot: "java",
        translatedName: () => "Java",
        workspaceCssClass: (withRepository: boolean) => withRepository ? "img_workspace-java-repository-dark" : "img_workspace-java-dark"
    },
    "Assembly": {
        name: "Assembly",
        monacoLanguageSelector: "myAssembly",
        fileEndingWithOutDot: "asm",
        translatedName: () => lm({
            "de": "Maschinensprache (Assembler)",
            "en": "Machine language (Assembler)",
            "fr": "Langage machine (assembleur)"
        }),
        workspaceCssClass: (withRepository: boolean) => withRepository ? "img_workspace-assembly-repository-dark" : "img_workspace-assembly-dark"
    }
};

