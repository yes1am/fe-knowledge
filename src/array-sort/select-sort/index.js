const { swap } = require('../util');

// 选择
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

const arr = [8, 5, 2, 6, 9, 3, 1, 4, 0, 7];

console.log(selectSort(arr));
