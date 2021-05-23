## interface 和 type 的区别

官方文档: https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-aliases

### 1. 什么是 type alias(类型别名)

type 为一个类型创建一个名称。type 有时候和 interface 很像，但是可以用 type 来命名基本类型、联合类型和元组，不然的话，这个类型就得手写。

比如**字面量的联合类型**:
```js
// 如果没有 type，我们得写两遍 'foo' | 'bar'
const a: 'foo' | 'bar' = 'foo';
const b: 'foo' | 'bar' = 'bar';

// 有了 type 之后，我们可以给 'foo' | 'bar' 起一个名字，以后用这个名字就行
type FooOrBar = 'foo' | 'bar';
const a: FooOrBar = 'foo';
const b: FooOrBar = 'bar';
```

type 实际上并**没有创造新的类型**，只是创建了一个名称，来引用一个类型。因此给一个基本类型取别名并不是很有用 (比如 `type A = string` 就没啥用，和你直接用 string 是一样的)。

### 2. type 和 interface 的共同点

1. 都可以用来描述一个对象或者函数

**描述对象:**
```js
// type
type Person = {
  age: number;
}

const a: Person = {
  age: 1,
}

// interface 
interface Person {
  age: number;
}

const a: Person = {
  age: 1,
}
```

**描述函数:**
```js
// interface 
interface Sum {
  (a: number, b: number): number;
}

const sum: Sum = (a, b) => a + b;

// type
type Sum = (a: number, b: number) => number;

const sum: Sum = (a, b) => a + b;
```

2. 都能用作泛型:
```js
// type
type Container<T> = { value: T };

const d: Container<string> = {
  value: '123'
}


// interface
interface Container1<T> {
  value: T;
}
const e: Container1<string> = {
  value: '123'
}
```

3. 互相可以进行类型的组合

**type 组合 type:** 
```js
type Name = {
  name: string;
}

type Age = {
  age: number;
}

type Person = Age & Name;
const a: Person = {
  age: 1,
  name: '1'
}
```

**interface 组合 interface:**
```js
interface Name {
  name: string;
}

interface Age {
  age: number;
}

interface Person extends Name, Age {
}

const a: Person = {
  age: 1,
  name: '1'
}
```

**type 组合 interface:**
```js
type Name = {
  name: string;
}

interface Age {
  age: number;
}

type Person = Name & Age; 

const a: Person = {
  age: 1,
  name: '1'
}
```

**interface 组合 type:**
```js
type Name = {
  name: string;
}

interface Age {
  age: number;
}

interface Person extends Name, Age {
}

const a: Person = {
  age: 1,
  name: '1'
}
```


### 3. type 和 interface 的不同点

正如我们提到的，type 别名 和 interface 有点类似，但是，其中会有些**微妙**的区别。

基本 type 具备 interface 的所有特性，主要的差异是，type 不能*重新被打开*来添加新的属性，而 interface 永远是*可以被扩展*的。

interface 可以进行扩展，当重复定义时会进行声明合并(W 类型同时具有 name 和 age 属性)。

```js
interface W {
  name: string;
}
interface W {
  age: string;
}

const a:W = {
  name: '1',
  age: '1'
}
```

而 type 重复定义会报错:

```js
// 报错
type W = {
  name: string;
}
type W = {
  age: string;
}
```

### 4. 总结

因为 interface 更接近 JS 对象的工作方式，对于扩展更加的开放，因此我们建议尽可能的使用 interface 而不是 type。

另一方面，如果你不能够使用 interface 来表示某些类型，你需要用联合或者元组类型时，type 更加适合。