function getLength(path) {
  return path.split('/').filter(Boolean).length;
}

function isChild(child, parent) {
  if (parent === '/') {
    return child.startsWith(parent) && getLength(child) === 1;
  }
  return child.startsWith(parent) && getLength(child) - getLength(parent) === 1;
}

function convert(arr, parent) {
  let result = JSON.parse(JSON.stringify(arr));
  result = result.map((item) => ({
    title: item.location,
    children: [],
  }));
  const res = [];
  result.forEach((item) => {
    if (item.title === parent) {
      res.push(item);
    }
    result.forEach((item1) => {
      if (isChild(item1.title, item.title)) {
        if (item.children) {
          item.children.push(item1);
        } else {
          item.children = [item1];
        }
      }
    });
  });
  return res;
}

const arr = [
  {
    location: '/',
  },
  {
    location: '/a',
  },
  {
    location: '/b',
  },
  {
    location: '/a/b',
  },
  {
    location: '/a/b/c',
  },
];

console.log(convert(arr, '/'));
