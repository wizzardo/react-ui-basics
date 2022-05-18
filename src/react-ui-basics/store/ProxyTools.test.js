import {createProxy} from "./ProxyTools";

it('test proxy noop', () => {
    const user = {name: 'Bob'};
    const p = createProxy(user);
    expect(p.bake()).toBe(user);
});

it('test proxy change property', () => {
    const user = {name: 'Bob'};
    const p = createProxy(user);
    p.name = 'Tom'

    expect(user).toEqual({name: 'Bob'});
    expect(p.bake()).toEqual({name: 'Tom'});
});

it('test proxy add property', () => {
    const user = {name: 'Bob'};
    const p = createProxy(user);
    p.age = 16
    p.age = 32

    expect(user).toEqual({name: 'Bob'});
    expect(p.bake()).toEqual({name: 'Bob', age: 32});
});

it('test proxy delete property', () => {
    const user = {name: 'Bob'};
    const p = createProxy(user);
    delete p.name;

    expect(user).toEqual({name: 'Bob'});
    expect(p.bake()).toEqual({});
});

it('test proxy set null', () => {
    const user = {name: 'Bob'};
    const p = createProxy(user);
    p.name = null;
    expect(user).toEqual({name: 'Bob'});
    expect(p.bake()).toEqual({name: null});
});

it('test proxy inner properties access noop', () => {
    const user = {name: 'Bob', hobbies: ['chess']};
    const p = createProxy(user);

    const name = p.name;
    const firstHobby = p.hobbies[0];

    expect(p.bake()).toBe(user);
    expect(name).toBe('Bob');
    expect(firstHobby).toBe('chess');
});

it('test proxy change inner properties', () => {
    const user = {name: 'Bob', hobbies: ['chess']};
    const p = createProxy(user);

    p.hobbies.push('poker');

    expect(user).toEqual({name: 'Bob', hobbies: ['chess']});
    expect(p.bake()).toEqual({name: 'Bob', hobbies: ['chess', 'poker']});
});

it('test proxy change inner properties 2', () => {
    const user = {name: 'Bob', hobbies: ['chess']};
    const p = createProxy(user);

    p.hobbies = [...p.hobbies, 'poker'];

    expect(user).toEqual({name: 'Bob', hobbies: ['chess']});
    expect(p.bake()).toEqual({name: 'Bob', hobbies: ['chess', 'poker']});
});

it('test proxy change inner property to null', () => {
    const user = {name: 'Bob', hobbies: ['chess']};
    const p = createProxy(user);

    p.hobbies = null;

    expect(user).toEqual({name: 'Bob', hobbies: ['chess']});
    expect(p.bake()).toEqual({name: 'Bob', hobbies: null});
});

it('test proxy change inner properties 3', () => {
    const user = {name: 'Bob', hobbies: [{name: 'chess'}]};
    const p = createProxy(user);

    p.hobbies[0].name = 'poker';

    expect(user).toEqual({name: 'Bob', hobbies: [{name: 'chess'}]});
    expect(p.bake()).toEqual({name: 'Bob', hobbies: [{name: 'poker'}]});
});