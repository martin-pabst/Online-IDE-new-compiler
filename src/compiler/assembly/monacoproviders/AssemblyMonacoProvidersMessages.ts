import { lm } from "../../../tools/language/LanguageManager";

export class AssemblyMonacoProvidersMessages{
        
    static Opcode = (opcode: number) => lm({
        'en': `opcode: 0x${opcode.toString(16)} = ${opcode}`,
    });

    static LabelCompletionDescription = (address: number) => {
        if(typeof address !== "number") {
            return lm({
                'de': `label mit unbekannter Adresse`,
                'en': `label with unknown address`,
                'fr': `label avec adresse inconnue`,
            });
        } else return lm({
            'de': `label an Adresse 0x${address.toString(16)}`,
            'en': `label at address 0x${address.toString(16)}`,
            'fr': `label à l'adresse 0x${address.toString(16)}`,
        });
    } 

    static LabelHoverDescription = (identifier:string,address: number) => lm({
        'de': "```\n" + `Label ${identifier}\n// an Addresse ${address != undefined ? ('0x' + address.toString(16) + ' = ' + address) : 'unbekannt'}` + "\n```",
        'en': "```\n" + `Label ${identifier}\n// at address ${address != undefined ? ('0x' + address.toString(16) + ' = ' + address) : 'unknown'}` + "\n```",
        'fr': "```\n" + `Label ${identifier}\n// à l'adresse ${address != undefined ? ('0x' + address.toString(16) + ' = ' + address) : 'inconnu'}` + "\n```"
    });
}