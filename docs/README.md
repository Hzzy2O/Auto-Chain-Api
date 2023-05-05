#💻 Auto-Chain-Api

<div>
  <a href="./README.md">中文</a> |
  <a href="./README.en.md">English</a>
</div>

基于Langchain实现的 AutoGPT 应用程序接口，使用 Node.js、TypeScript 和 Express 构建。
它提供了自主运行AI的功能，并且还提供了接入工具的能力，如文件操作、搜索、执行代码和命令行，以及生成图片和克隆Git库等

##🛠️ 搭载工具
文件操作能力：实现文件的读写、删除、查找等基本操作。
搜索能力：提供搜索功能，检索互联网最新信息。
执行代码：可执行用户提供的代码，方便快速测试和验证。
执行命令行：支持命令行操作，以满足更多需求。
生成图片：可根据用户的需求生成图片。
克隆Git仓库：方便快速获取Git 仓库。

##📋 环境要求
Node.js v18 或更高版本

##🚀 安装步骤
克隆项目到本地：

```bash
git clone https://github.com/Hzzy2O/Auto-Chain-Api.git
```

进入项目目录：

```bash
cd Auto-Chain-Api
```

安装依赖：

```bash
pnpm install
```

启动项目：

```bash
pnpm start
```

构建：

```bash
pnpm build
```

在项目根目录下创建一个 .env 文件，设置相关环境变量：
具体参考.env.example里的说明

```bash
LANGCHAIN_API_KEY=your-langchain-api-key
PORT=3000
```

使用以下命令启动开发服务器：

```bash
npm run dev
```

##📄 API 文档
<span>
请查看
<a href="./wiki/api.md">API文档</a>
了解详细的接口信息
</span>

##🤝 贡献
欢迎提交 Pull Request 与 Issue，共同完善和改进项目！

##📝 许可证
本项目采用 MIT 许可证 授权。
