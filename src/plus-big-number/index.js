function add(num1, num2) {
  const maxLength = Math.max(num1.length, num2.length);
  num1 = num1.padStart(maxLength, 0);
  num2 = num2.padStart(maxLength, 0);

  let flag = 0;
  let result = '';
  for (let i = maxLength - 1; i >= 0; i--) {
    const temp = parseInt(num1[i], 10) + parseInt(num2[i], 10) + flag;
    flag = Math.floor(temp / 10);
    result = (temp % 10) + result;
  }
  result = (flag === 1 ? '1' : '') + result;
  return result;
}

console.log(add('900719925474099222222', '900719925474099333333'));
console.log(900719925474099222222 + 900719925474099333333);
