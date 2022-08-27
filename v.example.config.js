// 该文件单独记录我们目前已经学习过的一些配置以及他的功能
import { defineConfig } from "vite";
import eslintPlugin from "vite-plugin-eslint";

export default defineConfig({
    plugins: [eslintPlugin()], // 配置vite插件, vite会在合适的时候去调用这些插件
    optimizeDeps: {
        exclude: [], // exclude的中依赖成员将不会进行依赖预构建
    }
})