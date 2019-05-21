
# Router

#### Basic usage:

```javascript
const A = ()=> <div>A</div>;
<Route path="/a"> <A/> </Route>;
```

#### With variables:

```javascript
const AB = ({a, b})=> <div>{a} {b}</div>;
<Route path="/:a/:b"> <AB/> </Route>;
```

#### With optional variables:

```javascript
const AB = ({a = 'a', b = 'b'})=> <div>{a} {b}</div>;
<Route path="/:a?/:b?"> <AB/> </Route>;
```

#### With not matcher:

```javascript
const A = ()=> <div>A</div>;
const NotA = ()=> <div>not A</div>;
<div>
    <Route path="/a"> <A/> </Route>
    <Route path="/!a"> <NotA/> </Route>
</div>
```

#### With any matcher:

```javascript
const A = ()=> <div>A</div>;
<div>
    <Route path="/*"> <A/> </Route>
</div>
```

#### With nested routes:

```javascript
const A = (a)=> <div>{a}</div>;
const Nested = ()=> <Route path="/*/:a"> <A/> </Route>;

<div>
    <Route path="/nested/*"> <Nested/> </Route>
</div>
```

