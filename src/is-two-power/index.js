function isTwoPower(num) {
  const originNum = num;
  let n = 1;
  while (num % 2 === 0) {
    num /= 2;
    if (num === 1) {
      console.log(`${originNum} 是 2 的 ${n} 次方`);
      return true;
    }
    n++;
  }
  return false;
}

console.log(isTwoPower(4)); // 4 是 2 的 2 次方, true
console.log(isTwoPower(6)); // false
console.log(isTwoPower(8)); // 8 是 2 的 3 次方, true
console.log(isTwoPower(10)); // false
