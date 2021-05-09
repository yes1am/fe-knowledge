function merge(left, right) {
  let i = 0;
  let j = 0;
  const result = [];
  while (i < left.length && j < right.length) {
    if (left[i] > right[j]) {
      result.push(right[j]);
      j++;
    } else {
      result.push(left[i]);
      i++;
    }
  }
  if (i < left.length) {
    result.push(...left.slice(i));
  } else {
    result.push(...right.slice(j));
  }
  return result;
}

// 归并排序
function mergeSort(arr) {
  if (arr.length > 1) {
    const middle = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, middle));
    const right = mergeSort(arr.slice(middle, arr.length));
    return merge(left, right);
  }
  return arr;
}

const arr = [8, 5, 2, 6, 9, 3, 1, 4, 0, 7];

console.log(mergeSort(arr));
