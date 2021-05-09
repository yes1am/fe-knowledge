## 冒泡排序

```js
const { swap } = require('../util');

// 冒泡排序
function bubbleSort(arr) {
  const result = arr.slice();
  for (let i = 0; i < result.length; i += 1) {
    for (let j = 0; j < result.length - i - 1; j += 1) {
      if (result[j] > result[j + 1]) {
        swap(result, j, j + 1);
      }
    }
  }
  return result;
}
```

假设有 10 个元素
1. 第一次循环，相邻元素相互比较，把更大的元素放到右边，最终最大的元素冒泡到最右边
2. 第二次循环，此时只需要比较前 9 个元素
3. 第二次循环，此时只需要比较前 8 个元素
4. ...