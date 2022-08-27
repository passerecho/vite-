const postcssPresetEnv = require("postcss-preset-env");
const path = require("path"); // 做路径处理的

module.exports = {
    plugins: [
        postcssPresetEnv({
            importFrom: path.resolve(__dirname, "./variable.css"), // 就好比你现在让postcss去知道 有一些全局变量他需要记下来
        })
    ]
}