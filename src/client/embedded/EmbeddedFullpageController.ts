import { IconButtonComponent } from '../../tools/components/IconButtonComponent';
import { DOM } from '../../tools/DOM';
import { transferElements } from '../../tools/HtmlTools';
import { MainEmbedded } from './MainEmbedded';
import '/assets/css/wholewindow.css';


export class EmbeddedFullpageController {

    wholeWindowElement: HTMLElement;
    primaryButton: IconButtonComponent;
    additionalButtonTopRight: IconButtonComponent;

    constructor(private mainEmbedded: MainEmbedded, private mainDiv: HTMLElement, controlsDiv: HTMLElement) {
        this.primaryButton = new IconButtonComponent(controlsDiv,
            ['img_whole-window', 'img_whole-window-back'], (event, state) => {
                this.onWholeWindowButtonClicked(state);
            },
            ["IDE im Vollbild darstellen", "IDE in Normalgröße darstellen"],
            true, "append"
        )

        this.primaryButton.divElement.style.marginLeft = '10px';
        this.primaryButton.divElement.style.marginRight = '10px';
        

    }

    onWholeWindowButtonClicked(state: number) {
        switch (state) {
            case 0:
                this.mainEmbedded.rightDiv.wholeWindowButton.setVisible(true);
                this.mainEmbedded.horizontalSlider?.restorePosition();
                this.mainEmbedded.verticalSlider?.restorePosition();
                this.additionalButtonTopRight.remove();
                document.body.classList.remove('joeCssFence');
                transferElements(this.wholeWindowElement, this.mainDiv);
                break;
            case 1:
                this.additionalButtonTopRight = new IconButtonComponent(this.mainEmbedded.rightDiv.tabManager.tabheadingRightDiv,
                    ['img_whole-window-back'], (event, state) => {
                        this.onWholeWindowButtonClicked(0);
                    },
                    ["IDE in Normalgröße darstellen"],
                    true, "append"
                )
                this.mainEmbedded.rightDiv.wholeWindowButton.setVisible(false);
                this.mainEmbedded.horizontalSlider?.savePosition();
                this.mainEmbedded.verticalSlider?.savePosition();
                document.body.classList.add('joeCssFence');
                this.wholeWindowElement = DOM.makeDiv(document.body, 'jo_wholeWindow', 'jo_wholeWindow_embeddedFullpage');
                transferElements(this.mainDiv, this.wholeWindowElement);
                break;
        }
    }

}