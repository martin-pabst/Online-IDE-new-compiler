import { DOM } from "../../DOM";
import { AccordionElement } from "./AccordionElement";
import { AccordionElementInterface } from "./AccordionElementInterface";
import { Treeview } from "./Treeview";
import { TreeviewAccordion } from "./TreeviewAccordion";

export class TreeviewSplitter {

    div: HTMLDivElement;

    yStart: number | undefined;
    divsStartHeights: number[] = [];

    transparentOverlay: HTMLDivElement | undefined;

    constructor(private accordion: TreeviewAccordion, private treeviewBelowIndex: number){
        let parentDiv = accordion.ElementList[treeviewBelowIndex].getOuterDiv();
        this.div = DOM .makeDiv(parentDiv, 'jo_treeview_splitter');
        this.div.style.display = 'none';
        this.enable();
    }

    enable(){
        this.div.style.display = '';

        this.div.onpointerdown = (ev) => {

            this.div.style.backgroundColor = '#800000';

            this.yStart = ev.pageY;
            let treeviewList: AccordionElementInterface[] = this.accordion.ElementList;

            this.divsStartHeights = [];
            for(let tv of treeviewList){
                let height = tv.getOuterDiv().getBoundingClientRect().height;
                this.divsStartHeights.push(height);
                tv.getOuterDiv().style.height = height + "px";
                tv.getOuterDiv().style.flex = "none";
            }

            // .jo_treeview_splitter_overlay{
            //     position: absolute;
            //     left: 0;
            //     top: 0;
            //     bottom: 0;
            //     right: 0;
            //     z-index: 1000;
            // }
            

            this.transparentOverlay = DOM.makeDiv(document.body);
            this.transparentOverlay.style.cursor = 'ns-resize';
            this.transparentOverlay.style.position = 'absolute';
            this.transparentOverlay.style.left = '0';
            this.transparentOverlay.style.top = '0';
            this.transparentOverlay.style.bottom = '0';
            this.transparentOverlay.style.right = '0';
            this.transparentOverlay.style.zIndex = '1000';

            this.transparentOverlay!.onpointermove = (ev) => {
                this.onPointerMove(ev.pageY);
                ev.stopPropagation();
            }

            this.transparentOverlay!.onmousemove = (ev) => {ev.stopPropagation()};

            this.transparentOverlay!.onpointerup = () => {
                this.transparentOverlay!.remove();
                this.div.style.backgroundColor = '';
            }

        }

    }

    onPointerMove(newY: number){
        let dyCursor = newY - this.yStart!;
        let treeviewList: AccordionElementInterface[] = this.accordion.ElementList;

        let targetHeights: number[] = this.divsStartHeights.slice();

        // if(this.divsStartHeights[this.treeviewBelowIndex] - dyCursor < treeviewBelow.config.minHeight!){
        //     dyCursor = this.divsStartHeights[this.treeviewBelowIndex] - treeviewBelow.config.minHeight!;
        // }

        if(dyCursor > 0){
            // targetHeights[this.treeviewBelowIndex - 1] += dyCursor;
            // targetHeights[this.treeviewBelowIndex] -= dyCursor;
            let dyTodo:  number = dyCursor;  // > 0!
            for(let i = this.treeviewBelowIndex; i < treeviewList.length; i++){
                let treeview = treeviewList[i];
                if(treeview.isCollapsed()) continue;
                let achievable = targetHeights[i] - treeview.getMinHeight();
                if(achievable <= 0) continue;
                if(achievable >= dyTodo){
                    targetHeights[i] -= dyTodo;
                    dyTodo = 0;
                    break;
                } else {
                    dyTodo -= achievable;
                    targetHeights[i] -= achievable;
                }
            }
            targetHeights[this.treeviewBelowIndex - 1] += dyCursor - dyTodo;
        } else {
            let dyTodo:  number = dyCursor;  // < 0!
            for(let i = this.treeviewBelowIndex - 1; i >= 0; i--){
                let treeview = treeviewList[i];
                if(treeview.isCollapsed()) continue;
                let achievable = treeview.getMinHeight() - targetHeights[i];
                if(achievable >= 0) continue;
                if(achievable <= dyTodo){
                    targetHeights[i] += dyTodo;
                    dyTodo = 0;
                    break;
                } else {
                    dyTodo -= achievable;
                    targetHeights[i] += achievable;
                }
            }
            targetHeights[this.treeviewBelowIndex] -= dyCursor - dyTodo;  // cyCursor < 0, so this makes this treeview larger!
        }

        for(let i = 0; i < treeviewList.length; i++){
            let od = treeviewList[i].getOuterDiv();
            od.style.height = targetHeights[i] + "px";
            od.style.flexBasis = "";
            od.style.flexGrow = "";
            treeviewList[i]._lastExpandedHeight = targetHeights[i];
        }


    }


}