## BFC


[MDN 文档](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Block_formatting_context)

### 1. 创建 BFC 的一些方式:  

- 根元素 `<html>`
- 浮动元素: 元素的 float 不是 none
- 绝对定位元素: 元素的 position 为 absolute 或者 fixed
- overflow 的计算值 (computed) 不为 visible 的块元素
- display 值为 flex-root 的元素
- ... 等等，更多请查看 MDN 文档

### 2. BFC 的三个作用

[codesandbox 链接](https://codesandbox.io/s/bfc-d2mfl?file=/src/demo1.jsx)

1. 一个 BFC 元素，可以完全的包裹内部的 float 元素，使得 float 元素不会溢出
2. 一个 BFC 元素，可以和另一个 float 的兄弟元素分隔开，防止被 float 元素遮挡
3. 在兄弟元素中的某一个元素外，套一个 BFC 的父元素，可以防止原来的兄弟元素 margin 重叠

