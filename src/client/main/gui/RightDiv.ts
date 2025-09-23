import jQuery from 'jquery';
import { MainBase } from "../MainBase.js";
import { ClassDiagram } from "./diagrams/classdiagram/ClassDiagram.js";
import { IWorld } from '../../../compiler/java/runtime/graphics/IWorld.js';
import { Tab, TabManager } from '../../../tools/TabManager.js';
import { DOM } from '../../../tools/DOM.js';
import { RightDivMessages } from './language/GUILanguage.js';
import ballTriangleSVG from '/assets/graphics/ball-triangle.svg';
import { IconButtonComponent } from '../../../tools/components/IconButtonComponent.js';

import '/assets/css/wholewindow.css';
import { transferElements } from '../../../tools/HtmlTools.js';
import { MainEmbedded } from '../../embedded/MainEmbedded.js';


export class RightDiv {

    classDiagram: ClassDiagram;
    isWholePage: boolean = false;

    coordinatesDiv: HTMLDivElement;
    newControlsContainer: HTMLDivElement;

    tabManager: TabManager;

    outputTab: Tab;
    classDiagramTab: Tab;

    rightDivElement: HTMLElement;
    originalControlsContainer: HTMLElement;
    rightDivInner: HTMLElement;

    wholeWindowElement: HTMLElement;

    wholeWindowButton: IconButtonComponent;

    rightdiv_width: string = "100%";

    constructor(private main: MainBase, private mainElement: HTMLElement, private withClassDiagram: boolean) {
        if (main.isEmbedded()) {
            this.findElementsEmbedded();
        } else {
            this.findElementsFullVersion();
        }
    }

    findElementsEmbedded() {
        this.rightDivElement = <HTMLElement>this.mainElement.getElementsByClassName('joe_rightDiv')[0];
        this.originalControlsContainer = <HTMLElement>this.mainElement.getElementsByClassName('joe_controlsDiv')[0];
        this.rightDivInner = <HTMLElement>this.mainElement.getElementsByClassName('joe_rightDivInner')[0];
    }

    findElementsFullVersion() {
        this.rightDivElement = document.getElementById('rightdiv');
        this.originalControlsContainer = document.getElementById('controls');
        this.rightDivInner = document.getElementById('rightdiv-inner');
    }

    private onWholeWindowButtonClicked(state: number) {

        if(this.main.isEmbedded()){
            this.findElementsEmbedded();
        } else {
            let helperBox = document.body.getElementsByClassName('jo_helperBox');
            if(helperBox.length > 0) (<HTMLElement>helperBox[0]).style.display = 'none';
        }

        this.isWholePage = state == 1;

        if (this.isWholePage) {
            if(this.main.isEmbedded()){
                document.body.classList.add('joeCssFence');
            (<MainEmbedded>this.main).embeddedFullpageController.primaryButton.setVisible(false);
            }
            this.wholeWindowElement = DOM.makeDiv(document.body, 'jo_wholeWindow');
            
            transferElements(this.rightDivElement, this.wholeWindowElement);
            transferElements(this.originalControlsContainer, this.newControlsContainer);
            
            jQuery('.jo_graphics').trigger('sizeChanged');
        } else {
            if(this.main.isEmbedded()){
                document.body.classList.remove('joeCssFence');
            (<MainEmbedded>this.main).embeddedFullpageController.primaryButton.setVisible(true);
            }
            transferElements(this.wholeWindowElement, this.rightDivElement);
            transferElements(this.newControlsContainer, this.originalControlsContainer);

            this.wholeWindowElement.remove();

            jQuery('.jo_graphics').trigger('sizeChanged');
        }

    }

    adjustWidthToWorld() {
        let $runDiv = jQuery(this.outputTab.bodyDiv);
        let world: IWorld = this.main.getInterpreter().retrieveObject("WorldClass");
        if (world != null && this.isWholePage) {
            let screenHeight = window.innerHeight - this.tabManager.headingsDiv.getBoundingClientRect().height - 6;
            let screenWidthToHeight = window.innerWidth / (screenHeight);
            let worldWidthToHeight = world.width / world.height;
            if (worldWidthToHeight <= screenWidthToHeight) {
                let newWidth = worldWidthToHeight * screenHeight;
                $runDiv.css('width', newWidth + "px");
                $runDiv.css('height', screenHeight + "px");
            } else {
                let newHeight = window.innerWidth / worldWidthToHeight;
                $runDiv.css('width', window.innerWidth + "px");
                $runDiv.css('height', newHeight + "px");
            }
        }

    }

    initGUI() {

        this.tabManager = new TabManager(this.rightDivInner);

        this.coordinatesDiv = DOM.makeDiv(undefined, 'jo_coordinates');
        this.tabManager.insertIntoRightDiv(this.coordinatesDiv);

        this.newControlsContainer = DOM.makeDiv(undefined, 'jo_control-container');
        this.tabManager.insertIntoRightDiv(this.newControlsContainer);

        this.tabManager.addTab(this.outputTab = new Tab(RightDivMessages.output(), ['jo_run']));
        DOM.makeDiv(this.outputTab.bodyDiv, 'jo_run-programend').textContent = RightDivMessages.programEnd();

        let $inputDiv = jQuery(`
            <div class="jo_run-input">
                            <div>
                                <div>
                                    <div class="jo_run-input-message" class="jo_rix">${RightDivMessages.inputNumber()}
                                    </div>
                                    <input class="jo_run-input-input" type="text" class="jo_rix">
                                    <div class="jo_run-input-button-outer" class="jo_rix">
                                        <div class="jo_run-input-button" class="jo_rix">OK</div>
                                    </div>

                                    <div class="jo_run-input-error" class="jo_rix"></div>
                                </div>
                            </div>
                        </div>
            `)
        this.outputTab.bodyDiv.appendChild($inputDiv[0]);

        let $runInnerDiv = jQuery(`
            <div class="jo_run-inner">
            <div class="jo_graphics"></div>
            <div class="jo_output" class="jo_scrollable"></div>
            </div>
            `);
        this.outputTab.bodyDiv.appendChild($runInnerDiv[0]);

        if (this.withClassDiagram) {
            this.tabManager.addTab(this.classDiagramTab = new Tab(RightDivMessages.classDiagram(), ['jo_classdiagram']));
            this.classDiagramTab.bodyDiv.appendChild(jQuery(`<img src="${ballTriangleSVG}" class="jo_classdiagram-spinner">`)[0]);
            this.classDiagramTab.onShow = () => {
                this.main.drawClassDiagrams(false);
            }

            setTimeout(() => {
                this.classDiagram = new ClassDiagram(jQuery(this.classDiagramTab.bodyDiv), this.main);
            }, 100);
        }

        this.outputTab.show();

        this.wholeWindowButton = new IconButtonComponent(this.tabManager.tabheadingRightDiv,
            ['img_whole-window-dark', 'img_whole-window-back-dark'], (event, state) => {
                this.onWholeWindowButtonClicked(state);
            },
            [RightDivMessages.wholeWindow(), RightDivMessages.backToNormalSize()],
            true, "append"
        )

    }

    isClassDiagramActive(): boolean {
        if (this.classDiagramTab) {
            return this.classDiagramTab.isActive();
        }
        return false;
    }


}



// let child_window = window.open();

// const cdocument = child_window.document;
// const cbody = cdocument.body;
// cbody.style.margin = '0';
// cbody.style.padding = '0';

// let cssFence = DOM.makeDiv(cbody, 'joeCssFence');
// cssFence.appendChild($rightDiv[0]);
// cssFence.style.margin = '0';

// const rules = Array.from(document.styleSheets)
//     .reduce((sum, sheet) => {
//         // errors in CORS at some sheets (e.g. qiita)
//         // like: "Uncaught DOMException: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules"
//         try {
//             return [...sum, ...Array.from(sheet.cssRules).map(rule => rule.cssText)];
//         } catch (e) {
//             // console.log('errored', e);
//             return sum;
//         }
//     }, []).filter(rule => rule.indexOf('joeCssFence') >= 0)

// const newSheet = cdocument.querySelector('head').appendChild(document.createElement('style')).sheet;

// // newSheet.insertRule('body{background-color: red}');

// for(let rule of rules){
//     newSheet.insertRule(rule);
// }
