# 科幻答案之书（DeepSeek API + Netlify）

这是一个可直接部署到 Netlify 的 Web 应用：
- 前端：原生 HTML/CSS/JS
- 后端：Netlify Functions
- 模型：DeepSeek 官方 API
- 输出：严格显示为 **一句科幻名言/台词 + 作品出处**

## 目录结构

```text
.
├─ index.html
├─ styles.css
├─ app.js
├─ netlify.toml
├─ package.json
└─ netlify/
   └─ functions/
      └─ answer.js
```

## 环境变量

在 Netlify 后台添加：

- `DEEPSEEK_API_KEY`：你的 DeepSeek API Key
- `DEEPSEEK_MODEL`：默认可填 `deepseek-chat`

## 本地开发（可选）

如果你电脑安装了 Node.js：

```bash
npm install -g netlify-cli
netlify dev
```

本地打开提示的网址即可。

## 上线

最简单的安全方式：
1. 将项目解压
2. 上传到 GitHub 仓库
3. Netlify 导入该仓库
4. 在 Netlify 设置环境变量
5. 点击重新部署

## 注意

- 不要把 API Key 写死在前端代码里。
- 这个项目已经把 API Key 放在服务端函数环境变量中。
- 前端不会暴露你的 DeepSeek Key。
