import "./src/imageLoader";
import "./src/svgLoader";
// import { name } from "./src/assets/json/index.json";

// 这个对象我都用到了, 那么打包工具敢删除对象里面的成员吗？？？

// 流媒体 video src 都不是一个mp4 rtmp 
// lodash ---> js工具库 深度克隆

// 企业项目: 如果生产环境非常的臃肿和性能差
// 控制导入

// tree shaking 摇树优化: 打包工具会自动帮你移除掉那些你没有用到的变量或者方法
console.log("jsonFile", name);// 如果你用的不是vite, 在其他的一些构建工具里 json文件的导入会作为一个JSON字符串形式存在

fetch("/api/users", {
  method: "post"
}).then(data => {
  console.log("data", data);
}).catch(error => {
  console.log("error", error);
})