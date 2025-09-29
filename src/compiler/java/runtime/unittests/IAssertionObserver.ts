import { Step } from "../../../common/interpreter/Step";
import { Thread } from "../../../common/interpreter/Thread";

export interface IAssertionObserver {
    notifyOnAssertTrue(thread: Thread, step: Step, condition: boolean, message: string): void;
    notifyOnAssertFalse(thread: Thread, step: Step, condition: boolean, message: string): void;
    notifyOnAssertEqualsBoolean(thread: Thread, step: Step, expected: boolean, actual: boolean, message: string): void;
    notifyOnAssertEqualsNumber(thread: Thread, step: Step, expected: number, actual: number, message: string): void;
    notifyOnAssertEqualsString(thread: Thread, step: Step, expected: string, actual: string, message: string): void;
    notifyOnAssertEqualsObject(thread: Thread, step: Step, expected: string, actual: string, message: string): void;
    notifyOnFail(thread: Thread, step: Step, message: string): void;
}

export class DummyAssertionObserver implements IAssertionObserver {

    notifyOnAssertTrue(thread: Thread, step: Step, condition: boolean, message: string): void {
    }

    notifyOnAssertFalse(thread: Thread, step: Step, condition: boolean, message: string): void {
    }

    notifyOnAssertEqualsBoolean(thread: Thread, step: Step, expected: boolean, actual: boolean, message: string): void {
    }

    notifyOnAssertEqualsNumber(thread: Thread, step: Step, expected: number, actual: number, message: string): void {
    }

    notifyOnAssertEqualsString(thread: Thread, step: Step, expected: string, actual: string, message: string): void {
    }

    notifyOnAssertEqualsObject(thread: Thread, step: Step, expected: string, actual: string, message: string): void {
    }

    notifyOnFail(thread: Thread, step: Step, message: string): void {
    }

}