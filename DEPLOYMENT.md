# 发布到 GitHub Pages 全流程

把本地 Vite 项目发布到 GitHub Pages，让任何人通过链接直接打开。

最终效果：得到一个 `https://用户名.github.io/仓库名/` 的链接，发给别人在浏览器里打开就是 demo。

---

## 一、原理

- 本项目用 `vite-plugin-singlefile` 打包，构建产物是单个 `dist/index.html`（所有 JS/CSS/图片都内联在内）
- `vite.config.ts` 中已设置 `base: './'`，相对路径，能在任何子路径下运行
- 借助 GitHub Actions，每次 `git push` 后自动跑 `npm run build` 并把 `dist/` 部署到 GitHub Pages

---

## 二、一次性准备（每个项目只做一次）

### 1. GitHub 端：创建空仓库

1. 打开 https://github.com/new
2. **Repository name**：填仓库名（例如 `agentin-knowledge-source`）
3. 选 **Public**
4. **不要**勾选 "Add a README"、".gitignore"、"License" —— 三个全部留空
5. 点 **Create repository**

### 2. 本地端：配置 Git 身份（如果从未配置过）

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

> 邮箱建议填 GitHub 注册邮箱，commit 才会被识别成你提交的。

### 3. 项目根目录加入自动部署配置

确认项目根目录有这个文件：`.github/workflows/deploy.yml`

完整内容见本仓库 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。

> 关键点：
> - 触发条件 `branches: [main]`：每次 push 到 main 自动跑
> - 步骤：checkout → setup-node → `npm ci` → `npm run build` → 上传 `dist/` → 部署到 Pages
> - 需要 `permissions: pages: write / id-token: write` 才能写 Pages

---

## 三、首次发布（只做一次）

### 步骤 1：本地初始化 git 并提交

```bash
cd /到/项目目录
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/仓库名.git
```

### 步骤 2：生成 Personal Access Token（PAT）

GitHub 不支持密码登录，必须用 token 作为 push 凭证。

1. 打开 https://github.com/settings/tokens
2. 右上角 **Generate new token** 下拉 → 选 **Generate new token (classic)**
3. **Note**：随便填（如 `local-mac`）
4. **Expiration**：90 days 或 No expiration
5. **Select scopes** 勾选：
   - ✅ `repo`（推送代码必需）
   - ✅ `workflow`（推送 `.github/workflows/*` 文件必需，**否则会报 `refusing to allow a Personal Access Token to create or update workflow`**）
6. 拉到底点 **Generate token**
7. 立刻复制 `ghp_xxxxxxxxxxxx...`（页面关闭后再也看不到）

### 步骤 3：推送代码

```bash
git push -u origin main
```

终端会提示输入凭证：
- `Username`：你的 GitHub 用户名
- `Password`：**粘贴刚才的 token**（不要输 GitHub 网页密码！终端里粘贴时不会显示任何字符，是正常现象，直接 Cmd+V 然后回车）

成功输出示例：
```
To https://github.com/AdleyJin/agentin-knowledge-source.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main' from 'origin'.
```

> macOS 钥匙串会自动记住这个 token，以后再 push 就不用再输入。

### 步骤 4：开启 GitHub Pages

1. 打开 `https://github.com/你的用户名/仓库名/settings/pages`
2. **Build and deployment** → **Source** 下拉选 **GitHub Actions**
   > ⚠️ **不要**选 "Deploy from a branch"
3. 选完即生效，无需保存

### 步骤 5：等部署完成

1. 打开 `https://github.com/你的用户名/仓库名/actions`
2. 看到名为 "Deploy to GitHub Pages" 的 workflow 在跑
3. 等 **build** 和 **deploy** 两个 job 都变成 ✅（约 1–2 分钟）

### 步骤 6：访问 demo

链接固定为：

```
https://你的用户名(全小写).github.io/仓库名/
```

例：`https://adleyjin.github.io/agentin-knowledge-source/`

> ⚠️ GitHub Pages 的子域是**全小写**的（即使你的用户名包含大写），但仓库名部分大小写敏感。

发给任何人，浏览器打开即可。

---

## 四、日常更新

代码改完后，只要：

```bash
git add .
git commit -m "更新说明"
git push
```

push 后 GitHub Actions 会自动重新构建并发布，1–2 分钟后链接就是新版本。**不需要本地 `npm run build`**，全交给 Actions。

---

## 五、常见问题

### Q1: push 时报 `Password authentication is not supported`

**原因**：GitHub 已禁止用密码登录，必须用 PAT。

**解决**：按"步骤 2"生成 token，把 token 当 password 粘贴。

### Q2: push 时报 `refusing to allow a Personal Access Token to create or update workflow ... without 'workflow' scope`

**原因**：你的 token 没有 `workflow` 权限，但推送内容里有 `.github/workflows/*.yml`。

**解决**：
1. 打开 https://github.com/settings/tokens
2. 点击你的 token 名字进入编辑页
3. 勾上 ✅ `workflow`
4. 拉到底点 **Update token**（token 字符串不变，不用重新复制）
5. 重新 `git push`

如果重新 push 还报"Authentication failed"，说明 macOS 钥匙串缓存了旧权限的 token，清一下：

```bash
printf "host=github.com\nprotocol=https\n\n" | git credential-osxkeychain erase
```

然后再 push，重新粘贴 token。

### Q3: GitHub Actions 报错（红色 ❌）

打开 Actions → 点失败的 workflow → 点失败的 step 看红色日志。

最常见原因：
- **`npm ci` 失败**：本地的 `package-lock.json` 没提交，或与 `package.json` 不同步。本地跑一次 `npm install`，把 `package-lock.json` 一起提交。
- **`npm run build` 失败**：本地构建有问题，先在本地 `npm run build` 排查清楚再 push。

### Q4: 链接打开是 404

- 检查 Settings → Pages 的 Source 是否选了 "GitHub Actions"（不是 "branch"）
- 检查 Actions 页面，最近一次 deploy job 是否绿色 ✅
- 如果刚改完设置，等 1 分钟再访问，CDN 有缓存

### Q5: 链接打开是空白页 / 资源 404

`vite.config.ts` 里 `base` 没设对。本项目已经设了 `base: './'`，可以兼容任意路径。如果是其他项目，确保 `base` 设为 `./` 或 `/仓库名/`。

### Q6: 想换更短的链接 / 自定义域名

- 不换域名但想用不同仓库名：到仓库 Settings → 改 Repository name
- 用自己的域名（如 `demo.example.com`）：Settings → Pages → **Custom domain** 填域名，然后到你的域名 DNS 里加一条 CNAME 指向 `你的用户名.github.io`

---

## 六、本项目的链接

- **仓库**：https://github.com/AdleyJin/agentin-knowledge-source
- **Demo**：https://adleyjin.github.io/agentin-knowledge-source/
- **Actions**：https://github.com/AdleyJin/agentin-knowledge-source/actions
