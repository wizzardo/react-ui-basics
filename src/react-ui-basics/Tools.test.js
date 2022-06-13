import {isDifferent} from "./Tools";

const toString = (it) => {
    if (typeof it === 'object')
        return JSON.stringify(it)
    else
        `${it}`
}

expect.extend({
    toBeDifferentTo(a, b) {
        return isDifferent(a, b) ? ({
            pass: true,
            message: () => `Expected ${toString(a)} to be same as ${toString(b)}`
        }) : ({
            pass: false,
            message: () => `Expected ${toString(a)} not to be same as ${toString(b)}`
        });
    }
});
expect.extend({
    toBeSameAs(a, b) {
        return !isDifferent(a, b) ? ({
            pass: true,
            message: () => `Expected ${toString(a)} to be different to ${toString(b)}`
        }) : ({
            pass: false,
            message: () => `Expected ${toString(a)} not to be different to ${toString(b)}`
        });
    }
});


const same = (a, b) => {
    expect(a).toBeSameAs(b)
};

const different = (a, b) => {
    expect(a).toBeDifferentTo(b)
};

it('test isDifferent', () => {
    same(1, 1);
    different(1, 2);
    different(1, []);
    different(1, '1');
    same(Infinity, Infinity);
    different(Infinity, -Infinity);
    different(NaN, undefined);
    different(NaN, null);
    different(NaN, NaN);
    different(1, -1);
    same(0, -0);

    same(null, null);
    same(void 0, undefined);
    same(undefined, undefined);
    different(null, undefined);
    different('', null);
    different(0, null);

    same(true, true);
    same(false, false);
    different(true, false);
    different(0, false);
    different(1, true);

    same('a', 'a');
    different('a', 'b');


    same({}, {});
    same({a: 1, b: 2}, {a: 1, b: 2});
    same({b: 2, a: 1}, {a: 1, b: 2});

    different({a: 1, b: 2, c: []}, {a: 1, b: 2});
    different({a: 1, b: 2}, {a: 1, b: 2, c: []});
    different({a: 1, c: 3}, {a: 1, b: 2});

    same({a: [{b: 1}]}, {a: [{b: 1}]});
    different({a: [{b: 2}]}, {a: [{b: 1}]});
    different({a: [{c: 1}]}, {a: [{b: 1}]});

    different([], {});
    different({}, []);
    different({}, null);
    different({}, undefined);

    different({a: void 0}, {});
    different({}, {a: undefined});
    different({a: undefined}, {b: undefined});


    same([], []);
    same([1, 2, 3], [1, 2, 3]);
    different([1, 2, 4], [1, 2, 3]);
    different([1, 2], [1, 2, 3]);

    same([{a: 1}, {b: 2}], [{a: 1}, {b: 2}]);
    different([{a: 2}, {b: 2}], [{a: 1}, {b: 2}]);

    different({'0': 0, '1': 1, length: 2}, [0, 1]);
});