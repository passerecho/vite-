import _ from "lodash"; // lodash可能也import了其他的东西
import lodashES from "lodash-es";

// 假设lodash又依赖了其他的模块, 并且这些模块都是用export导出

console.log("lodash", _);

// 既然我们现在的最佳实践就是node_modules, 那为什么es官方在我们导入非绝对路径和非相对路径的资源的时候不默认帮我们
// 搜寻node_modules呢？
export const count = 0;