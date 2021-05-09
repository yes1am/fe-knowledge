## 快速排序

*index2.js*
```js
function quickSort(arr, left, right) {
  if (left >= right) {
    return;
  }
  const pivot = arr[left];
  let i = left;
  let j = right;
  while (i < j) {
    // 向左找到第一个小于 pivot 的元素位置
    while (i < j && arr[j] >= pivot) {
      j--;
    }
    if (i < j) {
      arr[i] = arr[j];
    }

    // 向右找到第一个大于 pivot 的元素位置
    while (i < j && arr[i] <= pivot) {
      i++;
    }
    if (i < j) {
      arr[j] = arr[i];
    }
  }
  arr[i] = pivot;
  quickSort(arr, left, i - 1);
  quickSort(arr, i + 1, right);
}
```

1. 以第一个元素为基准元素，right 指针向左寻找比基准小的元素，赋值给 arr[left]。left 指针向右寻找比基准大的元素，赋值给 arr[right]。
2. 最终 left 和 right 会相等，此时 left === right === 基准元素真正应该所在的位置。

*index2.js* 为 [B 站视频](https://www.bilibili.com/video/BV1at411T75o/?spm_id_from=333.788.videocard.0) 所描述的算法，*index1.js* 是视频评论中提到的解法，思路应该是差不多的。