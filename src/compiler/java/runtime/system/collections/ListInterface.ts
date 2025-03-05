import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";
import { CollectionInterface } from "./CollectionInterface.ts";
import { ComparatorInterface } from "./ComparatorInterface.ts";
import { Program } from "../../../../common/interpreter/Program.ts";

export class ListInterface extends CollectionInterface {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "interface List<E> extends Collection<E>" },
        { type: "method", signature: "boolean add(int index, E element)", java: ListInterface.prototype._mj$add$boolean$int$E, comment: JRC.listAddElementComment },
        { type: "method", signature: "boolean addAll(int index, Collection<? extends E> c)", java: ListInterface.prototype._mj$addAll$boolean$int$Collection, comment: JRC.listAddAllElementsComment },
        { type: "method", signature: "E get (int index)", java: ListInterface.prototype._mj$get$E$int, comment: JRC.listGetComment },
        { type: "method", signature: "int indexOf (E element)", java: ListInterface.prototype._mj$indexOf$int$E, comment: JRC.listIndexOfComment },
        { type: "method", signature: "E remove (int index)", java: ListInterface.prototype._mj$remove$E$int, comment: JRC.listRemoveComment },
        { type: "method", signature: "E set (int index, E element)", java: ListInterface.prototype._mj$set$E$int$E, comment: JRC.listSetComment },
        { type: "method", signature: "default void sort(Comparator<? super E> comparator)", java: ListInterface.prototype._mj$sort$void$Comparator, comment: JRC.listSortComment },

        // TODO: sort, subList, ...
    ]

    static type: NonPrimitiveType;

    _mj$add$boolean$int$E(t: Thread, callback: CallbackFunction) { }

    _mj$addAll$boolean$int$Collection(t: Thread, callback: CallbackFunction) { }

    _mj$get$E$int(t: Thread, callback: CallbackFunction, index: number) { }

    _mj$indexOf$int$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) { }

    _mj$remove$E$int(t: Thread, callback: CallbackFunction, index: number) { }

    _mj$set$E$int$E(t: Thread, callback: CallbackFunction, index: number, element: ObjectClassOrNull) { }

    _mj$sort$void$Comparator(t: Thread, callback: CallbackFunction, comparator: ComparatorInterface) {

        let that = this;

        this._mj$size$int$(t, () => {
            let size: number = t.s.pop();
            if (size <= 1) {
                if (callback) callback(); // nothing to do
            } else {
                ListInterface.prototype.quicksort.call(that, t, callback, comparator, 0, size - 1);
            }
        })
    }

    quicksort(t: Thread, callback: CallbackFunction, comparator: ComparatorInterface, fromIndex: number, toIndex: number) {
        let that = this;

        if (toIndex - fromIndex <= 1) {
            if (callback) callback(); // nothing to do
            return;
        }

        ListInterface.prototype.partition.call(that, t, () => {

            let partitionIndex: number = t.s.pop();
            ListInterface.prototype.quicksort.call(that, t, () => {
                ListInterface.prototype.quicksort.call(that, t, () => {
                    if (callback) callback();
                    return;
                }, comparator, partitionIndex + 1, toIndex);
            }, comparator, fromIndex, partitionIndex - 1);


        }, comparator, fromIndex, toIndex);

        // public void quickSort(int arr[], int begin, int end) {
        //     if (begin < end) {
        //         int partitionIndex = partition(arr, begin, end);

        //         quickSort(arr, begin, partitionIndex-1);
        //         quickSort(arr, partitionIndex+1, end);
        //     }
        // }
    }

    private partition(t: Thread, callback: () => void, comparator: ComparatorInterface, begin: number, end: number) {

        let that = this;

        that._mj$get$E$int(t, () => {
            let pivot: ObjectClass = t.s.pop();
            let i: number = begin - 1;

            let j = begin;
            let loop = () => {
                if (j < end) {
                    that._mj$get$E$int(t, () => {
                        let left: ObjectClass = t.s.pop();

                        comparator._mj$compare$int$T$T(t, () => {
                            if (t.s.pop() <= 0) {
                                i++;
                                ListInterface.prototype.swap.call(that, t, () => {
                                    j++;
                                    loop();
                                }, i, j);
                            } else {
                                j++;
                                loop();
                            }
                        }, left, pivot);
                    }, j);
                } else {
                    // after for-loop
                    ListInterface.prototype.swap.call(that, t, () => {
                        t.s.push(i + 1);
                        callback();
                        return;
                    }, i + 1, end)
                }
            }

            loop();

        }, end);

        // private int partition(int arr[], int begin, int end) {
        // int pivot = arr[end];
        // int i = (begin-1);

        // for (int j = begin; j < end; j++) {
        //     if (arr[j] <= pivot) {
        //         i++;

        //         int swapTemp = arr[i];
        //         arr[i] = arr[j];
        //         arr[j] = swapTemp;
        //     }
        // }

        // int swapTemp = arr[i+1];
        // arr[i+1] = arr[end];
        // arr[end] = swapTemp;

        // return i+1;
    }

    swap(t: Thread, callback: () => void, index1: number, index2: number) {
        let that = this;
        that._mj$get$E$int(t, () => {
            let object1: ObjectClass = t.s.pop();
            that._mj$get$E$int(t, () => {
                let object2: ObjectClass = t.s.pop();

                that._mj$set$E$int$E(t, () => {
                    that._mj$set$E$int$E(t, callback, index2, object1);
                }, index1, object2);
            }, index2);
        }, index1);
    }

    static quicksortProgram: Program;
    static partitionProgram: Program;

    quicksortIterative(t: Thread, callback: CallbackFunction, comparator: ComparatorInterface, fromIndex: number, toIndex: number) {
        if(!ListInterface.quicksortProgram){
            ListInterface.initQuicksortProgram();
            ListInterface.initPartitionProgram();
        }
        t.s.push(this, comparator, fromIndex, toIndex);
        t.pushProgram(ListInterface.quicksortProgram, callback);
    }

    static initQuicksortProgram() {
        /*
         * method quicksort(this: Object[], comparator, begin, end)
         */

        ListInterface.quicksortProgram = new Program(ListInterface.type.module, undefined, "ListInterface.quicksort");
        ListInterface.quicksortProgram.numberOfParameters = 3;
        ListInterface.quicksortProgram.numberOfThisObjects = 1;

        let index = 0;
        let thisIndex = index++;
        // Parameter:
        let comparatorIndex = index++;
        let beginIndex = index++;
        let endIndex = index++;
        // local variables:
        let partitionIndexIndex = index++;

        ListInterface.quicksortProgram.numberOfLocalVariables = index - ListInterface.quicksortProgram.numberOfThisObjects - ListInterface.quicksortProgram.numberOfParameters;

        // public void quickSort(this = Object[], comparator, int begin, int end) {
        //     if (begin < end) {
        //         int partitionIndex = partition(comparator, begin, end);

        //         quickSort(comparator, begin, partitionIndex-1);
        //         quickSort(comparator, partitionIndex+1, end);
        //     }
        // }


        ListInterface.quicksortProgram.addCompiledSteps([
            (t, s, sb) => {  // 0
                if (t.s[sb + beginIndex] >= t.s[sb + endIndex]) {
                    t.return(undefined)
                    return -1;
                }
                t.s.push(t.s[sb + thisIndex], t.s[sb + comparatorIndex], t.s[sb + beginIndex], t.s[sb + endIndex]);
                t.pushProgram(ListInterface.partitionProgram, undefined);
                return 1;
            },
            (t, s, sb) => {  // 1
                t.s[sb + partitionIndexIndex] = t.s.pop();
                t.s.push(t.s[sb + thisIndex], t.s[sb + comparatorIndex], t.s[sb + beginIndex], t.s[sb + partitionIndexIndex] - 1);
                t.pushProgram(ListInterface.quicksortProgram, undefined);
                return 2;
            },
            (t, s, sb) => {  // 2
                t.s.push(t.s[sb + thisIndex], t.s[sb + comparatorIndex], t.s[sb + partitionIndexIndex] + 1, t.s[sb + endIndex]);
                t.pushProgram(ListInterface.quicksortProgram, undefined);
                t.return(undefined);
                return -1;
            },
        ])
    }

    static initPartitionProgram() {
        /*
         * method partition(this: Object[], comparator, begin, end)
         */

        ListInterface.partitionProgram = new Program(ListInterface.type.module, undefined, "ListInterface.partition");
        ListInterface.partitionProgram.numberOfParameters = 3;
        ListInterface.partitionProgram.numberOfThisObjects = 1;

        let index = 0;
        let thisIndex = index++;
        // Parameter:
        let comparatorIndex = index++;
        let beginIndex = index++;
        let endIndex = index++;
        // local variables:
        let pivotIndex = index++;
        let iIndex = index++;
        let jIndex = index++;
        let swapTempIndex = index++;

        ListInterface.partitionProgram.numberOfLocalVariables = index - ListInterface.partitionProgram.numberOfThisObjects - ListInterface.partitionProgram.numberOfParameters;

        // private int partition(int arr[], comparator, int begin, int end) {
        // int pivot = arr[end];
        // int i = (begin-1);

        // for (int j = begin; j < end; j++) {
        //     if (arr[j] <= pivot) {
        //         i++;

        //         int swapTemp = arr[i];
        //         arr[i] = arr[j];
        //         arr[j] = swapTemp;
        //     }
        // }

        // int swapTemp = arr[i+1];
        // arr[i+1] = arr[end];
        // arr[end] = swapTemp;

        // return i+1;



        ListInterface.partitionProgram.addCompiledSteps([
            (t, s, sb) => {  // 0
                t.s[sb + thisIndex]._mj$get$E$int(t, undefined, t.s[sb + endIndex]);
                return 1;
            },
            (t, s, sb) => {  // 1
                // int pivot = arr[end];
                t.s[sb + pivotIndex] = t.s.pop();
                // int i = (begin-1);
                t.s[sb + iIndex] = t.s[sb + beginIndex] - 1;
                // for (int j = begin; j < end; j++) {
                t.s[sb + jIndex] = t.s[sb + beginIndex];
                return 2;
            },
            (t, s, sb) => {  // 2
                // for (int j = begin; j < end; j++) {
                if (t.s[sb + jIndex] >= t.s[sb + endIndex]) return 9; // TODO
                // if (arr[j] <= pivot) {
                t.s[sb + thisIndex]._mj$get$E$int(t, undefined, t.s[sb + jIndex]);
                return 3;
            },
            (t, s, sb) => {  // 3
                // if (arr[j] <= pivot) {
                t.s[sb + comparatorIndex]._mj$compare$int$T$T(t, undefined, t.s.pop(), t.s[sb + pivotIndex]);
                return 4;
            },
            (t, s, sb) => {  // 4
                // if (arr[j] <= pivot) {
                if (t.s.pop() > 0) return 8; // TODO!
                //         i++;
                t.s[sb + iIndex]++;
                //         int swapTemp = arr[i];
                t.s[sb + thisIndex]._mj$get$E$int(t, undefined, t.s[sb + iIndex]);
                return 5;
            },
            (t, s, sb) => {  // 5
                //         int swapTemp = arr[i];
                t.s[sb + swapTempIndex] = t.s.pop();
                //         arr[i] = arr[j];
                t.s[sb + thisIndex]._mj$get$E$int(t, undefined, t.s[sb + jIndex]);
                return 6;
            },
            (t, s, sb) => {  // 6
                //         arr[i] = arr[j];
                t.s[sb + thisIndex]._mj$set$E$int$E(t, undefined, t.s[sb + iIndex], t.s.pop());

                return 7;
            },
            (t, s, sb) => {  // 7
                //         arr[j] = swapTemp;
                t.s[sb + thisIndex]._mj$set$E$int$E(t, undefined, t.s[sb + jIndex], t.s[sb + swapTempIndex]);
                return 8;
            },
            (t, s, sb) => {  // 8 (after if(){})
                // for (;; j++) {
                t.s[sb + jIndex]++;
                return 2;
            },
            (t, s, sb) => {  // 9 (after for-loop)
                // int swapTemp = arr[i+1];
                t.s[sb + thisIndex]._mj$get$E$int(t, undefined, t.s[sb + iIndex] + 1);
                return 10;
            },
            (t, s, sb) => {  // 10 (after for-loop)
                // int swapTemp = arr[i+1];
                t.s[sb + swapTempIndex] = t.s.pop();
                // arr[i+1] = arr[end];
                t.s[sb + thisIndex]._mj$get$E$int(t, undefined, t.s[sb + endIndex]);
                return 11;
            },
            (t, s, sb) => {  // 11
                // arr[i+1] = arr[end];
                t.s[sb + thisIndex]._mj$set$E$int$E(t, undefined, t.s[sb + iIndex] + 1, t.s.pop());
                return 12;
            },
            (t, s, sb) => {  // 12
                // arr[end] = swapTemp;
                t.s[sb + thisIndex]._mj$set$E$int$E(t, undefined, t.s[sb + endIndex], t.s[sb + swapTempIndex]);
                return 13;
            },
            (t, s, sb) => {  // 13
                // return i+1;
                t.return(t.s[sb + iIndex] + 1);
                return -1;
            },
        ])

    }



}

