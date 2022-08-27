# 你必须要理解的vite脚手架和vite

vite官网搭建vite项目文档教程: https://vitejs.dev/guide/#scaffolding-your-first-vite-project

比如我们敲了```yarn create vite```

1. 帮我们全局安装一个东西: create-vite (vite的脚手架)
2. 直接运行这个create-vite bin目录的下的一个执行配置

我们之前接触过vue-cli 

很多同学可能就会存在误区: **认为官网中使用对应yarn create构建项目的过程也是vite在做的事情**

create-vite和vite的关系是什么呢？ ---- create-vite内置了vite

使用vue-cli 会内置webpack 

先学习的就是vite

我们暂时不会使用```yarn create vite my-vue-app --template vue```

vue-cli 可以和webpack分的很清楚 

vite --> vue团队的 create-vite ---> vue团队

vue团队希望弱化vite的一个存在感, 但是我们去学习的时候不能弱化的, 

预设: 买房子 毛坯房(我们的工程) 买沙发, 做装修, 修各个厕所, 埋线, 精装修的房: 搭建好了

我们自己搭建一个项目: 下载vite, vue, post-css, less, babel

vue-cli/create-react-app(开发商)给我们提供已经精装修的模板: 帮你把react/vue都下好了, 同时他还帮你把配置调整到了最佳实践

create-vite(开发商)给你一套精装修模板(给你一套预设): 下载vite, vue, post-css, less, babel好了, 并且给你做好了最佳实践的配置