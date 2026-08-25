# “提质增效、AI赋能”创新应用大赛门户

赛事门户原型，覆盖赛事介绍、赛程、项目设置、申报指引、通知公告、常见问题和独立的优秀作品展示页。

## 本地运行

无需安装第三方依赖，使用系统 Python 启动静态服务器：

```sh
npm run dev
```

浏览器访问 `http://localhost:4173`。

## 单文件演示包

生成可离线打开的单文件演示页，内嵌首页、优秀作品展示、样式、交互和图片：

```sh
npm run build:demo
```

产物为 `dist/demo/demo.html`。演示时只需分发这一个文件，可直接双击在浏览器中打开。

可检查演示页是否仍为完全内嵌的单文件：

```sh
npm run check:demo
```

## 发布包

将可直接交付的多页静态站与离线演示统一整理到 `dist/release/`：

```sh
npm run build:release
npm run check:release
```

其中 `dist/release/index.html` 是网站入口，可将整个 `dist/release/` 上传至任意静态 Web 服务器；`dist/release/demo/demo.html` 是可单独分发、离线打开的演示文件。每次构建会重新生成该目录，不要在其中直接维护内容。

### Docker Nginx HTTPS 部署

该项目提供 `deploy/docker-compose.yml`，会只读挂载正式发布包、证书和 Nginx 配置，并开放 80/443。部署前确保域名已解析到服务器、云安全组与系统防火墙仅放行 80/443。

```sh
cp deploy/.env.example deploy/.env
# 编辑 .env，将 SERVER_NAME 改为实际域名
# 将证书链与私钥放入 deploy/certs/fullchain.pem、deploy/certs/privkey.pem
chmod 600 deploy/certs/privkey.pem
npm run build:release
npm run check:release
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config --quiet
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
```

HTTP 仅保留 Let's Encrypt HTTP-01 校验路径，其他请求均重定向至 HTTPS。Nginx 启用了 TLS 1.2/1.3、HSTS、CSP、禁止嵌入、只允许静态读请求、只读根文件系统与最小 Linux capabilities。证书续期后执行 `docker compose --env-file deploy/.env -f deploy/docker-compose.yml restart web` 使 Nginx 重新加载证书。

## 检查

```sh
npm test
```

该命令检查核心页面区域、响应式元信息、无障碍动效降级和页面文案标点约束。

## 目录

- `src/site/`：门户页面结构、样式和交互源码。
- `src/site/assets/`：随静态页面一起发布的赛事主视觉、二维码和其他本地资源。
- `scripts/`：构建与检查脚本。
- `deploy/`：Docker Compose、Nginx、证书占位目录和环境变量模板。
- `dist/`：构建产物，包括离线演示和可部署的发布包；可随时重新生成。
- `docs/`：PRD 等项目文档。
- `reference/`：通知公告等原始参考资料，不会被打入发布包。
- `artifacts/`：本地视觉检查截图，不会被打入发布包。



当前图片为本地化的原型素材，正式部署前建议替换为内部审核通过的赛事主视觉与案例图片。

## 发布优秀作品

当前为静态站点：内容管理员完成授权、审核、脱敏和权限分级后，在 `showcase-data.js` 中新增作品记录并发布站点。在线上传、审批流、文件存储和受限资料访问控制需要接入后端与统一身份认证后实现。
