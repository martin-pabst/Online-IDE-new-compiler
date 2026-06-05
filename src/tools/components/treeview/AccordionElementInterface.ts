export interface AccordionElementInterface {
    isCollapsed(): boolean;
    getTargetVariableHeight(): number;
    getFixedHeight(): number;
    getMinHeight(): number;
    getOuterDiv(): HTMLDivElement;
    _lastExpandedHeight: number;
}