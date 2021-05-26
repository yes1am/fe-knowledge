## Symbol

> 每个从 Symbol() 返回的 symbol 值都是唯一的

```js
Symbol('aa') === Symbol('aa') // false
```

如何枚举出 Symbol 类型的属性: `Object.getOwnPerpertySymbols()`, `Reflect.ownKeys()`
```js
const name = Symbol('name');
const obj = {
  a: '1',
  [name]: 'michael'
}
console.log(Object.keys(obj))  // ['a']
Object.getOwnPropertySymbols(obj)  // [Symbol(name)]
Reflect.ownKeys(obj)  // ['a', Symbol(name) ]
```

### 面试题

1. 如何枚举 Symbol 类型的属性？ 答案: `Object.getOwnPerpertySymbols()`, `Reflect.ownKeys()`

### 参考资料

1.  ES6 Symbol 到底有什么用？https://harttle.land/2018/10/14/whats-symbols-for.html#header-1
2.  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol