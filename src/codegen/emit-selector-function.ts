import Emitter from './emitter';
import {MMInfo, MMNode} from '../analysis';
import repeat from '../util/string-repeat';
import ThunkInfo from './thunk-info';
import {toIdentifierParts} from '../math/predicates';





// TODO: rewrite doc...
/**
 * Generates a function that, given a discriminant, returns the best-matching route executor from the given list of
 * candidates. The returned selector function is generated for maximum readability and efficiency, using conditional
 * constructs that follow the branches of the given `eulerDiagram`.
 * @param {EulerDiagram} eulerDiagram - The arrangement of patterns on which to base the returned selector function.
 * @returns {(address: string) => Function} The generated route selector function.
 */
export default function emitSelectorFunction(emit: Emitter, mminfo: MMInfo<MMNode>, thunkInfo: Map<MMNode, ThunkInfo>) {

    // Generate the combined source code for selecting the best thunk based on predicate-matching of the discriminant.
    let lines = [
        'function selectThunk(discriminant) {',
        ...emitThunkSelectorBlock(mminfo.rootNode, thunkInfo, 1),
        '}',
    ];
    emit(...lines);
}





/** Helper function to generate source code for the thunk selector function. */
function emitThunkSelectorBlock(node: MMNode, thunkInfo: Map<MMNode, ThunkInfo>, nestDepth: number) {

    // Make the indenting string corresponding to the given `nestDepth`.
    let indent = repeat('    ', nestDepth);

    // Recursively generate the conditional logic block to select among the given patterns.
    let lines: string[] = [];
    node.childNodes.forEach(node => {
        let condition = `${indent}if (isMatchː${toIdentifierParts(node.predicateInMethodTable)}(discriminant)) `;

        if (node.childNodes.length === 0) {
            lines.push(`${condition}return ${thunkInfo.get(node)!.name};`);
            return;
        }

        lines = [
            ...lines,
            `${condition}{`,
            ...emitThunkSelectorBlock(node, thunkInfo, nestDepth + 1),
            `${indent}}`
        ];
    });

    // Add a line to select the fallback predicate if none of the more specialised predicates matched the discriminant.
    lines.push(`${indent}return ${thunkInfo.get(node)!.name};`);
    return lines;
}
