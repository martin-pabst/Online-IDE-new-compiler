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

export function dateToString(date: Date, withTime: boolean = false): string{
  let s = `${twoDez(date.getDate())}.${twoDez(date.getMonth() + 1)}.${date.getFullYear()}, ${twoDez(date.getHours())}:${twoDez(date.getMinutes())}`;
  
  if(withTime){
    s += `, ${twoDez(date.getHours())}:${twoDez(date.getMinutes())}`;
  }

  return s;
}

export function dateToStringWithoutTime(date: Date): string{
  return `${twoDez(date.getDate())}.${twoDez(date.getMonth() + 1)}.${date.getFullYear()}`;
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

