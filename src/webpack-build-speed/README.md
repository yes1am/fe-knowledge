# webpack 编译性能

[参考文档](https://webpack.js.org/guides/build-performance/)

为了优化打包性能，首先得知道性能是如何的，时间花在哪里了，在 [如何提升 Webpack 打包速度](https://zhuanlan.zhihu.com/p/145012279) 提到了[speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin/) 用于测量 loader 和 plugin 花的时间。

## 1. 通用环境

无论你是在 deelopment 环境，还是 production 环境，以下的最佳实践都可以帮助你。

### 1.1. Stay Up to Date(保持更新)

- 使用最新的 webpack，因为 webpack 团队一直在优化性能

- 使用最新版本的 nodejs, 并且让你的包管理工具 (例如: `npm` 或者 `yarn`) 更新到最新，因为新版本可以创建效率更高的 module

### 1.2. Loaders

只将 loader 应用给最少的模块，而不是:  

```js
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
    ],
  },
};
```

使用 `include` 字段来确保只转换**需要转换**的 module:  

```js
const path = require('path');

module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader',
      },
    ],
  },
};
```



**Note:** 
1. 可以使用 [speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin) 来测量打包速度
2. 经过测试，确实提升比较大，由原来的 12，13 秒，提升到了 3, 4 秒

### 1.3. Bootstrap

每一个额外的 loader/plugin 都有一个 bootup(开机) 时间，尽可能的少使用 loader / plugin

### 1.4. Resolving (解析)

```js
resolve: {
    // 用于描述的 JSON 文件
    descriptionFiles: ['package.json'],
    // 告诉 webpack 解析模块时应该搜索的目录。
    modules: ['node_modules'],
    // 尝试按顺序解析这些后缀名，可以使得用户在引入模块时不带扩展
    // 比如 import File from '../path/to/file'，那么会依次查找 file.js, file.json, file.wasm
    extensions: ['.js', '.json', '.wasm'],
    // 解析目录时要使用的文件名。
    mainFiles: ['index']
  },
}
```

以下步骤可以加快解析速度:  

1. 减少 `resolve.modules`, `resolve.extensions` , `resolve.mainFiles` 以及 `resolve.descriptionFiles` 这些数组内元素的数量，因为它们会增加文件系统调用的次数
2. 设置 `resolve.symlinks: false`, 如果你不使用 symlinks (比如 `npm link` 或者 `yarn link`) 的话
3. 设置 `resolve.cacheWithContext: false`, 如果你使用了自定义的，不是特定 context 的 resolving plugin


### 1.5. Dlls

使用 `DLLPlugin` 将几乎不会变动的代码库(基本上是第三方库，如 react, react-dom 等)，进行单独的编译。这样会提升应用的编译速度，尽管这样会提到编译过程的复杂度。

参考: [webpack使用-详解DllPlugin](https://segmentfault.com/a/1190000016567986###)  


### 1.6. Smaller = Faster (更小 = 更快)

减少编译的整体体积，来提升编译性能。尽量让 chunks 更小:  

1. 使用更少/更小的库
2. 在多页应用中，使用 `SplitChunksPlugin` (之前是 `CommonsChunkPlugin`)，原理是多页应用会有多个 enter， Page A 打包出 a.js, Page B 打包出 b.js，而它们公共的代码比如 `antd`, `lodash` 等会分别打入 a.js 和 b.js。使用 `SplitChunksPlugin` 可以单独打包一份公共的 `vender.js`, 这样就避免了打包两份 `lodash` 的问题.
3. 在多页应用中，使用 `async` 模式的 `SplitChunksPlugin`
4. 删除未使用的代码 (如何操作？)
5. 只编译你真正依赖的代码 (比如如果只使用了 antd `Button` 组件, 那么不应该打包整个 `antd` 包)

### 1.7. Worker Pool (工作线程池)

[thread-loader](https://www.webpackjs.com/loaders/thread-loader/) 可以将运行比较耗时的 loader，放到 worker pool 中。

把这个 loader 放置在其他 loader 之前， 放置在这个 loader 之后的 loader 就会在一个 **单独的 worker 池(worker pool)** 中运行。

注意: 不要使用太多的 workers，因为 Node.js 运行时和加载器会有**启动开销**。尽量减少主线程与工作线程之间的模块传输(通信)，IPC (Inter-Process Communication: 进程间通信) 很昂贵。

### 1.8. Persistent cache(持久化存储)

在 webpack 配置中使用 [cache](https://webpack.docschina.org/configuration/other-options/#cache), 在 package.json 的 `postinstall` 中清除 cache。

### 1.9. Custom plugins/loaders (自定义 plugins / loaders)

使用自定义的 plugin 或者 loader 时，需要对它们进行一个大概的分析，以免引入性能问题。

### 1.10. Progress Plugin

从 webpack 配置中移除 `ProgressPlugin` 可以减少编译时间. 记住，`ProgressPlugin` 可能不会为**快速构建**提供太多的价值，因此，请权衡利弊再使用

[progress-plugin 文档](https://webpack.js.org/plugins/progress-plugin/): 可以打印 webpack 的编译进度。

使用:  

```js
const handler = (percentage, message, ...args) => {
  // e.g. Output each progress message directly to the console:
  console.info("###",percentage, message, ...args);
};

module.exports = {
  plugins: [
    new webpack.ProgressPlugin(handler)
  ]
}
```

效果截图:  

![20210617164336](https://raw.githubusercontent.com/yes1am/PicBed/master/img/20210617164336.png)

## 2. Development (开发环境)

以下步骤在开发环境会很有效

### 2.1 Incremental Builds (增量编译)

使用 webpack 的 `watch` 模式，**不要**使用其他工具来监听你的文件，然后调用 webpack。内置的 `watch` 模式会跟踪 timestamps 并且把这个信息传递给 compilation 来使得缓存失效。

在某些情况下，`watch` 模式会回退到 polling mode (轮询模式)，监听许多的文件会造成 CPU 大量负载。这种情况下，你可以设置 `watchOptions.poll` 来增加轮询的频率。

### 2.2 Compile in Memory (内存编译)

以下的几个工具，可以通过在内存中 (而不是写入磁盘) 编译和 serve 资源，从而提升性能。

1. webpack-dev-server
2. webpack-hot-middleware
3. webpack-dev-middleware

### 2.3 stats.toJSon 加速

webpack 4 默认使用 `stats.toJson()` 输出大量数据。除非在增量步骤中做必要的统计，否则请避免获取 stats 对象的部分内容。webpack-dev-server 在 v3.1.3 以后的版本，包含一个重要的性能修复，即最小化每个增量构建步骤中，从 stats 对象获取的数据量。

### 2.4 Devtool

需要知道不同的 [devtool](https://webpack.docschina.org/configuration/devtool/) 设置中，它们的性能差距。

1. `eval` 具有最好的性能，但并不能帮助你转译代码
2. 如果你能接受稍差一些的 map 质量，可以使用 `cheap-source-map` 来提高性能
3. 使用 `eval-source-map` 进行增量编译。

注意: 大多数情况下，`eval-cheap-module-source-map` 是最佳实践。

### 2.5 避免使用生产环境下才会用到的工具

有一些工具，plugins，loaders 只在 Production (生产环境) 下才有意义。例如，在 development 环境下使用 `TerserPlugin` 来 minify (压缩) 和 mangle(混淆) 你的代码是没有意义的

1. TerserPlugin
2. [fullhash] / [chunkhash] / [contenthash]
3. AggressiveSplittingPlugin
4. AggressiveMergingPlugin
5. [ModuleConcatenationPlugin](https://www.webpackjs.com/plugins/module-concatenation-plugin/): 过去 webpack 打包时的一个取舍是将 bundle 中各个模块**单独**打包成闭包，这个插件可以预编译所有模块到一个闭包中

### 2.6 Minimal Entry Chunk (最小化 entry chunk)

没看懂...

直接看[官方文档](https://webpack.docschina.org/guides/build-performance/#minimal-entry-chunk)吧。  

### 2.7 Avoid Extra Optimization Steps (避免额外的优化)

webpack 通过执行额外的算法任务，来优化输出结果的体积和加载性能。这些优化适用于小型代码库，但是在大型代码库中却非常耗费性能:  

```js
module.exports = {
  // ...
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
};
```

### 2.8 Output Without Path Info(输出结果不携带路径信息)

webpack 会在打包结果中，输出引用模块的路径信息，比如:  

```js
/***/ "./node_modules/@ant-design/icons/es/components/twoTonePrimaryColor.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@ant-design/icons/es/components/twoTonePrimaryColor.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
```

但在打包数千个模块的项目中，这会造成垃圾回收性能的压力，因此可以在 [output.pathinfo](https://webpack.docschina.org/configuration/output/#outputpathinfo) 中关闭:  

```js
module.exports = {
  // ...
  output: {
    pathinfo: false,
  },
};
```

**注意:**  
经过测试，这一项还可以降低最终打包结果的体积，从 14.1M 到 13.7M (具体数字因项目变化)

### 2.9 Node.js 版本 8.9.10-9.11.1

Node.js v8.9.10 - v9.11.1 中的 ES2015 Map 和 Set 实现，存在 性能回退。webpack 大量地使用这些数据结构，因此这次回退也会影响编译时间。

之前和之后的 Node.js 版本不受影响。

### 2.10 TypeScript Loader

当使用 `ts-loader` 时，使用 `transpileOnly` 参数表示只进行编译，而不会进行类型检查。

如果想拥有类型检查的功能，使用 `ForkTsCheckerWebpackPlugin`，这会加速 TS 类型检查的速度，以及 eslint 的速度，因为这个插件会把类型检查的过程放到**单独的进程(process)**去执行。

```js
module.exports = {
  // ...
  test: /\.tsx?$/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  ],
};
```

这里有一个 `ts-loader` 的[完整示例](https://github.com/TypeStrong/ts-loader/tree/master/examples/fork-ts-checker-webpack-plugin)。  

## 3. Production (生产环境)

以下这些步骤在 production 环境下有效。

**注意：**  
**不要为了小的性能提升而牺牲应用程序的质量！**在大多数情况下，优化代码质量比构建性能更重要。  

### 3.1 Multiple Compilations(多个 Compilations 对象)

当使用多个 Compilations 对象时，以下步骤可以帮忙:  

1. [parallel-webpack](https://github.com/trivago/parallel-webpack): 允许在一个 worker 池中运行 compilation
2. cache-loader：在多个 compilation 中共享缓存

### 3.2 Source Maps

Source maps 很消耗性能. 你确定需要它吗？

## 4. Specific Tooling Issues (特定工具的问题)

以下的工具存在某些问题，会降低构建性能

1. Babel
   1. 尽可能减少 preset / plugins 的数量
2. Typescript
   1. 使用 fork-ts-checker-webpack-plugin 将类型检查拆分到单独的进程
   2. 配置 loader 跳过类型检查
   3. 使用 ts-loader 时，设置 `happyPackMode: true / transpileOnly: true`
3. Sass
   1. `node-sass` 中有个来自 Node.js 线程池的阻塞线程的 bug。 当使用 thread-loader 时，需要设置 `workerParallelJobs: 2`

## 参考资料

1. 官方文档 Build Performance: https://webpack.js.org/guides/build-performance/
2. webpack使用-详解DllPlugin:https://segmentfault.com/a/1190000016567986###
3. 如何提升 Webpack 打包速度: https://zhuanlan.zhihu.com/p/145012279
4. SPEEDING UP WEBPACK: https://stephencook.dev/blog/speeding-up-webpack/