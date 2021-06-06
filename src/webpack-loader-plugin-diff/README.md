# Webpack 中 loader 和 plugin 的区别

## 1. Loader

Loader 是一个转换器，运行你在 `import` 加载这个文件之前去处理文件。因此 loaders 可以将 TS 转换为 js，可以将图片转为 base64，甚至可以让你直接在 JS 中 import css 文件 (因为它会将 css 转换为 js 代码)。

比如在 js 中引入 markdown 文件，那么 js 是无法识别 markdown 文件的, 因为它不是 js (都没有导出一个内容)。此时就需要一个 loader。

*webpack.config.js*
```js
{
  module: {
    rules: [
      {
        test: /\.md$/,
        use: path.resolve("./my-custom-loaders/md-loader.js"),
      },
    ]
  }
}
```

*my-custom-loaders/md-loader.js*

```js
module.exports = function (source) {
  // 任何你想要做的处理
  return 'module.exports = ' + JSON.stringify(source);
}
```

比如以上这个 loader 就简单将 markdown 的内容，转换为一个 js 字符串。在这个 loader 中，我们可以对 source 做任何你想要的处理，比如“增删改代码”。只要最后返回一个 JS 模块即可。

比如如下的配置：
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
};
```

即 js 本身是不能识别 less 文件的，那么:  
1. less-loader 可以先把 less 文件转换为 css 文件
2. css-loader 和 style-loader 再对 css 文件的内容进行处理, 并转换为一个 js 模块

## 2. Plugin

Plugin 的话不是针对某个类型的文件做处理，而是在整个打包过程中，去做一些事情，核心是一些钩子 (hooks)，包含 [compiler 钩子](https://www.webpackjs.com/api/compiler-hooks/) 和 [compilation 钩子](https://www.webpackjs.com/api/compilation-hooks/)。

React 的生命周期是，如果我们在 `render` 或者 `componentDidUpdata` 等时期添加一些逻辑，那么在组件渲染或更新时就会执行这些逻辑。

而 webpack 也是类似的，在 webpack 进行打包的过程中，也可以触发一些事件(可以理解为 hooks，或者生命周期)，plugin 就是在去监听这些事件，并做相关的逻辑。

比如，webpack 打包必然涉及 loader 的加载，那么我们可以写一个 plugin 是只要监听到了 loader 解析对应的事件 (即 `normalModuleLoader`)，就打印出对应出该模块的路径和所使用的 loader:

*webpack.config.js*
```js
const MyPlugin = require("./my-custom-plugins/my-plugins");

module.exports = {
  plugins: [
    new MyPlugin(),
  ],
};
```

*my-custom-plugins/my-plugins.js*
```js
// A JavaScript class.
class MyPlugin {
  // 必须定义一个 apply 方法
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      compilation.hooks.normalModuleLoader.tap('MyPlugin', (loaderContext, mod) => {
        console.log(`${mod.resource} 资源的 loaders 是:`, mod.loaders)
      })
    })
  }
}

module.exports = MyPlugin;
```
打印结果如下:

![20210606145007](https://raw.githubusercontent.com/yes1am/PicBed/master/img/20210606145007.png)


又或者，我们写一个 Plugin (官方示例: https://v4.webpack.docschina.org/contribute/writing-a-plugin/#%E7%A4%BA%E4%BE%8B)，每次除了正常打包结果之外，**我们还输出一个文件 filelist.md**，该文件记录了我们生成的文件信息。 (实际上就是监听 [emit hook](https://www.webpackjs.com/api/compiler-hooks/#emit), 在真正生成文件前，对 `compilation` 对象进行改动):

```js
class FileListPlugin {
  apply(compiler) {
    // emit 是异步 hook，使用 tapAsync 触及它，还可以使用 tapPromise/tap(同步)
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      // 在生成文件中，创建一个头部字符串：
      var filelist = 'In this build:\n\n';
      // 遍历所有编译过的资源文件，
      // 对于每个文件名称，都添加一行内容。
      for (var filename in compilation.assets) {
        filelist += '- ' + filename + '\n';
      }
      // 将这个列表作为一个新的文件资源，插入到 webpack 构建中：
      compilation.assets['filelist.md'] = {
        source: function() {
          return filelist;
        },
        size: function() {
          return filelist.length;
        }
      };
      callback();
    });
  }
}

module.exports = FileListPlugin;
```

又或者是像 [clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin), 实际上就是在监听 emit 和 done 两个事件，去删除对应的文件。

[源码](https://github.com/johnagan/clean-webpack-plugin/blob/6d8a2323a4700f2e01614c8606d1ed26853a63ce/src/clean-webpack-plugin.ts#L185-L193)

```js
if (this.cleanOnceBeforeBuildPatterns.length !== 0) {
  hooks.emit.tap('clean-webpack-plugin', (compilation) => {
    this.handleInitial(compilation);
  });
}

hooks.done.tap('clean-webpack-plugin', (stats) => {
  this.handleDone(stats);
});
```

## 3. 简单总结

1. loader 是用来解析某些特定文件的，将非 js 转换为 js，或者是对 js 代码做一些处理或者转换 (比如 babel)
2. plugin 是在 webpack 整个生命周期中，通过监听 webpack 抛出的一些事件，通过一些 API 来修改输出结果 (比如多输出一个文件，或者删除某个目录，或者任何你想做的事情)。

## 参考资料

1. webpack 中 loader 和 plugin 的区别是什么: https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/308
2. 怎样编写一个简单的webpack插件：https://zhuanlan.zhihu.com/p/142010380
   1. webpack源码解读 - 主编译流程：https://zhuanlan.zhihu.com/p/135985621
   2. webpack源码解读 - 理解Tapable原理：https://zhuanlan.zhihu.com/p135997214
