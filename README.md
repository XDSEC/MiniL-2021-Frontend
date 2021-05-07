# mini LCTF 前端

## 部署

此仓库在盘神前端的基础上将后端改为CTFd（或与CTFd 拥有一致API的后端）  

nginx配置

```conf
location / {
  前端，参考原README
}
location /events {
  sse，自行搜索相关
}
location /api/v1 {
  proxy_set_header        Host $host;
  proxy_set_header        X-Real-IP $remote_addr;
  proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header        X-Forwarded-Proto $scheme;
  proxy_pass ->>CTFd;
}
```

## CTFd 插件整合

### api auth

由于CTFd登陆注册的路由挂在了`/`上而不是`/api/v1`，使用时需要加个插件  

https://gist.github.com/frankli0324/c91ab94ce4f7c2a1d34c57f09bc36604  

使用时在`plugins`目录下创建一个目录，将上面的脚本在此目录下保存为`__init__.py`

### ctfd-whale

将`page_blueprint`的`url_prefix`改为`/api/v1`  
不嫌麻烦的话把whale的assets里头的`/plugins/ctfd-whale`也都换成`/api/v1`，方便后台管理

### ctfd-more-events

给bot播报用

## 关于为什么要用CTFd

* 后台比较漂亮，看谁交了啥flag之类的
* 有现成的docker插件

## 使用方法

1. 安装依赖

```bash
yarn install
```

2. 测试运行

```bash
yarn serve
```

3. 打包项目

```bash
yarn build
```
