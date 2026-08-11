import pako from 'pako';

export class TextEncoderDecoder {
    public static NoEncoding: number = 0;
    public static GzipThenBase64: number = 1

    public static encode(text: string, encoding: number): string {
        switch (encoding) {
            case TextEncoderDecoder.NoEncoding:
                return text;
            case TextEncoderDecoder.GzipThenBase64:
                let bytes:Uint8Array<ArrayBufferLike> = new TextEncoder().encode(text);
                let gzipResult = pako.gzip(bytes, {level: 9});
                return gzipResult.toBase64();
            default:
                throw new Error(`Unknown encoding: ${encoding}`);
        }
    }

    public static decode(text: string, encoding: number): string {
        switch (encoding) {
            case TextEncoderDecoder.NoEncoding:
                return text;
            case TextEncoderDecoder.GzipThenBase64:
                let bytes:Uint8Array<ArrayBufferLike> = pako.ungzip(Uint8Array.fromBase64(text));
                return new TextDecoder().decode(bytes);
            default:
                throw new Error(`Unknown encoding: ${encoding}`);
        }
    }

}