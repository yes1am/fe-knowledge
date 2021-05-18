// 两个数相加
function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  // 得到要将两个数都变为整数的话，所需要的倍数
  // eslint-disable-next-line no-restricted-properties
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}

console.log(add(0.1, 0.2) === 0.3);

// 任意个数相加
function add1(num1, num2, ...args) {
  if (args.length) {
    return add(add(num1, num2), args[0], ...args.slice(0));
  }
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  // 得到要将两个数都变为整数的话，所需要的倍数
  // eslint-disable-next-line no-restricted-properties
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}

console.log(add1(0.1, 0.2, 0.3) === 0.6);
