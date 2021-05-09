const { swap } = require('../util');

// 冒泡排序
function bubbleSort(arr) {
  const result = arr.slice();
  for (let i = 0; i < result.length; i += 1) {
    for (let j = 0; j < result.length - i - 1; j += 1) {
      if (result[j] < result[j + 1]) {
        swap(result, j, j + 1);
      }
    }
  }
  return result;
}

const arr = [8, 5, 2, 6, 9, 3, 1, 4, 0, 7];

console.log(bubbleSort(arr));
