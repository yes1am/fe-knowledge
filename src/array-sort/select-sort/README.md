## 选择排序

```js
function selectSort(arr) {
  const result = arr.slice();
  for (let i = 0; i < result.length; i += 1) {
    let minIndex = i;
    for (let j = i + 1; j < result.length; j += 1) {
      if (result[j] < result[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      swap(result, i, minIndex);
    }
  }
  return result;
}
```

假设有 10 个元素
1. 第一次循环，假设第 1 个元素最小，从第 1 个元素开始到最后一个元素中找出最小的那个元素，将最小的元素与第 1 个元素互换位置，使得第 1 个元素就是最小的。
2. 第二次循环，假设第 2 个元素最小，从第 2 个元素开始到最后一个元素中找出最小的那个元素，将最小的元素与第 2 个元素互换位置，使得第 2 个元素就是最小的
3. ...