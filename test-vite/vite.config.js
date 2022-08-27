import {defineConfig, loadEnv} from "vite";
import viteBaseConfig from "./vite.base.config";
import viteDevConfig from "./vite.dev.config";
import viteProdConfig from "./vite.prod.config";



// 策略模式
const envResolver = {
    "build": () => {
        console.log("生产环境");
        return ({ ...viteBaseConfig, ...viteProdConfig })
    },
    "serve": () => {
        console.log("开发环境");
        return  ({ ...viteBaseConfig, ...viteProdConfig }) // 新配置里是可能会被配置envDir .envA
    }
}

export default defineConfig(({ command, mode }) => {
    // 是build 还是serve主要取决于我们敲的命令是开启开发环境还是生产环境
    // console.log("process", process.cwd());
    // 当前env文件所在的目录
    // 第二个参数不是必须要使用process.cwd(),
    const env = loadEnv(mode, process.cwd(), "");
    return envResolver[command]();
})