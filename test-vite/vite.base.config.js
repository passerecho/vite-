import { defineConfig } from "vite";
import { ViteAliases } from "vite-aliases";
import viteCompression from 'vite-plugin-compression';

import MyViteAliases from "./plugins/ViteAliases";
import { createHtmlPlugin } from "vite-plugin-html";
import CreateHtmlPlugin from "./plugins/CreateHtmlPlugin";
import { viteMockServe } from "vite-plugin-mock";
import VitePluginMock from "./plugins/VitePluginMock";

export default defineConfig({
    optimizeDeps: {
        exclude: [], // 将指定数组中的依赖不进行依赖预构建
    },
    envPrefix: "ENV_",
    css: { // 对css的行为进行配置
        // modules配置最终会丢给postcss modules
        modules: { // 是对css模块化的默认行为进行覆盖
            localsConvention: "camelCaseOnly", // 修改生成的配置对象的key的展示形式(驼峰还是中划线形式)
            scopeBehaviour: "local", // 配置当前的模块化行为是模块化还是全局化 (有hash就是开启了模块化的一个标志, 因为他可以保证产生不同的hash值来控制我们的样式类名不被覆盖)
            // generateScopedName: "[name]_[local]_[hash:5]" // https://github.com/webpack/loader-utils#interpolatename
            // generateScopedName: (name, filename, css) => {
            //     // name -> 代表的是你此刻css文件中的类名
            //     // filename -> 是你当前css文件的绝对路径
            //     // css -> 给的就是你当前样式
            //     console.log("name", name, "filename", filename, "css", css); // 这一行会输出在哪？？？ 输出在node
            //     // 配置成函数以后, 返回值就决定了他最终显示的类型
            //     return `${name}_${Math.random().toString(36).substr(3, 8) }`;
            // }
            hashPrefix: "hello", // 生成hash会根据你的类名 + 一些其他的字符串(文件名 + 他内部随机生成一个字符串)去进行生成, 如果你想要你生成hash更加的独特一点, 你可以配置hashPrefix, 你配置的这个字符串会参与到最终的hash生成, （hash: 只要你的字符串有一个字不一样, 那么生成的hash就完全不一样, 但是只要你的字符串完全一样, 生成的hash就会一样）
            globalModulePaths: ["./componentB.module.css"], // 代表你不想参与到css模块化的路径
        },
        preprocessorOptions: { // key + config key代表预处理器的名
            less: { // 整个的配置对象都会最终给到less的执行参数（全局参数）中去
                // 在webpack里就给less-loader去配置就好了
                math: "always",
                globalVars: { // 全局变量
                    mainColor: "red",
                }
            },
        },
        devSourcemap: true,
    },
    build: {
        rollupOptions: { // 配置rollup的一些构建策略
            output: { // 控制输出
                // 在rollup里面, hash代表将你的文件名和文件内容进行组合计算得来的结果
                assetFileNames: "[hash].[name].[ext]"
            }
        },
        assetsInlineLimit: 4096000, // 4000kb 
        outDir: "dist",
        assetsDir: "static"
    },
    plugins: [
        MyViteAliases(),
        viteCompression(),
        // ViteAliases()
        // createHtmlPlugin({
        //     inject: {
        //         data: {
        //             title: "主页"
        //         }
        //     }
        // })
        CreateHtmlPlugin({
            inject: {
                data: {
                    title: "主页2"
                }
            }
        }), // serve === 开启开发服务器
        // viteMockServe()
        VitePluginMock()
    ], 
});