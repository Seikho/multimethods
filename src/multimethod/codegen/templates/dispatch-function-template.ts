import RouteExecutor from '../route-executor';





// TODO: these must be in the lexical environment when the template is eval'd:
// TODO: explain each of these in turn...
let CONTINUE: any;
let toDiscriminant: (...args: any[]) => string;
let fatalError: (error: string) => never;

// TODO: these are replacement placeholders.
// TODO: explain each of these in turn...
let SELECT_ROUTE: (discriminant: string) => RouteExecutor;
// FUNCTION_NAME is also replaced





// TODO: explain important norms in the template function...
// TODO: put more explanatory comments inside. They will be stripped out during emit to maximise inlining potential
export default function FUNCTION_NAME(ELLIPSIS_MMARGS: any[]) {
    let discriminant = toDiscriminant(ELLIPSIS_MMARGS);
    let executeRoute = SELECT_ROUTE(discriminant);
    let result = executeRoute(discriminant, CONTINUE, ELLIPSIS_MMARGS);
    if (result === CONTINUE) return fatalError('UNHANDLED');
    return result;
};