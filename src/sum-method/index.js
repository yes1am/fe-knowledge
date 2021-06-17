function sum(...args) {
  let arg = [...args];
  function sum1(...args1) {
    arg = arg.concat(args1);
    return sum1;
  }
  sum1.valueOf = () => arg.reduce((a, b) => a + b);
  return sum1;
}

console.log(sum(1)(2).valueOf() === 3);

console.log(sum(1)(2)(3)(4).valueOf() === 10);
