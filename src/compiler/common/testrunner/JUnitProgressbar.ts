import { DOM } from "../../../tools/DOM";

// see https://vite.dev/guide/assets
import compileGifUrl from '/assets/graphics/compile.gif'

export class JUnitProgressbar {

    mainDiv: HTMLDivElement;
    textDiv: HTMLDivElement;
    barDiv: HTMLDivElement;
    graphicDiv: HTMLDivElement;

    constructor(parentElement: HTMLElement) {
        this.mainDiv = DOM.makeDiv(parentElement, "jo_junitProgressbarMain");
        let outerBarDiv = DOM.makeDiv(this.mainDiv, "jo_junitProgressbarBarOuter");
        this.barDiv = DOM.makeDiv(outerBarDiv, "jo_junitProgressbarBarInner");
        this.textDiv = DOM.makeDiv(outerBarDiv, "jo_junitProgressbarText");
        this.graphicDiv = DOM.makeDiv(outerBarDiv, "jo_junitProgressbarGraphic");
        this.graphicDiv.innerHTML = `<img src="${compileGifUrl}" />`
    }

    hide() {
        this.mainDiv.style.display = 'none';
    }

    show() {
        this.mainDiv.style.display = 'block';
    }

    showProgress(testsOverall: number, testsPassed: number, testsFailed: number) {
        this.mainDiv.style.display = 'block';
        let percent = Math.round((testsPassed + testsFailed) / testsOverall * 100);
        if (testsFailed > 0) {
            this.barDiv.style.backgroundColor = "#ed2f2f4c";
        } else {
            this.barDiv.style.backgroundColor = "#21ff294c";
        }

        this.barDiv.style.width = percent + "%";

        let textHtml = `${percent} % (` +
            `<span class="jo_junit_captionRightside">${testsPassed}<span class="img_junit-passed"></span>` +
            `${testsOverall - testsPassed - testsFailed}<span class="img_junit-todo" style="left: -4px; width: 12px"></span>` +
            `${testsFailed}<span class="img_junit-failed"></span></span>)`;

        this.graphicDiv.style.display = percent < 100 ? 'block' : 'none';

        this.textDiv.innerHTML = textHtml;
    }

}