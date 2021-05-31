// 递归解法
let count1 = 0;
function fib1(n) {
  count1++;
  if (n < 2) {
    return n;
  }
  return fib1(n - 2) + fib1(n - 1);
}

console.log(fib1(6)); // 8
console.log(count1); // 25 次

// 循环解法
let count2 = 0;
function fib2(n) {
  if (n < 2) {
    return n;
  }
  const fibs = [0, 1];
  for (let i = 2; i <= n; i++) {
    count2++;
    fibs[i] = fibs[i - 1] + fibs[i - 2];
  }
  return fibs[n];
}

console.log(fib2(6)); // 8
console.log(count2); // 5 次
