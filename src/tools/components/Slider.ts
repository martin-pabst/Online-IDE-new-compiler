import '/assets/css/slider.css';
import { DOM } from '../DOM';

export type SliderBeginEndCallback = () => void;
export type SliderMovedCallback = (newLength: number) => void;

export class Slider {

    sliderDiv!: HTMLElement;
    otherDiv!: HTMLElement;

    transparentOverlay: HTMLDivElement | undefined;

    sliderBeginCallback?: SliderBeginEndCallback;
    sliderEndCallback?: SliderBeginEndCallback;

    /**
     * A div contains container and another div. Between the latter two
     * a slider should get inserted.
     * @param container
     * @param lastFirst true, if container is right/at bottom of other div; false if otherwise
     * @param vertHor true, if container and other div are on top/below of another; false if they are left/right of each other
     * @param sliderMovedCallback
     * @param otherDiv
     */
    constructor(private container: HTMLElement,
        private lastFirst: boolean, private vertHor: boolean,
        private sliderMovedCallback: SliderMovedCallback,
        otherDiv?: HTMLElement) {

        this.initSlider();
        if (otherDiv) this.otherDiv = otherDiv;
    }

    initSlider() {
        let that = this;

        if (this.otherDiv == null) {
            let parentElement = this.container.parentElement;
            if (!parentElement) {
                console.log("Error in EmbeddedSlider: element has no parentElement.");
                return;
            }
            Array.from(parentElement.children).forEach((element) => {
                if (element != this.container) {
                    that.otherDiv = <HTMLElement>element;
                }
            });
        }

        this.sliderDiv = DOM.makeDiv(undefined, "jo_slider");

        this.sliderDiv.style.width = this.vertHor ? "100%" : "4px";
        this.sliderDiv.style.height = this.vertHor ? "4px" : "100%";
        this.sliderDiv.style.cursor = this.vertHor ? "row-resize" : "col-resize";

        if (this.lastFirst) {
            this.sliderDiv.style.top = "0px";
            this.sliderDiv.style.left = "0px";
        } else {
            if (this.vertHor) {
                this.sliderDiv.style.bottom = "0px";
                this.sliderDiv.style.left = "0px";
            } else {
                this.sliderDiv.style.top = "0px";
                this.sliderDiv.style.right = "0px";
            }
        }

        this.container.append(this.sliderDiv);

        let mousePointer = window.PointerEvent ? "pointer" : "mouse";

        //@ts-ignore
        this.sliderDiv.addEventListener(mousePointer + "down", (md: PointerEvent) => {

            let x = md.clientX;
            let y = md.clientY;

            let ownRectangle = this.container.getBoundingClientRect();
            let ownStartHeight = ownRectangle.height;
            let ownStartWidth = ownRectangle.width;
            let otherRectangle = this.otherDiv.getBoundingClientRect();
            let otherStartHeight = otherRectangle.height;
            let otherStartWidth = otherRectangle.width;

            let moveListener: EventListener;

            this.transparentOverlay = DOM.makeDiv(document.body);
            this.transparentOverlay.style.cursor = this.vertHor ? 'ns-resize' : 'ew-resize';
            this.transparentOverlay.style.position = 'absolute';
            this.transparentOverlay.style.left = '0';
            this.transparentOverlay.style.top = '0';
            this.transparentOverlay.style.bottom = '0';
            this.transparentOverlay.style.right = '0';
            this.transparentOverlay.style.zIndex = '1000';

            if(this.sliderBeginCallback) this.sliderBeginCallback();


            //@ts-ignore
            this.transparentOverlay.addEventListener("pointermove", moveListener = (mm: PointerEvent) => {
                let dx = mm.clientX - x;
                let dy = mm.clientY - y;

                if (this.vertHor) {
                    let newHeight = ownStartHeight + (this.lastFirst ? -dy : dy);
                    let newOtherHeight = otherStartHeight + (this.lastFirst ? dy : -dy);
                    this.container.style.height = newHeight + "px";
                    this.otherDiv.style.height = newOtherHeight + "px";
                    // this.container.style.maxHeight = newHeight + "px";
                    // this.otherDiv.style.maxHeight = newOtherHeight + "px";
                    this.sliderMovedCallback(newHeight);
                } else {
                    let newWidth = ownStartWidth + (this.lastFirst ? -dx : dx);
                    let newOtherWidth = otherStartWidth + (this.lastFirst ? dx : -dx);
                    this.container.style.width = newWidth + "px";
                    this.otherDiv.style.width = newOtherWidth + "px";
                    // this.container.style.maxWidth = newWidth + "px";
                    // this.otherDiv.style.maxWidth = newOtherWidth + "px";
                    this.sliderMovedCallback(newWidth);
                }
                this.container.style.flex = "0 1 auto";

            });

            this.transparentOverlay!.onmousemove = (ev) => {ev.stopPropagation()};

            let upListener: EventListener;
            //@ts-ignore
            this.transparentOverlay.addEventListener("pointerup", upListener = () => {
                this.transparentOverlay!.remove();
                if(this.sliderEndCallback) this.sliderEndCallback();
            });


        });

    }

    setColor(color: string) {
        this.sliderDiv.style.backgroundColor = color;
    }


}
