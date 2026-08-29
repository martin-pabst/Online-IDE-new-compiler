export class SecureJSON {
    public static parse(jsonString: string | null | undefined ): any {

        if (typeof jsonString !== "string") {
            return undefined;
        }

        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return undefined;
        }
    }

    public static stringify(value: any): string | undefined {
        if(typeof value === "undefined") {
            return undefined;
        }
        if(value === null) {
            return null;
        }
        try {
            return JSON.stringify(value);
        } catch (e) {
            return undefined;
        }
    }
}