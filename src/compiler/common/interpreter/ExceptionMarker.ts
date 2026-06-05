import { IMain } from "../IMain";
import { CompilerFile } from "../module/CompilerFile";
import { ProgramPointerPositionInfo } from "../monacoproviders/ProgramPointerManager";
import { IRange } from "../range/Range";
import { Step } from "./Step";
import { SchedulerState } from "./SchedulerState";
import { IThrowable } from "./ThrowableType";
import '/assets/css/exceptionmarker.css';

export class ExceptionMarker {

  key: string = "ExceptionMarker";

  constructor(private main: IMain) {
  }

  markExceptionByFileAndRange(file: CompilerFile, range: IRange | undefined) {

    this.removeExceptionMarker();

    if (!file || !range) return;

    let ppm = this.main.getInterpreter().programPointerManager;
    if (!ppm) return;

    this.main.showFile(file);

    let p: ProgramPointerPositionInfo = {
      programOrmoduleOrFile: file,
      range: range
    }

    ppm.show(p, {
      key: this.key,
      isWholeLine: true,
      className: "jo_revealExceptionPosition",
      minimapColor: "#d61bd056",
      rulerColor: "#d61bd056",
      beforeContentClassName: "jo_revealExceptionPositionBefore"
    })

    setTimeout(() => {
      // event stop is also fired when compiler sends new Executable to interpreter!
      this.main.getInterpreter().eventManager.once("stop", () => {
        this.removeExceptionMarker();
      })

    }, 1100);

  }

  markException(exception: IThrowable | { file: CompilerFile, range: IRange | undefined }, step: Step) {


    let file = exception.file;
    let range = exception.range;

    this.markExceptionByFileAndRange(file!, range);

    setTimeout(() => {
      this.main.getDisassembler()?.markException(step);
    }, 1000);

  }

  removeExceptionMarker() {
    this.main.getInterpreter()?.programPointerManager?.hide(this.key);
  }

}