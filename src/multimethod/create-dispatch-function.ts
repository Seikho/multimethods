import computePredicateLineages from './compute-predicate-lineages';
import computePredicateLineagesII from './compute-predicate-lineages-ii';
import generateMultimethod from './codegen/generate-multimethod';
import MultimethodOptions from './multimethod-options';
import normaliseRules from './normalise-rules';
import {EulerDiagram} from '../set-theory/sets';
import {validateEulerDiagram} from './validate';
import debug, {VALIDATE} from '../util/debug';





// TODO: review all comments here - eg refs to 'RuleSet' should be updated to Multimethod, etc
/** Internal function used to generate the RuleSet#execute method. */
export default function createDispatchFunction(normalisedOptions: MultimethodOptions) {

    // TODO: ...
    let normalisedRules = normaliseRules(normalisedOptions.rules);

    // Generate a taxonomic arrangement of all the predicate patterns that occur in the rule set.
    let eulerDiagram = new EulerDiagram(normalisedRules.map(rule => rule.predicate));

    // TODO: explain...
    if (debug.enabled) {
        let problems = validateEulerDiagram(eulerDiagram, normalisedOptions);
        problems.forEach(problem => debug(`${VALIDATE} %s`, problem));
    }

    // Find every possible functionally-distinct route that any discriminant can take through the rule set.
    let eulerDiagramWithLineages = computePredicateLineages(eulerDiagram, normalisedRules);
    let eulerDiagramWithLineagesII = computePredicateLineagesII(eulerDiagramWithLineages);

    // TODO: ...
    let dispatchFunction = generateMultimethod(eulerDiagramWithLineagesII, normalisedOptions);
    return dispatchFunction;
}
