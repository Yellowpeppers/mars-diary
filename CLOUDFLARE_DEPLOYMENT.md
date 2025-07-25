# Cloudflare Pages 部署指南

## 🚀 部署步骤

### 1. 构建项目
```bash
npm run pages:build
```

### 2. 部署到 Cloudflare Pages
```bash
npm run pages:deploy
```

## ⚙️ 环境变量配置

部署完成后，需要在 Cloudflare Pages 控制台中设置以下环境变量：

### 必需的环境变量

1. **Supabase 配置**
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://sxprhemlcbburwblzkbm.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cHJoZW1sY2JidXJ3Ymx6a2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjYwMjIsImV4cCI6MjA2ODk0MjAyMn0.eAbYOxqocvPLEyIDKHaPU3oSObylOE2NvITE3wbds-0`
   - `SUPABASE_SERVICE_ROLE_KEY`: **⚠️ 必须设置！** 从 Supabase 项目设置中获取

2. **AI API 配置**
   - `GEMINI_API_KEY`: `AIzaSyCTVs2Tdxmtyhl1hQmwSIwl2itYmFAv5Ws`
   - `ARK_API_KEY`: `e453dc12-c50e-47a1-ba68-3cca996c9c17`

### 如何设置环境变量

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages 项目
3. 点击 "Settings" 标签
4. 找到 "Environment variables" 部分
5. 添加上述环境变量
6. 保存并重新部署

## 📝 注意事项

- 环境变量设置完成后需要重新部署才能生效
- 确保所有 API 密钥都是有效的
- 生产环境和预览环境可能需要分别设置环境变量

### 获取 Supabase Service Role Key

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 "Settings" → "API"
4. 在 "Project API keys" 部分找到 "service_role" 密钥
5. 复制该密钥并设置为 `SUPABASE_SERVICE_ROLE_KEY` 环境变量

## 🔧 故障排除

### ❌ API 返回 500 错误
**最常见原因：缺少 `SUPABASE_SERVICE_ROLE_KEY`**

解决步骤：
1. **首先检查** `SUPABASE_SERVICE_ROLE_KEY` 是否已设置
2. 确认所有环境变量都已正确配置
3. 重新部署项目使环境变量生效
4. 查看 Cloudflare Pages 的部署日志

### 🔍 测试 API 连接
部署后可以访问以下 URL 测试：
- `https://your-site.pages.dev/api/test` - 基础 API 测试
- 如果返回 500 错误，说明环境变量配置有问题