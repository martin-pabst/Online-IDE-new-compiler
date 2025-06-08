import jQuery from 'jquery';
import { makeTabs } from "../../../tools/HtmlTools.js";
import { MainBase } from "../MainBase.js";
import { ClassDiagram } from "./diagrams/classdiagram/ClassDiagram.js";
import { IWorld } from '../../../compiler/java/runtime/graphics/IWorld.js';

export class RightDiv {

    classDiagram: ClassDiagram;
    isWholePage: boolean = false;

    $tabs: JQuery<HTMLElement>;
    $headings: JQuery<HTMLElement>;

    constructor(private main: MainBase, public $rightDiv: JQuery<HTMLElement>) {

        this.$tabs = $rightDiv.find('.jo_tabs');
        this.$headings = $rightDiv.find('.jo_tabheadings');

        let withClassDiagram = this.$headings.find('.jo_classDiagramTabHeading').length > 0;

        if (withClassDiagram) {
            this.classDiagram = new ClassDiagram(this.$tabs.find('.jo_classdiagram'), main);
            this.$headings.find('.jo_classDiagramTabHeading').on("click", () => { that.main.drawClassDiagrams(false) });
        }

        let that = this;
        let rightdiv_width: string = "100%";
        $rightDiv.find('.jo_whole-window').on("click", () => {

            that.isWholePage = !that.isWholePage;

            let $wholeWindow = jQuery('.jo_whole-window');

            if (!that.isWholePage) {
                jQuery('#code').css('display', 'flex');
                jQuery('#rightdiv').css('width', rightdiv_width);
                // jQuery('#run').css('width', '');
                $wholeWindow.removeClass('img_whole-window-back');
                $wholeWindow.addClass('img_whole-window');
                jQuery('#controls').insertAfter(jQuery('#view-mode'));
                $wholeWindow.attr('title', 'Auf Fenstergröße vergrößern');
                jQuery('.jo_graphics').trigger('sizeChanged');
            } else {
                jQuery('#code').css('display', 'none');
                rightdiv_width = jQuery('#rightdiv').css('width');
                jQuery('#rightdiv').css('width', '100%');
                $wholeWindow.removeClass('img_whole-window');
                $wholeWindow.addClass('img_whole-window-back');
                // that.adjustWidthToWorld();
                jQuery('.jo_control-container').append(jQuery('#controls'));
                $wholeWindow.attr('title', 'Auf normale Größe zurückführen');
                jQuery('.jo_graphics').trigger('sizeChanged');
            }
        });

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


    }

    adjustWidthToWorld() {
        let world: IWorld = this.main.getInterpreter().retrieveObject("WorldClass");
        if (world != null && this.isWholePage) {
            let screenHeight = window.innerHeight - this.$headings.height() - 6;
            let screenWidthToHeight = window.innerWidth / (screenHeight);
            let worldWidthToHeight = world.width / world.height;
            if (worldWidthToHeight <= screenWidthToHeight) {
                let newWidth = worldWidthToHeight * screenHeight;
                this.$tabs.find('.jo_run').css('width', newWidth + "px");
                this.$tabs.find('.jo_run').css('height', screenHeight + "px");
            } else {
                let newHeight = window.innerWidth / worldWidthToHeight;
                this.$tabs.find('.jo_run').css('width', window.innerWidth + "px");
                this.$tabs.find('.jo_run').css('height', newHeight + "px");
            }
        }

    }

    initGUI() {
        makeTabs(this.$rightDiv);
    }

    isClassDiagramEnabled(): boolean {
        let heading = this.$headings.find('.jo_classDiagramTabHeading');
        if (heading.length == 0) return false;
        return heading.hasClass("jo_active");
    }


}