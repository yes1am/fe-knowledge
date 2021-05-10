function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const middle = left + Math.floor((right - left) / 2);
    if (arr[middle] > target) {
      right = middle - 1;
    } else if (arr[middle] < target) {
      left = middle + 1;
    } else {
      return middle;
    }
  }
  return -1;
}

const nums = [-1, 0, 3, 5, 9, 12];
const target = 0;

console.log(binarySearch(nums, target));
