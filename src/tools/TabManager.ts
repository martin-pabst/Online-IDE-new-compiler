import '/assets/css/tabs.css';

export class TabManager {

    headingsDiv: HTMLDivElement;
    bodiesDiv: HTMLDivElement;

    tabheadingRightDiv: HTMLDivElement;

    tabs: Tab[] = [];


    constructor(private container: HTMLElement, public sharedBody: boolean = false) {
        this.container.classList.add('jo_tabs_container');

        this.headingsDiv = document.createElement('div');
        this.headingsDiv.classList.add('jo_tabheadings')
        this.container.appendChild(this.headingsDiv);

        this.bodiesDiv = document.createElement('div');
        this.bodiesDiv.classList.add('jo_tabs')
        this.container.appendChild(this.bodiesDiv);

        this.tabheadingRightDiv = document.createElement('div');
        this.tabheadingRightDiv.classList.add("jo_tabheading-right", "jo_noHeading");
        this.headingsDiv.appendChild(this.tabheadingRightDiv);

    }

    addTab(tab: Tab) {
        tab.tabManager = this;
        this.tabs.push(tab);
        this.headingsDiv.insertBefore(tab.headingDiv, this.tabheadingRightDiv);
        if(!this.sharedBody){
            this.bodiesDiv.appendChild(tab.bodyDiv);
        }
    }

    insertIntoRightDiv(element: HTMLElement){
        this.tabheadingRightDiv.appendChild(element);
    }

    setActive(tab: Tab) {

        for (let tab1 of this.tabs) {
            if(tab1 == tab) continue;
            tab1.headingDiv.classList.remove('jo_active');
            if(!this.sharedBody) tab1.bodyDiv.style.display = 'none';
        }

        tab.headingDiv.classList.add('jo_active');
        if(!this.sharedBody) tab.bodyDiv.style.display = 'flex'

    }

    setTabVisible(tab: Tab, visibility: boolean) {
        tab.headingDiv.style.display = visibility ? 'block' : 'none'; 
        tab.visible = visibility;
        if(!visibility && tab.isActive()){
            let firstVisibleTab = this.tabs.find(t => t.visible);
            if(firstVisibleTab) this.setActive(firstVisibleTab);
        }
    }

}

export class Tab {
    headingDiv: HTMLDivElement;
    bodyDiv: HTMLDivElement;
    tabManager: TabManager;

    visible: boolean = true;

    onShow: () => void;

    constructor(caption: string, cssClasses: string[] = [], withoutBody: boolean = false) {
        this.headingDiv = document.createElement('div');
        this.headingDiv.classList.add('jo_tabheading');
        this.headingDiv.textContent = caption;

        this.headingDiv.onclick = (ev: MouseEvent) => {
            this.show();
        }
        
        if(!withoutBody) {  
            this.bodyDiv = document.createElement('div');
            this.bodyDiv.classList.add('jo_tab');
            for(let cssClass of cssClasses) this.bodyDiv.classList.add(cssClass);        
        }

    }

    show(){
        this.tabManager.setActive(this);
        if(this.onShow) this.onShow();
    }

    isActive(): boolean {
        return this.headingDiv.classList.contains('jo_active');
    }

    setVisible(visibility: boolean){
        this.tabManager.setTabVisible(this, visibility);
    }
}