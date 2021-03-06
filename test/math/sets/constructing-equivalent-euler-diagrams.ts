import {expect} from 'chai';
import {NormalPredicate} from 'multimethods/math/predicates';
import {EulerDiagram, EulerSet} from 'multimethods/math/sets';





describe('Constructing equivalent euler diagrams', () => {

    let tests = [
        ['∅', 'foo', 'bar', 'f{chars}', '*o'],
        ['**', '/f**', '/foo/*', '/foo', '/*o', '/foo'],
        ['a', 'b', 'c', 'd', 'e', 'f', '∅'],
        ['a', 'a', 'a', 'a', 'a', 'a'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*', '∅', 'a/b', 'a/*', '*/b/b'],
        ['*A*', '*B*', '*BB*'],
        ['*A*', '*BB*', '*B*'],
        ['*A*S*', '*B*', '*A*M*', '*B*M*'],
        ['*A*I*', '*B*', '*A*T*', '*B*I*T*'],
        ['*A*', '*B*', '*C*', '*B*C*D*'],
        ['*A*', '*B*', '*C*', '*B*C*D*', '*C*D*'],
        ['*A*', '*B*', '*B*C*', '*A*B*C*D*'],
        ['*A*', '*B*', '*C*', '*D*', '*E*', 'A', 'B', 'C', 'D', 'E'],
        [
            '*A*I*S*W*', '*B*W*', '*A*I*M*W*', '*W*', '*B*M*W*', '*A*J*M*S*', '*A*T*W*',
            '*A*E*S*T*W*', '*B*I*M*S*T*U*W*Y*Z*', '*A*B*X*Z*', '*A*B*M*W*X*Y*', '*D*E*Q*',
        ],
        [
            // Highly overlapping pathological case (20 principal, 190 auxiliary)
            '*.A*', '*.B*', '*.C*', '*.D*', '*.E*', '*.F*', '*.G*', '*.H*', '*.I*', '*.J*',
            '*.K*', '*.L*', '*.M*', '*.N*', '*.O*', '*.P*', '*.Q*', '*.R*', '*.S*', '*.T*',
        ],
        [
            // Highly overlapping pathological case (40 principal, 764 auxiliary)
            '*A*', '*B*', '*C*', '*D*', '*E*', '*F*', '*G*', '*H*',
            '*K*', '*L*', '*M*', '*N*', '*O*', '*P*', '*Q*', '*R*',
            '*0*', '*1*', '*2*', '*3*', '*4*', '*5*', '*6*', '*7*',
            '*@A*', '*@B*', '*@C*', '*@D*', '*@E*', '*@F*', '*@G*', '*@H*',
            '*A@*', '*B@*', '*C@*', '*D@*', '*E@*', '*F@*', '*G@*', '*H@*',
        ],
        [
            // Highly overlapping pathological case (80 principal, 2848 auxiliary)
            '*AA*', '*BB*', '*CC*', '*DD*', '*EE*', '*FF*', '*GG*', '*HH*',
            '*KK*', '*LL*', '*MM*', '*NN*', '*OO*', '*PP*', '*QQ*', '*RR*',
            '*00*', '*11*', '*22*', '*33*', '*44*', '*55*', '*66*', '*77*',
            '*A*Z*', '*B*Z*', '*C*Z*', '*D*Z*', '*E*Z*', '*F*Z*', '*G*Z*', '*H*Z*',
            '*K*Z*', '*L*Z*', '*M*Z*', '*N*Z*', '*O*Z*', '*P*Z*', '*Q*Z*', '*R*Z*',
            '*0*Z*', '*1*Z*', '*2*Z*', '*3*Z*', '*4*Z*', '*5*Z*', '*6*Z*', '*7*Z*',
            '*-*A*', '*-*B*', '*-*C*', '*-*D*', '*-*E*', '*-*F*', '*-*G*', '*-*H*',
            '*-*K*', '*-*L*', '*-*M*', '*-*N*', '*-*O*', '*-*P*', '*-*Q*', '*-*R*',
            '*-*0*', '*-*1*', '*-*2*', '*-*3*', '*-*4*', '*-*5*', '*-*6*', '*-*7*',
            '00*', '11*', '22*', '33*', '44*', '55*', '66*', '77*',
        ],
        [
            // Rarely overlapping, mostly superset/subset/disjoint (200 principal, 22 auxiliary)
            'a*', 'b*', 'c*', 'd*', 'e*', 'f*', 'g*', 'h*', 'i*', 'j*',
            'a/*', 'b/*', 'c/*', 'd/*', 'e/*', 'f/*', 'g/*', 'h/*', 'i/*', 'j/*',
            'a/a*', 'b/a*', 'c/a*', 'd/a*', 'e/a*', 'f/a*', 'g/a*', 'h/a*', 'i/a*', 'j/a*',
            'a/a*', 'a/b*', 'a/c*', 'a/d*', 'a/e*', 'a/f*', 'a/g*', 'a/h*', 'a/i*', 'a/j*',
            'a*/a*', 'b*/a*', 'c*/a*', 'd*/a*', 'e*/a*', 'f*/a*', 'g*/a*', 'h*/a*', 'i*/a*', 'j*/a*',
            'a/aa*', 'a/ab*', 'a/ac*', 'a/ad*', 'a/ae*', 'a/af*', 'a/ag*', 'a/ah*', 'a/ai*', 'a/aj*',
            'aa*', 'ab*', 'ac*', 'ad*', 'ae*', 'af*', 'ag*', 'ah*', 'ai*', 'aj*',
            'aa/*', 'ab/*', 'ac/*', 'ad/*', 'ae/*', 'af/*', 'ag/*', 'ah/*', 'ai/*', 'aj/*',
            'aa*/a*', 'ab*/a*', 'ac*/a*', 'ad*/a*', 'ae*/a*', 'af*/a*', 'ag*/a*', 'ah*/a*', 'ai*/a*', 'aj*/a*',
            'a/aaa*', 'a/aab*', 'a/aac*', 'a/aad*', 'a/aae*', 'a/aaf*', 'a/aag*', 'a/aah*', 'a/aai*', 'a/aaj*',
            'a*z', 'b*z', 'c*z', 'd*z', 'e*z', 'f*z', 'g*z', 'h*z', 'i*z', 'j*z',
            'a/*z', 'b/*z', 'c/*z', 'd/*z', 'e/*z', 'f/*z', 'g/*z', 'h/*z', 'i/*z', 'j/*z',
            'a/a*z', 'b/a*z', 'c/a*z', 'd/a*z', 'e/a*z', 'f/a*z', 'g/a*z', 'h/a*z', 'i/a*z', 'j/a*z',
            'a/a*z', 'a/b*z', 'a/c*z', 'a/d*z', 'a/e*z', 'a/f*z', 'a/g*z', 'a/h*z', 'a/i*z', 'a/j*z',
            'a*/a*z', 'b*/a*z', 'c*/a*z', 'd*/a*z', 'e*/a*z', 'f*/a*z', 'g*/a*z', 'h*/a*z', 'i*/a*z', 'j*/a*z',
            'a/aa*z', 'a/ab*z', 'a/ac*z', 'a/ad*z', 'a/ae*z', 'a/af*z', 'a/ag*z', 'a/ah*z', 'a/ai*z', 'a/aj*z',
            'aa*z', 'ab*z', 'ac*z', 'ad*z', 'ae*z', 'af*z', 'ag*z', 'ah*z', 'ai*z', 'aj*z',
            'aa/*z', 'ab/*z', 'ac/*z', 'ad/*z', 'ae/*z', 'af/*z', 'ag/*z', 'ah/*z', 'ai/*z', 'aj/*z',
            'aa*/a*z', 'ab*/a*z', 'ac*/a*z', 'ad*/a*z', 'ae*/a*z', 'af*/a*z', 'ag*/a*z', 'ah*/a*z', 'ai*/a*z', 'a*/a*z',
            'a/aaa*z', 'a/aab*z', 'a/aac*z', 'a/aad*z', 'a/aae*z', 'a/aaf*z', 'a/aag*z', 'a/aah*z', 'a/aai*z', 'a/aj*z',
        ],
    ];

    tests.forEach(test => {
        let testName = test.join(', ');
        if (testName.length > 60) testName = testName.slice(0, 60) + '...';
        testName = `${test.length} items (${testName})`;
        it(testName, () => {
            let predicates = test;
            let ed1: EulerDiagram;
            let ed2: EulerDiagram;
            let attempt = () => {
                // Construct an ED from the given predicates in the given order and in reverse order.
                ed1 = new EulerDiagram(predicates, isUnreachable);
                ed2 = new EulerDiagram(predicates.reverse(), isUnreachable);
            };

            // The two EDs should represent identical DAGs.
            expect(attempt).not.to.throw();
            expect(setToObj(ed1!.universalSet)).to.deep.equal(setToObj(ed2!.universalSet));
        });
    });
});





/** Helper function that converts an EulerDiagram to a simple nested object with predicate sources for keys */
function setToObj(set: EulerSet): {} {
    return set.subsets.reduce(
        (obj, subset) => {
            let key = subset.predicate as string;
            if (!subset.isPrincipal) key = `[${key}]`;
            obj[key] = setToObj(subset);
            return obj;
        },
        {}
    );
}





// TODO: temp testing...
function isUnreachable(p: NormalPredicate) {

    // Only consider the form *A*B*C*...*
    if (p.length < 3) return;
    if (p.charAt(0) !== '*' || p.charAt(p.length - 1) !== '*') return;
    if (p.indexOf('**') !== -1 || p.indexOf('/') !== -1) return;

    // If the parts aren't strictly ordered, it's unreachable
    let parts = p.slice(1, -1).split('*');
    for (let i = 0, j = 1; j < parts.length; ++i, ++j) {
        if (parts[i] >= parts[j]) return true;
    }
    return;
}
