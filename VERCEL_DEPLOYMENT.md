# 火星日记 - Vercel 部署指南

## 🚀 快速部署到 Vercel

### 方法一：使用 Vercel CLI（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   # 在项目根目录执行
   vercel
   
   # 按照提示操作：
   # - Set up and deploy? [Y/n] Y
   # - Which scope? 选择你的账户
   # - Link to existing project? [y/N] N
   # - What's your project's name? mars-diary
   # - In which directory is your code located? ./
   ```

4. **配置环境变量**
   ```bash
   # 添加环境变量
   vercel env add GEMINI_API_KEY
   vercel env add ARK_API_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXTAUTH_SECRET
   ```

5. **重新部署**
   ```bash
   vercel --prod
   ```

### 方法二：通过 GitHub 连接

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

2. **在 Vercel Dashboard 导入项目**
   - 访问 https://vercel.com/dashboard
   - 点击 "New Project"
   - 从 GitHub 导入你的仓库
   - 选择 "mars-diary" 项目

3. **配置构建设置**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### 环境变量配置

在 Vercel Dashboard 的项目设置中添加以下环境变量：

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `GEMINI_API_KEY` | Google Gemini API 密钥 | `AIzaSy...` |
| `ARK_API_KEY` | 豆包 API 密钥 | `ak-...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | 随机生成的字符串 |
| `NEXTAUTH_URL` | 应用 URL | `https://your-app.vercel.app` |

### 生成 NEXTAUTH_SECRET

```bash
# 生成随机密钥
openssl rand -base64 32
```

### 部署后配置

1. **更新 Supabase 认证设置**
   - 在 Supabase Dashboard 中，进入 Authentication > URL Configuration
   - 添加你的 Vercel 域名到 "Site URL" 和 "Redirect URLs"
   - 例如：`https://your-app.vercel.app`

2. **测试部署**
   - 访问你的 Vercel 应用 URL
   - 测试用户注册、登录功能
   - 测试日记创建和查看功能

### 常见问题

#### 1. API 路由 500 错误
- 检查环境变量是否正确设置
- 确保 Supabase 数据库表已创建（运行 `supabase-setup.sql`）

#### 2. 认证失败
- 确保 `NEXTAUTH_URL` 设置为正确的 Vercel 域名
- 检查 Supabase 的 URL 配置

#### 3. 图片加载失败
- 检查 `ARK_API_KEY` 是否正确
- 确保豆包 API 配额充足

### 监控和日志

- 在 Vercel Dashboard 中查看函数日志
- 使用 `vercel logs` 命令查看实时日志
- 在 Supabase Dashboard 中监控数据库查询

### 自定义域名（可选）

1. 在 Vercel Dashboard 中进入项目设置
2. 点击 "Domains" 标签
3. 添加你的自定义域名
4. 按照提示配置 DNS 记录
5. 更新 `NEXTAUTH_URL` 环境变量为新域名

## 🎉 部署完成！

你的火星日记应用现在已经部署到 Vercel 上了！用户可以：
- 注册和登录账户
- 写地球日记并转换为火星日记
- 生成火星场景图片
- 查看日记时间线
- 分享和下载图片

如果遇到问题，请检查 Vercel 函数日志和 Supabase 日志来诊断问题。