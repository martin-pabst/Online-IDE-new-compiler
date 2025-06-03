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
import "/assets/css/icons.css";
import "/assets/css/apidoc.css";
import { Button } from '../../tools/Button.js';
import { downloadFile } from '../../tools/HtmlTools.js';
import { JavaSyntaxAPIPrinter } from './JavaSyntaxAPIPrinter.js';
import { DatabaseModule } from '../libraries/java/database/DatabaseModule.js';


export class ApiDoc {
    async start() {

        await extractCsrfTokenFromGetRequest(true);

        this.initEditor();
        this.initClassDocumentation();
    }

    initEditor(){

        JavaLanguage.getInstance();

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

    getClassDocumentationForAI(): string {
        let mm = new JavaLibraryModuleManager(new DatabaseModule());

        let typeList = mm.javaTypes
        .sort(
            (a, b) => a.identifier.localeCompare(b.identifier));
        
        let printer = new JavaSyntaxAPIPrinter();
        
        let s: string = "";

        for(let type of typeList){
            if(type instanceof JavaClass || type instanceof JavaEnum || type instanceof JavaInterface){
                s += printer.printClassEnumInterface(type);
            }
        }

        return s;
        
    }

    initClassDocumentation() {

        let mm = new JavaLibraryModuleManager(new DatabaseModule());

        let typeList = mm.javaTypes
        .sort(
            (a, b) => a.identifier.localeCompare(b.identifier));


        typeList.filter(type => type instanceof NonPrimitiveType).forEach((type, index) => {

            let img: string = "img_classdeclaration-dark";
            if(type instanceof JavaEnum) img = "img_enumdeclaration-dark";
            if(type instanceof JavaInterface) img = "img_interfacedeclaration-dark";

            let $menuItem = jQuery('<div class="jo_menu-class"><span class="' + img + ' jo_menu_img"></span>' + type.identifier + '</div>');
            jQuery('#classes').append($menuItem)
            $menuItem.on('click', (e) => {
                jQuery('.jo_menu-class').css('background-color', 'unset')
                jQuery(e.target).css('background-color', '#a0a0a070');
                this.showAPIHelp(type);
            })
        });

        // jQuery('#classesHeading').text(HelpMessages.apiDocClasses());
        // jQuery('#interfacesHeading').text(HelpMessages.apiDocInterfaces());
        // jQuery('#enumsHeading').text(HelpMessages.apiDocEnums());
        jQuery('#mainHeading').text(HelpMessages.apiDocMainHeading());

        let button = new Button(jQuery('#mainHeading')[0], "Download (für AI-Prompt)", "#303030", () => {
            downloadFile(this.getClassDocumentationForAI(), "Online-IDE API-Documentation.txt", false);
        })
        button.buttonDiv.classList.add('aiDownloadButton');

    }

    showAPIHelp(type: NonPrimitiveType) {
        let $mainHeading = jQuery('#main-heading');
        let $mainBody = jQuery('#main-body');
        $mainHeading.empty();
        $mainBody.empty();
        
        let $caption = jQuery('<div class="jo_type"></div>');
        $mainHeading.append($caption);
        monaco.editor.colorize(type.getDeclaration(), "myJava", {}).then(
            (html) => {$caption.append(jQuery(html))}
        );
        
        if(type.documentation){
            $mainHeading.append(jQuery('<div class="jo_documentation">' + this.docToString(type.documentation) + '</div>'));
        }
        
        
        if(type instanceof JavaClass) this.showConstructors(type);
        this.showMethods(type);
        if(type instanceof JavaClass || type instanceof JavaEnum) this.showAttributes(type);
        
    }
    
    showConstructors(t: JavaClass){
        let $mainBody = jQuery('#main-body');
        $mainBody.append(jQuery('<div class="jo_constructor-heading">Konstruktoren:</div>'));
        let methods = t.getOwnMethods().filter((m) => m.isConstructor);

        methods.sort((a, b) => a.identifier.localeCompare(b.identifier));

        if(methods.length == 0){
            $mainBody.append(jQuery(`<div class="jo_method">${HelpMessages.apiDocNone()}</div>`));
        } else {
            for(let method of methods){
                let $caption = jQuery(jQuery('<div class="jo_method"></div>'));
                $mainBody.append($caption);
                monaco.editor.colorize(method.getDeclaration(), "myJava", {}).then(
                    (html) => {$caption.append(jQuery(html))}
                );

                if(method.documentation != null && method.documentation != ""){
                    $mainBody.append(jQuery('<div class="jo_documentation">' + this.docToString(method.documentation) + '</div>'));
                }
            }
        }
    }

    showMethods(t: NonPrimitiveType){
        let $mainBody = jQuery('#main-body');
        $mainBody.append(jQuery('<div class="jo_method-heading">Methoden:</div>'));
        let methods: JavaMethod[];
        if(t instanceof JavaInterface){
            methods = t.getAllMethods().slice(0);
        } else {
            methods = t.getAllMethods().filter((m) => !m.isConstructor && m.visibility != TokenType.keywordPrivate);
        }

        methods.sort((a, b) => a.identifier.localeCompare(b.identifier));

        if(methods.length == 0){
            $mainBody.append(jQuery(`<div class="jo_method">${HelpMessages.apiDocNone()}</div>`));
        } else {
            for(let method of methods){
                let $caption = jQuery(jQuery('<div class="jo_method"></div>'));
                $mainBody.append($caption);
                monaco.editor.colorize(method.getDeclaration(), "myJava", {}).then(
                    (html) => {$caption.append(jQuery(html))}
                );

                if(method.classEnumInterface && method.classEnumInterface != t){
                    $mainBody.append(jQuery('<div style = "font-size: 70%"> (geerbt von ' + method.classEnumInterface.identifier + ')</div>'));
                }

                if(method.documentation != null && method.documentation != ""){
                    $mainBody.append(jQuery('<div class="jo_documentation">' + this.docToString(method.documentation) + '</div>'));
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
        let $mainBody = jQuery('#main-body');
        $mainBody.append(jQuery('<div class="jo_attribute-heading">Attribute:</div>'));
        let attributes = t.getFields().filter(field => field.visibility != TokenType.keywordPrivate);

        attributes.sort((a, b) => a.identifier.localeCompare(b.identifier));

        if(attributes.length == 0){
            $mainBody.append(jQuery(`<div class="jo_method">${HelpMessages.apiDocNone()}</div>`));
        } else {
            for(let attribute of attributes){
                let $caption = jQuery(jQuery('<div class="jo_method"></div>'));
                $mainBody.append($caption);
                monaco.editor.colorize(attribute.getDeclaration(), "myJava", {}).then(
                    (html) => {$caption.append(jQuery(html))}
                );

                if(attribute.documentation != null && attribute.documentation != ""){
                    $mainBody.append(jQuery('<div class="jo_documentation">' + this.docToString(attribute.documentation) + '</div>'));
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


