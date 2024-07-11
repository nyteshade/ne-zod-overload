"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoMatchedHandlerError = exports.Overload = void 0;
const zod_1 = require("zod");
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
exports.Overload = function Overload(overloads) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const originalName = originalMethod.name;
        descriptor.value = function (...args) {
            const parsed = overloads
                // Phase 1: Validation and context injection
                .map(([schema, handler, minArgs]) => {
                let type = '';
                switch (schema._def.typeName) {
                    case zod_1.z.ZodUndefined.name:
                        type = 'no.params';
                        break;
                    case zod_1.z.ZodTuple.name: {
                        type = 'tuple';
                        break;
                    }
                    case zod_1.z.ZodArray.name: {
                        type = 'array';
                        break;
                    }
                    default:
                        type = 'custom';
                        break;
                }
                // Create an object conforming to
                // OverloadParsedInputRow instead of using Tuples
                // which TypeScript is fairly braindead about.
                const validated = {
                    schema: schema,
                    safeParsed: undefined,
                    handler,
                    minArgs: isNaN(minArgs) ? 0 : Number(minArgs),
                    type: type,
                };
                if (type === 'no.params') {
                    // NO_PARAMS schemas can be represented properly
                    // now that we have the number of arguments to the
                    // overloaded function call. Let's swap it with
                    // something that has more relevance
                    validated.schema = zod_1.z.custom(data => data.length === 0);
                }
                else {
                    // All other valid schemas have arguments, add a
                    // clause that ensures this validation is occuring
                    // when safeParsing the arguments as a whole.
                    const { schema: _schema, minArgs: _minArgs } = validated;
                    validated.schema = _schema.and(zod_1.z.custom(_ => args.length === _minArgs));
                }
                return validated;
            })
                // Phase 2: Run the schema and/or handle edge cases
                .map((element) => {
                switch (element.type) {
                    case 'no.params':
                        element.safeParsed = element.schema?.safeParse(undefined);
                        break;
                    case 'tuple':
                    case 'array':
                        element.safeParsed = element.schema?.safeParse(args);
                        break;
                    case 'custom':
                        element.safeParsed = element.schema?.safeParse(args?.[0]);
                        break;
                }
                return element;
            })
                // Phase 3: Filter and only allow successfully parsed through
                .filter(element => element?.safeParsed.success)?.[0];
            if (parsed) {
                const { safeParsed, handler, type } = parsed;
                switch (type) {
                    case 'no.params':
                        return handler.bind(target)();
                    case 'tuple':
                        return handler.bind(target)(...safeParsed.data);
                    case 'array':
                        return handler.apply(target, safeParsed.data);
                    case 'custom':
                        return handler.bind(target)(safeParsed.data);
                }
            }
            // If no overload matches, call the original method
            return originalMethod.apply(this, args);
        };
        // maintain name on the replaced function
        Object.defineProperty(descriptor.value, 'name', {
            value: originalName,
            enumerable: false,
            configurable: true,
            writable: false,
        });
        return descriptor;
    };
};
/**
 * Custom error class for missing handler scenarios in Zod overloads.
 *
 * This error is thrown when a required handler is not provided for a Zod
 * overload configuration.
 *
 * @extends Error
 */
class NoMatchedHandlerError extends Error {
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
    constructor(overloads, ...spaceJoinedStrings) {
        super(spaceJoinedStrings.join(' ').trim());
        this.overloads = overloads;
    }
}
exports.NoMatchedHandlerError = NoMatchedHandlerError;
//# sourceMappingURL=../src/src/zod.overload.js.map