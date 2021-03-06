import * as fatalError from '../../util/fatal-error';
import hasNamedCaptures from './has-named-captures';
import Predicate from './predicate';





// NB: dsl-grammar is a .js file that is built from a pegjs grammar. TSC can't see it, so `import` can't be used here.
// tslint:disable-next-line:no-var-requires
const grammar: { parse(text: string): string; } = require('./dsl-grammar');





/**
 * Verifies that `source` is a valid predicate and returns abstract syntax information about the predicate.
 * Throws an error if `source` is not a valid predicate. Consult the documentation for further information
 * about the predicate DSL syntax [1].
 * [1] TODO...
 * @param {string} source - the source string to be parsed as a predicate.
 * @returns {PredicateAST} an object containing details about the successfully parsed predicate.
 */
export default function toPredicate(source: string): Predicate {
    try {
        // This is just a pass/fail parser. There is no meaningful result for success. NB: may throw.
        grammar.parse(source);

        // Enforce current rule that a predicate can't have both alternatives and named captures.
        let hasAlternatives = source.indexOf('|') !== -1;
        let hasNamedCaps = hasNamedCaptures(source as Predicate);
        if (hasAlternatives && hasNamedCaps) {
            throw new Error('Predicate cannot contain both alternation and named captures');
        }

        // If we get here, `source` is a valid predicate.
        return source as Predicate;
    }
    catch (ex) {
        let startCol = ex.location ? ex.location.start.column : 0;
        let endCol = ex.location ? ex.location.end.column : source.length;
        if (endCol <= startCol) endCol = startCol + 1;
        let indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        return fatalError.PREDICATE_SYNTAX(`${ex.message}:\n${source}\n${indicator}`);
    }
}





// TODO: revise comments...
/** Information associated with a successfully parsed predicate. */
/**
 * The predicate string in its normalized form (i.e. all named captures replaced with '*' and '**').
 * Any two predicates with the same signature are guaranteed to match the same set of strings.
 */
