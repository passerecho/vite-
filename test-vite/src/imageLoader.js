// 主要是来帮助我们学习怎么加载静态图片资源
import sylasPicUrl from "@assets/images/sylas.png";  // 原始 字符串的replace操作

// 服务端 他会去读取这个图片文件的内容 ---> Buffer  二进制的字符串
// Buffer

console.log("sylasPicUrl", sylasPicUrl);

const img = document.createElement("img");

img.src = sylasPicUrl;

document.body.append(img);