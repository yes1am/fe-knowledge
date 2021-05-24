function getN(i) {
  let j = 0;
  while (true) {
    if ((j * j - j) <= 2 * i && 2 * i < (j * j + j)) {
      break;
    }
    j++;
  }
  return j;
}

function getXY(i) {
  const n = getN(i);
  const x = i - (n * (n - 1)) / 2;
  const y = n - (i - (n * (n - 1)) / 2) - 1;
  if (n % 2 === 0) {
    // 偶数
    return [y, x];
  }
  return [x, y];
}

console.log(getXY(16));
