# vite和webpack启动工程比较

1. 是通过使用vue-cli去构建一个基于webpack的vue工程
2. 使用vite去构建一个基于vite的vue工程

```
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

- 全局安装: 这个依赖会被安装到你的用户目录, 某些依赖还会自动给你注入环境变量 别名注入一个vue
  - webpack去找寻依赖的时候他并不会只找寻当前目录的node_modules, 他会依次往上找直到在根目录都没有找到对应的依赖, 他才会报错
  - 所以我们全局安装的话无论在哪个文件夹下里都可以访问到这个依赖
- 非全局安装
  - 生产状态: -S
  - 开发状态: -D eslint 


- yarn create: 
  - 


