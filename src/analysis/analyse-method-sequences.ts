import {MethodTableEntry, ParentNode, MethodSequence, MethodSequenceEntry} from './mm-node';
import isMetaMethod from '../util/is-meta-method';
import MMInfo from './mm-info';
import repeatString from '../util/string-repeat';
import {toIdentifierParts} from "../math/predicates";





// TODO: doc...
export default function analyseMethodSequences<T extends MethodTableEntry & ParentNode<T>>(mminfo: MMInfo<T>) {
    return mminfo.addProps(startNode => {
        let methodSequence = [] as MethodSequenceEntry<T>[];

        // TODO: explain method sequence... *All* applicable methods for the node's predicate in most- to least- specific order...
        for (let ancestorNode: T | null = startNode; ancestorNode !== null; ancestorNode = ancestorNode.parentNode) {
            ancestorNode.exactMethods.forEach((method, i) => {

                // Make an IdentifierPart for each method that is descriptive and unique accross the multimethod.
                let identifier = `${toIdentifierParts(ancestorNode!.exactPredicate)}${repeatString('ᐟ', i)}`;
                if (isMetaMethod(method) && (ancestorNode !== startNode || i > 0)) {
                    identifier = `${toIdentifierParts(startNode.exactPredicate)}ːviaː${identifier}`;
                }

                methodSequence.push({method, fromNode: ancestorNode as T & MethodSequence<T>, identifier});
            });
        }

        // The 'entry point' method is the one whose method we call to begin the cascading evaluation for a dispatch. It
        // is the least-specific meta-method, or if there are no meta-methods, it is the most-specific ordinary method.
        let entryPoint = methodSequence.filter(entry => isMetaMethod(entry.method)).pop() || methodSequence[0];

        // This one is for convenience.
        let identifier = methodSequence[0].identifier;

        return {methodSequence, entryPoint, identifier} as MethodSequence<T>;
    });
}