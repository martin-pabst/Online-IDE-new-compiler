import '/assets/css/slider.css';
import { DOM } from '../DOM';

export type SliderknobBeginEndCallback = () => void;
export type SliderknobMovedCallback = () => void;

export type SliderKnobNeighbourOrientation = "top" | "right" | "bottom" | "left";
export type SliderKnobNeighbour = {
    element: HTMLElement,
    neighbourOrientation: SliderKnobNeighbourOrientation[],
    oldWidth?: number,
    oldHeight?: number
}

export class Sliderknob {

    sliderknobDiv!: HTMLElement;

    transparentOverlay: HTMLDivElement | undefined;

    sliderknobBeginCallback?: SliderknobBeginEndCallback;
    sliderknobEndCallback?: SliderknobBeginEndCallback;

    DX = -8;
    DY = -8;

    constructor(private neighbours: SliderKnobNeighbour[],
        private sliderMovedCallback: SliderknobMovedCallback) {

        this.initSlider();
    }

    initSlider() {


        this.sliderknobDiv = DOM.makeDiv(undefined, "jo_sliderknob", "img_knob", "jo_button", "jo_active");
        this.sliderknobDiv.draggable = false;
        this.sliderknobDiv.style.zIndex = "10";

        document.body.append(this.sliderknobDiv);

        let left = 0;
        let top = 0;

        for (let neighbour of this.neighbours) {
            let neighbourBoundingBox = neighbour.element.getBoundingClientRect();

            for (let orientation of neighbour.neighbourOrientation) {
                switch (orientation) {
                    case "top":
                        top = neighbourBoundingBox.top + neighbourBoundingBox.height;
                        break;
                    case "bottom":
                        top = neighbourBoundingBox.top;
                        new ResizeObserver(() => {
                            this.sliderknobDiv.style.top = neighbour.element.getBoundingClientRect().top + this.DY + window.scrollY + "px";
                            }).observe(neighbour.element);
                        break;
                    case "left":
                        left = neighbourBoundingBox.left + neighbourBoundingBox.width;
                        break;
                    case "right":
                        left = neighbourBoundingBox.left;
                        new ResizeObserver(() => {
                            this.sliderknobDiv.style.left = neighbour.element.getBoundingClientRect().left + this.DX + window.scrollX + "px";
                            }).observe(neighbour.element);
                        break;
                }
            }

        }

        this.sliderknobDiv.style.top = top + window.scrollY + this.DY + "px";
        this.sliderknobDiv.style.left = left + window.scrollX + this.DX + "px";


        let mousePointer = window.PointerEvent ? "pointer" : "mouse";

        this.sliderknobDiv.addEventListener(mousePointer + "down", (md: PointerEvent) => {

            let x = md.clientX;
            let y = md.clientY;

            for (let neighbour of this.neighbours) {
                let neighbourBoundingBox = neighbour.element.getBoundingClientRect();
                neighbour.oldWidth = neighbourBoundingBox.width;
                neighbour.oldHeight = neighbourBoundingBox.height;
            }

            let moveListener: EventListener;

            this.transparentOverlay = DOM.makeDiv(document.body);
            this.transparentOverlay.style.cursor = 'ns-resize';
            this.transparentOverlay.style.position = 'absolute';
            this.transparentOverlay.style.left = '0';
            this.transparentOverlay.style.top = '0';
            this.transparentOverlay.style.bottom = '0';
            this.transparentOverlay.style.right = '0';
            this.transparentOverlay.style.zIndex = '1000';

            if (this.sliderknobBeginCallback) this.sliderknobBeginCallback();

            //@ts-ignore
            this.transparentOverlay.addEventListener("pointermove", moveListener = (mm: PointerEvent) => {
                let dx = mm.clientX - x;
                let dy = mm.clientY - y;

                for (let neighbour of this.neighbours) {
                    for (let orientation of neighbour.neighbourOrientation) {
                        switch (orientation) {
                            case "top":
                                neighbour.element.style.height = neighbour.oldHeight + dy + "px";
                                break;
                            case "bottom":
                                neighbour.element.style.height = neighbour.oldHeight - dy + "px";
                                break;
                            case "left":
                                neighbour.element.style.width = neighbour.oldWidth + dx + "px";
                                break;
                            case "right":
                                neighbour.element.style.width = neighbour.oldWidth - dx + "px";
                                break;
                        }
                    }

                }

                // this.sliderknobDiv.style.top = top + dy + "px";
                // this.sliderknobDiv.style.left = left + dx + "px";

                if (this.sliderMovedCallback) {
                    this.sliderMovedCallback();
                }

                // this.container.style.flex = "0 1 auto";

            });

            this.transparentOverlay!.onmousemove = (ev) => { ev.stopPropagation() };

            this.transparentOverlay.addEventListener("pointerup", () => {
                this.transparentOverlay!.remove();
                if (this.sliderknobEndCallback) this.sliderknobEndCallback();
            });


        });

    }


}
