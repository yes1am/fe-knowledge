## React Router 原理

**简单来讲就是:**  

history 内部有观察者模式，Router 组件作为观察者。  

1. 在路由跳转时，通过 history 内部的 push 或者 replace 方法进行跳转
2. 在点击浏览器前进/后退按钮时，监听 popState (history 模式) / hashChange (hash 模式) 并执行回调

以上两种方式，都会触发观察者模式，通过 notifyListeners 告诉 Router 组件当前最新的路由信息。

Router 组件通过 Context 告知所有 Route 组件 (如 `<Route path="/user" />`) 当前最新的路由信息，Route 组件内部将自己的 path 与最新的路由信息进行 match，如果匹配则会展示当前组件。

### 参考资料

1. React Router 源码简单分析: https://yes-1-am.gitbook.io/blog/react-kai-fa-shi-jian/reactrouter-yuan-ma-jian-dan-fen-xi
2. 面试官: 你了解前端路由吗?: https://juejin.cn/post/6844903589123457031#heading-14