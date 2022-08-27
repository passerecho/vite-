# vite常用插件之vite-plugin-mock

mock数据: 模拟数据

前后端一般是并行开发 用户列表 ( 接口文档 )

mock数据 去做你前端的工作 

1. 简单方式: 直接去写死一两个数据 方便调试
  - 缺陷： 
    - 没法做海量数据测试
    - 没法获得一些标准数据 
    - 没法去感知http的异常

    axios: http请求库 

2. mockjs: 模拟海量数据的， vite-plugin-mock的依赖项就是mockjs

https://github.com/vbenjs/vite-plugin-mock