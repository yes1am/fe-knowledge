# event loop

**简化版描述:**  
1. 一段代码中，js 从上到下执行，遇到同步代码会立刻执行，遇到 `setTimeout` 则加入到宏任务队列(**队列的原则是先进先出**)中，遇到 `new Promise().then` 则加入到微任务队列 (不过 **Promise( 逻辑代码 )** 中的**逻辑代码**会同步执行)。
2. 当同步任务执行完之后，会一直执行微任务队列里的任务，直到微任务队列为空。因此如果在微任务队列执行过程中有新的微任务加入，那么**新增加的微任务也会在这次循环中被执行，即一定是先于下一个宏任务的**。
3. 当所有的微任务执行完毕，会找宏任务队列中的第一个任务开始执行。这个宏任务中的同步代码会立刻执行，遇到 `setTimeout` 则加入到宏任务队列中，遇到 `new Promise().then` 则加入到微任务队列... **后续同第 1 步**

## 1. 测试题及其解释

### 1.1 同步任务 + 微任务 new Promise
```js
new Promise((resolve) => {
  console.log('1');
  resolve();
}).then(() => {
  console.log('2');
}).then(() => {
  console.log('3');
});

new Promise((resolve) => {
  console.log('a');
  resolve();
}).then(() => {
  console.log('b');
});
```

执行结果: `1,a,2,b,3`  

1. 首先 `console.log('1')` 和 `console.log('a')` 作为 `new Promise` 里的代码，会**同步依次**执行。
2. 在执行 `console.log('1')` 完成后打印 `1`，同时会把 `console.log(2)` 放到微任务队列中，此时微任务队列为 `[console.log(2)]`
3. 在执行 `console.log('a')` 完成后打印 `a`，同时会把 `console.log('b')` 放到微任务队列中，此时微任务队列为 `[console.log(2), console.log('b')]`, (*假设数组第一个元素为队列头，出队列是从队列头开始出*)
4. 此时所有的同步代码都执行完毕，发现微任务队列不为空，于是从队列头取任务出来执行，执行 `console.log(2)` 打印 `2`, 同时会把 `console.log(3)` 放入微任务队列，此时微任务队为: `[console.log('b'), console.log(3)]`
5. 继续从微任务队列取任务，于是先执行 `console.log('b')`, 再执行 `console.log(3)`, 分别打印 `b`, `3`

因此最终执行结果为 `1,a,2,b,3`

## 1.2 同步任务 + 微任务 new Promise + setTimeout 宏任务

```js
new Promise((resolve) => {
  console.log('1');
  resolve();
}).then(() => {
  console.log('2');
}).then(() => {
  console.log('3');
});

setTimeout(() => {
  console.log(4);
}, 0);

new Promise((resolve) => {
  console.log('a');
  resolve();
}).then(() => {
  console.log('b');
});
```

同 1.1 一样，区别在于 setTimeout 里的回调会被放到宏任务队列中，因此会在所有的微任务执行完成之后，再执行 `console.log(4)`.

因此最终打印结果为: `1,a,2,b,3,4`

### 1.3 async await

建议购买 [极客时间/浏览器工作原理与实践](https://time.geekbang.org/column/article/119046) 课程，并查看第 `15-20` 课.

`async/await` 的底层原理是 `Promise` 与 `generator 生成器` 的使用，而 `generator` 会涉及到**让出线程**的一个概念。如下:  

```js
function* genDemo() {
  console.log('开始执行第一段');
  yield 'generator 1';

  console.log('开始执行第二段');
  yield 'generator 2';

  console.log('执行结束');
  return 'generator 3';
}

console.log('main 0');
const gen = genDemo();
console.log(gen.next().value);

console.log('main 1');
console.log(gen.next().value);

console.log('main 2');
console.log(gen.next().value);

console.log('main 3');
```

打印结果为: 
```js
main 0
开始执行第一段
generator 1

main 1
开始执行第二段
generator 2

main 2
执行结束
generator 3

main 3
```

即:  
1. 当调用 gen.next() 时，会执行生成器内部的函数，直到遇到 `yield`
2. 遇到 `yield` 之后, 会将 `yield` 后面的内容返回给 `gen.next().value`, 比如 `yield 12` 则 `gen.next().value` 为 `12`, 同时会**暂停生成器内部函数的继续执行，转而执行生成器之外的函数。比如 console.log('main 1')**

有兴趣也可以看看 [co](https://github.com/tj/co) 源码, 它可以让生成器**不用手动调用** `.next()`，而一直执行下去。如下:
```js
co(function *(){
  // resolve multiple promises in parallel
  var a = Promise.resolve(1);
  var b = Promise.resolve(2);
  var c = Promise.resolve(3);
  var res = yield [a, b, c];
  console.log(res);
  // => [1, 2, 3]
}).catch(onerror);

co(function* () {
  // resolve multiple promises in parallel
  const a = yield Promise.resolve(1);
  const b = yield Promise.resolve(2);
  const c = yield Promise.resolve(3);
  console.log(a + b + c);
  // => 6
}).catch((err) => {
  console.log('err', err);
});
```

以上代码很像 `async/await` 有没有？实际上你可以把 `co` 看做 `async`, 把 `yield` 看做 `await`.

了解了 `generator` 之后，我们来看接下来几个 `async/await` 示例

#### 1.3.1 示例 1

```js
async function b() {
  console.log('b');
}

async function a() {
  console.log('1');
  await b();
  console.log('2');
}

a();
```
打印结果为 `1,b,2`, 这应该很容易理解  

#### 1.3.2 示例 2

```js
async function b() {
  console.log('b');
}

async function a() {
  console.log('1');
  await b();
  console.log('2');
}

a();
console.log('3');
```

打印结果为: `1,b,3,2`, 我们说 `async/await` 内部就是 `generator`, 也就是说，当执行完 `await b()` 之后会**让出线程**，会转而执行 `a()` 函数之后的代码 `console.log(3)`, 等这代码执行完之后才会继续执行 `await` 后的代码 `console.log(2)`  

如果觉得**让出线程**难理解，可以把代码转为 Promise 来理解:  

```js
// 代码已经做了转化，函数内容移动到了 new Promise 里面
// async function b() {
//   console.log('b');
// }

async function a() {
  console.log('1');

  // 代码已经做了转化
  // await b();
  // console.log(2)

  new Promise((resolve) => {
    // await 的函数内容，变成 new Promise 的内容
    console.log('b');
    resolve()
  }).then(() => {
    // 把 await 之后的代码，变成 .then 之后的代码
    console.log('2');
  })
  
}

a();
console.log('3');
```
即:  
1. 把 await 的函数内容，变成 `new Promise` 中的内容
2. 把 await 之后的代码，变成 `.then` 之后的代码

这样，我们还是可以按照之前 `new Promise().then` 为微任务队列的方式来理解。

#### 1.3.3 示例 3

```js
async function foo() {
    console.log('foo')
}
async function bar() {
    console.log('bar start')
    await foo()
    console.log('bar end')
}
console.log('script start')
setTimeout(function () {
    console.log('setTimeout')
}, 0)
bar();
new Promise(function (resolve) {
    console.log('promise executor')
    resolve();
}).then(function () {
    console.log('promise then')
})
console.log('script end')
```
打印结果为: 
```js
script start
bar start
foo
promise executor
script end
bar end
promise then
setTimeout
```

同理，我们可以用 Promise 改写刚刚的代码:  
```js
async function bar() {
  console.log('bar start')
  new Promise((resolve) => {
    console.log('foo')
    resolve()
  }).then(() => {
    console.log('bar end')
  })
}
console.log('script start')
setTimeout(function () {
    console.log('setTimeout')
}, 0)
bar();
new Promise(function (resolve) {
    console.log('promise executor')
    resolve();
}).then(function () {
    console.log('promise then')
})
console.log('script end')
```

1. 同步代码执行完之后，微任务队列有 `[console.log('bar end'), console.log('promise then')]`, 宏任务队列有 [`console.log('setTimeout')`]
2. 因此执行完同步代码之后，会依次执行微任务队列里的任务，等**微任务队列为空**时，再执行宏任务队列的任务。

#### 1.3.4 示例 4

```js
console.log('script start');

async function async2() {
  console.log('async2 end');
}
async function async3() {
  console.log('async3 end');
}

async function async1() {
  await async2();
  console.log('async1 end');
  await async3();
  console.log('async4 end');
}

async1();

setTimeout(() => {
  console.log('setTimeout');
}, 0);

new Promise((resolve) => {
  console.log('Promise');
  resolve();
})
  .then(() => {
    console.log('promise1');
  })
  .then(() => {
    console.log('promise2');
  });

console.log('script end');
```

打印结果:  
```js
script start
async2 end
Promise
script end
async1 end
async3 end
promise1
async4 end
promise2
setTimeout
```

我们依旧可以把上面的代码进行转换:  

```js
console.log('script start');

async function async1() {
  new Promise((resolve) => {
    console.log('async2 end');
    resolve()
  }).then(() => {
    console.log('async1 end');
    new Promise((resolve) => {
      console.log('async3 end');
      resolve()
    }).then(() => {
      console.log('async4 end');
    })
  })
}

async1();

setTimeout(() => {
  console.log('setTimeout');
}, 0);

new Promise((resolve) => {
  console.log('Promise');
  resolve();
})
  .then(() => {
    console.log('promise1');
  })
  .then(() => {
    console.log('promise2');
  });

console.log('script end');
```

注意，以下两段代码的，它们各自都有两次 `.then`，但是每个 `.then` 都不是一次加入微任务队列的，只有执行完第一个 `.then`, 才会将后一个 `.then` 放到微任务队列。

```js
// 代码 1
new Promise((resolve) => {
  console.log('async2 end');
}).then(() => {
  console.log('async1 end');  // 1
  new Promise((resolve) => {
    console.log('async3 end');
  }).then(() => {
    console.log('async4 end');  // 2
  })
})

// 代码 2
new Promise((resolve) => {
  console.log('Promise');
  resolve();
}).then(() => {
    console.log('promise1'); // 3
  })
  .then(() => {
    console.log('promise2');  // 4
  });
```

1. 以上 1, 2, 3, 4 四个微任务, 一开始微任务队列只有 `[1,3]`
2. 等 1 执行完之后，会把 2 放到微任务队列中, 此时微任务队列为 `[3,2]`
3. 等 3 执行完之后，会把 4 放到微任务队列中, 此时微任务队列为 `[2, 4]`
4. 再依次执行 `2` 和 `4`

#### 1.3.5 示例 5

```js
async function foo() {
  console.log(1);
  const a = await 100;
  console.log(a);
  console.log(2);
}
console.log(0);
foo();
console.log(3);
```

打印结果为: `0, 1, 3, 100, 2`

#### 1.3.6 示例 6

```js
async function c() {
  console.log('c');
}

async function b() {
  console.log('a');
  await c();
  console.log('b');
}

async function a() {
  console.log(1);
  await b();
  console.log(2);
}

a()
```

打印结果为: `1,a,c,b,2`

转换:  

```js
async function a() {
  console.log(1);
  new Promise(resolve => {
    console.log('a');
    new Promise(resolve => {
      console.log('c');
      resolve()
    }).then(() => {
      console.log('b');
    })
    resolve()
  }).then(() => {
    console.log(2);  
  })
}

a()
```

由转换后的代码可知，在微任务队列中，`console.log('b')` 先于 `console.log(2)` 加入微任务队列，最终微任务队列为: `[console.log('b'), console.log(2)]`  

#### 1.3.7 示例 7

```js
async function c() {
  console.log('c');
}

async function b() {
  console.log('a');
  await c();
  console.log('b');
}

async function a() {
  console.log(1);
  await b();
  console.log(2);
}

a();
console.log(3);
```

转换后代码为:  
```js
async function a() {
  console.log(1);
  new Promise(resolve => {
    console.log('a');
    new Promise(resolve => {
      console.log('c');
      resolve()
    }).then(() => {
      console.log('b');
    })
    resolve()
  }).then(() => {
    console.log(2);  
  })
}

a()
console.log(3)
```

打印结果为: `1,a,c,3,b,2`

#### 1.3.8 示例 8

```js
async function c() {
  console.log('c');
}

async function b() {
  console.log('a');
  await c();
  console.log('b');
}

async function a() {
  console.log(1);
  await b();
  console.log(2);
}

async function d() {
  await a();
  console.log(3);
}

d();
```

代码转换:  

```js
async function d() {
  new Promise((resolve) => {
    console.log(1);
    new Promise((resolve) => {
      console.log('a');
      new Promise((resolve) => {
        console.log('c');
        resolve();
      }).then(() => {
        console.log('b');
      })
      resolve();
    }).then(() => {
      console.log(2);
    })
    resolve()
  }).then(() => {
    console.log(3);
  })
}

d();
```

因此最终结果为: `1,a,c,b,2,3`

## 参考资料

1. 博客 Event Loop: https://yes-1-am.gitbook.io/blog/javascript/event-loop
2. 极客时间/浏览器工作原理与实践: https://time.geekbang.org/column/article/119046 查看第 `15-20` 课