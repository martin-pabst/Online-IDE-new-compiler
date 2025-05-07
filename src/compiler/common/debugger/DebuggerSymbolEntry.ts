import { TreeviewNode } from "../../../tools/components/treeview/TreeviewNode";
import { DebM } from "./DebuggerMessages";
import { GenericVariantOfJavaClass, IJavaClass, JavaClass } from "../../java/types/JavaClass";
import { BaseField, BaseSymbol, SymbolOnStackframe } from "../BaseSymbolTable";
import { BaseArrayType, BaseListType, BaseType } from "../BaseType";
import { SymbolTableSection } from "./SymbolTableSection";
import { ValueRenderer } from "./ValueRenderer.ts";
import { IPosition } from "../range/Position.ts";
import jQuery from 'jquery';
import { JavaField } from "../../java/types/JavaField.ts";
import { Interpreter } from "../interpreter/Interpreter.ts";
import { StringClass } from "../../java/runtime/system/javalang/ObjectClassStringClass.ts";

export type RuntimeObject = {
    getType(): RuntimeObjectType & BaseType;
    [index: string]: any;
}

interface RuntimeObjectType {
    getOwnAndInheritedFields(): BaseField[];
    [index: string]: any;
}


export class DebuggerSymbolEntry {

    treeViewNode: TreeviewNode<DebuggerSymbolEntry>;
    children: DebuggerSymbolEntry[] = [];
    oldValue?: any; // old value if value is primitive type
    oldLength?: number; // old length if value is array
    isLocalVariable: boolean = true;

    static MAXCHILDREN: number = 20;
    static MAXARRAYSECTIONLENGTH: number = 100;

    static quickArrayOutputMaxLength = 100;

    constructor(protected symbolTableSection: SymbolTableSection,
        parent: DebuggerSymbolEntry | undefined, protected type: BaseType | undefined,
        public identifier: string
    ) {

        this.treeViewNode = new TreeviewNode(symbolTableSection.treeview,
            false, "", undefined,
            this, this, parent, true
        )

        this.treeViewNode.render();

        if (identifier == "this") {
            this.treeViewNode.expandCollapseComponent.setState("expanded");
        }
    }

    render(value: any, changeValueFunction?: (newValue) => void) {

        if (value == null) {
            this.setCaption(" = ", "null", "jo_debugger_value");
            this.removeChildren();
        } else if (Array.isArray(value)) {
            this.renderArray(value, DebuggerSymbolEntry.quickArrayOutputMaxLength);
        } else if (typeof value == "object") {
            if(value.constructor.name == 'StringClass'){
                this.renderStringClass(value, changeValueFunction);
            }
            this.renderObject(<RuntimeObject>value);
        } else {
            this.renderPrimitiveValue(value, changeValueFunction);
        }

    }

    attachNodesToTreeview() {
        this.treeViewNode.attachAfterDetaching();
        this.children.forEach(c => c.attachNodesToTreeview());
    }


    removeChildren() {
        this.children.forEach(child => child.treeViewNode.destroy());
        this.children = [];
    }

    setCaption(delimiter: string, value: string, valuecss: string, pulseIfValueChanged: boolean = true, valueIsClean: boolean = false,
        setChangedValue?: (newValue: string) => void
    ) {

        if (!valueIsClean) {
            value = value.replaceAll("<", "&lt;")
            value = value.replaceAll(">", "&gt;")
        }

        let cssClass = this.isLocalVariable ? "jo_debugger_localVariableIdentifier" : "jo_debugger_fieldIdentifier";

        try {
            if ((typeof this.oldValue !== 'undefined') && value != this.oldValue && pulseIfValueChanged) {
                valuecss += " jo_debugger_pulse";
            }
        } catch(ex){}

        this.oldValue = value;

        let quote: string = '';
        if (value && typeof value == "string" && value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
            quote = '"';
            value = value.substring(1, value.length - 1);
        }

        let caption = `<span class="${cssClass}">${this.identifier}</span>${delimiter}<span class="${valuecss}">${quote}<span class="jo_valueSpan">${value}</span>${quote}</span>`;
        this.treeViewNode.caption = caption;

        if (setChangedValue) {
            setTimeout(() => {
                
                let valueSpan = <HTMLSpanElement>this.treeViewNode.captionDiv.getElementsByClassName('jo_valueSpan')[0]
                
                jQuery(valueSpan).addClass('jo_valueSpanEditable');

                let oldValue: any = jQuery(valueSpan).text();
                
                let endEditing = function () {
                    jQuery(this).attr('contentEditable', "false");
                    let newValue = jQuery(this).text();
                    if(oldValue != newValue){
                        setChangedValue(newValue)
                    }
                };
    
                valueSpan.onfocus = function () {
                    window.setTimeout(function () {
                        var sel, range;
                        if (window.getSelection && document.createRange) {
                            range = document.createRange();
                            range.selectNodeContents(valueSpan);
                            sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }, 1);
                };
    
                this.treeViewNode.onClickHandler = () => {
                    jQuery(valueSpan).attr('contentEditable', "true");
                    valueSpan.focus();
                }
    
                jQuery(valueSpan)
                    // .on('click', function (event) {
                    //     jQuery(this).attr('contentEditable', "true");
                    //     jQuery(this)[0].focus();
                    //     // document.execCommand('selectAll', false, null);
                    //     event.preventDefault();
                    // })
                    .on('blur', endEditing)
                    .on('keydown', function (event) {
                        switch (event.key) {
                            case "Enter":
                                endEditing.call(this);
                                event.preventDefault();
                                break;
                            case "Escape":
                                jQuery(this).attr('contentEditable', "false");
                                jQuery(this).text(oldValue);
                                break;
                        }
                    });
            }, 10);

        }

    }

    renderStringClass(value: StringClass, changeValueFunction?: (newValue) => void){
        let s: string = value == null ? "null" : `"${value.value}"`;
        this.setCaption(" = ", s, "jo_debugger_value", true, false, (newValue: string) => {
            if(newValue == "null"){
                if(changeValueFunction) changeValueFunction(null);
                return;
            } else if(changeValueFunction) {
                newValue = "" + newValue;
                if(newValue.startsWith('"')) newValue = newValue.substring(1);
                if(newValue.endsWith('"')) newValue = newValue.substring(0, newValue.length - 1);
                if(value == null){
                    value = new StringClass(newValue);
                } else {
                    value.value = newValue;
                }
                changeValueFunction(value);
            }
        });
    }

    renderPrimitiveValue(value: any, changeValueFunction?: (newValue) => void) {
        if (typeof value == "string") {
            this.setCaption(" = ", `"${value}"`, "jo_debugger_value", true, false, (newValue: string) => {
                if (changeValueFunction) {
                    changeValueFunction(newValue);
                }
            });
        } else {
            this.setCaption(" = ", "" + value, "jo_debugger_value", true, false, (newValue: string) => {
                if (changeValueFunction) {
                    if (typeof value == 'boolean') {
                        changeValueFunction(newValue == 'true');
                    } else if (typeof value == 'number') {
                        try {
                            let numbervalue = Number.parseFloat(newValue);
                            changeValueFunction(numbervalue);
                        } catch (ex) { }
                    }
                }
            });
        }
        this.removeChildren();
    }


    renderObject(o: RuntimeObject) {
        let type = o.getType();

        if (type.identifier == "String") {
            this.setCaption(" = ", '"' + ("" + o.value) + '"', "jo_debugger_value");
            return;
        }

        if (["Double", "Boolean", "Integer", "Float", "Character"].indexOf(type.identifier) >= 0) {
            this.renderPrimitiveValue(o.value);
            return;
        }

        let typesDiffer: boolean = false;
        if (type != this.type) {
            typesDiffer = true;
            if (type instanceof JavaClass && this.type instanceof GenericVariantOfJavaClass && this.type.isGenericVariantOf == type) {
                typesDiffer = false;
            }
        }

        if (typesDiffer || !this.type) {
            this.type = type;
        }

        if (o["getElements"]) {
            this.renderList(<BaseListType><any>o);
            return;
        }

        let caption: string;
        if (o["_debugOutput"]) {
            caption = o["_debugOutput"]();
        } else {
            caption = ValueRenderer.renderValue(o, DebuggerSymbolEntry.quickArrayOutputMaxLength);
        }

        if (this.identifier == "this") {
            caption = '';
            let style = this.treeViewNode.getMainDiv().style;
            style.borderBottomStyle = "dashed";
            style.borderBottomColor = '#808080';
            style.borderBottomWidth = '1px';
        }

        this.treeViewNode.iconClass = "img_debugger-object";
        this.setCaption(": " + this.type.toString(), " " + caption, "jo_debugger_value");

        if (typesDiffer || this.children.length == 0) {
            this.removeChildren();
            let fields: BaseField[] = type.getOwnAndInheritedFields().filter(f => !f.hiddenWhenDebugging);
            this.treeViewNode.isFolder = fields.length > 0;

            this.treeViewNode.removeAllExpandListeners();
            this.treeViewNode.addExpandListener((state) => {
                if (state == "collapsed") return;
                for (let field of fields) {
                    let fde = new ObjectFieldDebuggerEntry(this.symbolTableSection, this, field);
                    this.children.push(fde);
                }
                this.children.forEach(c => (<ObjectFieldDebuggerEntry>c).fetchValueFromObjectAndRender(o));
            }, true)

            this.treeViewNode.expandCollapseComponent.setState(this.identifier == 'this' ? "expanded" : "collapsed");
        }

        this.children.forEach(c => (<ObjectFieldDebuggerEntry>c).fetchValueFromObjectAndRender(o));
    }

    renderList(value: BaseListType) {
        this.setCaption(": ", this.type!.toString() + "-" + DebM.object(), "jo_debugger_type");
        let elements = value.getElements();
        if (elements.length != this.oldLength) {
            this.removeChildren();
            this.oldLength = elements.length;
            for (let i = 0; i < elements.length; i++) {
                this.children.push(new ListElementDebuggerEntry(
                    this.symbolTableSection, this, i
                ))
            }
            this.treeViewNode.isFolder = elements.length > 0;
        }
        this.children.forEach(c => (<ListElementDebuggerEntry>c).fetchValueFromArrayAndRender(elements));
    }

    renderArray(a: any[], maxLength: number) {
        if (a == null || !this.type) return;

        this.treeViewNode.isFolder = a.length > 0;      // isFolder is a property -> a method gets called where the ExpandCollapseComponent is shown

        // on first opening:
        if (typeof this.oldLength == "undefined") this.treeViewNode.expandCollapseComponent.setState("collapsed");

        let elementtype = (<BaseArrayType><any>this.type).getElementType()
        this.setCaption(": " + elementtype.toString() + "[" + a.length + "] ",
            ValueRenderer.quickArrayOutput(a, DebuggerSymbolEntry.quickArrayOutputMaxLength, this.oldValue, "jo_debugger_pulse"),
            "jo_debugger_value", false, true);

        if (a.length < 10000) {
            this.oldValue = a.slice();
        }

        while ((this.children.length || 0) > a.length) {
            this.children.pop()!.treeViewNode.destroy();
        }

        if (a.length != this.oldLength || this.children.length == 0) {

            let addAndDisplayChildren = () => {

                if (a.length! > DebuggerSymbolEntry.MAXARRAYSECTIONLENGTH) {

                    let subintervalLength = this.getSubintervalLength(a.length);
                    for (let nextIndex = 0; nextIndex < a.length; nextIndex += subintervalLength) {
                        this.children.push(new ArraySectionDebuggerEntry(
                            this.symbolTableSection, this, nextIndex, Math.min(nextIndex + subintervalLength - 1, a.length - 1),
                            elementtype
                        ))
                    }

                } else {
                    for (let i = this.oldLength || 0; i < Math.min(a.length, DebuggerSymbolEntry.MAXCHILDREN); i++) {
                        this.children.push(new ArrayElementDebuggerEntry(
                            this.symbolTableSection, this, i,
                            elementtype
                        ))
                    }
                }


                this.oldLength = a.length;
                this.children.forEach(c => (<ArrayElementDebuggerEntry>c).fetchValueFromArrayAndRender(a));
            }

            if (this.treeViewNode.expandCollapseComponent.state == "expanded") {
                addAndDisplayChildren();
            } else {
                this.treeViewNode.removeAllExpandListeners();
                this.treeViewNode.addExpandListener((state) => {
                    addAndDisplayChildren();
                });
            }

        } else {
            this.children.forEach(c => (<ArrayElementDebuggerEntry>c).fetchValueFromArrayAndRender(a));
        }


    }

    getSubintervalLength(intervalLength: number) {
        let digits = Math.trunc(Math.log10(intervalLength));
        return Math.trunc(Math.pow(10, Math.max(digits - 2, 2)));
    }

}


export class StackElementDebuggerEntry extends DebuggerSymbolEntry {

    constructor(symbolTableSection: SymbolTableSection,
        private symbol: SymbolOnStackframe) {
        super(symbolTableSection, undefined, symbol.getType(), symbol.identifier);

        if (!(this.symbol instanceof SymbolOnStackframe)) {
            this.treeViewNode.getMainDiv().style.display = 'none';
        }
    }

    fetchValueFromStackAndRender(stack: any[], stackBase: number, position: IPosition) {

        let notYetDefined: boolean = true;
        let symbolRange = this.symbol.identifierRange;

        if (symbolRange.endLineNumber < position.lineNumber) {
            notYetDefined = false;
        } else if (symbolRange.endLineNumber == position.lineNumber && symbolRange.endColumn < position.column) {
            notYetDefined = false;
        }

        if (notYetDefined) {
            this.treeViewNode.getMainDiv().style.display = 'none';
        } else {
            this.treeViewNode.getMainDiv().style.display = '';
            let value = this.symbol.getValue(stack, stackBase);

            this.render(value, (newValue: any) => {
                stack[stackBase + this.symbol.stackframePosition] = newValue;
            });
        }



    }

}

export class StaticFieldDebuggerEntry extends DebuggerSymbolEntry {

    constructor(symbolTableSection: SymbolTableSection,
        private field: JavaField) {
        super(symbolTableSection, undefined, field.getType(), field.identifier);

    }

    fetchValueAndRender(position: IPosition, interpreter: Interpreter) {

        let notYetDefined: boolean = true;
        let symbolRange = this.field.identifierRange;

        if (symbolRange.endLineNumber < position.lineNumber) {
            notYetDefined = false;
        } else if (symbolRange.endLineNumber == position.lineNumber && symbolRange.endColumn < position.column) {
            notYetDefined = false;
        }

        if (notYetDefined) {
            this.treeViewNode.getMainDiv().style.display = 'none';
        } else {
            this.treeViewNode.getMainDiv().style.display = '';

            let klass = interpreter.scheduler.classObjectRegistry[this.field.classEnum.identifier];

            let value = klass[this.field.getInternalName()];

            this.render(value, (newValue: any) => {
                klass[this.field.getInternalName()] = newValue;
            });
        }



    }

}

export class ObjectFieldDebuggerEntry extends DebuggerSymbolEntry {

    constructor(symbolTableSection: SymbolTableSection,
        parent: DebuggerSymbolEntry,
        private field: BaseField) {
        super(symbolTableSection, parent, field.getType(), field.identifier);
        this.isLocalVariable = false;
    }

    fetchValueFromObjectAndRender(object: RuntimeObject) {
        let value: any;
        let identifier = this.field.getFieldIndentifier();
        if (this.field.isStatic()) {
            value = object.getType().runtimeClass[identifier];
            this.render(value, (newValue) => { object.getType().runtimeClass[identifier] = newValue });
        } else {
            value = object[identifier];
            this.render(value, (newValue) => { object[identifier] = newValue });
        }
    }

}

export class ArrayElementDebuggerEntry extends DebuggerSymbolEntry {

    constructor(symbolTableSection: SymbolTableSection,
        parent: DebuggerSymbolEntry,
        private index: number,
        elementType: BaseType) {
        super(symbolTableSection, parent, elementType, parent.identifier + '[<span class="jo_debugger_index">' + index + '</span>]');
    }

    fetchValueFromArrayAndRender(a: any[]) {
        let value = a[this.index];
        this.render(value, (newValue) => {
            a[this.index] = newValue;
        });
    }

}

export class ArraySectionDebuggerEntry extends DebuggerSymbolEntry {

    constructor(symbolTableSection: SymbolTableSection,
        parent: DebuggerSymbolEntry,
        private indexFrom: number,
        private indexTo: number,
        elementType: BaseType) {
        super(symbolTableSection, parent, elementType, parent.identifier);
        this.setCaption("", "[" + this.indexFrom + " ... " + this.indexTo + "]", "jo_debugger_index");
    }

    fetchValueFromArrayAndRender(a: any[]) {
        this.treeViewNode.isFolder = true;      // isFolder is a property -> a method gets called where the ExpandCollapseComponent is shown

        // on first rendering:
        if (typeof this.oldLength == "undefined") {
            this.treeViewNode.expandCollapseComponent.setState("collapsed");
            this.treeViewNode.removeAllExpandListeners();
            this.oldLength = this.indexTo - this.indexFrom + 1;

            this.treeViewNode.addExpandListener((state) => {
                if (this.oldLength! > DebuggerSymbolEntry.MAXARRAYSECTIONLENGTH) {

                    let subintervalLength = this.getSubintervalLength(this.oldLength!);
                    for (let nextIndex = this.indexFrom; nextIndex <= this.indexTo; nextIndex += subintervalLength) {
                        this.children.push(new ArraySectionDebuggerEntry(
                            this.symbolTableSection, this, nextIndex,
                            Math.min(nextIndex + subintervalLength - 1, this.indexTo),
                            this.type!
                        ))
                    }

                } else {
                    for (let i = this.indexFrom || 0; i <= this.indexTo; i++) {
                        this.children.push(new ArrayElementDebuggerEntry(
                            this.symbolTableSection, this, i,
                            this.type!
                        ))
                    }
                }

                this.children.forEach(c => (<ArrayElementDebuggerEntry>c).fetchValueFromArrayAndRender(a));
            }, true);

            this.children.forEach(c => (<ArrayElementDebuggerEntry>c).fetchValueFromArrayAndRender(a));
        }


        if (a.length != this.oldLength || this.children.length == 0) {

            let addAndDisplayChildren = () => {
            }

            if (this.treeViewNode.expandCollapseComponent.state == "expanded") {
                addAndDisplayChildren();
            } else {
            }

        }

        for(let child of this.children){
            (<ArraySectionDebuggerEntry | ArrayElementDebuggerEntry>child).fetchValueFromArrayAndRender(a);
        }


    }

}

export class ListElementDebuggerEntry extends DebuggerSymbolEntry {

    constructor(symbolTableSection: SymbolTableSection,
        parent: DebuggerSymbolEntry,
        private index: number) {
        super(symbolTableSection, parent, undefined, parent.identifier + '[<span class="jo_debugger_index">' + index + '</span>]');
    }

    fetchValueFromArrayAndRender(a: any[]) {
        let value = a[this.index];
        this.render(value, (newValue: any) => {
            a[this.index] = newValue;
        });

    }

}