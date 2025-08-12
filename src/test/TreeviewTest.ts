import { Slider } from "../tools/components/Slider";
import { Treeview } from "../tools/components/treeview/Treeview";
import '/assets/css/icons.css';

class TVFile {

}

class TreeviewTest {
    constructor() {
        this.init();
    }
    
    init() {
        let treeviewDiv = document.getElementById("treeviewdiv");
        new Slider(treeviewDiv, false, false, (newLength) => {})

        let tv: Treeview<TVFile> = new Treeview(treeviewDiv, {
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
            defaultIconClass: "img_file-dark-text"
        })

        let file1 = new TVFile();
        let node1 = tv.addNode(false, "Erster", "img_file-dark-java", file1, file1, undefined);
        node1.render();

    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TreeviewTest();
    console.log("TreeviewTest initialized");
});