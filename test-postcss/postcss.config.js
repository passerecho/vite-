// 就类似于全屋净水系统的加插槽
// 预设环境里面是会包含很多的插件
// 语法降级 --> postcss-low-level
// 编译插件 --> postcss-compiler
// ...
const postcssPresetEnv = require("postcss-preset-env");

// 预设就是帮你一次性的把这些必要的插件都给你装上了
// 做语法的编译 less语法 sass语法 （语法嵌套 函数 变量) postcss的插件 --> 
module.exports = {
    plugins: [postcssPresetEnv(/* pluginOptions */)]
}