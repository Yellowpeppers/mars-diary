# 火星日记模拟器 🚀

将你的地球日常瞬间投射到火星平行时空，体验红色星球上的浪漫与科幻。

## 功能特性

- 🤖 **智能转换**: 将地球日记转换为火星殖民者的生活记录
- 🎨 **AI 插图**: 通过豆包 AI 生成火星场景插图
- 📅 **智能时间线**: 按 Sol（火星日）记录和浏览历史日记，支持分页浏览
- 🎯 **优化体验**: 默认选择最新日记，可折叠地球日记原文
- 📤 **灵活分享**: 支持文字复制和图片下载两种分享方式
- 🔐 **用户认证**: 基于 Supabase 的邮箱魔法链接登录
- 📱 **响应式设计**: 适配桌面和移动设备

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI 服务**: Google Gemini + 豆包 AI 图像生成
- **部署**: Cloudflare Pages

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

在 `.env.local` 中配置以下环境变量：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# 豆包 AI 图像生成
ARK_API_KEY=your_ark_api_key_here

# App
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. 数据库设置

在 Supabase 中执行 `supabase-setup.sql` 文件来创建必要的数据表。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署

### Cloudflare Pages 部署

1. **构建项目**:
```bash
npm run pages:build
```

2. **部署到 Cloudflare Pages**:
```bash
npm run pages:deploy
```

3. **设置环境变量**: 在 Cloudflare Pages 控制台中设置所需的环境变量

详细部署说明请参考 `CLOUDFLARE_DEPLOYMENT.md` 文件。

## API 密钥获取

### Google Gemini API
1. 访问 [Google AI Studio](https://makersuite.google.com/)
2. 创建账户并获取 API 密钥
3. 确保账户可以使用 Gemini Pro 模型

### 豆包 AI API
1. 访问 [火山引擎控制台](https://console.volcengine.com/ark)
2. 注册账户并开通豆包 AI 服务
3. 在控制台获取 ARK API Key
4. 确保账户有足够的余额使用图像生成模型

### Supabase
1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 在项目设置中获取 URL 和 API 密钥

## 项目结构

### 文档层次
- **PRD.md** - 产品需求文档，包含完整的产品愿景、功能规格和技术要求
- **README.md** - 项目说明文档，包含快速开始指南和开发信息
- **.env.local** - 环境变量配置文件（需要手动配置API密钥）

### 完整目录结构

```
mars-diary/
├── .env.local              # 环境变量配置
├── .next/                  # Next.js 构建输出目录
├── PRD.md                  # 产品需求文档
├── README.md               # 项目说明文档
├── next.config.mjs         # Next.js 配置
├── package.json            # 项目依赖和脚本
├── postcss.config.mjs      # PostCSS 配置
├── tailwind.config.ts      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── diary/
    │   │   │   ├── route.ts        # 火星日记生成 API
    │   │   │   ├── save/
    │   │   │   │   └── route.ts    # 日记保存 API
    │   │   │   └── list/
    │   │   │       └── route.ts    # 日记列表 API
    │   │   └── image/
    │   │       └── route.ts        # 图像生成 API
    │   ├── globals.css             # 全局样式
    │   ├── layout.tsx              # 根布局组件
    │   ├── page.tsx                # 首页
    │   ├── timeline/
    │   │   └── page.tsx            # 时间线页面
    │   └── write/
    │       └── page.tsx            # 写日记页面
    ├── components/
    │   ├── navbar.tsx              # 导航栏组件
    │   └── ui/                     # UI 组件库
    │       ├── button.tsx
    │       └── card.tsx
    ├── hooks/
    │   └── use-auth.ts             # 认证状态管理 Hook
    └── lib/
        ├── supabase.ts             # Supabase 客户端配置
        └── utils.ts                # 工具函数（Sol计算、事件生成等）
```

## 开发路线图

### 已完成功能
- [x] 基础日记转换功能
- [x] Google Gemini AI 集成
- [x] 火星日记生成
- [x] 响应式 UI 设计
- [x] 智能时间线功能
  - [x] 默认选择最新日记
  - [x] 分页浏览 (每页10条)
  - [x] 可折叠地球日记原文
  - [x] 优化的日记详情布局
- [x] 灵活分享功能
  - [x] 文字内容复制到剪贴板
  - [x] 图片直接下载到本地
- [x] Sol 时间计算
- [x] 火星环境事件系统
- [x] Tailwind CSS 样式
- [x] Git 版本控制
- [x] 用户认证集成 (Supabase 邮箱魔法链接)
- [x] 数据库存储功能 (日记保存和读取)
- [x] 统一UI主题设计 (深色火星风格)
- [x] 优化加载体验和性能
- [x] AI 图像生成集成 (豆包 AI)
- [x] Vercel 生产环境部署

### 下一阶段开发计划

#### 🎯 第一优先级 (核心功能完善)
- [x] AI 图像生成集成 (豆包 AI)
- [x] 时间线界面优化 (分页、默认选择、布局改进)
- [x] 分享功能增强 (文字复制、图片下载)
- [ ] 日记编辑功能 (修改已保存的日记)
- [ ] 日记删除功能
- [ ] 搜索和筛选功能

#### 🚀 第二优先级 (用户体验提升)
- [x] 日记分享功能 (文字复制、图片下载)
- [ ] 社交媒体分享集成
- [ ] 导出功能 (PDF/图片格式)
- [ ] 个人统计面板 (写作天数、字数统计等)
- [ ] 主题切换功能

#### 💡 第三优先级 (高级功能)
- [ ] 移动端 PWA 优化
- [ ] TTS 语音朗读功能
- [ ] 多语言支持
- [ ] 付费订阅功能 (高级AI模型、更多图片生成等)

## 当前项目状态

### ✅ 核心功能已完成
- **用户认证系统**: 基于 Supabase 的邮箱魔法链接登录
- **日记生成**: Google Gemini AI 驱动的地球日记转火星日记
- **AI 图像生成**: 豆包 AI 生成火星场景插图
- **数据持久化**: 完整的日记保存和读取功能
- **智能时间线**: 按 Sol 日期展示历史日记，支持分页和智能布局
- **分享功能**: 支持文字复制和图片下载
- **响应式UI**: 统一的深色火星主题设计
- **性能优化**: 缓存策略、加载优化、错误处理

### 🎯 下一步开发重点

**立即开始**: 日记管理功能
- 实现日记编辑功能
- 添加日记删除功能
- 优化用户体验

**预计完成时间**: 1-2 个开发周期

### 📊 项目完成度
- 核心功能: 100% ✅
- UI/UX: 98% ✅  
- 数据层: 100% ✅
- AI集成: 100% ✅
- 分享功能: 100% ✅
- 性能优化: 95% ✅
- 部署就绪: 100% ✅

## 许可证

MIT License
