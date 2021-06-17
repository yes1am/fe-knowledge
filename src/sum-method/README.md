# sum 函数

```js
sum(1)(2).valueOf() === 3
sum(1)(2)(3)(4).valueOf() === 10
```

要以上两个等式成立，那么:  

```js
sum(1)(2) 返回的值必须有 valueOf 方法，不然 sum(1)(2).valueOf() 会报错
sum(1)(2) 必须还是一个函数，不然 sum(1)(2)(3) 会报错
```

由于我们可以给函数添加属性，但我们无法让一个非函数进行调用。因此我们可以确定, 返回的是一个带有 **valueOf** 属性的**函数**，因此:  

```js
function sum(...args) {
  let arg = [...args];
  function sum1(...args1) {
    arg = arg.concat(args1);
    return sum1;
  }
  sum1.valueOf = () => arg.reduce((a, b) => a + b);
  return sum1;
}
```