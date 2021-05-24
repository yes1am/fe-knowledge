## 数学归纳法

wiki 百科：https://zh.wikipedia.org/wiki/%E6%95%B0%E5%AD%A6%E5%BD%92%E7%BA%B3%E6%B3%95


### 1. 题目 1
证明: `1 + 2 + 3 + ... + n = n * (n + 1) / 2`

```js
n = 1 时
1 = (1 * 1 + 1) / 2 // 成立

假设 n = n 时成立
1 + 2 + 3 + ... + n = n * (n + 1) / 2

令 n = n + 1，则:
1 + 2 + 3 + ... + n + (n + 1) = n * (n + 1) / 2 + (n + 1)

且:
n * (n + 1) / 2 + (n + 1)
等于
(n * (n + 1) + 2 * (n + 1)) / 2
等于
((n + 1) * (n + 2)) / 2

即:
1 + 2 + 3 + ... + n + (n + 1) = (n + 1) * ((n + 1) + 1) / 2
```
因此: `1 + 2 + 3 + ... + n = n * (n + 1) / 2` 成立

### 题目 2

证明: `1 + 3 + ... + (2n - 1) = n ^ 2`

```js
n 等于 1 时:
1 = 1 ^ 2 成立

假设 n = n 时成立:
1 + 3 + ... + (2n - 1) = n ^ 2

令 n = n + 1，则

1 + 3 + ... + (2n - 1) + (2 * (n + 1) -1)
等于
n ^ 2 + 2n + 1
等于
(n + 1) ^ 2
```
因此: `1 + 3 + ... + (2n - 1) = n ^ 2` 成立.