# 火星日记 - Cloudflare Pages 部署指南

## 🚀 部署步骤

### 1. 准备GitHub仓库

```bash
# 1. 在GitHub上创建新仓库 (例如: mars-diary)
# 2. 添加远程仓库
git remote add origin https://github.com/你的用户名/mars-diary.git

# 3. 推送代码到GitHub
git branch -M main
git push -u origin main
```

### 2. 配置Cloudflare Pages

1. **登录Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 进入 "Pages" 部分

2. **创建新项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 连接你的GitHub账户
   - 选择 `mars-diary` 仓库

3. **配置构建设置**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Root directory: /
   ```

### 3. 配置环境变量

在Cloudflare Pages项目设置中添加以下环境变量：

```
GEMINI_API_KEY=你的Gemini API密钥
ARK_API_KEY=你的豆包API密钥
NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 4. API密钥获取指南

#### Gemini API密钥
1. 访问 https://makersuite.google.com/app/apikey
2. 登录Google账户
3. 创建新的API密钥
4. 复制密钥到环境变量

#### 豆包API密钥
1. 访问 https://console.volcengine.com/ark
2. 注册/登录火山引擎账户
3. 开通豆包服务
4. 获取API密钥

#### Supabase配置
1. 访问 https://supabase.com/dashboard
2. 创建新项目
3. 在项目设置中找到API配置
4. 复制URL和匿名密钥

### 5. 部署完成

- Cloudflare会自动构建和部署你的应用
- 部署完成后会提供一个 `.pages.dev` 域名
- 每次推送到main分支都会自动重新部署

## 🔧 故障排除

### 构建失败
- 检查环境变量是否正确配置
- 确认所有依赖都在package.json中
- 查看构建日志中的错误信息

### API调用失败
- 验证API密钥是否有效
- 检查API配额是否用完
- 确认网络连接正常

## 📝 注意事项

1. **环境变量安全**：不要将真实的API密钥提交到Git仓库
2. **API配额**：注意各个API服务的使用限制
3. **域名配置**：可以在Cloudflare中配置自定义域名
4. **HTTPS**：Cloudflare自动提供HTTPS支持

## 🎉 享受你的火星日记应用！

部署完成后，你的朋友们就可以通过互联网访问你的火星日记应用了！