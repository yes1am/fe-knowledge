## margin 重叠

- [MDN 链接](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing)
- [codesandbox 链接](https://codesandbox.io/s/margin-chongdie-sfyyo?file=/src/demo3.jsx)

margin 重叠**只会发生在竖直方向上**，而不会发生在水平方向上。

### 1. 同一层相邻元素之间 (Adjacent siblings) 发生的外边距重叠。

> The margins of adjacent siblings are collapsed (except when the latter sibling needs to be cleared past floats).

不是很理解，但可以参考 [Stack Overflow](https://stackoverflow.com/a/62363503/8018862)。经过测试在 firefox 上和 chrome 上表现确实不一样。

### 2. 没有内容将父元素与后代元素分开

如果没有内容将父元素与后代元素分开，那么父元素的 margin-top 会和**第一个后代元素**的 margin-top 重叠。  

同理父元素的 margin-bottom 会和最后一个后代元素的 margin-bottom 重叠。  

**解决方案:**  

1. 给父元素设置为 BFC
2. 给父元素设置 padding 或者 border


### 3. 空的块级元素

如果有空的块级元素，此时该元素的 margin-top 和 margin-bottom 也会有边界折叠问题发生。

**解决方案:**  

1. 给空的块级元素设置 padding 或者 border 或者 height