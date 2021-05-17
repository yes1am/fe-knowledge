## 大整数相加

由于 JS 最大安全整数 (`Number.MAX_SAFE_INTEGER` 等于 9007199254740991) 的问题:

```js
Number.MAX_SAFE_INTEGER + 1
9007199254740992

Number.MAX_SAFE_INTEGER + 2
9007199254740992
```

即当数字大于 `Number.MAX_SAFE_INTEGER` 时，那么对这个数进行**加减乘除**运算都可能不准确。

对于加法来说，此时**需要将数字转为字符串，并手动模拟加法的运算步骤**。

```js
function add(num1, num2) {
  const maxLength = Math.max(num1.length, num2.length);
  num1 = num1.padStart(maxLength, 0);
  num2 = num2.padStart(maxLength, 0);

  let flag = 0;
  let result = '';
  for (let i = maxLength - 1; i >= 0; i--) {
    const temp = parseInt(num1[i], 10) + parseInt(num2[i], 10) + flag;
    flag = Math.floor(temp / 10);
    result = (temp % 10) + result;
  }
  result = (flag === 1 ? '1' : '') + result;
  return result;
}
```

对于减法，乘法，也有对应的方案，此处暂时省略。

BigInteger 中的 [add 方法](https://github.com/peterolson/BigInteger.js/blob/83f930d1a93a782e1ba694077d14c3fa17c86eb4/BigInteger.js#L102) 其实现也是类似的:

*每一位相加，最后把更大的数的剩下的位数，再加上。*  

```js
function add(a, b) { // assumes a and b are arrays with a.length >= b.length
  var l_a = a.length,
      l_b = b.length,
      r = new Array(l_a),
      carry = 0,
      base = BASE,
      sum, i;
  for (i = 0; i < l_b; i++) {
      sum = a[i] + b[i] + carry;
      carry = sum >= base ? 1 : 0;
      r[i] = sum - carry * base;
  }
  while (i < l_a) {
      sum = a[i] + carry;
      carry = sum === base ? 1 : 0;
      r[i++] = sum - carry * base;
  }
  if (carry > 0) r.push(carry);
  return r;
}
```

> 不过实际上 big-integer 的实现还是不太一样的，它把一个大的数比如 900719925474099333333，拆分为 [9333333, 2547409, 9007199] 这种小的数组合成的数组，然后进行计算。具体原理请查看源码。

## 参考文章

1. [JavaScript 浮点数陷阱及解法](https://github.com/camsong/blog/issues/9)
2. [有趣的大数运算](https://zhuanlan.zhihu.com/p/48528621)
3. [MDN BigInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
4. [任意长度整数运算的库: BigInteger](https://github.com/peterolson/BigInteger.js)