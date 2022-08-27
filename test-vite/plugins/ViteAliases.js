// vite的插件必须返回给vite一个配置对象
const fs = require("fs");
const path = require("path");

function diffDirAndFile(dirFilesArr = [], basePath = "") {
    const result = {
        dirs: [],
        files: []
    }
    dirFilesArr.forEach(name => {
        // 我直接用异步的方式去写的
        const currentFileStat = fs.statSync(path.resolve(__dirname, basePath + "/" + name));
        console.log("current file stat", name, currentFileStat.isDirectory());
        const isDirectory = currentFileStat.isDirectory();

        if (isDirectory) {
            result.dirs.push(name);
        } else {
            result.files.push(name);
        }

    })

    return result;
}

function getTotalSrcDir(keyName) {
    const result = fs.readdirSync(path.resolve(__dirname, "../src"));
    const diffResult = diffDirAndFile(result, "../src");
    console.log("diffResult", diffResult);
    const resolveAliasesObj = {}; // 放的就是一个一个的别名配置 @assets: xxx
    diffResult.dirs.forEach(dirName => {
        const key = `${keyName}${dirName}`;
        const absPath = path.resolve(__dirname, "../src" + "/" + dirName);
        resolveAliasesObj[key] = absPath;
    })

    return resolveAliasesObj;
}

module.exports = ({
    keyName = "@"
} = {}) => {
    return {
        config(config, env) {
            // 只是传给你 有没有执行配置文件: 没有
            console.log("config", config, env);
            // config: 目前的一个配置对象
            // production  development  serve build yarn dev yarn build 
            // env: mode: string, command: string
            // config函数可以返回一个对象, 这个对象是部分的viteconfig配置【其实就是你想改的那一部分】
            const resolveAliasesObj = getTotalSrcDir(keyName);
            console.log("resolve", resolveAliasesObj);
            return {
                // 在这我们要返回一个resolve出去, 将src目录下的所有文件夹进行别名控制
                // 读目录
                resolve: {
                    alias: resolveAliasesObj
                }
            };
        }
    }
}
