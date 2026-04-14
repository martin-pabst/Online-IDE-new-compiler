
import jQuery from 'jquery';
import * as PIXI from 'pixi.js';
import { ThemeManager } from "../main/gui/ThemeManager.js";
import { MainEmbedded } from "./MainEmbedded.js";

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'


// All css files for embedded online-ide:
import "/assets/fonts/fonts.css";
import "/assets/css/bottomdiv.css";
import "/assets/css/debugger.css";
import "/assets/css/editor.css";
import "/assets/css/embedded.css";
import "/assets/css/helper.css";
import "/assets/css/icons.css";
import "/assets/css/run.css";

import spritesheetjson from '/assets/graphics/spritesheet.json.txt';
import spritesheetpng from '/assets/graphics/spritesheet.png';
import { PixiSpritesheetData } from "../spritemanager/PixiSpritesheetData.js";
import * as monaco from 'monaco-editor'

declare global {
    // Note the capital "W"
    interface Window { MonacoEnvironment?: monaco.Environment | undefined; }
}

declare var APP_VERSION: string;
declare var BUILD_DATE: string;

export type JOScript = {
    title: string,
    text: string,
    url?: string
}

function loadSpritesheet() {
    fetch(spritesheetjson)
        .then((response) => response.json())
        .then((spritesheetData: PixiSpritesheetData) => {
            PIXI.Assets.load(spritesheetpng).then((texture: PIXI.Texture) => {
                let source: PIXI.ImageSource = texture.source;
                source.minFilter = "nearest";
                source.magFilter = "nearest";

                spritesheetData.meta.size.w = texture.width;
                spritesheetData.meta.size.h = texture.height;
                let spritesheet = new PIXI.Spritesheet(texture, spritesheetData);
                spritesheet.parse().then(() => {
                    PIXI.Assets.cache.set('spritesheet', spritesheet);
                });
            })
        });
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



export class EmbeddedStarter {


    startupComplete = 2;


    initGUI() {

        this.checkStartupComplete();
    }

    initEditor() {
        this.checkStartupComplete();
    }

    checkStartupComplete() {
        this.startupComplete--;
        if (this.startupComplete == 0) {
            this.start();
        }
    }


    start() {

        this.initJavaOnlineDivs();

    }

    async initJavaOnlineDivs() {

        let divsWithScriptLists: [JQuery<HTMLElement>, JOScript[]][] = [];

        jQuery('.java-online').addClass('notranslate').each((index: number, element: HTMLElement) => {
            let $div = jQuery(element);
            let scriptList: JOScript[] = [];

            $div.find('script').each((index: number, element: HTMLElement) => {
                let $script = jQuery(element);

                let srcAttr = $script.attr('src');
                let text = $script.text().trim();
                let script: JOScript = {
                    title: $script.attr('title'),
                    text: text
                };


                if ($script.data('type') == "hint" && !script.title.endsWith(".md")) {
                    script.title += ".md";
                }

                if (srcAttr != null) script.url = srcAttr;
                script.text = this.eraseDokuwikiSearchMarkup(script.text);
                scriptList.push(script);
            });

            divsWithScriptLists.push([$div, scriptList])

        });

        for (let dws of divsWithScriptLists) {
            new ThemeManager(<HTMLDivElement>dws[0][0]).switchTheme("dark");

            await this.initDiv(dws[0], dws[1]);
        }

    }

    eraseDokuwikiSearchMarkup(text: string): string {
        return text.replace(/<span class="search\whit">(.*?)<\/span>/g, "$1");
    }

    async initDiv($div: JQuery<HTMLElement>, scriptList: JOScript[]) {

        $div.addClass('joeCssFence');
        for (let script of scriptList) {
            if (script.url != null) {
                const response = await fetch(script.url)
                script.text = await response.text()
            }
        }

        // Here execution is continued...
        new MainEmbedded($div, scriptList);

    }

}

jQuery(function () {

    let embeddedStarter = new EmbeddedStarter();

    initMonacoEditor()

    embeddedStarter.initEditor();
    embeddedStarter.initGUI();

    loadSpritesheet();

    //@ts-ignore
    console.log("Online-IDE embedded Version " + APP_VERSION + " vom " + BUILD_DATE);

});
