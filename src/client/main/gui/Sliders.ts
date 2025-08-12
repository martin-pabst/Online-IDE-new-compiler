import jQuery from 'jquery';
import { jo_mouseDetected } from "../../../tools/HtmlTools.js";
import { Main } from "../Main.js";
import { ZoomControl } from "./diagrams/ZoomControl.js";
import { Slider } from '../../../tools/components/Slider.js';
import { Sliderknob } from '../../../tools/components/Sliderknob.js';

export class Sliders {

    main: Main;

    constructor(main: Main) {
        this.main = main;
    }

    initSliders() {
        let $leftPanel = jQuery('#leftpanel');
        let $editor = jQuery('#editor');
        let $editorInner = jQuery('#editor>.monaco-editor');
        let $rightDiv = jQuery('#rightdiv');
        let $bottomDiv = jQuery('#bottomdiv-outer');

        new Slider($leftPanel[0], false, false, (newLength) => {
            this.main.getMainEditor().layout();
            if (this.main.bottomDiv.homeworkManager.diffEditor != null) {
                this.main.bottomDiv.homeworkManager.diffEditor.layout();
            }
        }, $editor[0]);

        new Slider($rightDiv[0], true, false, (newLength) => {
            this.main.getMainEditor().layout();
            if (this.main.bottomDiv.homeworkManager.diffEditor != null) {
                this.main.bottomDiv.homeworkManager.diffEditor.layout();
            }
        }, $editor[0]);

        new Slider($bottomDiv[0], true, true, (newLength) => {
            this.main.getMainEditor().layout();
            if (this.main.bottomDiv.homeworkManager.diffEditor != null) {
                this.main.bottomDiv.homeworkManager.diffEditor.layout();
            }
        }, $editor[0]);

        new Sliderknob([
            {element: $leftPanel[0], neighbourOrientation: ["left"]},
            {element: $editor[0], neighbourOrientation: ["right", "top"]},
            {element: $bottomDiv[0], neighbourOrientation: ["bottom"]},

        ], () => {
            this.main.getMainEditor().layout();
            if (this.main.bottomDiv.homeworkManager.diffEditor != null) {
                this.main.bottomDiv.homeworkManager.diffEditor.layout();
            }
        })

        new Sliderknob([
            {element: $rightDiv[0], neighbourOrientation: ["right"]},
            {element: $bottomDiv[0], neighbourOrientation: ["bottom"]},
            {element: $editor[0], neighbourOrientation: ["left", "top"]},

        ], () => {
            this.main.getMainEditor().layout();
            if (this.main.bottomDiv.homeworkManager.diffEditor != null) {
                this.main.bottomDiv.homeworkManager.diffEditor.layout();
            }
        })

    }


    initSlidersOld() {
        let that = this;

        let mousePointer = window.PointerEvent ? "pointer" : "mouse";

        let sliderknobLeft = jQuery('<div class="jo_sliderknob img_knob jo_button jo_active" style="left: -8px" draggable="false"></div>');
        jQuery('#slider2').append(sliderknobLeft);
        sliderknobLeft.on(mousePointer + 'down', (md: JQuery.MouseDownEvent) => {
            let y = md.clientY;
            let x = md.clientX;

            md.stopPropagation();
            ZoomControl.preventFading = true;

            jQuery(document).on(mousePointer + "move.knobleft", (mm: JQuery.MouseMoveEvent) => {
                let dy = mm.clientY - y;
                let dx = mm.clientX - x;
                mm.stopPropagation();

                that.moveLeftPanel(dx);
                that.moveBottomDiv(dy);

                x += dx;
                y += dy;
            });

            jQuery(document).on(mousePointer + "up.knobleft", () => {
                jQuery(document).off(mousePointer + "move.knobleft");
                jQuery(document).off(mousePointer + "up.knobleft");
                ZoomControl.preventFading = false;
            });

        });

        let sliderknobRight = jQuery('<div class="jo_sliderknob img_knob jo_button jo_active" style="right: -8px" draggable="false"></div>');
        jQuery('#slider2').append(sliderknobRight);
        sliderknobRight.on(mousePointer + 'down', (md: JQuery.MouseDownEvent) => {
            let y = md.clientY;
            let x = md.clientX;

            md.stopPropagation();
            ZoomControl.preventFading = true;

            jQuery(document).on(mousePointer + "move.knobright", (mm: JQuery.MouseMoveEvent) => {
                let dy = mm.clientY - y;
                let dx = mm.clientX - x;
                mm.stopPropagation();

                that.moveRightDiv(dx);
                that.moveBottomDiv(dy);

                x += dx;
                y += dy;
            });

            jQuery(document).on(mousePointer + "up.knobright", () => {
                jQuery(document).off(mousePointer + "move.knobright");
                jQuery(document).off(mousePointer + "up.knobright");
                ZoomControl.preventFading = false;
            });

        });

    }

    moveRightDiv(dx: number) {
        let $editor = jQuery('#editor>.monaco-editor');
        let $rightDiv = jQuery('#rightdiv');

        let width = Number.parseInt($rightDiv.css('width').replace('px', ''));
        $rightDiv.css('width', (width - dx) + "px");

        let mewidth = Number.parseInt($editor.css('width').replace('px', ''));
        $editor.css('width', (mewidth + dx) + "px");

        this.main.getMainEditor().layout();
        if (this.main.bottomDiv.homeworkManager.diffEditor != null) {
            this.main.bottomDiv.homeworkManager.diffEditor.layout();
        }

        jQuery('.jo_graphics').trigger('sizeChanged');
        width += dx;
    }
    moveBottomDiv(dy: number) {
        let $editor = jQuery('#editor>.monaco-editor');
        let $bottomDiv = jQuery('#bottomdiv-outer');

        let height = Number.parseInt($bottomDiv.css('height').replace('px', ''));
        $bottomDiv.css('height', (height - dy) + "px");

        let meheight = Number.parseInt($editor.css('height').replace('px', ''));
        $editor.css('height', (meheight + dy) + "px");

        this.main.getMainEditor().layout();
        if (this.main.bottomDiv.homeworkManager.diffEditor != null) {
            this.main.bottomDiv.homeworkManager.diffEditor.layout();
        }
    }

    moveLeftPanel(dx: number) {
        let $leftPanel = jQuery('#leftpanel');
        let $editor = jQuery('#editor>.monaco-editor');

        let width = Number.parseInt($leftPanel.css('width').replace('px', ''));
        $leftPanel.css('width', (width + dx) + "px");

        let mewidth = Number.parseInt($editor.css('width').replace('px', ''));
        $editor.css('width', (mewidth - dx) + "px");
        this.main.getMainEditor().layout();
        if (this.main.bottomDiv.homeworkManager.diffEditor != null) {
            this.main.bottomDiv.homeworkManager.diffEditor.layout();
        }

    }



}