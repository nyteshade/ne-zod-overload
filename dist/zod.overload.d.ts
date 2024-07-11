import type { OverloadDecorator, Overloads } from './zod.overload.types';
/**
 * Creates a decorator function that implements runtime method overloading
 * using Zod schemas.
 *
 * This function allows you to define multiple implementations for a method
 * based on different input types, validated at runtime using Zod schemas.
 * It supports single-parameter, multi-parameter, varargs, and no-parameter
 * overloads.
 *
 * @template TOutput The return type of the overloaded method
 *
 * @param overloads An array of OverloadPair tuples, each containing a Zod
 * schema (or tuple of schemas) and a corresponding handler function
 *
 * @returns A decorator function that can be applied to class methods
 *
 * @example
 * const myDecorator = Overload([
 *   [z.string(), (input: string) => input.length],
 *   [z.number(), (input: number) => input.toString()],
 *   [Overload.NO_PARAMS, () => 'No input provided'],
 *   [z.tuple([z.string()]).rest(z.number()),
 *     (str: string, ...nums: number[]) =>
 *       str.repeat(nums.reduce((a, b) => a + b, 0))]
 * ]);
 *
 * class MyClass {
 *   @myDecorator
 *   myMethod(input?: string | number, ...rest: number[]): string | number {
 *     // Fallback implementation
 *   }
 * }
 */
export declare const Overload: OverloadDecorator;
/**
 * Custom error class for missing handler scenarios in Zod overloads.
 *
 * This error is thrown when a required handler is not provided for a Zod
 * overload configuration.
 *
 * @extends Error
 */
export declare class NoMatchedHandlerError extends Error {
    overloads: Overloads;
    /**
     * Creates a new MissingHandlerError instance.
     *
     * @param overloads - an array of entry (i.e. [key, value]) arrays used
     * in the `@Overload` decorator so that they may be surfaced when errors
     * are indicated.
     * @param spaceJoinedStrings - Strings to be joined with spaces and then
     * trimmed to form the error message.
     *
     * @example
     * throw new MissingHandlerError('Missing', 'handler', 'for', 'overload');
     */
    constructor(overloads: Overloads, ...spaceJoinedStrings: string[]);
}
//# sourceMappingURL=../src/src/zod.overload.d.ts.map