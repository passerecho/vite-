
// 涉及到commonjs规范的一个原理 


// module.exports require() // es6 module import export for

module

exports = module.exports = {}

// 第5个成员 就是__dirname __filename

(function(exports, require, module, __filename, __dirname) {
    require("")
    console.log("__dirname", __dirname);
}())

// 出node课程