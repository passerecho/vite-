/***
 * 一定会去读文件
 * 我们如果写的是相对路径 那么他会尝试去拼接成绝对路径
 * commonjs 规范 注入几个变量 __dirname
 *  
 */


const fs = require("fs"); // 处理文件的模块（读文件, 修改文件等一系列操作）
const path = require("path"); // path本质上就是一个字符串处理模块, 它里面有非常多的路径字符串处理方法
require("./a");

// path.resolve在拼接字符串

//  /Users/iamsavage/Desktop/b站课程/vite教学/test-path
// __dirname + "/variable.css"
const result = fs.readFileSync(path.resolve(__dirname, "./variable.css")); // 我们希望基于main.js去进行一个绝对路径的生成

// console.log("result", result.toString(), process.cwd(), __dirname + "/variable.css", path.resolve(__dirname, "./variable.css"));

// node端去读取文件或者操作文件的时候, 如果发现你用的是相对路径, 则会去使用process.cwd()来进行对应的拼接
// process.cwd: 获取当前的node执行目录

// __dirname: 始终返回的是当前文件所在的目录