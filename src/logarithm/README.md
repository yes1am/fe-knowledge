# 对数 logarithm

如果 a 的 x 次方等于 N，那么数 x 叫做以 a 为底, N 的对数(logarithm)，叫做 x = log<sub>a</sub>N。其中 a 叫做对数的底数，N 叫做真数。

对数函数的曲线图:

![20210531133604](https://raw.githubusercontent.com/yes1am/PicBed/master/img/20210531133604.png)

## 1. 基础知识

### 1.1 自然常数 e

自然常数，为数学中一个常数，是一个无限不循环小数，且为超越数，其值约为 `2.718281828459045`

### 1.2 在 JS 中的表现

在 JS 中，`Math.E` 即为自然常数, `Math.E = 2.718281828459045`。

`Math.log()` 函数返回一个数的**自然对象** (即以 e 为底的对数)，如 `Math.log(Math.E) = 1`，相当于求 log<sub>e</sub>Math.E。

log<sub>2</sub>8 即表示，求 2 的多少次方等于 8:  

返回以 x 为底 y 的对数（即log<sub>x</sub>y）
```js
function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

getBaseLog(2, 8)  // 3
```


### 1.3 特殊的底数

**参考:** https://en.wikipedia.org/wiki/Logarithm#Particular_bases

当底数为 e 时，可以简写为 `ln`，即 log<sub>e</sub>2 = ln2

当底数为 10 时，可以简写为 `lg`，即 log<sub>10</sub>100 = lg100

### 1.4 在算法复杂度的体现

算法的时间复杂度中，存在一个叫做**对数阶**的复杂度: `O(logN)`

```js
function test(n) {
  let i = 1;
  let count = 0;
  while(i < n ) {
      count++
      i = i * 2;
  }
  console.log(`n 为 ${n}, count 为: ${count}`)
}

test(4)  // 'n 为 4, count 为: 2'
test(8) // 'n 为 8, count 为: 3'
test(12) // 'n 为 12, count 为: 4'
test(16) // 'n 为 16, count 为: 4'
```

while 的循环次数，等于 log<sub>2</sub>n，因此算法复杂度为 log<sub>2</sub>n. 至于为什么会被简化为 `O(logN)`，参考 [log不写底数时底数到底是多少？](https://www.zhihu.com/question/28207179/answer/123400458)。

## 参考资料

1. 对数: https://baike.baidu.com/item/%E5%AF%B9%E6%95%B0
2. 自然常数 e: https://baike.baidu.com/item/%E8%87%AA%E7%84%B6%E5%B8%B8%E6%95%B0
3. Math.log(): https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/log
4. log不写底数时底数到底是多少？(时间复杂度) :https://www.zhihu.com/question/28207179/answer/123400458