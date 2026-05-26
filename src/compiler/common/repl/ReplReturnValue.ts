import { BaseType } from "../BaseType";
import { Error } from "../Error";

export type ReplReturnValue = {
    value: any,
    text: string,
    type: BaseType | undefined,
    errors?: Error[]
} | undefined;
