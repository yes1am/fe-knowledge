## 浮点数相加

由于浮点数用二进制来表示时，可能是一个无限循环的数, 而 JS 本身使用有限的空间保存这个值，就会丢失精度。

浮点数相加精度丢失的一个表现就是: `0.1 + 0.2 === 0.3` 为 `false`

常用的一个方案是，将 0.1 及 0.2 **乘上一个倍数**进而转化为整数，整数相加不会存在丢失精度问题，之后再将结果**除于倍数**。

```js
function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  // 得到要将两个数都变为整数的话，所需要的倍数
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}
```

[JavaScript 浮点数运算的精度问题](https://www.html.cn/archives/7340) 这篇文章提到的一个加法函数:  

```js
function accAdd(arg1, arg2) {
    var r1, r2, m, c;
    try {
        r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
        r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
        var cm = Math.pow(10, c);
        if (r1 > r2) {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", "")) * cm;
        } else {
            arg1 = Number(arg1.toString().replace(".", "")) * cm;
            arg2 = Number(arg2.toString().replace(".", ""));
        }
    } else {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
}
```

实际上是一样的，比如:
```js
if (r1 > r2) {
    arg1 = Number(arg1.toString().replace(".", ""));
    arg2 = Number(arg2.toString().replace(".", "")) * cm;
} else {
    arg1 = Number(arg1.toString().replace(".", "")) * cm;
    arg2 = Number(arg2.toString().replace(".", ""));
}

// 等价于
if (r1 > r2) {
    arg1 = arg1 * Math.pow(10, r1)
    arg2 = arg2 * Math.pow(10, r2) * Math.pow(10, r1 - r2) 
    // 等价于 arg2 = arg2 * Math.pow(10, r1)
} else {
    arg1 =arg1 * Math.pow(10, r1) * Math.pow(10, r2 - r1);
    // 等价于 arg2 = arg2 * Math.pow(10, r2)
    arg2 = arg2 * Math.pow(10, r2)
}

// 也就是
arg1 = arg1 * Math.pow(10, Math.max(r1, r2))
arg2 = arg2 * Math.pow(10, Math.max(r1, r2))
```

但是加法又会引入 [大数相加](https://github.com/yes1am/fe-knowledge/tree/master/src/plus-big-number) 的问题。

```js
add(0.1000000000000000000000000000000003, 0.21000000000000000000000000000000002)
// 0.31
```

*不知为何*, 看了下阿里的这个[库](https://github.com/nefe/number-precision) 似乎也没解决这个问题。

```js
const NP = require('number-precision');
NP.plus(0.1000000000000000000000000000000003, 0.21000000000000000000000000000000002) === 0.31
// true
```

而 [big-number](https://github.com/MikeMcl/bignumber.js) 解决了这个问题:

```js
const BigNumber =  require("bignumber.js");
new BigNumber("0.1000000000000000000000000000000003").plus(new BigNumber("0.2000000000000000000000000000000003")).toString()
// 0.3000000000000000000000000000000006
```

同时，bignumber 还处理了大整数的情况:

```js
const BigNumber =  require("bignumber.js");
new BigNumber("1000000000000000000000000000000003").plus(new BigNumber("2000000000000000000000000000000003")).toString()
// 3.000000000000000000000000000000006e+33
```


## 参考资料

1. [JavaScript 浮点数陷阱及解法](https://github.com/camsong/blog/issues/9)
2. [JavaScript 浮点数运算的精度问题](https://www.html.cn/archives/7340)
