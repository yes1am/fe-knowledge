## 判断一个数字是否为 2 的 n 次方

如 4 是 2 的 2 次方，而 6 不是

```js
function isTwoPower(num) {
  const originNum = num;
  let n = 1;
  // 如果 模2 等于 0，说明 除 2 还是整数，那么将 num 变为 num / 2 继续除
  while (num % 2 === 0) {
    num /= 2;
    if (num === 1) {
      console.log(`${originNum} 是 2 的 ${n} 次方`);
      return true;
    }
    n++;
  }
  return false;
}
```