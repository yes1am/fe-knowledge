# CSRF 的 token 方案是如何实现的(koa-csrf 源码浅析)

> 可借助 koa-basic: https://github.com/yes1am/workshop/tree/master/packages/koa-basic 来测试相关代码。

讨论如何防范 CSRF 攻击时，都会说到 token 的方案，即后端渲染页面时往页面上设置一个 token，前端请求时带上这个 token，后端将这个 token 与原先生成的 token 进行比较。由于恶意网站无法获得这个 token 的值，因此无法携带正确的 token，因此请求会失败。

但是有没有想过，服务端的 token 是如何保存的，这个 token 是如何校验的？经常会听到服务端用 session 区分用户，那 session 是什么？接下来就来解释这些问题。

## 1. 什么是 session

正常的系统登录做法是，前端输入账号密码进行登录，后端查询数据库证明用户存在。于是后端往**存储系统**里添加一条数据。

```js
// sessionId 是一个不能被猜出的字符串， 其中 { 用户信息 } 即为这个用户的 session 信息，你可以往里面新增数据
存储系统[sessionId] = { 用户信息 }
```

同时把这个 sessionId 作为 cookie 返回给前端。用户下次来访问时，带着 sessionId，那服务器查询 **存储系统[sessionId]**, 就知道说这个用户的信息了，也就是知道这个用户的会话信息了。

那么可能会有疑问，**存储系统**究竟是啥？其实，**它只要是一个能存东西的对象/服务就行，可以是数据库，可以是 redis，可以是内存**。

我记得之前看过 JAVA 类似以下的代码:

```java
HttpSession session = request.getSession();
//将数据存储到session中
session.setAttribute("data", "xxx");
//获取session的Id
String sessionId = session.getId();
```

这个 session 是表示用户当前的会话，会话你可能会觉得很抽象。你就这么理解吧，它就是个属于这个用户的一个对象 (object)。你可以往里面写数据，也可以从中读取数据。

刚刚说到**存储系统**可以是数据库，可以是 redis，可以是内存。也就是说，它只要能存数据就行。实际上 `session === 存储系统[sessionId]` ，而**存储系统**存放着所有用户的数据，session 里面是某个特定用户的数据。

当一个请求来的时候，服务端代码会根据 cookie 中的 sessionId, 得到当前用户的会话 `存储系统[sessionId]`，然后把这个 `存储系统[sessionId]` 作为 session，可以在代码中使用。(*这个从 cookie 中拿 sessionId 得到当前用户的 session 的过程，一般被框架封装了，所以如果不清楚的话，会有一些疑惑为什么不用 sessionId 这个 cookie，也能获得 session*)

这样你应该可以理解，为什么代码里写 `session.getXX()` 能够获得当前用户的数据。为什么每个用户的请求到这段代码时，返回值会不一样。

本质上是因为 session 等于 `存储系统[sessionId]` ，在这个阶段已经把各个用户区分开了，因此 session 一定是属于这个用户的会话。并且一定是有 sessionId (通常是保存在 cookie 里，请求的时候会带上) 才能区分用户。

**结论:**  
1. session 的实现可以是**数据库/redis/内存**。session 本身是指某个特定用户的一些信息，而为了从**数据库/redis/内存**中去找到这个特定的用户的信息，依赖于 sessionId, 用户第二次访问时需要携带 sessionId 才能从**数据库/redis/内存** 中找到该用户第一次访问时保留的信息。

## 2. generic-session 源码解析

### 2.1 简单介绍

当前源码地址: https://github.com/koajs/generic-session/tree/abef2b39358489f459cb993553ef6f10fa7bc9bf

这是一个通用的 koa session 中间件，默认使用内存来存储 session，可以改为 redis 或者 mongoDB。

**使用示例:**  
```js
var session = require('koa-generic-session');
var redisStore = require('koa-redis');
var koa = require('koa');

var app = new koa(); // for koa v1 use `var app = koa();`
app.keys = ['keys', 'keykeys'];
app.use(session({
  store: redisStore()  // 使用 redis 作为【存储系统】
}));

app.use(function *() {
  switch (this.path) {
    case '/get':
      get.call(this);
      break;
  }
});

function get() {
  // 直接通过 this.session 得到当前用户的 session 信息
  // 当刷新页面时，由于 cookie 中的 sessionId 没有变化，因为依然能够得到正确的 session
  var session = this.session;
  session.count = session.count || 0;
  session.count++;
  this.body = session.count;
}

app.listen(8080);
```

默认的存储系统为**内存**, 代码如下:  
```js
const debug = require('debug')('koa-generic-session:memory_store');

class MemoryStore {
  constructor() {
    this.sessions = {};
  }

  get(sid) {
    debug('get value %j with key %s', this.sessions[sid], sid);
    return this.sessions[sid];
  }

  set(sid, val) {
    debug('set value %j for key %s', val, sid);
    this.sessions[sid] = val;
  }

  destroy(sid) {
    delete this.sessions[sid];
  }
}

module.exports = MemoryStore;
```

### 2.2 源码解析


先看 session.js 这个文件，简化之后如下：

```js
module.exports = (options) => {
  return options.defer ? deferSession : session
}
```

先不管 defer 的情况，我们直接看 session 方法, 分两种情况:

1. 用户第一次访问(此时没有 sessionId )
2. 用户带着 sessionId 来访问

#### 2.2.1 用户第一次访问页面的时候(此时没有 sessionId)

```js
 async function session(ctx, next) {
  // 在 getSession 方法中，如果一开始没有 cookie，那么会通过 generateSession 生成一个 session, 默认 session 的值是 { cookie: {httpOnly: true, path: '/' ...}
  // 同时会用 uid-safe 生成一个 sessionId
  const result = await getSession(ctx)

  // 将得到的 session，绑定到 ctx，再结合下面的 Object.defineProperty, 在业务代码中，通过 this.session 进行 session 的读写
  ctx._session = result.session

  // more flexible
  Object.defineProperty(ctx, 'session', {
    get() {
      return this._session
    },
    set(sess) {
      this._session = sess
    }
  })

  // 执行我们的业务代码，参考 koa 的洋葱模型
  await next()

  // refreshSession 里面会调用 saveNow(ctx, ctx.sessionId, session) 方法，把最新的 session 数据存到 store 里面，同时把 sessionId 设置到 cookie 里
  await refreshSession(ctx, ctx.session, result.originalHash, result.isNew)
}

// 保存数据到 store 
 async function saveNow(ctx, id, session) {
   // 此时 session 的内容是 { cookie: { xxx } } 
   // 将 { sessionId: session } 保存到 store 里，默认 store 是使用内存来保存的。可以改为 redis 或者 mongoDB 数据库
   await store.set(id, session)
   // 设置一个 cookie，name 默认为 'koa.sid'，值为 sessionId，cookie 的其他属性比如 maxAge 来自于 session.cookie
   sessionIdStore.set.call(ctx, id, session)
}
```

#### 2.2.2 当用户带着 sessionId 来访问时

```js
async function session(ctx, next) {
  // 先执行 getSession，根据请求中的 sessionId，拿到 store 里面属于这个用户的 session 值
  const result = await getSession(ctx)

  // 执行业务代码，这里业务代码可能会更新 session
  await next()

  // 再把最新的 session 值保存到 store 中，以及写入 cookie
  await refreshSession(ctx, ctx.session, result.originalHash, result.isNew)
}

async function getSession(ctx) {
   // 获取到 cookie 中的 'koa.sid' 这个 cookie 的值
   ctx.sessionId = sessionIdStore.get.call(ctx)
  if (!ctx.sessionId) {
  } else {
    try {
      // 拿到之前 store[sessionId] 的值，即取到之前设置的 session
      session = await store.get(ctx.sessionId)
  }
  return {
    session: session,
  }
}
```

**问题:**  
发现随意修改 cookie 的值，比如将 abc => abd, 发现这个 cookie 会无效。难道有什么地方校验了 cookie 格式？

**答案:**  
破案了，是因为设置了 signed cookie，更多详情请查看: https://github.com/koajs/koa/blob/master/docs/api/context.md#ctxcookiesgetname-options 的 `signed` 参数

## 3. koa-csrf 源码解析

当前源码地址: https://github.com/koajs/csrf/tree/fc122a8cae47889fe7f0a0054f6a723bed2e42bc

**核心代码 src/index.js:**  
```js
middleware(ctx, next) {
  // 注意，这里是一个类似于 getter 函数，当我们在业务中使用 ctx.csrf 时:
  // 比如将它渲染到页面 await ctx.render('index', { csrf: ctx.csrf }) 时
  // 那么这段逻辑就会重新执行，即重新更新 csrf 的值
  
  // 也就是每次请求这个页面，都会重新生成一个新的 csrf 的值
  ctx.__defineGetter__('csrf', () => {
    // 首先创建一个 secret，保存到 session 中，用户刷新页面不会更改 session
    ctx.session.secret = this.tokens.secretSync();
    // 基于这个 secret 生成 csrf，每次刷新页面，会有不同的 csrf 的值
    ctx._csrf = this.tokens.create(ctx.session.secret);
    return ctx._csrf;
  });
	
  // 如果当前请求的方法，在 excludeMethods 里面，那么就不进行 token 的校验
  if (this.opts.excludedMethods.indexOf(ctx.method) !== -1) {
    return next();
  }

  // 如果到了这里，说明需要校验 token，于是从请求的 body 中拿到 token
  const bodyToken = ctx.request.body && typeof ctx.request.body._csrf === 'string' ? ctx.request.body._csrf : false;
  const token = bodyToken || !this.opts.disableQuery && ctx.query && ctx.query._csrf || ctx.get('csrf-token') || ctx.get('xsrf-token') || ctx.get('x-csrf-token') || ctx.get('x-xsrf-token');

  if (!token) {
    return ctx.throw(this.opts.invalidTokenStatusCode, typeof this.opts.invalidTokenMessage === 'function' ? this.opts.invalidTokenMessage(ctx) : this.opts.invalidTokenMessage);
  }

  // 如果 token 校验失败，那么就返回错误信息
  if (!this.tokens.verify(ctx.session.secret, token)) {
    return ctx.throw(this.opts.invalidTokenStatusCode, typeof this.opts.invalidTokenMessage === 'function' ? this.opts.invalidTokenMessage(ctx) : this.opts.invalidTokenMessage);
  }

  return next();
}
```

### 3.1 使用解析

*index.html*
```js
<form action="/register" method="POST">
  <input type="hidden" name="_csrf" value="<%= csrf %>" />
  <input type="email" name="email" placeholder="Email" />
  <input type="password" name="password" placeholder="Password" />
  <button type="submit">Register</button>
</form>
```
当我们使用 koa 渲染以上模板时, 比如通过 `ctx.render('index', { csrf: ctx.csrf })`，那么就重新生成一个 csrf 的值，并注入到页面上(因此每次刷新页面，都会有一个新的 csrf 的值)。

当点击 submit 按钮时，会把 csrf 的信息提交到服务端。服务端先获取 token，然后对 token 进行校验，代码如下:  
```js
const bodyToken = ctx.request.body && typeof ctx.request.body._csrf === 'string' ? ctx.request.body._csrf : false;

const token = bodyToken || !this.opts.disableQuery && ctx.query && ctx.query._csrf || ctx.get('csrf-token') || ctx.get('xsrf-token') || ctx.get('x-csrf-token') || ctx.get('x-xsrf-token');

// 如果 token 校验失败，那么就返回错误信息
if (!this.tokens.verify(ctx.session.secret, token)) {
  // 报错
}
```

### 3.2 如何校验 token

用于生成和校验 csrf 的库的源码地址: https://github.com/pillarjs/csrf/blob/f0d66c91ea4be6d30a03bd311ed9518951d9c3e4/index.js

```js
// 生成 token 的时候，随机一个 salt 的值
// 最终 token 的结果为 salt - hash(salt + '-' + secret)
// 也就是说，可以从 token 中（按照 - 分隔）得到 salt
Tokens.prototype._tokenize = function tokenize (secret, salt) {
  return salt + '-' + hash(salt + '-' + secret)
}


// 校验 token
Tokens.prototype.verify = function verify (secret, token) {
  if (!secret || typeof secret !== 'string') {
    return false
  }

  if (!token || typeof token !== 'string') {
    return false
  }

  var index = token.indexOf('-')

  if (index === -1) {
    return false
  }

  // 从用户提交的 token 中，解析出 salt
  // 从 session 中拿出之前的 secret，根据 salt 和 secret 重新生成 token
  // 看【新生成的 token】 和 【用户提交上来的 token】是否一致
  var salt = token.substr(0, index)
  var expected = this._tokenize(secret, salt)

  return compare(token, expected)
}
```

也就是说:  
1. 生成 csrf 时，随机一个 salt，csrf 的值为 `salt - hash(salt + '-' + secret)`，其中 secret 是保存在 session 中的
2. 当新的 csrf 到来时，我们先获取已保存的 secret，同时从新的 csrf 中分离出 salt 的值 (通过分隔 `-`)，重新计算出 csrf，和新的 csrf 对比是否一致。如果一致，说明这个 csrf 是服务端颁发给这个用户的

## 4. 答疑 & 思考

### 4.1 回答一开始提到的几个问题

1. 服务端的 token 是如何保存的?

保存到 session 中，而 session 本身的实现可以是**数据库/redis/内存**, 通过 sessionId 这个 cookie 的值来区分不同的用户

2. 这个 token 是如何校验的？

参考 3.2

### 4.2 思考

1. CSRF 在 SPA单页应用中，它的下发 token 是怎样的？
