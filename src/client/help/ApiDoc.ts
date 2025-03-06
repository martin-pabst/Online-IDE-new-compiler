import jQuery from 'jquery';
import { JavaLanguage } from '../../compiler/java/JavaLanguage.js';
import { JavaLibraryModuleManager } from '../../compiler/java/module/libraries/JavaLibraryModuleManager.js';
import { TokenType } from '../../compiler/java/TokenType.js';
import { JavaClass } from '../../compiler/java/types/JavaClass.js';
import { JavaEnum } from '../../compiler/java/types/JavaEnum.js';
import { JavaInterface } from '../../compiler/java/types/JavaInterface.js';
import { JavaMethod } from '../../compiler/java/types/JavaMethod.js';
import { NonPrimitiveType } from '../../compiler/java/types/NonPrimitiveType.js';
import { extractCsrfTokenFromGetRequest } from "../communication/AjaxHelper.js";
import { HelpMessages } from './HelpMessages.js';
import * as monaco from 'monaco-editor'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'


import "/assets/fonts/fonts.css";
import "/assets/css/apidoc.css";
import { SystemModule } from '../../compiler/java/runtime/system/SystemModule.js';
import { PrimitiveStringClass } from '../../compiler/java/runtime/system/javalang/PrimitiveStringClass.js';


export class ApiDoc {
    async start() {

        await extractCsrfTokenFromGetRequest(true);

        this.initEditor();
        this.initClassDocumentation();
    }

    initEditor(){

        JavaLanguage.registerLanguageAtMonacoEditor();

        monaco.editor.defineTheme('myCustomThemeDark', {
            base: 'vs-dark', // can also be vs-dark or hc-black
            inherit: true, // can also be false to completely replace the builtin rules
            rules: [
                { token: 'method', foreground: 'dcdcaa', fontStyle: 'italic' },
                { token: 'print', foreground: 'dcdcaa', fontStyle: 'italic bold' },
                { token: 'class', foreground: '3DC9B0' },
                { token: 'number', foreground: 'b5cea8' },
                { token: 'type', foreground: '499cd6' },
                { token: 'identifier', foreground: '9cdcfe' },
                { token: 'statement', foreground: 'bb96c0', fontStyle: 'bold' },
                { token: 'keyword', foreground: '68bed4', fontStyle: 'bold' },
                // { token: 'comment.js', foreground: '008800', fontStyle: 'bold italic underline' },
            ],
            colors: {
                "editor.background": "#1e1e1e"
            }
        });

        monaco.editor.setTheme('myCustomThemeDark');

        monaco.editor.create(jQuery('#editordiv')[0], {
            language: "myJava"
        });


    }

    initClassDocumentation() {

        let mm = new JavaLibraryModuleManager([], new SystemModule(PrimitiveStringClass));

        let typeList = mm.javaTypes
        .sort(
            (a, b) => a.identifier.localeCompare(b.identifier));


        typeList.filter((type) => type instanceof JavaClass).forEach((type, index) => {
            let $menuItem = jQuery('<div class="jo_menu-class">' + type.identifier + '</div>');
            jQuery('#classes').append($menuItem)
            $menuItem.on('click', () => {
                this.showAPIHelp(type);
            })
        });

        typeList.filter((type) => type instanceof JavaInterface).forEach((type, index) => {
            let $menuItem = jQuery('<div class="jo_menu-class">' + type.identifier + '</div>');
            jQuery('#interfaces').append($menuItem)
            $menuItem.on('click', () => {
                this.showAPIHelp(type);
            })
        });

        typeList.filter((type) => type instanceof JavaEnum).forEach((type, index) => {
            let $menuItem = jQuery('<div class="jo_menu-class">' + type.identifier + '</div>');
            jQuery('#enums').append($menuItem)
            $menuItem.on('click', () => {
                this.showAPIHelp(type);
            })
        });

        jQuery('#classesHeading').text(HelpMessages.apiDocClasses());
        jQuery('#interfacesHeading').text(HelpMessages.apiDocInterfaces());
        jQuery('#enumsHeading').text(HelpMessages.apiDocEnums());
        jQuery('#mainHeading').text(HelpMessages.apiDocMainHeading());

    }

    showAPIHelp(type: NonPrimitiveType) {
        let $main = jQuery('#main');
        $main.empty();

        let $caption = jQuery('<div class="jo_type"></div>');
        $main.append($caption);
        monaco.editor.colorize(type.getDeclaration(), "myJava", {}).then(
            (html) => {$caption.append(jQuery(html))}
        );

        if(type.documentation){
            $main.append(jQuery('<div class="jo_documentation">' + this.docToString(type.documentation) + '</div>'));
        }


        if(type instanceof JavaClass) this.showConstructors(type);
        this.showMethods(type);
        if(type instanceof JavaClass || type instanceof JavaEnum) this.showAttributes(type);

    }

    showConstructors(t: JavaClass){
        let $main = jQuery('#main');
        $main.append(jQuery('<div class="jo_constructor-heading">Konstruktoren:</div>'));
        let methods = t.getOwnMethods().filter((m) => m.isConstructor);

        methods.sort((a, b) => a.identifier.localeCompare(b.identifier));

        if(methods.length == 0){
            $main.append(jQuery(`<div class="jo_method">${HelpMessages.apiDocNone()}</div>`));
        } else {
            for(let method of methods){
                let $caption = jQuery(jQuery('<div class="jo_method"></div>'));
                $main.append($caption);
                monaco.editor.colorize(method.getDeclaration(), "myJava", {}).then(
                    (html) => {$caption.append(jQuery(html))}
                );

                if(method.documentation != null && method.documentation != ""){
                    $main.append(jQuery('<div class="jo_documentation">' + this.docToString(method.documentation) + '</div>'));
                }
            }
        }
    }

    showMethods(t: NonPrimitiveType){
        let $main = jQuery('#main');
        $main.append(jQuery('<div class="jo_method-heading">Methoden:</div>'));
        let methods: JavaMethod[];
        if(t instanceof JavaInterface){
            methods = t.getAllMethods().slice(0);
        } else {
            methods = t.getAllMethods().filter((m) => !m.isConstructor && m.visibility != TokenType.keywordPrivate);
        }

        methods.sort((a, b) => a.identifier.localeCompare(b.identifier));

        if(methods.length == 0){
            $main.append(jQuery(`<div class="jo_method">${HelpMessages.apiDocNone()}</div>`));
        } else {
            for(let method of methods){
                let $caption = jQuery(jQuery('<div class="jo_method"></div>'));
                $main.append($caption);
                monaco.editor.colorize(method.getDeclaration(), "myJava", {}).then(
                    (html) => {$caption.append(jQuery(html))}
                );

                if(method.documentation != null && method.documentation != ""){
                    $main.append(jQuery('<div class="jo_documentation">' + this.docToString(method.documentation) + '</div>'));
                }
            }
        }
    }

    docToString(documentation: string | (() => string) | undefined): string {
        if(!documentation) return "";
        if(typeof documentation == "string") return documentation;
        return documentation();
    }

    showAttributes(t: JavaClass | JavaEnum){
        let $main = jQuery('#main');
        $main.append(jQuery('<div class="jo_attribute-heading">Attribute:</div>'));
        let attributes = t.getFields().filter(field => field.visibility != TokenType.keywordPrivate);

        attributes.sort((a, b) => a.identifier.localeCompare(b.identifier));

        if(attributes.length == 0){
            $main.append(jQuery(`<div class="jo_method">${HelpMessages.apiDocNone()}</div>`));
        } else {
            for(let attribute of attributes){
                let $caption = jQuery(jQuery('<div class="jo_method"></div>'));
                $main.append($caption);
                monaco.editor.colorize(attribute.getDeclaration(), "myJava", {}).then(
                    (html) => {$caption.append(jQuery(html))}
                );

                if(attribute.documentation != null && attribute.documentation != ""){
                    $main.append(jQuery('<div class="jo_documentation">' + this.docToString(attribute.documentation) + '</div>'));
                }
            }
        }
    }

}

function initMonacoEditor(): void {
    // see https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-esm.md#using-vite
    // https://dev.to/lawrencecchen/monaco-editor-svelte-kit-572
    // https://github.com/microsoft/monaco-editor/issues/4045

    self.MonacoEnvironment = {
        getWorker: (_workerId, label) => {
            switch (label) {
                case 'json':
                    return new jsonWorker()
                case 'css':
                case 'scss':
                case 'less':
                    return new cssWorker()
                case 'html':
                case 'handlebars':
                case 'razor':
                    return new htmlWorker()
                case 'typescript':
                case 'javascript':
                    return new tsWorker()
                default:
                    return new editorWorker()
            }
        }
    };

}

window.onload = () => {
    initMonacoEditor();
    new ApiDoc().start();
}


