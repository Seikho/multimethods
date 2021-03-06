import {MMInfo, MMNode} from '../analysis';
import {INVALID_METHOD_RESULT, UNHANDLED} from '../util/fatal-error';





// TODO: doc...
export default interface Emitter {
    env: EmitEnvironment;
    (...lines: string[]): void;
    generate(): Function;
}





// TODO: doc...
export interface EmitEnvironment extends MMInfo<EmitNode> {
    isPromiseLike: (value: any) => boolean;
    CONTINUE: any;
    unhandledError: typeof UNHANDLED;
    invalidResultError: typeof INVALID_METHOD_RESULT;
}





// TODO: doc...
export interface EmitNode extends MMNode {
    isMatch: (discriminant: string) => {} | null;
    hasCaptures: boolean;
    getCaptures: (discriminant: string) => {[captureName: string]: string};
}





// TODO: doc...
export function createEmitter(env: EmitEnvironment) {
    let allLines = [] as string[];

    function emit(...args: string[]) {
        args.forEach(lines => {
            lines.split('\n').forEach(line => {
                allLines.push(line);
            });
        });
    }

    let result = emit as Emitter;
    result.env = env;
    result.generate = () => evalMultimethodFromSource(env, allLines.join('\n'));
    return result;
}





// TODO: doc...
function evalMultimethodFromSource(env: EmitEnvironment, source: string) {

    // Static sanity check that the names and structures assumed in emitted code match those statically declared in the
    // EmitEnvironment var. A mismatch could arise for instance if IDE-based rename/refactor tools are used to change
    // property names, etc. Such tools won't pick up the references in emitted code, which would lead to ReferenceError
    // exceptions at runtime when the emitted code is evaluated. The following statements don't do anything, but they
    // will cause static checking errors if refactorings have occured, and they indicate which names/structures assumed
    // in the emitted code will need to be updated to agree with the refactored code.
    const globProps = {env};
    const {...envProps} = env;
    const {...cfgProps} = env.config;
    const {...nodeProps} = env.allNodes[0];
    // tslint:disable:no-unused-expression
    [EnvNames.ENV] as Array<keyof typeof globProps>;
    [EnvNames.IS_PROMISE_LIKE] as Array<keyof typeof envProps>;
    [EnvNames.CONTINUE] as Array<keyof typeof envProps>;
    [EnvNames.ERROR_UNHANDLED] as Array<keyof typeof envProps>;
    [EnvNames.ERROR_INVALID_RESULT] as Array<keyof typeof envProps>;
    [EnvNames.CONFIG] as Array<keyof typeof envProps>;
    [EnvNames.ALL_NODES] as Array<keyof typeof envProps>;
    [EnvNames.TO_DISCRIMINANT] as Array<keyof typeof cfgProps>;
    [EnvNames.IS_MATCH] as Array<keyof typeof nodeProps>;
    [EnvNames.GET_CAPTURES] as Array<keyof typeof nodeProps>;
    [EnvNames.EXACT_METHODS] as Array<keyof typeof nodeProps>;
    // tslint:enable:no-unused-expression

    // Evaluate the multimethod's entire source code to obtain the multimethod function. The use of eval here is safe.
    // There are no untrusted inputs substituted into the source. The client-provided methods can do anything (so may
    // be considered untrusted), but that has nothing to do with the use of 'eval' here, since they would need to be
    // called by the dispatcher whether or not eval was used. More importantly, the use of eval here allows for
    // multimethod dispatch code that is both more readable and more efficient, since it is tailored specifically
    // to the configuration of this multimethod, rather than having to be generalized for all possible cases.
    // tslint:disable-next-line:no-eval
    let mm = eval(`(function () { ${source}; return ${env.config.name}; })`)() as Function;
    mm.toString = () => source;
    return mm;
}





// TODO: doc... assumed names...
//              define each once and ref multiple times. These must be consistently named throughout emitted code
export enum EnvNames {
    ENV = 'env',
    IS_PROMISE_LIKE = 'isPromiseLike',
    CONTINUE = 'CONTINUE',
    ERROR_UNHANDLED = 'unhandledError',
    ERROR_INVALID_RESULT = 'invalidResultError',
    CONFIG = 'config',
    ALL_NODES = 'allNodes',
    TO_DISCRIMINANT = 'toDiscriminant',
    IS_MATCH = 'isMatch',
    GET_CAPTURES = 'getCaptures',
    EXACT_METHODS = 'exactMethods',
    EMPTY_OBJECT = 'EMPTY_OBJECT',
    SELECT_THUNK = 'selectThunk',
    THUNK = 'thunk',
    METHOD = 'method',
}
