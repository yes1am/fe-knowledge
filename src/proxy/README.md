## Proxy

MDN: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy

> Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等

### 1. Proxy

**结论1: Proxy 创建了对象的代理，但是访问原对象，是不会触发 get 的:**  

```js
const handler = {
  get(obj, prop) {
    console.log('get');
    return prop in obj ? obj[prop] : 37;
  },
};

const a = {};
const p = new Proxy(a, handler);
console.log(p.a);  // 打印 get，37
console.log(a.a);  // 只打印 undefined, 不打印 37
```

也就是说，后续通过 p 来访问 a 的属性是会走 proxy handler 的逻辑的，但是直接通过 a 来访问属性，不会走 proxy handler 的逻辑。


**结论2: Proxy 创建了对象的代理，对 Proxy 对象的操作，会改变原对象**  

```js
const handler = {
  get(obj, prop) {
    return prop in obj ? obj[prop] : 37;
  },
};

const a = {};
const p = new Proxy(a, handler);
p.a = 1;
p.b = undefined;

console.log(p.a, p.b); // 1, undefined
console.log('c' in p, p.c); // false, 37
console.log(a);  // { a: 1, b: undefined }
```

即对对象 p 的修改，也改变了原对象 a

### 2. defineProperty

注意，使用 defineProperty 时，内部不能使用 obj.key 再次访问属性，否则会**栈溢出**
```js
const data = {
  name: '',
};

Object.defineProperty(data, 'name', {
  get() {
    console.log('get');
    return data.name;  // 栈溢出，因为此时获取属性值，则又会进入 get() 方法内
  },
});

console.log(data.name);
```

而应该这样使用:
```js
let value = '姓名1';
const data = {
};
Object.defineProperty(data, 'name', {
  get() {
    return value;
  },
  set(newValue) {
    value = newValue;
  },
  enumerable: true,
  configurable: true,
});

console.log(data.name);  // 姓名 1
data.name = '姓名2';
console.log(data.name);  // 姓名 2
```

### 3. Reflect

使用:
```js
const data = {
  name: '123',
};

const p = new Proxy(data, {
  get(obj, prop) {
    console.log('get');
    // return prop in obj ? obj[prop] : 37;   // 使用 obj[key] 和 使用 Reflect 的效果是一样的
    return Reflect.has(obj, prop) ? Reflect.get(obj, prop) : 37;
  },
});
```

既然使用 `对象[属性]` 就能取到值，那为什么要有 Reflect 呢？

*贺师俊的知乎回答*

> JavaScript 语言内置的 Reflect 对象上的函数是为 Proxy 准备的，Proxy 的 handler 的各种 trap 分别对应 Reflect 上的同名方法。（这也是为什么与 Proxy 无关的反射相关特性将不会放到 Reflect 对象上。）

*阮一峰的回答*  

1. 将Object对象的一些明显属于语言内部的方法（比如Object.defineProperty），放到Reflect对象上
2. 修改某些Object方法的返回结果，让其变得更合理。比如，`Object.defineProperty(obj, name, desc)` 在无法定义属性时，会抛出一个错误，而 `Reflect.defineProperty(obj, name, desc)` 则会返回 `false`
3. 让 Object 操作都变成函数行为。某些 Object 操作是命令式，比如 `name in obj` 和 `delete obj[name]`，而 `Reflect.has(obj, name)` 和 `Reflect.deleteProperty(obj, name)` 让它们变成了函数行为
4. Reflect 对象的方法与 Proxy 对象的方法一一对应，只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法

**参考:**
1. ES6设计反射Reflect的意义是什么：https://www.zhihu.com/question/276403215
2. 阮一峰 ES6：https://www.bookstack.cn/read/es6-3rd/spilt.1.docs-reflect.md


### 4. Proxy 和 defineProperty 的优劣

1. defineProperty 无法监听数组变更, 比如无法监听 push。但 proxy 可以

**proxy:**  
```js
const data = [1];
const p = new Proxy(data, {
  get(obj, prop) {
    console.log('get', prop);
    return Reflect.has(obj, prop) ? Reflect.get(obj, prop) : 37;
  },
  set(obj, prop, value) {
    console.log('set', prop);
    obj[prop] = value;
    // 表示成功
    return true;
  },
});

p.push(2);

// 打印
// get push
// get length
// set 1
// set length
```

**defineProperty:**  
```js
const data = [1];
const tempData = [1];

Object.keys(data).forEach((key) => {
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get: () => {
      console.log('get');
      return tempData[key];
    },
    set: (val) => {
      console.log('set');
      tempData[key] = val;
    },
  });
});

console.log(data[0]); // 打印 get, 1
console.log(data[0] = 2);  // 打印 set, 2
console.log(data[0]); // 打印 get, 2
data.shift();  // 打印 get
data.push(100); // 无打印，即无法监听 push 
```


**参考:**
1. Proxy 比 defineproperty 优劣如何: https://juejin.cn/post/6844903601416978439#heading-15
2. 为什么defineProperty不能检测到数组长度的“变化”: https://juejin.cn/post/6844903614096343047