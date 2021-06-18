# React 和 Vue 的异同

[参考链接](https://cn.vuejs.org/v2/guide/comparison.html)  


## 1. 相同之处

1. 都有 Virtual DOM
2. 都提供了响应式 (Reactive) 和组件化 (Composable) 的视图组件
3. 将注意力集中保持在核心库，而将其他功能如路由和全局状态管理交给相关的库

## 2. 不同之处

### 2.1 优化

在 React 应用中，当某个组件的状态发生变化时，它会以该组件为根，重新渲染整个组件子树。  

如果要避免不必要的子组件重渲染，那么需要使用 `PureComponent` 或者手动实现 `shouldComponentUpdate` 方法，同时你可能会需要使用**不可变的数据结构**来使得你的组件更容易被优化。

而在 Vue 的应用中，组件的依赖是在渲染过程自动追踪的，所以系统能**精确知晓**哪个组件确实需要被重渲染。Vue 的这个特点使得开发者不用考虑此类优化，**从而更好的专注于应用本身**。

### 2.2 HTML & CSS

#### 2.2.1. JSX vs Template

React 中，所有组件的渲染功能依赖 JSX，使用 JSX 渲染函数有以下的优势：  
1. 可以使用完整的编程语言 JS 功能来构建你的识图页面 (都是 js 来写)
2. 开发工具比如 (linting, ts 类型检查) 对 JSX 的支持相对于现有的 Vue 模板是比较先进的

而 Vue 是使用 template 的写法, 会在一个文件中有 template，有 js，有 style 样式代码:  

```vue
<template>
  <div id="app">
    <logo></logo>
  </div>
</template>

<script>
import Logo from "./components/Logo";
export default {
  components: {
    logo: Logo
  }
};
</script>

<style>
html,
body,
#app {
  // 省略
}
</style>
```

#### 2.2.2 组件作用域内的 CSS

React 中需要通过 CSS Modules 或者 styled-components 的方式，来隔绝 css 的作用域，使得不会互相影响。

而在 Vue 中，可以简单的使用 scoped，就能实现类似 css module 的效果(隔离作用域):  

```js
<style scoped>
//
</style>
```

### 2.3 规模

#### 2.3.1 向下扩展

对于 React 来说，通常你需要用 Babel 转义 jsx 代码，因此需要学习**构建系统**，虽然在技术上可以用 Babel 实时编译代码，但是并**不推荐**用于生产环境。

而对 Vue 来说, 以下的代码就可以运行起来:  

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
</head>
<body>
  <div id="app">
    {{ message }}
  </div>
  <script>
    var app = new Vue({
      el: '#app',
      data: {
        message: 'Hello Vue!'
      }
    })
  </script>
</body>
</html>
```



### 2.4 原生渲染

React Native 能够使你用与 React 相同的组件模型编写 Android 和 iOS 的应用。

Weex 允许你使用 Vue 语法开发不仅仅可以运行在浏览器端，还能被用于 iOS 和 Android 上原生应用的组件。

## 3. 其它，虚拟 DOM， DOM diff 算法等等，略

涉及到源码了，暂时不了解