const arr = [
  {
    id: 1,
    val: '学校',
    parentId: null,
  },
  {
    id: 2,
    val: '班级1',
    parentId: 1,
  },
  {
    id: 3,
    val: '班级2',
    parentId: 1,
  },
  {
    id: 4,
    val: '学生1',
    parentId: 2,
  },
  {
    id: 5,
    val: '学生2',
    parentId: 3,
  },
  {
    id: 6,
    val: '学生3',
    parentId: 3,
  },
];

function convert(arr) {
  arr = JSON.parse(JSON.stringify(arr));
  const map = arr.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});

  const result = [];
  Object.keys(map).forEach((key) => {
    const item = map[key];
    if (!item.parentId) {
      result.push(item);
    } else {
      const parent = map[item.parentId];
      parent.children = parent.children || [];
      parent.children.push(item);
    }
  });
  return result;
}

console.log(convert(arr));
