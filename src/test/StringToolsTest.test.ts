import { expect, test } from 'vitest'

import { getLineNumber } from '../tools/StringTools';

test('Test function getLineNumber', () => {
  let text1 = "Line 0\nLine 1\nLine2";
  expect(getLineNumber(text1, 0), "Line number must be 0.").toStrictEqual(0);
  expect(getLineNumber(text1, 5), "Line number must be 0.").toStrictEqual(0);
  expect(getLineNumber(text1, 6), "Line number must be 0.").toStrictEqual(0);
  expect(getLineNumber(text1, 7), "Line number must be 1.").toStrictEqual(1);
  expect(getLineNumber(text1, 16), "Line number must be 2.").toStrictEqual(2);
  expect(getLineNumber(text1, 160), "Line number must be 2.").toStrictEqual(2);
})

