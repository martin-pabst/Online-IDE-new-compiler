import { makeTabs } from "../../../tools/HtmlTools.js";
import { Main } from "../Main.js";
import { MyConsole } from "./console/MyConsole.js";
import { ErrorManager } from "./ErrorManager.js";
import { MainBase } from "../MainBase.js";
import { HomeworkManager } from "./HomeworkManager.js";
import { GradingManager } from './GradingManager.js';

import { Tab, TabManager } from "../../../tools/TabManager.js";
import jQuery from 'jquery';

import '/assets/css/tabs.css';
import gridSVG from '/assets/graphics/grid.svg';
import compileGIF from '/assets/graphics/compile.gif';
import { BottomDivMessages } from "./language/GUILanguage.js";

export class BottomDiv {

    tabManager: TabManager;

    // programPrinter: ProgramPrinter;
    console: MyConsole;
    errorManager: ErrorManager;
    homeworkManager: HomeworkManager;
    gradingManager: GradingManager;

    disassemblerTab: Tab;
    jUnitTab: Tab;

    $dbBusyImage: JQuery<HTMLImageElement>;
    $networkBusyImage: JQuery<HTMLImageElement>;
    $updateTimer: JQuery<HTMLDivElement>;


    constructor(private main: MainBase, public $bottomDiv: JQuery<HTMLElement>,
        withConsole: boolean,
        withPCode: boolean,
        withErrors: boolean,
        isEmbedded: boolean
    ) {

        this.tabManager = new TabManager($bottomDiv[0]);

        if (withErrors) {
            this.errorManager = new ErrorManager(main, this.tabManager);
            this.errorManager.tab.show();
        }

        if(withConsole){
            this.console = new MyConsole(main, withConsole ? this.tabManager : null);
        }

        if (!isEmbedded) {
            this.homeworkManager = new HomeworkManager(<Main>main, this.tabManager);
            this.gradingManager = new GradingManager(<Main>main, this.tabManager);
        }

        if (withPCode) {
            this.disassemblerTab = new Tab(BottomDivMessages.code(), ["jo_scrollable", "jo_pcodeTab"]);
            this.tabManager.addTab(this.disassemblerTab);
        }

        this.jUnitTab = new Tab(BottomDivMessages.testRunner(), ["jo_testrunnerTab"]);
        this.tabManager.addTab(this.jUnitTab);

        //         <img class="jo_db-busy" title="Warten auf Datenbank..."
        //     src="assets/graphics/grid.svg">
        // <img class="jo_network-busy" src="assets/graphics/compile.gif" alt="">
        // <div class="jo_updateTimerDiv">
        //     <svg width="30" height="16">
        //         <rect class="jo_updateTimerRect" x="0" y="4" width="30" height="8"
        //             style="stroke:none;fill:#008000;fill-opacity:0.8">
        //         </rect>
        //     </svg>
        // </div>

        if(!isEmbedded){
            this.$dbBusyImage = jQuery(`<img class="jo_db-busy" title="${BottomDivMessages.waitForDatabase()}" src="${gridSVG}">`);
            this.tabManager.insertIntoRightDiv(this.$dbBusyImage[0]);
            this.$networkBusyImage = jQuery(`<img class="jo_network-busy" src="${compileGIF}" alt="">`);
            this.tabManager.insertIntoRightDiv(this.$networkBusyImage[0]);
            
            this.$updateTimer = jQuery(`<div class="jo_updateTimerDiv">
                <svg width="30" height="16">
                <rect class="jo_updateTimerRect" x="0" y="4" width="30" height="8"
                style="stroke:none;fill:#008000;fill-opacity:0.8">
                </rect>
                </svg>
                </div>`);
            this.tabManager.insertIntoRightDiv(this.$updateTimer[0]);
        }

    }

    initGUI() {
        makeTabs(this.$bottomDiv);
        if (this.console != null)
            this.console.initGUI();
        if (this.homeworkManager != null) this.homeworkManager.initGUI();

        this.$bottomDiv.find('.jo_tabs').children().first().trigger("click");
    }

    showHomeworkTab() {
        this.homeworkManager.tab.headingDiv.style.display = "block";
        this.homeworkManager.tab.show();
    }

    showJunitTab() {
        this.jUnitTab.show();
    }

    hideHomeworkTab() {
        this.errorManager.tab.show();
        this.homeworkManager.tab.headingDiv.style.display = "none";
    }

    showHideDBBusyIcon(visible: boolean) {
        let displayValue: string = visible ? "block" : "none";
        this.$dbBusyImage.css("display", displayValue);
    }

}