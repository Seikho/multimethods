import analyse from './analysis';
import codegen from './codegen';
import instrument from './instrumentation';
import Options from './options';
import debug from './util/debug';
import validate from './validation';





// TODO: doc...
function create<T0, TR>(options: SyncUnaryOptions<T0, TR>): ($0: T0) => TR;
function create<T0, TR>(options: AsyncUnaryOptions<T0, TR>): ($0: T0) => Promise<TR>;
function create<T0, TR>(options: UnaryOptions<T0, TR>): ($0: T0) => TR|Promise<TR>;
function create<T0, T1, TR>(options: SyncBinaryOptions<T0, T1, TR>): ($0: T0, $1: T1) => TR;
function create<T0, T1, TR>(options: AsyncBinaryOptions<T0, T1, TR>): ($0: T0, $1: T1) => Promise<TR>;
function create<T0, T1, TR>(options: BinaryOptions<T0, T1, TR>): ($0: T0, $1: T1) => TR|Promise<TR>;
function create<T0, T1, T2, TR>(options: SyncTernaryOptions<T0, T1, T2, TR>): ($0: T0, $1: T1, $2: T2) => TR;
function create<T0, T1, T2, TR>(options: AsyncTernaryOptions<T0, T1, T2, TR>): ($0: T0, $1: T1, $2: T2) => Promise<TR>;
function create<T0, T1, T2, TR>(options: TernaryOptions<T0, T1, T2, TR>): ($0: T0, $1: T1, $2: T2) => TR|Promise<TR>;
function create<T, TR>(options: SyncVariadicOptions<T, TR>): (...args: T[]) => TR;
function create<T, TR>(options: AsyncVariadicOptions<T, TR>): (...args: T[]) => Promise<TR>;
function create<T, TR>(options?: VariadicOptions<T, TR>): (...args: T[]) => TR | Promise<TR>;
function create(options?: Options) {
    options = options || {};
    validate(options); // NB: may throw
    let mminfo = analyse(options);
    let emit = codegen(mminfo);
    if (debug.enabled) instrument(emit);
    let multimethod = emit.generate();
    return multimethod;
}
export default create;





export type SyncUnaryOptions<T0, TR> = {async: false} & BaseUnaryOptions<T0, TR>;
export type AsyncUnaryOptions<T0, TR> = {async: true} & BaseUnaryOptions<T0, TR|Promise<TR>>;
export type UnaryOptions<T0, TR> = BaseUnaryOptions<T0, TR|Promise<TR>>;
export interface BaseUnaryOptions<T0, TR> extends Options {
    arity: 1;
    toDiscriminant?: ($0: T0) => string;
    methods?: Methods<($0: T0, captures: Captures, forward: ($0: T0) => TR) => TR>;
}





export type SyncBinaryOptions<T0, T1, TR> = {async: false} & BaseBinaryOptions<T0, T1, TR>;
export type AsyncBinaryOptions<T0, T1, TR> = {async: true} & BaseBinaryOptions<T0, T1, TR|Promise<TR>>;
export type BinaryOptions<T0, T1, TR> = BaseBinaryOptions<T0, T1, TR|Promise<TR>>;
export interface BaseBinaryOptions<T0, T1, TR> extends Options {
    arity: 2;
    toDiscriminant?: ($0: T0, $1: T1) => string;
    methods?: Methods<($0: T0, $1: T1, captures: Captures, forward: ($0: T0, $1: T1) => TR) => TR>;
}





export type SyncTernaryOptions<T0, T1, T2, TR> = {async: false} & BaseTernaryOptions<T0, T1, T2, TR>;
export type AsyncTernaryOptions<T0, T1, T2, TR> = {async: true} & BaseTernaryOptions<T0, T1, T2, TR|Promise<TR>>;
export type TernaryOptions<T0, T1, T2, TR> = BaseTernaryOptions<T0, T1, T2, TR|Promise<TR>>;
export interface BaseTernaryOptions<T0, T1, T2, TR> extends Options {
    arity: 3;
    toDiscriminant?: ($0: T0, $1: T1, $2: T2) => string;
    methods?: Methods<($0: T0, $1: T1, $2: T2, captures: Captures, forward: ($0: T0, $1: T1, $2: T2) => TR) => TR>;
}





export type SyncVariadicOptions<T, TR> = {async: false} & BaseVariadicOptions<T, TR>;
export type AsyncVariadicOptions<T, TR> = {async: true} & BaseVariadicOptions<T, TR|Promise<TR>>;
export type VariadicOptions<T, TR> = BaseVariadicOptions<T, TR|Promise<TR>>;
export interface BaseVariadicOptions<T, TR> extends Options {
    toDiscriminant?: (...args: T[]) => string;
    methods?: Methods<(...args: Array<T|Captures|((...args: T[]) => TR)>) => TR>;
    // TODO:              ^--- the `...args` type is best effort, but really needs to be:
    //                (...args: T[], captures: {[name: string]: string}, next: Next)
}





export interface Methods<TMethod extends Function> {
    [predicate: string]: TMethod|TMethod[];
}





export interface Captures {
    [captureName: string]: string;
}
