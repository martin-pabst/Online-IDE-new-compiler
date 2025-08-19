import { Slider } from "../tools/components/Slider";
import { Treeview } from "../tools/components/treeview/Treeview";
import '/assets/css/icons.css';

class TVFile {
    constructor(public name: string){

    }
}

class TreeviewTest {
    constructor() {
        this.init();
    }
    
    init() {
        let treeviewDiv = document.getElementById("treeviewdiv");
        new Slider(treeviewDiv, false, false, (newLength) => {})

        let tv: Treeview<TVFile, TVFile> = new Treeview(treeviewDiv, {
            captionLine: {
                enabled: true,
                text: "Treeview"
            },
            withSelection: true,
            buttonAddElements: true,
            buttonAddElementsCaption: "add",
            buttonAddFolders: true,
            selectMultiple: false,
            withFolders: true,
            defaultIconClass: "img_file-dark-text",
            comparator: (e1, e2) => {
                if(e1?.name && e2?.name){
                    return e1.name.localeCompare(e2.name);
                }
                return 0;
            }
        })

        // tv.newNodeCallback = (name, node) => {
        //     return null;
        // }

        let file1 = new TVFile("Erster Erster Erster Erster Erster Erster ");
        let node1 = tv.addNode(false, "Erster Erster Erster Erster Erster Erster ", 
            "img_file-dark-java", file1, undefined);
        node1.addIconButton('img_start-dark', undefined, undefined, true);

        let file2 = new TVFile("AZweiter");
        let node2 = tv.addNode(false, "Zweiter", "img_file-dark-text", file2, undefined);
        node2.addIconButton('img_start-dark', undefined, undefined, true);

        node1.setRightPartOfCaptionErrors("(10)");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TreeviewTest();
    console.log("TreeviewTest initialized");
});