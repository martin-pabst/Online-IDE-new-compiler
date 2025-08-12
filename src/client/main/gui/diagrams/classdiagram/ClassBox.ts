import jQuery from 'jquery';
import { hash } from "../../../../../tools/StringTools.js";
import { Diagram } from "../Diagram.js";
import { Alignment, DiagramElement } from "../DiagramElement.js";
import { ClassDiagram } from "./ClassDiagram.js";
import { JavaClass } from '../../../../../compiler/java/types/JavaClass.js';
import { JavaInterface } from '../../../../../compiler/java/types/JavaInterface.js';
import { SystemModule } from '../../../../../compiler/java/runtime/system/SystemModule.js';
import { JavaMethod } from '../../../../../compiler/java/types/JavaMethod.js';
import { JavaField } from '../../../../../compiler/java/types/JavaField.js';
import { Visibility } from '../../../../../compiler/java/types/Visibility.js';
import { TokenType } from '../../../../../compiler/java/TokenType.js';
import { ClassClass } from '../../../../../compiler/java/runtime/system/ClassClass.js';

export type SerializedClassBox = {
    className: string,
    filename: string,
    hashedSignature: number,
    withMethods: boolean,
    withAttributes: boolean,
    leftCm: number,
    topCm: number,
    isSystemClass: boolean,
    workspaceId?: number
}

export class ClassBox extends DiagramElement {

    className: string;
    klass: JavaClass | JavaInterface;
    filename: string;
    hashedSignature: number;
    documentation: string;
    active: boolean = true;
    withMethods: boolean = true;
    withFields: boolean = true;

    inDebounce: any;

    isSystemClass: boolean;

    $dropdownTriangle: JQuery<Element>;

    constructor(public diagram: Diagram, leftCm: number, topCm: number, klass: JavaClass | JavaInterface) {
        super(diagram.svgElement);

        this.klass = klass;

        if (klass != null) {
            this.attachToClass(this.klass);
            this.isSystemClass = klass.module instanceof SystemModule;
            this.withFields = false; //!this.isSystemClass;
            this.withMethods = false; // !this.isSystemClass;
        }

        this.moveTo(leftCm, topCm, true);

    }

    copy(): ClassBox {
        let cb1 = new ClassBox(this.diagram, this.leftCm, this.topCm, null);
        cb1.className = this.className;
        cb1.filename = this.filename;
        cb1.hashedSignature = this.hashedSignature;
        cb1.documentation = this.documentation;
        cb1.active = false;
        cb1.withMethods = this.withMethods;
        cb1.withFields = this.withFields;

        cb1.isSystemClass = this.isSystemClass;
        return cb1;
    }

    serialize(): SerializedClassBox {
        return {
            className: this.className,
            filename: this.filename,
            hashedSignature: this.hashedSignature,
            withAttributes: this.withFields,
            withMethods: this.withMethods,
            isSystemClass: this.isSystemClass,
            leftCm: this.leftCm,
            topCm: this.topCm
        }
    }

    static deserialize(diagram: Diagram, scb: SerializedClassBox): ClassBox {

        let cb = new ClassBox(diagram, scb.leftCm, scb.topCm, null);
        cb.hashedSignature = scb.hashedSignature;
        cb.className = scb.className;
        cb.filename = scb.filename;
        cb.withFields = scb.withAttributes;
        cb.withMethods = scb.withMethods;
        cb.isSystemClass = scb.isSystemClass;

        return cb;

    }

    documentationToString(documentation: string | (() => string)) {
        if (!documentation) return "";
        if (typeof documentation == "string") return documentation;
        return documentation();
    }

    attachToClass(klass: JavaClass | JavaInterface) {

        this.klass = klass;
        let klassSignature: number = this.getSignature(klass);

        if (this.className != klass.identifier || this.hashedSignature != klassSignature || this.widthCm < 0.7 || this.documentation != klass.documentation) {
            this.isSystemClass = klass.module instanceof SystemModule;
            this.renderLines();
        } else {
            this.addMouseEvents();
        }

        this.className = klass.identifier;
        this.filename = klass.module.file.name;
        this.hashedSignature = klassSignature;
        this.documentation = this.documentationToString(klass.documentation);
    }

    jumpToDeclaration(element: JavaClass | JavaInterface | JavaMethod | JavaField) {
        this.diagram.main.showProgramPosition(this.klass.module.file, element.identifierRange);
    }


    renderLines() {

        this.clear();

        let parametersWithTypes = (<ClassDiagram>this.diagram).currentClassBoxes.parametersWithTypes;

        this.addTextLine({
            type: "text",
            text: (this.klass instanceof JavaInterface ? "<<interface>> " : (this.klass.isAbstract() ? "<<abstract>> " : "")) + this.klass.identifier,
            tooltip: this.klass.getDeclaration(),
            alignment: Alignment.center,
            bold: true,
            italics: this.klass instanceof JavaInterface || this.klass.isAbstract(),
            onClick: this.isSystemClass ? undefined : () => { this.jumpToDeclaration(this.klass) }
        });

        if (this.klass instanceof JavaClass && this.withFields) {
            this.addTextLine({
                type: "line",
                thicknessCm: 0.05
            });
            for (let field of this.klass.getFields().filter(field => field.type.identifier != 'Class')) {

                let text: string = this.getVisibilityText(field.visibility);

                switch (this.diagram.main.getSettings().getValue("classDiagram.typeConvention")) {
                    default:
                        // Default to Java-like convention
                        text += field.type?.toString() + " " + field.identifier;
                        break;
                    case "pascal":
                        text += field.identifier + ": " + field.type?.toString();
                        break;
                }

                this.addTextLine({
                    type: "text",
                    text: text,
                    tooltip: field.getDeclaration(),
                    alignment: Alignment.left,
                    onClick: this.isSystemClass ? undefined : () => { this.jumpToDeclaration(field) }
                });
            }
        }

        if (this.withMethods) {
            this.addTextLine({
                type: "line",
                thicknessCm: 0.05
            });
            let hiddenSignatures: string[] = ["string toJson()", this.klass.identifier + " fromJson(string)"];
            this.klass.getOwnMethods().filter(m => hiddenSignatures.indexOf(m.getSignature()) < 0)
                .filter(m => !m.isConstructor || m.identifier == this.klass.identifier)
                .forEach(m => {
                    let text: string = this.getVisibilityText(m.visibility) + m.identifier + "()";

                    let returnType: string = m.isConstructor ? "" :
                        (m.returnParameterType == null ? "" : m.returnParameterType.toString());

                    if (parametersWithTypes) {
                        switch (this.diagram.main.getSettings().getValue("classDiagram.typeConvention")) {
                            default:
                                // Default to Java-like convention
                                if (returnType !== "") returnType += " ";
                                text = this.getVisibilityText(m.visibility) + returnType + m.identifier + "(" +
                                m.parameters.map((p) => { return p.type.toString() + " " + p.identifier }).join(", ") + ")";
                                break;
                                case "pascal":
                                if (returnType !== "") returnType = " : " + returnType;
                                text = this.getVisibilityText(m.visibility) + m.identifier + "(" +
                                    m.parameters.map((p) => { return p.identifier + ": " + p.type.toString() }).join(", ") + ")" +
                                    returnType;
                                break;
                        }
                    }

                    this.addTextLine({
                        type: "text",
                        text: text,
                        tooltip: m.getDeclaration(),
                        alignment: Alignment.left,
                        italics: this.klass instanceof JavaInterface || m.isAbstract,
                        onClick: this.isSystemClass ? undefined : () => { this.jumpToDeclaration(m) }
                    });

                });
        }

        this.backgroundColor = this.isSystemClass ? "#aaaaaa" : "#ffffff";
        this.render();

        this.$dropdownTriangle = this.createElement("path", this.$element[0], {
            d: this.getTrianglePath(),
            class: "dropdown-triangle",
            style: "transform: " + "translate(" + (this.widthCm - 0.35) + "cm,0.05cm)", // + (<TextLine>this.lines[0]).textHeightCm + "cm)"
        })

        this.addMouseEvents();
    }

    getTrianglePath() {
        if (this.withMethods) {
            return "M 0 8 L 11 8 L 5.5 2 L 0 8";
        } else {
            return "M 0 2 L 11 2 L 5.5 8 L 0 2";
        }
        // if (this.withMethods) {
        //     return "M 3 6 L 11 6 L 7 2 L 3 6";
        // } else {
        //     return "M 3 2 L 11 2 L 7 6 L 3 2";
        // }
    }

    detach() {
        this.$element?.off('mousedown.diagramElement');
        jQuery(document).off('mouseup.diagramElement');
        jQuery(document).off('mousemove.diagramElement');
        super.detach();
    }

    addMouseEvents() {
        let that = this;

        if (this.$dropdownTriangle != null) {
            this.$dropdownTriangle.off("mouseup.dropdowntriangle");
            this.$dropdownTriangle.off("mousedown.dropdowntriangle");
        }

        this.$dropdownTriangle.on("mousedown.dropdowntriangle", (e) => {
            e.stopPropagation();
        });
        this.$dropdownTriangle.on("mouseup.dropdowntriangle", (e) => {
            e.stopPropagation();
            this.withMethods = !this.withMethods;
            this.withFields = !this.withFields;
            this.$dropdownTriangle.attr("d", this.getTrianglePath());
            this.renderLines();
            (<ClassDiagram><any>this.diagram).adjustClassDiagramSize();
            (<ClassDiagram><any>this.diagram).updateArrows();
        });

        this.$element.on('mousedown.diagramElement', (event: JQuery.MouseDownEvent) => {

            event.stopPropagation();
            event.stopImmediatePropagation();

            if (event.button != 0) return;

            let x = event.screenX;
            let y = event.screenY;

            that.$element.find('rect').addClass('dragging');

            jQuery(document).off('mouseup.diagramElement');
            jQuery(document).off('mousemove.diagramElement');

            jQuery(document).on('mousemove.diagramElement', (event: JQuery.MouseMoveEvent) => {
                let cmPerPixel = 1 / 96 * 2.36 / this.diagram.zoomfactor;
                let dx = (event.screenX - x) * cmPerPixel;
                let dy = (event.screenY - y) * cmPerPixel;

                x = event.screenX;
                y = event.screenY;

                that.move(dx, dy, true);


                clearTimeout(that.inDebounce);
                that.inDebounce = setTimeout(() => {
                    let classDiagram = <ClassDiagram><any>that.diagram;
                    classDiagram.updateArrows();
                }, 200);
            });

            jQuery(document).on('mouseup.diagramElement', () => {
                that.move(0, 0, true, true);
                let classDiagram = <ClassDiagram><any>that.diagram;
                classDiagram.adjustClassDiagramSize();
                classDiagram.updateArrows();
                that.$element.find('rect').removeClass('dragging');
                jQuery(document).off('mouseup.diagramElement');
                jQuery(document).off('mousemove.diagramElement');
                classDiagram.dirty = true;
            });


        })
    }

    getVisibilityText(visibility: Visibility) {
        switch (visibility) {
            case TokenType.keywordPrivate: return "-";
            case TokenType.keywordProtected: return "#";
            case TokenType.keywordPublic: return "+";
        }
    }

    getSignature(klass: JavaClass | JavaInterface): number {

        let s: string = "";

        if (klass instanceof JavaClass && this.withFields && klass.fields.length > 0) {
            for (let f of klass.fields) s += this.getVisibilityText(f.visibility) + f.type?.toString() + " " + f.identifier;
        }

        let methods = klass.getOwnMethods();
        if (this.withMethods && methods.length > 0) {
            for (let m of methods) {
                if (m.isConstructor) continue;
                let rt: string = m.returnParameterType == null ? "void" : m.returnParameterType.toString();
                s += this.getVisibilityText(m.visibility) + rt + " " + m.identifier + "(" +
                    m.parameters.map((p) => { return p.type.toString() + " " + p.identifier }).join(", ") + ")";
            }
        }

        return hash(s);

    }

    hasSignatureAndFileOf(klass: JavaClass | JavaInterface) {
        return klass.module.file.name == this.filename &&
            this.getSignature(klass) == this.hashedSignature;
    }



}