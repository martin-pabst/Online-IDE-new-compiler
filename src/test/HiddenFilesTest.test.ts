import { expect, test } from 'vitest'
import { CompilerFile } from '../compiler/common/module/CompilerFile';

test('CompilerFile.isHidden() detects dot-prefixed hidden files', () => {
    const file1 = new CompilerFile("Main.java");
    const file2 = new CompilerFile(".scaffold.java");
    const file3 = new CompilerFile("other.txt");

    expect(file1.isHidden()).toBe(false);
    expect(file2.isHidden()).toBe(true);
    expect(file3.isHidden()).toBe(false);
});
