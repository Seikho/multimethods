import fatalError from '../../util/fatal-error';
import MultimethodOptions from './multimethod-options';
import isMetaMethod from './is-meta-method';





// TODO!... more normalisation / validation / defaults
export default function normaliseOptions(options?: Partial<MultimethodOptions>): MultimethodOptions {

    // Ensure the options object exists, even if it is empty.
    options = options || {};

    // TODO: review all these defaults. ESP. toDiscriminant!!
    let arity = options.arity !== undefined ? options.arity : 'variadic';
    let timing = options.timing || 'mixed';
    let toDiscriminant = options.toDiscriminant || ((...args: any[]) => args.map(arg => (arg || '').toString()).join(''));
    let methods = options.methods || {};

    // TODO: more validation, eg signatures of given methods, legal arity, legal timing, legal discriminant, etc
    validateMethods(methods);

    // TODO: ...
    return {
        arity,
        timing,
        toDiscriminant,
        methods
    };
}





function validateMethods(methods: MultimethodOptions['methods']) {
    Object.keys(methods).forEach(predicate => {
        // TODO: anything to validate?

        let method = methods[predicate];
        if (Array.isArray(method)) {
            let chain = method;

            // ensure first regular method in chain (if any) comes after last meta-method in chain (if any)
            if (chain.some((fn, i) => i < chain.length - 1 && !isMetaMethod(fn) && isMetaMethod(chain[i + 1]))) {
                return fatalError.MIXED_CHAIN(predicate);
            }
        }
    });
}