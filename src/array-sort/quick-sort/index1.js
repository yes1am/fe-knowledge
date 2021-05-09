const { swap } = require('../util');

// 快速
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
    // 向右找到第一个大于 pivot 的元素位置
    while (i < j && arr[i] <= pivot) {
      i++;
    }
    swap(arr, i, j);
  }
  swap(arr, i, left);
  quickSort(arr, left, i - 1);
  quickSort(arr, i + 1, right);
}

const arr = [8, 5, 2, 6, 9, 3, 1, 4, 0, 7];
quickSort(arr, 0, arr.length - 1);
console.log(arr);
