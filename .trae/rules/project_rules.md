## 项目概述

这是一个 LLM 的聊天框架，用于用户与大模型进行对话

## 开发环境

### 技术栈

- **前端框架**: Next.js 15 (React 框架)
- **开发语言**: TypeScript/JavaScript, Node.js
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **代码编辑器**: CodeMirror
- **数据库**: PostgreSQL (使用 Drizzle ORM)
- **缓存**: Redis
- **文件存储**: Vercel Blob
- **AI 集成**: AI SDK, xAI API
- **认证**: NextAuth.js
- **代码质量**: Biome (格式化和代码检查)
- **测试**: Playwright
- **包管理**: pnpm
- **部署**: Vercel

### 环境要求

- Node.js 18+
- pnpm
- PostgreSQL 数据库
- Redis (可选，用于缓存)

### 开发命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm lint` - 代码检查和格式化
- `pnpm db:migrate` - 数据库迁移
- `pnpm db:studio` - 打开数据库管理界面
- `pnpm test` - 运行测试

### 环境变量配置

需要在 `.env.local` 文件中配置以下环境变量：

- `AUTH_SECRET` - 认证密钥
- `XAI_API_KEY` - xAI API 密钥
- `POSTGRES_URL` - PostgreSQL 数据库连接字符串
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob 存储令牌
- `REDIS_URL` - Redis 连接字符串（可选）

## 通用规则

- 生成代码简洁易懂，不要有重复
- 使用中文作为回复
- 代码注释要符合人类程序员的样式，不写入不必要的注释，符合 Nodejs 规范、Javascript 规范、TypeScript 规范
- 如果需要执行命令，请提示我，由我来执行，并反馈结果后继续新的对话
