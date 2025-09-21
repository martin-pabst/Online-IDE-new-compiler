import { Treeview } from "../../../tools/components/treeview/Treeview";
import { TreeviewAccordion } from "../../../tools/components/treeview/TreeviewAccordion";
import { DebM } from "./DebuggerMessages";
import { BaseSymbolTable } from "../BaseSymbolTable";
import { IMain } from "../IMain.ts";
import { Scheduler } from "../interpreter/Scheduler";
import { Thread } from "../interpreter/Thread";
import { ThreadState } from "../interpreter/ThreadState.ts";
import { ProgramState } from "../interpreter/ProgramState.ts";
import { ProgramPointerPositionInfo } from "../monacoproviders/ProgramPointerManager";
import { DebuggerCallstackEntry } from "./DebuggerCallstackEntry";
import { DebuggerSymbolEntry } from "./DebuggerSymbolEntry";
import { DebuggerWatchEntry } from "./DebuggerWatchEntry.ts";
import { DebuggerWatchSection } from "./DebuggerWatchSection.ts";
import { SymbolTableSection } from "./SymbolTableSection";
import '/assets/css/debugger.css';
import { IPosition } from "../range/Position.ts";
import { Range } from "../range/Range.ts";
import { JavaSymbolTable } from "../../java/codegenerator/JavaSymbolTable.ts";
import { IRange } from "monaco-editor";

export class Debugger {

    treeviewAccordion: TreeviewAccordion;

    currentlyVisibleSymbolTableSections: SymbolTableSection[] = [];
    showVariablesTreeview!: Treeview<DebuggerSymbolEntry, DebuggerSymbolEntry>;

    callstackTreeview!: Treeview<DebuggerCallstackEntry, DebuggerCallstackEntry>;

    threadsTreeview!: Treeview<Thread, Thread>;

    watchTreeview!: Treeview<DebuggerWatchEntry, DebuggerWatchEntry>;

    maxCallstackEntries: number = 15;

    lastThread?: Thread;

    watchSection: DebuggerWatchSection;

    constructor(private debuggerDiv: HTMLDivElement, public main: IMain) {

        this.treeviewAccordion = new TreeviewAccordion(debuggerDiv);
        this.initShowVariablesTreeview();
        this.initWatchTreeview();
        this.initCallstackTreeview();
        this.initThreadsTreeview();

        this.watchSection = new DebuggerWatchSection(this.watchTreeview, this);

        setTimeout(() => {
            this.treeviewAccordion.onResize(true);
        }, 100);

    }

    hide() {
        this.debuggerDiv.style.display = "none";
    }

    show() {
        this.debuggerDiv.style.display = "block";
    }

    initWatchTreeview() {
        this.watchTreeview = new Treeview(this.treeviewAccordion, {
            captionLine: {
                enabled: true,
                text: DebM.watch()
            },
            flexWeight: "1",
            withDeleteButtons: true,
            isDragAndDropSource: false,
            buttonAddFolders: false,
            withSelection: false,
            minHeight: 50,
            orderBy: "comparator"
        });


    }

    initThreadsTreeview() {
        this.threadsTreeview = new Treeview(this.treeviewAccordion, {
            captionLine: {
                enabled: true,
                text: DebM.threads()
            },
            flexWeight: "1",
            withDeleteButtons: false,
            isDragAndDropSource: false,
            buttonAddFolders: false,
            buttonAddElements: false,
            withSelection: true,
            minHeight: 50,
            orderBy: "comparator"
        });

    }

    initCallstackTreeview() {
        this.callstackTreeview = new Treeview(this.treeviewAccordion, {
            captionLine: {
                enabled: true,
                text: DebM.callStack()
            },
            flexWeight: "1",
            withDeleteButtons: false,
            isDragAndDropSource: false,
            buttonAddFolders: false,
            buttonAddElements: false,
            withSelection: true,
            minHeight: 50,
            orderBy: "comparator"
        });

    }

    initShowVariablesTreeview() {
        this.showVariablesTreeview = new Treeview(this.treeviewAccordion, {
            captionLine: {
                enabled: true,
                text: DebM.variables()
            },
            flexWeight: "3",
            withDeleteButtons: false,
            isDragAndDropSource: false,
            buttonAddFolders: false,
            buttonAddElements: false,
            withSelection: false,
            minHeight: 200,
            orderBy: "comparator"
        });

    }

    showThreads(scheduler: Scheduler) {
        let currentThread = scheduler.getCurrentThread();
        this.threadsTreeview.clear();

        let threadList = scheduler.getAllThreads();
        if (threadList.length == 0 && this.lastThread) {
            threadList = [this.lastThread];
        }

        for (let thread of threadList) {
            let caption = thread.name;
            let icon = "img_thread-" + ThreadState[thread.state];
            let node = this.threadsTreeview.addNode(false, caption,
                icon, thread, undefined)

            node.setTooltip(caption + "(" + ThreadState[thread.state] + ")");

            if (thread == currentThread) node.setSelected(true);
            node.onClickHandler = (t) => {
                if (!t) return;
                this.showCallstack(t);
                this.showVariablesOfProgramState(t);
                let topCallstackEntry = this.callstackTreeview.nodes[0];
                if (topCallstackEntry) {
                    topCallstackEntry.select();
                }
            }
        }
    }

    showCurrentThreadState() {
        let repl = this.main.getRepl();
        let currentThread = this.main.getInterpreter().scheduler.getCurrentThread();
        if (currentThread?.currentProgramState?.program && !currentThread.currentProgramState.program.isReplProgram || repl.state != "standalone") {
            this.showThreadState(this.main.getInterpreter().scheduler.getCurrentThread());
            return;
        }

        // Show repl thread:
        let thread = this.main.getRepl().standaloneThread;
        this.showVariablesOfStandaloneRepl(thread, repl.standaloneSymbolTable);
        this.showCallstack(thread);
        this.showThreads(thread.scheduler);
        this.watchSection.update(thread.scheduler.interpreter);
    }

    showThreadState(thread: Thread | undefined) {

        if (!thread) {
            if (this.lastThread) thread = this.lastThread;
        }

        this.lastThread = thread;

        if (!thread) return;

        this.showVariablesOfProgramState(thread);
        this.showCallstack(thread);
        this.showThreads(thread.scheduler);
        this.watchSection.update(thread.scheduler.interpreter)
    }

    showCallstack(thread: Thread) {
        this.callstackTreeview.clear();
        let programStack = thread.programStack;
        if (programStack.length == 0) return;

        let count = Math.min(programStack.length, this.maxCallstackEntries);
        for (let i = programStack.length - 1; i >= programStack.length - count; i--) {
            let programState = programStack[i];
            let entry = new DebuggerCallstackEntry(programState);
            let node = this.callstackTreeview.addNode(false, entry.getCaption(), undefined,
                entry, undefined);
            node.onClickHandler = (entry) => {
                this.showVariablesOfProgramState(thread, entry?.programState);
                this.showCallstackPositionInsideProgram(thread, entry);
            }
            if (i == programStack.length - 1) {
                node.setSelected(true);
            }
        }

        if (count < programStack.length) {
            //@ts-ignore
            this.callstackTreeview.addNode(false, `${programStack.length - count} ${DebM.more()}`, undefined, "x", undefined, undefined, true);
        }
    }

    showCallstackPositionInsideProgram(thread: Thread, entry?: DebuggerCallstackEntry) {
        if (!entry?.range) return;
        if (entry.program.isReplProgram) {
            thread.scheduler.interpreter.programPointerManager?.hide("callstackEntry");
            return;
        }

        let position: ProgramPointerPositionInfo = {
            programOrmoduleOrFile: entry.program,
            range: entry.range
        }

        thread.scheduler.interpreter.programPointerManager?.show(position, {
            key: "callstackEntry",
            isWholeLine: true,
            className: "jo_revealCallstackEntry",
            minimapColor: "#3067ce",
            rulerColor: "#3067ce",
            beforeContentClassName: "jo_revealCallstackEntryBefore"
        })
    }

    showVariablesOfStandaloneRepl(thread: Thread, symbolTable: JavaSymbolTable) {
        let symbolTableSection = this.currentlyVisibleSymbolTableSections.length == 1 ? this.currentlyVisibleSymbolTableSections[0] : undefined;
        if (symbolTableSection && symbolTableSection.symbolTable == symbolTable) {
            symbolTableSection.reReadSymbolTable();
        } else {
            symbolTableSection = new SymbolTableSection(this.showVariablesTreeview, symbolTable, this);
        }

        this.currentlyVisibleSymbolTableSections = [symbolTableSection];

        let position: IPosition;
        let range: IRange = { startLineNumber: 100, startColumn: 0, endLineNumber: 100, endColumn: 1e5 };
        if (range && range.startLineNumber >= 0) {
            position = Range.getStartPosition(range);
        }

        this.showVariablesTreeview.detachAllNodes();
        for (let sts of this.currentlyVisibleSymbolTableSections) {
            sts.attachNodesToTreeview();
            sts.renewValues(thread.s, 0, position);
        }

    }

    showVariablesOfProgramState(thread: Thread, programState?: ProgramState) {
        if (!programState) {
            if (thread.programStack.length > 0) programState = thread.programStack[thread.programStack.length - 1];
        }

        if (!programState) {
            this.showVariablesTreeview.clear();
            this.currentlyVisibleSymbolTableSections = [];
            return;
        }

        let callstackEntry = new DebuggerCallstackEntry(programState);

        if (!callstackEntry.symbolTable) return;

        let symbolTablesToShow: BaseSymbolTable[] = [];
        let st1: BaseSymbolTable | undefined = callstackEntry.symbolTable;
        while (st1) {
            if (!st1.hiddenWhenDebugging) {
                symbolTablesToShow.unshift(st1);
            }
            st1 = st1.parent;
        }

        let remainingSymbolTableSections: SymbolTableSection[] = [];

        let firstNonFittingFound = false;
        for (let i = 0; i < this.currentlyVisibleSymbolTableSections.length; i++) {
            let sts = this.currentlyVisibleSymbolTableSections[i];
            if (i > symbolTablesToShow.length || sts.symbolTable != symbolTablesToShow[i] || firstNonFittingFound) {
                firstNonFittingFound = true;
            } else {
                remainingSymbolTableSections.push(sts);
            }
        }

        while (remainingSymbolTableSections.length < symbolTablesToShow.length) {
            let index = remainingSymbolTableSections.length;
            remainingSymbolTableSections.push(new SymbolTableSection(this.showVariablesTreeview, symbolTablesToShow[index], this));
        }

        this.currentlyVisibleSymbolTableSections = remainingSymbolTableSections;



        let position: IPosition = {
            lineNumber: Number.MAX_SAFE_INTEGER,
            column: 0
        }
        let range = callstackEntry.nextStep?.getValidRangeOrUndefined();
        if (range && range.startLineNumber >= 0) {
            position = Range.getStartPosition(range);
        }

        this.showVariablesTreeview.detachAllNodes();
        for (let sts of this.currentlyVisibleSymbolTableSections) {
            sts.attachNodesToTreeview();
            sts.renewValues(thread.s, programState.stackBase, position);
        }

    }




}