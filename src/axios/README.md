## Axios

Axios 是一个基于 Promise 的，并且兼容浏览器和 Nodejs 的请求库。

目前我比较关心的一个问题是，**它是如何实现兼容浏览器与 Nodejs 的**。因此稍微看了下源码。  

简单使用:  
```js
import axios from 'axios';

axios.get('https://www.baidu.com/')
  .then(function (response) {
    // handle success
    console.log("结果", response.data);
  })
  .catch(function (error) {
    // handle error
    console.log("错误", error);
  })   
  .then(function (res) {
    // always executed
  });
```

因此我们简单分析以下以上代码的一个流程:

1. package.json 中 main 是 [index.js](https://github.com/axios/axios/blob/59fa6147eb6940fdb965f4be4cc8cd7e1c3819db/package.json#L5)
2. index.js 最终会指向 [lib/axios.js](https://github.com/axios/axios/blob/59fa6147eb6940fdb965f4be4cc8cd7e1c3819db/lib/axios.js)
3. lib/axios.js 中依赖 [lib/core/Axios.js](https://github.com/axios/axios/blob/59fa6147eb6940fdb965f4be4cc8cd7e1c3819db/lib/core/Axios.js) 来创建实例
4. [Axios](https://github.com/axios/axios/blob/59fa6147eb6940fdb965f4be4cc8cd7e1c3819db/lib/core/Axios.js#L126-L135) 中给 axios 实例加上了 `delete`, `get`, `head` 等方法, 内部会调用 [request](https://github.com/axios/axios/blob/59fa6147eb6940fdb965f4be4cc8cd7e1c3819db/lib/core/Axios.js#L29) 方法，而 request 方法调用了 [dispatchRequest](https://github.com/axios/axios/blob/59fa6147eb6940fdb965f4be4cc8cd7e1c3819db/lib/core/dispatchRequest.js#L53) 方法
5. dispatchRequest 会用到 adapter 方法，而 adapter 来自于 [default.adapters](https://github.com/axios/axios/blob/59fa6147eb6940fdb965f4be4cc8cd7e1c3819db/lib/defaults.js#L17-L27)

即最终通过以下代码来确定使用 浏览器的 XMR 还是 Nodejs 的 http.
```js
function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}
```

浏览器的 XMR: [xhr.js](https://github.com/axios/axios/blob/59fa6147eb6940fdb965f4be4cc8cd7e1c3819db/lib/adapters/xhr.js)
```js
var request = new XMLHttpRequest();
...
request.send(requestData);
```

Nodejs 的 http: [http.js](https://github.com/axios/axios/blob/59fa6147eb6940fdb965f4be4cc8cd7e1c3819db/lib/adapters/http.js#L202)
```js
var http = require('http');
var https = require('https');
...
transport = isHttpsProxy ? https : http;
...
transport.request(options, function handleResponse(res) {
  ...
})
```

看到这里，**它是如何实现兼容浏览器与 Nodejs 的** 这个疑问也就解开了。

如果有兴趣可以继续深入阅读源码，调试调试，目测源码逻辑上也不是特别复杂，每个文件也不长。

## 参考资料
- [Axios源码深度剖析 - AJAX新王者](https://juejin.cn/post/6844903613609803783)