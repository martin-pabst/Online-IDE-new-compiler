import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "../javalang/ObjectClassStringClass";
import { ComparableInterface } from "./ComparableInterface";
import { ComparatorInterface } from "./ComparatorInterface";
import { ListInterface } from "./ListInterface";
import { SystemCollection } from "./SystemCollection";
import { Program } from "../../../../common/interpreter/Program.ts";

export class CollectionsClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Collections extends Object", comment: JRC.CollectionsClassComment },
        { type: "method", signature: "static void shuffle(List<?> list)", java: CollectionsClass.shuffleIterative, comment: JRC.CollectionsShuffleComment },
        { type: "method", signature: "static <T extends Comparable> void sort(List<T> list)", java: CollectionsClass.sortComparableList, comment: JRC.CollectionsSortComparableListComment },
        { type: "method", signature: "static <T> void sort(List<T> list, Comparator<? super T> comparator)", java: CollectionsClass.sortListWithComparator, comment: JRC.CollectionsSortComparableListComment },
    ];

    static type: NonPrimitiveType;

    static shuffle(t: Thread, list: ListInterface) {

        if (list instanceof SystemCollection) {
            SystemCollection.shuffle(list);
        }

        list._mj$size$int$(t, () => {
            let size = t.s.pop();
            let shuffleCount: number = size * 2;

            let f = () => {
                if (shuffleCount > 0) {
                    shuffleCount--;
                    let index1 = Math.floor(Math.random() * size);
                    let index2 = Math.floor(Math.random() * size);

                    list._mj$get$E$int(t, () => {
                        let w1 = t.s.pop();

                        list._mj$get$E$int(t, () => {
                            let w2 = t.s.pop();

                            list._mj$set$E$int$E(t, () => {
                                list._mj$set$E$int$E(t, () => {

                                    f();

                                }, index2, w1);

                            }, index1, w2);

                        }, index2);

                    }, index1);

                }
            }

            if (size > 1) f();

        })
    }

    static shuffleProgram: Program;
    static shuffleIterative(t: Thread, list: ListInterface) {

        if (list instanceof SystemCollection) {
            SystemCollection.shuffle(list);
            return;
        }

        if (!CollectionsClass.shuffleProgram) {

            CollectionsClass.shuffleProgram = new Program(CollectionsClass.type.module, undefined, "Collections.shuffle");
            CollectionsClass.shuffleProgram.numberOfParameters = 1;
            CollectionsClass.shuffleProgram.numberOfThisObjects = 0;

            let index = 0;
            let listIndex = index++;
            let sizeIndex = index++;
            let counterIndex = index++;
            let n1Index = index++;
            let n2Index = index++;
            let e1Index = index++;
            let e2Index = index++;

            CollectionsClass.shuffleProgram.numberOfLocalVariables = index;

            CollectionsClass.shuffleProgram.addCompiledSteps([
                (t, s, sb) => {  // 0
                    t.s[sb + listIndex]._mj$size$int$(t, undefined);
                    return 1;
                },
                (t, s, sb) => {  // 1
                    t.s[sb + sizeIndex] = t.s.pop();
                    t.s[sb + counterIndex] = t.s[sb + sizeIndex] * 2;
                    return 2;
                },
                (t, s, sb) => {  // 2
                    if (t.s[sb + counterIndex] <= 0) {
                        return 6;
                    }
                    t.s[sb + n1Index] = Math.floor(Math.random() * t.s[sb + sizeIndex]);
                    t.s[sb + n2Index] = Math.floor(Math.random() * t.s[sb + sizeIndex]);

                    t.s[sb + listIndex]._mj$get$E$int(t, undefined, t.s[sb + n1Index]);
                    return 3;
                },
                (t, s, sb) => {  // 3
                    t.s[sb + e1Index] = t.s.pop();
                    t.s[sb + listIndex]._mj$get$E$int(t, undefined, t.s[sb + n2Index]);
                    return 4;
                },
                (t, s, sb) => {  // 4
                    t.s[sb + e2Index] = t.s.pop();
                    t.s[sb + listIndex]._mj$set$E$int$E(t, undefined, t.s[sb + n1Index], t.s[sb + e2Index]);
                    return 5;
                },
                (t, s, sb) => {  // 5
                    t.s[sb + listIndex]._mj$set$E$int$E(t, undefined, t.s[sb + n2Index], t.s[sb + e1Index]);
                    t.s[sb + counterIndex]--;
                    return 2;
                },
                (t, s, sb) => {  // 6
                    t.return(undefined);
                    return 7
                },
            ])

        }

        t.s.push(list);

        t.pushProgram(CollectionsClass.shuffleProgram, () => {  });

    }

    static sortListWithComparator(t: Thread, list: ListInterface, comparator: ComparatorInterface) {

        if (list instanceof SystemCollection) {
            SystemCollection.sortWithComparator(t, undefined, comparator, list);
            return;
        }

        list._mj$sort$void$Comparator(t, undefined, comparator);

    }


    static sortComparableList(t: Thread, list: ListInterface) {

        let comparator: ComparatorInterface = {
            _mj$compare$int$T$T: function (t: Thread, callback: CallbackFunction, object1: ObjectClass, object2: ObjectClass): void {
                if (object1 == null) {
                    t.s.push(1);
                    if (callback) callback();
                    return;
                }

                if (object2 == null) {
                    t.s.push(-1);
                    if (callback) callback();
                    return;
                }

                (<ComparableInterface><any>object1)._mj$compareTo$int$T(t, callback, object2);
                return;
            }
        }

        CollectionsClass.sortListWithComparator(t, list, comparator);

    }


}