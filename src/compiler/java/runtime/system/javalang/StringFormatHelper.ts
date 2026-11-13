import { Thread } from "../../../../common/interpreter/Thread";
import { Formatter } from "../../../../../tools/formatter/Formatter";
import { BooleanClass } from "../primitiveTypes/wrappers/BooleanClass";
import { CharacterClass } from "../primitiveTypes/wrappers/CharacterClass";
import { NumberClass } from "../primitiveTypes/wrappers/NumberClass";
import { NullPointerExceptionClass } from "./NullPointerExceptionClass";
import { ObjectClass, StringClass } from "./ObjectClassStringClass";

/**
 * Bridge between the java library methods String.format, String.formatted, PrintStream.printf
 * and the synchronous {@link Formatter}: toString() of user-defined java objects is step-aware
 * (it may execute java code), so those arguments are converted to strings first, one after
 * another via callbacks, before Formatter.format is called.
 *
 * This class is not imported by ObjectClassStringClass.ts (that would create an import cycle
 * ObjectClass -> Formatter -> exception classes -> ObjectClass); SystemModule injects
 * StringFormatHelper.format into StringClass.formatImplementation instead.
 */
export class StringFormatHelper {

    static format(t: Thread, format: string | null | undefined, args: any[] | null | undefined, callback: (result: string) => void): void {
        if (format == null) throw new NullPointerExceptionClass("format string is null");

        let resolvedArguments: any[] = args == null ? [] : args.slice();
        let i = 0;

        const resolveNext = () => {
            while (i < resolvedArguments.length) {
                let arg = resolvedArguments[i];
                let index = i++;
                if (StringFormatHelper.needsStepAwareToString(arg)) {
                    (<ObjectClass>arg)._mj$toString$String$(t, () => {
                        let s = t.s.pop();
                        resolvedArguments[index] = s == null ? null : (s instanceof StringClass ? s.value : "" + s);
                        resolveNext();
                    });
                    return;
                }
            }
            callback(Formatter.format(format, ...resolvedArguments));
        }

        resolveNext();
    }

    /**
     * Strings and the wrapper classes are handled by Formatter directly (it needs their exact
     * type for %d/%f compatibility checks); every other object gets its toString() called.
     */
    private static needsStepAwareToString(arg: any): boolean {
        return arg instanceof ObjectClass
            && !(arg instanceof StringClass)
            && !(arg instanceof NumberClass)
            && !(arg instanceof BooleanClass)
            && !(arg instanceof CharacterClass);
    }

}
