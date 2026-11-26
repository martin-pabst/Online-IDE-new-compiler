import { DateHelper } from "./DateHelper";

export function hash(s: string){
    let hash: number = 0;
    let chr: number;
    for (let i = 0; i < s.length; i++) {
      chr   = s.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export function escapeHtml(unsafe: string): string {
  if(typeof unsafe == 'undefined') return "";
  return unsafe
      .replace(/['"]+/g, '')
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

/**
 * @returns e.g. "20.06.2024, 12:15" (this format is parsed by stringToDate) or "20.06.2024" if withTime is false
 */
export function dateToString(date: Date, withTime: boolean = true): string{
  return DateHelper.format(date, withTime ? "dd.MM.yyyy, HH:mm" : "dd.MM.yyyy");
}

export function dateToStringWithoutTime(date: Date): string{
  return dateToString(date, false);
}

export function twoDez(z: number):string {
  if(z < 10) return "0" + z;
  return "" + z;
}

export function threeDez(z: number):string {
  if(z < 10) return "  " + z;
  if(z < 100) return " " + z;
  return "" + z;
}

export function stringToDate(text: string): Date | undefined {

  let match = text.match(/^(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2})$/);

  if(!match) return undefined;

  let date: Date = new Date(Number.parseInt(match[3]), Number.parseInt(match[2]) - 1, Number.parseInt(match[1]), Number.parseInt(match[4]), Number.parseInt(match[5]) );

  return date;
}

export function stringWrap(s: string, length: number ): string{
  return s.replace(
    new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, 'g'), '$1\n'
  );
}

export function formatAsJavadocComment(s: string, indent: number|string = ""): string {
  let indentString = "";

  if(typeof indent == "string"){
    indentString = indent;
  } else {
    for(let i = 0; i < indent; i++){
      indentString += " ";
    }
  }

  s = stringWrap(s, 60);
  if(s.length > 0) s = "\n" + s;
  s = indentString + "/**" + s.replace(/\n/g, "\n" + indentString + " * ") + "\n" + indentString + " */";
  return s;
}

export function removeJavadocSyntax(s: string, indent: number|string = ""): string {
  let indentString = "";

  if(typeof indent == "string"){
    indentString = indent;
  } else {
    for(let i = 0; i < indent; i++){
      indentString += " ";
    }
  }

  s = s.replace(/\/\*\*/g, "");
  s = s.replace(/\/\*/g, "");
  s = s.replace(/\n\s*\*\//g, "\n");
  s = s.replace(/\n\s*\*/g, "\n");
  s = s.trim();

  s = stringWrap(s, 60);
  s = indentString + s.replace(/\n\s*/g, "  \n" + indentString);
  return s;
}

/** Function that count occurrences of a substring in a string;
 * @param {String} text               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see https://stackoverflow.com/a/7924240/938822
 */
export function countSubstrings(text: string, subString: string, allowOverlapping: boolean): number {

  text += "";
  subString += "";
  if (subString.length <= 0) return (text.length + 1);

  var n = 0,
      pos = 0,
      step = allowOverlapping ? 1 : subString.length;

  while (true) {
      pos = text.indexOf(subString, pos);
      if (pos >= 0) {
          ++n;
          pos += step;
      } else break;
  }
  return n;
}

export function getLine(text: string, lineNumber: number): string {
  if(lineNumber < 0 || !text) return "";

  let index = 0;
  for(let i = 1; i < lineNumber; i++){
    index = text.indexOf("\n", index + 1);
    if(index < 0) return "";
  }

  let indexEnd = text.indexOf("\n", index + 1);
  if(indexEnd < 0) indexEnd = text.length;

  return text.substring(index + 1, indexEnd);
}

export function getLineNumber(text: string, index: number){
  let i = 0;
  let lineNumber = -1;
  while(i >= 0){
    i = text.indexOf("\n", i + 1);
    lineNumber++;
    if(index <= i) return lineNumber;
  }
  return lineNumber;
}

export function generateSecret(length: number): string {
  let alphabet: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let secret: string = "";
  for(let i = 0; i < length; i++){
    secret += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return secret;
}

export function firstLetterUppercase(s: string): string {
  if(s == null || s.length == 0) return;
  return s[0].toLocaleUpperCase() + s.substring(1);
}

/**
 * Compares two strings lexicographically exactly like Java's String.compareTo:
 * Both strings are compared char by char (UTF-16 code units, which is what Java's
 * char and JavaScript's charCodeAt both use). At the first index k where they differ
 * the result is s1.charAt(k) - s2.charAt(k), e.g. "a" vs "A" gives 32. If one string
 * is a prefix of the other, the result is the difference of their lengths.
 *
 * Unlike String.prototype.localeCompare, the result is not limited to -1, 0, 1 and
 * doesn't depend on the locale (localeCompare sorts "a" before "A", Java doesn't).
 */
export function compareTo(s1: string, s2: string): number {
  const length1 = s1.length;
  const length2 = s2.length;
  const minLength = length1 < length2 ? length1 : length2;
  for (let k = 0; k < minLength; k++) {
    const c1 = s1.charCodeAt(k);
    const c2 = s2.charCodeAt(k);
    if (c1 != c2) return c1 - c2;
  }
  return length1 - length2;
}

/**
 * Compares two strings lexicographically ignoring case differences exactly like Java's
 * String.compareToIgnoreCase: chars that differ are converted with Character.toUpperCase
 * and then with Character.toLowerCase. At the first index where they still differ, the
 * result is the difference of these lowercase chars, e.g. "[" vs "A" gives '[' - 'a' = -6.
 * If one string is a prefix of the other (ignoring case), the result is the difference
 * of their lengths.
 *
 * Surrogate pairs (chars outside the Basic Multilingual Plane) are compared char by char
 * as in Java 8; newer Java versions also ignore case differences of these characters.
 */
export function compareToIgnoreCase(s1: string, s2: string): number {
  const length1 = s1.length;
  const length2 = s2.length;
  const minLength = length1 < length2 ? length1 : length2;
  for (let k = 0; k < minLength; k++) {
    let c1 = s1.charCodeAt(k);
    let c2 = s2.charCodeAt(k);
    if (c1 != c2) {
      c1 = charToUpperCase(c1);
      c2 = charToUpperCase(c2);
      if (c1 != c2) {
        c1 = charToLowerCase(c1);
        c2 = charToLowerCase(c2);
        if (c1 != c2) return c1 - c2;
      }
    }
  }
  return length1 - length2;
}

/**
 * Like Java's Character.toUpperCase(char), which uses Unicode's simple case mapping (one char to
 * one char). JavaScript's toUpperCase uses the full case mapping, which turns some chars into
 * several chars (e.g. "ß" into "SS"). Java leaves these chars unchanged.
 */
function charToUpperCase(c: number): number {
  if (c < 128) return c >= 97 && c <= 122 ? c - 32 : c;
  const upper = String.fromCharCode(c).toUpperCase();
  return upper.length == 1 ? upper.charCodeAt(0) : c;
}

/**
 * Like Java's Character.toLowerCase(char), see charToUpperCase.
 */
function charToLowerCase(c: number): number {
  if (c < 128) return c >= 65 && c <= 90 ? c + 32 : c;
  // The only char whose full lowercase mapping has more than one char: "İ" becomes "i" followed
  // by a combining dot above. Its simple case mapping is "i".
  if (c == 0x130) return 0x69;
  const lower = String.fromCharCode(c).toLowerCase();
  return lower.length == 1 ? lower.charCodeAt(0) : c;
}