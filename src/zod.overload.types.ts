import { z, ZodTypeAny } from 'zod';

/**
 * Represents a tuple of Zod schemas, possibly ending with a rest parameter.
 *
 * This type ensures that the tuple has at least one Zod schema and can
 * optionally end with a Zod array for varargs.
 */
export type AnyZodTuple = [z.ZodTypeAny, ...z.ZodTypeAny[]] |
[...z.ZodTypeAny[], z.ZodArray<z.ZodTypeAny>];
/**
 * Infers TypeScript types from a tuple of Zod schemas, handling varargs.
 *
 * @template T The tuple of Zod schemas
 */

export type InferZodTuple<T extends AnyZodTuple> = T extends [
  ...infer U,
  z.ZodArray<infer V>
]
  ? [
      ...{[K in keyof U]: U[K] extends z.ZodTypeAny ? z.infer<U[K]> : never;},
      ...z.infer<V>[],
    ]
  : {[K in keyof T]: T[K] extends z.ZodTypeAny ? z.infer<T[K]> : never;};


export type Overloads = [ZodTypeAny, (...args: any[]) => any, number][];

/**
 * Represents an object with a null prototype and arbitrary key-value pairs.
 *
 * This type is useful for creating objects that don't inherit any properties
 * or methods from Object.prototype, providing a "clean slate" for custom
 * property definitions.
 *
 * @example
 * const nullProtoObj: NullProtoObject = Object.create(null);
 * nullProtoObj.customProp = 'value';
 */

export type NullProtoObject =
  { [key: string | symbol | number]: any } &
  { __proto__: null };
/**
 * Represents the return type of a safe parsing operation.
 *
 * This type encapsulates the result of a parsing operation that may either
 * succeed or fail, providing type-safe access to the parsed data or error
 * information.
 *
 * @template T The type of the successfully parsed data
 *
 * @property success Indicates whether the parsing operation was successful
 * @property data The parsed data (only present if success is true)
 * @property error The parsing error (only present if success is false)
 *
 * @example
 * function safeParse<T>(input: unknown): SafeParseReturnType<T> {
 *   try {
 *     const data = parseData(input) as T;
 *     return { success: true, data };
 *   } catch (error) {
 *     return { success: false, error: error as z.ZodError };
 *   }
 * }
 */

export type SafeParseReturnType = z.SafeParseReturnType<any, any>;

export interface OverloadParsedInputRow {
  schema: ZodTypeAny;
  safeParsed: SafeParseReturnType;
  handler: (...args: any) => any;
  minArgs?: number;
  type: 'no.params' | 'tuple' | 'array' | 'custom';
}

/**
 * A customized type for a decorator function that allows overloading with Zod
 * schemas and provides type completion for the NO_PARAMS constant.
 *
 * This type represents a function that takes an array of overload pairs and
 * returns a decorator function. The decorator function can be applied to class
 * methods to implement runtime overloading based on Zod schemas.
 *
 * @template TOutput The return type of the overloaded methods
 *
 * @property {z.infer<typeof NO_PARAMS>} NO_PARAMS A constant representing no
 * parameters, allowing for zero-parameter overloads
 *
 * @example
 * const myDecorator: OverloadDecorator = Overload([
 *   [z.string(), (input: string) => input.length],
 *   [z.number(), (input: number) => input.toString()],
 *   [Overload.NO_PARAMS, () => 'No input provided'],
 *   [z.tuple([z.string()]).rest(z.number()),
 *     (str: string, ...nums: number[]) => str.repeat(nums.reduce((a, b) => a +
 * b, 0))]
 * ]);
 *
 * class MyClass {
 *   @myDecorator
 *   myMethod(input?: string | number, ...rest: number[]): string | number {
 *     // Implementation
 *   }
 * }
 */
export type OverloadDecorator = (overloads: Overloads) => (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => PropertyDescriptor;
