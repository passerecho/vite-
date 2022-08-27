# 在vite中处理css

vite天生就支持对css文件的直接处理

1. vite在读取到main.js中引用到了Index.css
2. 直接去使用fs模块去读取index.css中文件内容
3. 直接创建一个style标签, 将index.css中文件内容直接copy进style标签里
4. 将style标签插入到index.html的head中
5. 将该css文件中的内容直接替换为js脚本(方便热更新或者css模块化), 同时设置Content-Type为js 从而让浏览器以JS脚本的形式来执行该css后缀的文件

场景:

- 一个组件最外层的元素类名一般取名 : wrapper
- 一个组件最底层的元素雷明明我们一般取名: .footer

你取了footer这个名字, 别人因为没有看过你这个组件的源代码, 也可能去取名footer这个类名

最终可能会导致样式被覆盖（因为类名重复）, 这就是我们在协同开发的时候很容易出现的问题

cssmodule就是来解决这个问题的

大概说一下原理: 

全部都是基于node

1. module.css (module是一种约定, 表示需要开启css模块化)
2. 他会将你的所有类名进行一定规则的替换（将footer 替换成 _footer_i22st_1）
3. 同时创建一个映射对象{ footer: "_footer_i22st_1" }
4. 将替换过后的内容塞进style标签里然后放入到head标签中 (能够读到index.html的文件内容)
5. 将componentA.module.css内容进行全部抹除, 替换成JS脚本
5. 将创建的映射对象在脚本中进行默认导出

less(预处理器): less给我们提供了一些方便且非常实用的方法