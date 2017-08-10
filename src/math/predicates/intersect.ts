import isSubsetOf from './is-subset-of';
import NONE from './none';
import NormalPredicate from './normal-predicate';
import toNormalPredicate from './to-normal-predicate';





/**
 * Computes the intersection of the two given predicates. The intersection recognizes a string if and only if that
 * string is recognized by *both* given predicates. Because intersections cannot in general be expressed as a single
 * predicate, the result is given as an array of normalized predicates, to be interpreted as follows:
 * (1) An empty array. This means the arguments represent disjoint predicates.
 *     That is, there are no strings that are recognized by both arguments.
 *     Example: 'foo' ∩ 'bar' = []
 * (2) An array with one element. This means the intersection may be represented
 *     by a single predicate, whose normalized predicate is contained in the array.
 *     Example: 'a*' ∩ '*b' = ['a*b']
 * (3) An array with multiple elements. The array contains a list of mutually disjoint predicates, the union
 *     of whose recognized strings are precisely those strings that are recognized by both of the arguments.
 *     Example: 'test.*' ∩ '*.js' = ['test.js', 'test.*.js']
 * @param {NormalPredicate} a - lhs predicate to be intersected.
 * @param {NormalPredicate} b - rhs predicate to be intersected.
 * @returns {NormalPredicate} - The normalized predicate representing the intersection of `a` and `b`.
 */
export default function intersect(a: NormalPredicate, b: NormalPredicate): NormalPredicate {

    // TODO: temp testing...
    let t0 = Date.now();

    // Compute the intersections of every alternative of `a` with every alternative of `b`.
    let aAlts = a === NONE ? [] : a.split('|') as NormalPredicate[];
    let bAlts = b === NONE ? [] : b.split('|') as NormalPredicate[];
    let allIntersections = [] as NormalPredicate[];
    for (let altA of aAlts) {
        for (let altB of bAlts) {
            let moreIntersections = getAllIntersections(altA, altB);
            allIntersections = allIntersections.concat(moreIntersections);
        }
    }

    // TODO: temp testing...
    let t1 = Date.now();

    // Finalise the result.
    if (allIntersections.length === 0) return NONE;
    let result = toNormalPredicate(allIntersections.join('|'));

    // TODO: temp testing...
    let t2 = Date.now();
    let d1 = (t1 - t0) / 1000.0;
    let d2 = (t2 - t1) / 1000.0;
    if (d1 + d2 > 1) {
        console.log(`\n\n\n${a} ∩ ${b}`);
        console.log(`intersection count: ${allIntersections.length}`);
        console.log(`getAllIntersections time: ${d1}s`);
        console.log(`toNormalPredicate time: ${d2}s`);

        // let alts = new SetOfAlternatives();
        // alts.addAll(allIntersections);
        // console.log(alts.values());
    }

    console.log('CALL COUNT: ' + CALL_COUNT);
    return result;
}





// TODO: temp testing...
let CALL_COUNT = 0;





/**
 * Computes all predicates that may be formed by unifying wildcards/globstars from one predicate with
 * substitutable substrings of the other predicate, such that all characters from both predicates are
 * present and in order in the result. All the predicates computed in this way represent valid
 * intersections of `a` and `b`. However, some may be duplicates or subsets of others.
 * @param {NormalPredicate} a - a normalised predicate.
 * @param {NormalPredicate} b - a normalised predicate.
 * @returns {NormalPredicate[]} - a list of normalised predicates that represent valid intersections of `a` and `b`.
 */
function getAllIntersections(a: NormalPredicate, b: NormalPredicate): NormalPredicate[] {

    // Ensure `a` always precedes `b` lexicographically. Intersection is commutative,
    // so sorting `a` and `b` reduces the solution space without affecting the result.
    if (a > b) [b, a] = [a, b];

    // If an intersection was already computed for these `a` and `b` values, return the previously memoised result.
    // All code paths beyond this point memoise the result before returning it, so it becomes available to future calls.
    let memoisedResult = MEMOISER.get(a, b);
    if (memoisedResult) return memoisedResult;
    ++CALL_COUNT;

    // CASE 1: Either predicate is empty. An empty predicate intersects only with
    // another empty predicate or a single wildcard/globstar. Since an empty string
    // precedes all other strings lexicographically, we just check if `a` is empty.
    if (a === '') {
        if (b === '' || b === '*' || b === '**') {
            return MEMOISER.set(a, b, ['' as NormalPredicate]);
        }
        else {
            return MEMOISER.set(a, b, []);
        }
    }

    // CASE 2: Either predicate is found to be a subset of the other, using
    // simple pattern matching. The result in this case is the subset predicate.
    if (isSubsetOf(a, b)) {
        return MEMOISER.set(a, b, [a]);
    }
    if (isSubsetOf(b, a)) {
        return MEMOISER.set(a, b, [b]);
    }

    // CASE 3: Both predicates start with at least one literal character. If the starting
    // literals have no common prefix, the predicates are disjoint. Otherwise, we determine
    // the intersection by recursively intersecting everything after the common prefix.
    let aFirstToken = getFirstToken(a);
    let bFirstToken = getFirstToken(b);
    if (aFirstToken.charAt(0) !== '*' && bFirstToken.charAt(0) !== '*') {
        let commonPrefix = longestCommonPrefix(aFirstToken, bFirstToken);
        if (commonPrefix.length === 0) return MEMOISER.set(a, b, []); // Predicates are disjoint

        let aSuffix = a.slice(commonPrefix.length) as NormalPredicate;
        let bSuffix = b.slice(commonPrefix.length) as NormalPredicate;
        let result = getAllIntersections(aSuffix, bSuffix).map(u => commonPrefix + u) as NormalPredicate[];
        return MEMOISER.set(a, b, result);
    }

    // CASE 4: At least one of the predicates starts with a wildcard or globstar. Let's call this predicate p1, and
    // the other predicate p2. We split p1 into a [prefix, suffix] pair, where p1.prefix is p1's leading wildcard
    // or globstar, and p1.suffix is the remainder of p1. We now consider *every* [prefix, suffix] pair of p2 such that
    // p1.prefix unifies with p2.prefix. We now determine the intersection by recursively intersecting p1.suffix
    // against each remaining p2.suffix, and accumulating the results.
    let [p1, p2] = aFirstToken === '**' || bFirstToken.charAt(0) !== '*' ? [a, b] : [b, a];
    let p1Prefix = (p1 === a ? aFirstToken : bFirstToken) as string as '*'|'**';
    let p1Suffix = p1.slice(p1Prefix.length) as NormalPredicate;

    // Obtain all splits for p2. When unifying splits against '*', do strength
    // reduction on split prefixes containing '**' (ie replace '**' with '*').
    let p2Pairs = getPredicateSplits(p2, p1Prefix);

    // Compute and return intersections for all valid unifications. This is a recursive operation.
    let result1 = [] as NormalPredicate[];
    for (let [p2Prefix, p2Suffix] of p2Pairs) {
        let more = getAllIntersections(p1Suffix, p2Suffix).map(u => p2Prefix + u) as NormalPredicate[];
        result1 = result1.concat(more);
    }

    // TODO: temp testing... dedupe
    let result2 = result1.length === 0 ? [] : toNormalPredicate(result1.join('|')).split('|') as NormalPredicate[];
    return MEMOISER.set(a, b, result2);
}





function getFirstToken(p: NormalPredicate) {
    if (p.length === 0) return p;
    let literalCount = p.indexOf('*');
    if (literalCount === -1) return p; // The whole of p is a literal
    if (literalCount === 0) return (p.length > 1 && p.charAt(1) === '*' ? '**' : '*') as NormalPredicate;
    if (literalCount === 1) return p.charAt(0) as NormalPredicate;
    return p.slice(0, literalCount) as NormalPredicate;
}





// TODO: doc helper...
function longestCommonPrefix(p1: NormalPredicate, p2: NormalPredicate) {
    let shorter = p1.length < p2.length ? p1 : p2;
    let shorterLength = shorter === p1 ? p1.length : p2.length;
    for (let i = 0; i < shorterLength; ++i) {
        if (p1.charAt(i) === p2.charAt(i)) continue;
        return p1.slice(0, i) as NormalPredicate;
    }
    return shorter;
}





/**
 * Returns an array of all the [prefix, suffix] pairs into which the predicate `p` may be split, such that `prefix`
 * is a subset of `prefixUnifier`. Splits that occur on a wildcard/globstar have the wildcard/globstar on both sides
 * of the split (i.e. as the last character(s) of the prefix and the first character(s) of the suffix).
 * E.g., 'ab**c' splits into: ['','ab**c'], ['a','b**c'], ['ab**','**c'], and ['ab**c',''].
 */
function getPredicateSplits(p: NormalPredicate, prefixUnifier: '*'|'**') {

    // TODO: temp testing...
    DUMP[p] = (DUMP[p] || 0) + 1;



    let result = [] as string[][];
    let prefix = '';
    let suffix = p as string;
    let strengthReduce = prefixUnifier === '*';
    while (true) {
        // Before we issue the next [prefix, suffix] pair, check whether `suffix` starts with a wildcard or globstar.
        let splitType: ''|'*'|'**';
        splitType = suffix.charAt(0) !== '*' ? '' : suffix.charAt(1) === '*' ? '**' : '*';

        // If so, the wildcard/globstar needs to *also* appear at the end of the prefix for this pair. Furthermore,
        // if the prefix is being unified with a wildcard (not a globstar), then we strenth-reduce globstars to
        // wildcards on appending them to the prefix, so that the prefix always unifies with `prefixUnifier`.
        if (splitType) prefix += (strengthReduce ? '*' : splitType);

        // Now we can issue the pair.
        result.push([prefix, suffix]);

        // If the pair just issued was split on a wildcard/globstar, the next split comes *after* the char following it.
        if (splitType) suffix = suffix.slice(splitType.length);

        // There are two possible stopping conditions:
        // 1. we just issued the last possible pair (i.e. `suffix` is empty)
        // 2. the remaining prefixes cannot possibly unify with `prefixUnifier`
        if (suffix === '' || (prefixUnifier === '*' && suffix.charAt(0) === '/')) break;

        // If we get here, we know the suffix is non-empty. Furthermore, the suffix must start with a literal, since:
        // - if the just-issued suffix *did* start with a wildcard/globstar, we sliced it off right after issuing it
        // - a wildcard/globstar cannot be followed by another wildcard/globstar
        // - the suffix is non-empty, so the only possibility left is that it starts with a literal.
        // We transfer this literal from the start of the suffix to the end of the prefix, and iterate again.
        prefix += suffix.charAt(0);
        suffix = suffix.slice(1);
    }
    return result as Array<[NormalPredicate, NormalPredicate]>;
}

// TODO: temp testing...
let DUMP = {} as any;
setTimeout(() => {
    console.log(DUMP, null, 4);
}, 5000);





// TODO: doc...
class Memoiser {
    get(a: NormalPredicate, b: NormalPredicate) {
        let value: NormalPredicate[]|undefined;
        let map2 = this.map.get(a);
        if (map2) value = map2.get(b);
        //console.log(`MEMO ${value ? 'HIT' : '--miss--'}: ${a + '   :   ' + b} ==> ${JSON.stringify(value || '')}`);
        return value;
    }
    set(a: NormalPredicate, b: NormalPredicate, value: NormalPredicate[]) {
        //console.log(`MEMO set: ${a + '   :   ' + b} ==> ${JSON.stringify(value)}`);
        let map2 = this.map.get(a);
        if (!map2) this.map.set(a, map2 = new Map());
        map2.set(b, value);
        return value;
    }
    private map = new Map<NormalPredicate, Map<NormalPredicate, NormalPredicate[]>>();
}
const MEMOISER = new Memoiser();
//const MEMOISER2 = new Memoiser();
