import {configure} from './config';
import {getLongestCommonPrefix, isPromiseLike}  from './util';
export {configure, Options} from './config';

// TODO: export the later ones? They are only used in unit tests. Could we do equivalent tests through public API?
export {parsePredicatePattern, PredicateAST, toIdentifier, toMatchFunction, toNormalPredicate, ANY, toPredicate} from './set-theory/predicates';


export {default as intersect} from './set-theory/sets/intersect';


export {EulerDiagram, Set} from './set-theory/sets';





// TODO: temp testing...
export * from './multimethod';





// TODO: temp testing...
export function meta<T extends Function>(fn: T) {
    const IS_META = '__meta';
    // TODO: use a symbol...
    // TODO: ensure it is a function, etc
    (fn as any)[IS_META] = true;
    return fn;
}





// TODO: doc...
export const util = {
    getLongestCommonPrefix,
    isPromiseLike
};





// TODO: doc...
configure({warnings: 'default'});
