## 插入排序

```js
function insertSort(arr) {
  const result = arr.slice();
  for (let i = 1; i < result.length; i += 1) {
    // 记下要插入的数据
    const temp = result[i];

    // 从未排序的第一个元素往左开始，找到 temp 应该插入的位置 j
    // 比如当前是从小到大排序，那么如果 temp 小于前面的已排序序列的元素，那么 j 就应该减小
    let j = i;
    while (j > 0 && temp < result[j - 1]) {
      result[j] = result[j - 1];
      j -= 1;
    }
    // 如果 temp 应该插入的位置 (j) 和一开始的位置 (i) 不一致，那么应该将 temp 插入到 j
    if (i !== j) {
      result[j] = temp;
    }
  }
  return result;
}
```

1. 将第一个元素，当做一个有序序列，把第二个元素到最后一个元素当做未排序序列
2. 从头到尾扫描未排序序列，将扫描到的每个元素，插入到有序序列的适当位置。
3. 比如从 result[1] 开始，看 result[1] 应该插入到 result[0] 的前面还是后面
