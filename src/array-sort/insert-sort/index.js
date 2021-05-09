// 插入排序
function insertSort(arr) {
  const result = arr.slice();
  for (let i = 1; i < result.length; i += 1) {
    const temp = result[i];

    let j = i;
    while (j > 0 && temp < result[j - 1]) {
      result[j] = result[j - 1];
      j -= 1;
    }
    if (temp !== result[j]) {
      result[j] = temp;
    }
  }
  return result;
}

const arr = [8, 5, 2, 6, 9, 3, 1, 4, 0, 7];

console.log(insertSort(arr));
