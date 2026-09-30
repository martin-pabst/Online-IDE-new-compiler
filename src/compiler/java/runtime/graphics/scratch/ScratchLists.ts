import { Thread } from "../../../../common/interpreter/Thread";
import type { JavaExecutable } from "../../../JavaExecutable";
import { NRWListClass } from "../../modules/nrw/NRWListClass";
import { ArrayListClass } from "../../system/collections/ArrayListClass";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";

/**
 * The library modules that make Stage.getAll, Stage.find and Sprite.getTouchingSprites
 * hand out the List of the NRW Zentralabitur (see ScratchModule, library "scratch-nrw").
 */
export interface ScratchListFlavour {
    scratchNrwLists?: boolean;
}

/**
 * The list a Scratch method returning sprites hands out: a java.util.List, or in the
 * "scratch-nrw" library the nrw List — the IDE's counterpart of the NRW build of
 * Scratch for Java.
 *
 * Both libraries compile these methods under the same internal name, and the library
 * parser writes them onto the one shared prototype, so the declaration cannot decide
 * which list it is. The program that runs does: its executable carries the library
 * modules it was compiled with.
 */
export function scratchSpriteList(t: Thread, sprites: ObjectClass[]): ArrayListClass | NRWListClass {
    if (!usesNrwLists(t)) return new ArrayListClass(sprites);
    const list = new NRWListClass();
    for (const sprite of sprites) list._append(sprite);
    return list;
}

function usesNrwLists(t: Thread): boolean {
    const executable = t?.scheduler?.interpreter?.executable as JavaExecutable | undefined;
    const modules = executable?.libraryModuleManager?.libraryModules ?? [];
    return modules.some(m => (m as ScratchListFlavour).scratchNrwLists === true);
}
