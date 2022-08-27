# vite的预加载

```js
import _ from "lodash"; // lodash可能也import了其他的东西
```

在处理的过程中如果说看到了有非绝对路径或者相对路径的引用, 他则会尝试开启路径补全

```js
import _ from "/node_modules/.vite/lodash"; // lodash可能也import了其他的东西

import __vite__cjsImport0_lodash from "/node_modules/.vite/deps/lodash.js?v=ebe57916";
```

找寻依赖的过程是自当前目录依次向上查找的过程, 直到搜寻到根目录或者搜寻到对应依赖为止 /user/node_modules/lodash, ../

生产 和开发 

yarn dev ---> 开发(每次依赖预构建所重新构建的相对路径都是正确的)

vite会全权交给一个叫做rollup的库去完成生产环境的打包

缓存 ---> 

实际上vite在考虑另外一个问题的时候就顺便把这个问题解决了

commonjs 规范的导出 module.exports 

有的包他是以commonjs规范的格式导出 axios 

**依赖预构建**: 首先vite会找到对应的依赖, 然后调用esbuild(对js语法进行处理的一个库), 将其他规范的代码转换成esmodule规范, 然后放到当前目录下的node_modules/.vite/deps, 同时对esmodule规范的各个模块进行统一集成 

```js
// a 
export default function a() {}

```

```js
export { default as a  } from "./a.js"
```

vite重写以后
```js
function a() {}
```

他解决了3个问题: 
1. 不同的第三方包会有不同的导出格式(这个是vite没法约束人家的事情)
2. 对路径的处理上可以直接使用.vite/deps, 方便路径重写
3. 叫做网络多包传输的性能问题(也是原生esmodule规范不敢支持node_modules的原因之一), 有了依赖预构建以后无论他有多少的额外export 和import, vite都会尽可能的将他们进行集成最后只生成一个或者几个模块

vite.config.js === webpack.config.hs

