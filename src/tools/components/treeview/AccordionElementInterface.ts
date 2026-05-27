export interface AccordionElementInterface {
    isCollapsed(): boolean;
    getTargetVariableHeight(): number;
    getFixedHeight(): number;
    getOuterDiv(): HTMLDivElement;
    _lastExpandedHeight: number;
}