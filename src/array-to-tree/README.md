## 数组转树

参考: https://github.com/lgwebdream/FE-Interview/issues/35

### index1.js

**题目:**
将以下的数组
```js
[
  {
    location: '/'
  },
  {
    location: '/a'
  },
  {
    location: '/b'
  },
  {
    location: '/a/b'
  },
  {
    location: '/a/b/c'
  }
]
```
转为

```
{
  title: '/',
  children: [
    {
      title: '/a',
      children: [
        {
          title: '/a/b',
          children: [
            {
              title: '/a/b/c',
              children: []
            }
          ]
        }
      ]
    },
    {
      title: '/b',
      children: []
    }
  ]
}
```

**思路:**

两次循环，来改变数组中的项。并且当修改对象时，如果别处引用了该对象，那么别处的值也会发生更改。


**代码:**
```js
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
    if(item.title === parent) {
      res.push(item)
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
  return res
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
```

## index2.js

**题目:**  

将以下数组
```js
[
  {
    id: 1,
    val: "学校",
    parentId: null,
  },
  {
    id: 2,
    val: "班级1",
    parentId: 1,
  },
  {
    id: 3,
    val: "班级2",
    parentId: 1,
  },
  {
    id: 4,
    val: "学生1",
    parentId: 2,
  },
  {
    id: 5,
    val: "学生2",
    parentId: 3,
  },
  {
    id: 6,
    val: "学生3",
    parentId: 3,
  },
]
```
转换为

```js
{
  id: 1,
  val: '学校',
  parentId: null,
  children: [
    {
      id: 2,
      val: '班级1',
      parentId: 1,
      children: [
        {
          id: 4,
          val: '学生1',
          parentId: 2
        }
      ]
    },
    {
      id: 3,
      val: '班级2',
      parentId: 1,
      children: [
        { 
          id: 5,
          val: '学生2',
          parentId: 3
        },
        {
          id: 6,
          val: '学生3',
          parentId: 3
        }
      ]
    }
  ]
}
```

**代码:**

```js
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
```

其实思路和 `index1.js` 是一样的，都是循环然后往的元素添加 children，借助对象引用，实现修改的功能。


