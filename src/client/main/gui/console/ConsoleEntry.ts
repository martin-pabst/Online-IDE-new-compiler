import jQuery from 'jquery';
import { ValueTool } from '../../../../compiler/common/debugger/ValueTool';
import * as monaco from 'monaco-editor'
import { NonPrimitiveType } from '../../../../compiler/java/types/NonPrimitiveType';


export class ConsoleEntry {

    caption: string|JQuery<HTMLElement>; // only used for root elements, e.g. "Local variables"
    // if caption is set then value == null and parent == null

    parent: ConsoleEntry;
    children: ConsoleEntry[];

    canOpen: boolean;
    isOpen: boolean = false;

    identifier: string;

    value: any;

    $consoleEntry: JQuery<HTMLElement>;

    constructor(private isCommand: boolean, caption: string|JQuery<HTMLElement>, value: any, private valueAsString: string,
         identifier: string, parent: ConsoleEntry,
        private withBottomBorder: boolean, private color: string = null ) {
        this.caption = caption;
        this.parent = parent;
        if (parent != null) {
            parent.children.push(this);
        }
        this.value = value;

        this.identifier = identifier;

        this.render();
    }

    getLevel(): number {
        return this.parent == null ? 0 : this.parent.getLevel() + 1;
    }

    getIndent(): number {
        // return this.getLevel() * 15;
        return this.getLevel() == 0 ? 0 : 15;
    }

    render() {

        this.$consoleEntry = jQuery('<div></div>');
        this.$consoleEntry.addClass("jo_consoleEntry");
        this.$consoleEntry.css('margin-left', '' + this.getIndent() + 'px');

        if(this.withBottomBorder){
            this.$consoleEntry.addClass('jo_withBorder');
        }
        
        let $ceFirstLine = jQuery('<div class="jo_ceFirstline"></div>');
        
        this.$consoleEntry.append($ceFirstLine);


        if (ValueTool.hasChildren(this.value)) {
            this.canOpen = true;
            this.$consoleEntry.addClass('jo_canOpen');
            this.$consoleEntry.append(jQuery('<div class="jo_ceChildContainer"></div>'));

            this.$consoleEntry.find('.jo_ceFirstline').on('mousedown', (event) => {
                if (this.value != null) {
                    if (this.children == null) {
                        this.onFirstOpening();
                    }
                    this.$consoleEntry.toggleClass('jo_expanded');
                    this.isOpen = !this.isOpen;
                } else {
                    this.children = null;
                }

                event.stopPropagation();

            });

        } else {
            if(this.caption == null && this.getLevel() == 0){
                this.$consoleEntry.addClass('jo_cannotOpen');
            }
        }

        this.renderValue();

    }

    onFirstOpening() {

        this.children = [];
        let $childcontainer = this.$consoleEntry.find('.jo_ceChildContainer');

        let childrenList = ValueTool.getChildren(this.value);
        for(let i = 0; i < Math.min(childrenList.length, 100); i++){
            let iv = childrenList[i];
            let de = new ConsoleEntry(false, null, iv.value, undefined, iv.identifier + " =", this, false, 'var(--console-fieldidentifier)');
            de.render();
            $childcontainer.append(de.$consoleEntry);
        }
        
        if(childrenList.length > 100){
            let de = new ConsoleEntry(false, null, "" + (childrenList.length - 100) + " weitere Elemente...", undefined, null, this, false, 'var(--console-fieldidentifier)');
            de.render();
            $childcontainer.append(de.$consoleEntry);
        }

    }

    renderValue() {

        let $firstLine = this.$consoleEntry.find('.jo_ceFirstline');

        if (this.isCommand) {
            if(this.caption != null){
                if(typeof this.caption == "string" ){
                    monaco.editor.colorize(this.caption, 'myJava', { tabSize: 3 }).then((html) => {
                        $firstLine.append(jQuery(html));
                    });
                    // $firstLine.append(jQuery('<span class="jo_ceCaption">' + this.caption + "</span>"));
                } else {
                    let span = jQuery('<span class="jo_ceCaption"></span>');
                    span.append(this.caption);
                    $firstLine.append(span);
                }
            } else {
                $firstLine.append(jQuery('<span class="jo_ceNoValue">Kein Wert zurückgegeben.</span>'));
            }
            return;
        } else {

            if(this.identifier != null){
                let $identifier = jQuery('<span class="jo_ceIdentifier">' + this.identifier + "&nbsp;</span>");
                if(this.color != null){
                    $identifier.css('color', this.color);
                }
                $firstLine.append($identifier);
            }
            let $span = jQuery('<span class="jo_ceValue"></span>')
            let v: string =  this.valueAsString || ValueTool.renderValue(this.value, 30);

            if (this.value != null && typeof this.value == 'object' && !v.endsWith('-object')) {
                let type = <NonPrimitiveType>this.value.constructor.type;
                if(type && type.identifier.toLowerCase() != 'string') v = type.identifier + " " + v;
            }

            $span.text(v.substring(0, 100) + (v.length > 100 ? "..." : ""));
            $firstLine.append($span);
        }    }

    detachValue() {
        this.value = undefined;
        this.$consoleEntry.removeClass('jo_canOpen');
        if(this.getLevel() == 0 && this.caption == null){
            this.$consoleEntry.addClass('jo_cannotOpen');
        }
    }

}