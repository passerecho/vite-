const Koa = require("koa"); // 不能用esmodule 必须使用commonjs
const fs = require("fs");  // ./ / npm install yarn add 
const path = require("path");

// 读取vite.config.js ??? fs去读取？
// 我们不用返回给客户端的吧 而且我们这里约定的名字就叫做vite.config.js
const viteConfig = require("./vite.config");
const aliasResolver = require("./aliasResolver");

console.log("vite.Config", viteConfig)

const app = new Koa();  // const vue = new Vue();
app.use(async (ctx) => { //context 上下文 request --> 请求信息 响应信息 get请求 / 
    console.log("ctx", ctx.request, ctx.response);
    // 用中间件去帮我们读文件就行了
    if (ctx.request.url === "/") {
        const indexContent = await fs.promises.readFile(path.resolve(__dirname, "./index.html")); // 在服务端一般不会这么用
        ctx.response.body = indexContent;
        ctx.response.set("Content-Type", "text/html");  
    }
    // 如果当前文件的url是以js后缀结尾的
    // 我们的root js文件一定是和html文件在一个目录的对不对
    if (ctx.request.url.endsWith(".js")) {
        const JSContent = await fs.promises.readFile(path.resolve(__dirname, "." + ctx.request.url)); // 在服务端一般不会这么用
        console.log("JSContent", JSContent);
        // 直接进行alias的替换
        const lastResult = aliasResolver(viteConfig.resolve.alias, JSContent.toString());
        ctx.response.body = lastResult; // 作为响应体发给对应的请求的人
        ctx.response.set("Content-Type", "text/javascript");
    }
})

app.listen(5173, () => {
    console.log("vite dev serve listen on 5173");
})