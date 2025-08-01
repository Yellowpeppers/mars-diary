# 火星日记 - 技术栈说明

## 认证系统

### 为什么选择 Supabase Auth 而不是 NextAuth？

**当前实现**: Supabase Auth + 邮箱密码登录

**技术优势**:
1. **简单可靠**: 传统的邮箱密码登录方式，用户熟悉
2. **安全性高**: 基于成熟的密码认证机制
3. **集成度高**: 与 Supabase 数据库无缝集成，统一管理用户数据
4. **配置简单**: 无需额外的 OAuth 配置和密钥管理
5. **用户体验**: 快速注册登录，支持密码重置

**实现方式**:
- 用户输入邮箱和密码进行注册
- 用户使用邮箱和密码登录
- 支持密码重置功能
- 自动创建用户档案和会话

## 图片存储方案

### 豆包 AI 图片生成

**实现方式**:
- 豆包 AI 生成图片并返回稳定链接
- 直接使用豆包提供的图片URL
- 图片链接稳定可靠，无需额外存储

**技术优势**:
1. **简单高效**: 直接使用豆包返回的图片链接
2. **成本优化**: 无需额外的存储成本
3. **性能优良**: 豆包CDN提供快速访问
4. **维护简单**: 减少存储管理复杂度

## 部署方案

### 部署方案

**选择**: Vercel

**选择 Vercel 的原因**:
1. **Next.js 原生支持**: Vercel 是 Next.js 的官方部署平台
2. **零配置部署**: 自动检测 Next.js 项目并优化构建
3. **边缘函数**: API Routes 自动部署为 Serverless 函数
4. **环境变量管理**: 简单的环境变量配置界面
5. **预览部署**: 每个 PR 自动生成预览链接

## 环境变量配置

### 必需的环境变量

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI 服务
GEMINI_API_KEY=your_gemini_api_key
ARK_API_KEY=your_doubao_api_key
```

### 已移除的配置

以下配置在当前版本中**不再需要**:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- 邮件服务器配置

## 数据库设计

### 核心表结构

1. **profiles**: 用户档案表
   - 存储用户基本信息
   - 与 Supabase Auth 用户关联

2. **diary_entries**: 日记条目表
   - 存储地球日记和火星日记
   - 包含图片链接和元数据
   - 支持 Sol 日期计算

3. **storage.objects**: 图片存储
   - 存储 AI 生成的火星场景图片
   - 公共访问权限
   - 自动缓存策略

### 安全策略 (RLS)

- 用户只能访问自己的数据
- 图片公共可读，认证用户可上传
- 服务角色拥有完整权限用于 API 操作

## 性能优化

1. **图片处理**: 异步上传到 Supabase Storage
2. **缓存策略**: API 响应缓存和图片 CDN 缓存
3. **错误处理**: 多层级错误处理和回退机制
4. **加载优化**: 分页加载和懒加载图片

## 开发体验

1. **类型安全**: 完整的 TypeScript 支持
2. **代码规范**: ESLint 和 Prettier 配置
3. **热重载**: Next.js 开发服务器
4. **环境隔离**: 开发和生产环境分离

这个技术栈选择确保了项目的可维护性、安全性和用户体验的最佳平衡。