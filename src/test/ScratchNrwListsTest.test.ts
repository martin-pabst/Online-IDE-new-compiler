import { describe, expect, test } from 'vitest';
// the interpreter and compiler first, as JavaTests does: importing the runtime classes
// on their own runs into an import cycle
import '../compiler/common/interpreter/Interpreter';
import '../compiler/java/JavaCompiler';
import { JavaLibraryManager } from '../compiler/java/runtime/JavaLibraryManager';
import { scratchSpriteList } from '../compiler/java/runtime/graphics/scratch/ScratchLists';
import { NRWListClass } from '../compiler/java/runtime/modules/nrw/NRWListClass';
import { ArrayListClass } from '../compiler/java/runtime/system/collections/ArrayListClass';

/**
 * Which list Stage.getAll, Stage.find and Sprite.getTouchingSprites hand out is
 * decided by the running program's library modules; see ScratchLists.ts.
 */

/**
 * Just enough of a thread for scratchSpriteList: the path to the modules of the
 * executable, as the IDE builds them for these libraries.
 */
function threadRunning(...libraries: string[]): any {
    const manager = new JavaLibraryManager();
    manager.addLibraries(...libraries);
    const libraryModules = manager.getAdditionalModules();
    return { scheduler: { interpreter: { executable: { libraryModuleManager: { libraryModules } } } } };
}

const sprites: any[] = [{ name: "a" }, { name: "b" }, { name: "c" }];

describe('Scratch sprite lists', () => {

    test('scratch alone hands out a java.util.List', () => {
        const list = scratchSpriteList(threadRunning('scratch'), sprites);
        expect(list).toBeInstanceOf(ArrayListClass);
    });

    test('scratch next to nrw hands out the nrw List, in order', () => {
        const list = scratchSpriteList(threadRunning('scratch', 'nrw'), sprites);
        expect(list).toBeInstanceOf(NRWListClass);
        const nrw = list as NRWListClass;
        const seen: any[] = [];
        nrw._toFirst();
        while (nrw._hasAccess()) {
            seen.push(nrw._getContent());
            nrw._next();
        }
        expect(seen).toEqual(sprites);
    });

    test('the order of the libraries does not matter', () => {
        expect(scratchSpriteList(threadRunning('nrw', 'scratch'), sprites)).toBeInstanceOf(NRWListClass);
    });

    test('scratch next to another library keeps java.util.List', () => {
        expect(scratchSpriteList(threadRunning('scratch', 'gng'), sprites)).toBeInstanceOf(ArrayListClass);
    });

    test('an empty result is an empty nrw List', () => {
        const list = scratchSpriteList(threadRunning('scratch', 'nrw'), []);
        expect((list as NRWListClass)._isEmpty()).toBe(true);
    });
});
