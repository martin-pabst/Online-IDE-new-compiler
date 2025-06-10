import jQuery from 'jquery';
import { Main } from "./Main.js";
import { SynchronizationManager } from "../repository/synchronize/RepositorySynchronizationManager.js";
import { RepositoryCreateManager } from "../repository/update/RepositoryCreateManager.js";
import { RepositorySettingsManager } from "../repository/update/RepositorySettingsManager.js";
import { RepositoryCheckoutManager } from "../repository/update/RepositoryCheckoutManager.js";
import { SpriteManager } from "../spritemanager/SpriteManager.js";
import * as PIXI from 'pixi.js';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import "/assets/fonts/fonts.css";
import "/assets/css/diagram.css";

// All css files for fullscreen online-ide:
import "/assets/css/bottomdiv.css";
import "/assets/css/debugger.css";
import "/assets/css/editor.css";
import "/assets/css/editorStatic.css";
import "/assets/css/helper.css";
import "/assets/css/icons.css";
import "/assets/css/run.css";
import "/assets/css/dialog.css";
import "/assets/css/synchronize-repo.css";
import "/assets/css/updatecreate-repo.css";
import "/assets/css/spritemanager.css";

import spritesheetjson from '/assets/graphics/spritesheet.json.txt';
import spritesheetpng from '/assets/graphics/spritesheet.png';
import { PixiSpritesheetData } from "../spritemanager/PixiSpritesheetData.js";


declare var BUILD_DATE: string;
declare var APP_VERSION: string;


function loadSpritesheet() {
    fetch(`${spritesheetjson}`)
        .then((response) => response.json())
        .then((spritesheetData: PixiSpritesheetData) => {
            PIXI.Assets.load(`${spritesheetpng}`).then((texture: PIXI.Texture) => {
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

window.onload = () => {

    setTimeout(() => {
        let vidisDiv = jQuery('vidis-login')[0];
        if(!vidisDiv) return;
        jQuery(jQuery('vidis-login')[0].shadowRoot).find('.entry-button-label').text('Amelden mit VIDIS (Test)')
    }, 500);


    document.getElementById('versionDiv').textContent = "Version " + APP_VERSION + " vom " + BUILD_DATE;

    // p5.disableFriendlyErrors = true

    loadSpritesheet();
    
    initMonacoEditor()
    
    let main = new Main();
    main.startupBeforeLogin();
}