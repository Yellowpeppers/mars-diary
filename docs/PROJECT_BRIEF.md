# 火星日记模拟器项目简报

## 项目概述

**火星日记模拟器**是一个创新的Web应用，将用户的地球日常生活转换为火星殖民者的沉浸式体验。用户输入地球日记后，系统通过AI技术生成对应的火星日记和配套的场景插图，创造出独特的科幻叙事体验。

## 技术架构

### 前端设计
- **框架**: Next.js 14 + TypeScript + Tailwind CSS
- **UI设计**: 深色火星主题，主色调为火星橙色(#E85C35)和深空黑(#1a1a1a)
- **响应式布局**: 支持桌面端双栏布局和移动端单栏切换
- **核心页面**:
  - 首页: 产品介绍和快速体验入口
  - 写日记页面(/write): 文本输入和AI生成结果展示
  - 时间线页面(/timeline): 历史日记浏览，支持分页和智能布局

### 后端架构
- **API Routes**: 基于Next.js的Serverless函数
- **数据库**: Supabase PostgreSQL + Storage
- **认证系统**: Supabase Auth邮箱密码登录
- **核心API端点**:
  - `/api/diary`: 火星日记生成
  - `/api/image`: AI图像生成
  - `/api/diary/save`: 日记保存
  - `/api/diary/list`: 日记列表获取

### 数据库设计
```sql
-- 用户档案表
profiles (id, username, email, avatar_url, created_at, updated_at)

-- 日记条目表
diary_entries (id, user_id, earth_diary, mars_diary, mars_event, image_url, sol_number, created_at, updated_at)
```

## AI提示词系统

### 文本生成提示词
系统使用Google Gemini 2.5 Flash Lite模型，核心提示词模板包含：

**世界观设定**:
- 重力0.38g，外出需轻质软壳宇航服
- 粉橘天空、稀薄CO₂大气
- 时间单位：1 sol ≈ 24h39m
- 主要场景：阿瑞斯圆顶城、夜峡洞穴镇、极冠冰矿站、同步轨道电梯、尘暴流浪车队
- 社会经济：企业-城邦制，货币OxyCredit

**随机事件系统**:
```javascript
const MARS_EVENTS = [
  '沙尘暴 Level‑2',
  '太阳风辐射警报', 
  '真空管列车故障',
  '货舱坠落警报',
  '极夜心理测试'
]
```

**写作要求**:
1. 进行「地球元素 → 火星对应」映射（如：通勤→MagLine排队、下雨→尘暴预警）
2. 保留用户原文情绪基调，结合火星环境放大或调和
3. 使用冷淡、硬科幻、略带魔幻感的语言
4. 结尾署名"— Sol‑{solNumber} 的你"
5. 篇幅控制在250字左右

### 图像生成提示词
使用豆包AI(doubao-seedream-3-0-t2i-250415)模型，采用三步式提示词构建：

**第一步：场景提取**
```
从以下火星日记中提取最具视觉冲击力的一个场景，用一句50-80字的中文描述。必须包含主角动作和环境细节。
```

**第二步：英文翻译**
```
将以下中文场景描述翻译成简洁生动的英文，只返回翻译结果
```

**第三步：专业图像提示词**
```
{englishScene}, atmospheric wide shot, protagonist in foreground, dystopian & decayed sci-fi aesthetic, desaturated color palette, cracked surfaces, dust-filled air, chiaroscuro lighting, ultra-sharp 8K details, colors: pale orange (#E85C35), frost gray (#8A8F9A), deep black (#0B0E12), style of Moebius meets Simon Stålenhag, no text, no watermark, ruined habitat, melancholic mood
```

## 核心功能特性

### 智能转换系统
- **Sol时间计算**: 地球日期自动转换为火星Sol日期
- **元素映射**: 智能将地球生活元素转换为火星对应场景
- **情绪保持**: 保留原始日记的情感基调

### AI图像生成
- **场景提取**: 从火星日记中智能提取视觉场景
- **风格统一**: 末世科幻美学，符合项目整体调性
- **存储优化**: 图片自动上传到Supabase Storage

### 用户体验优化
- **智能时间线**: 默认选择最新日记，支持分页浏览
- **灵活分享**: 支持文字复制和图片下载
- **响应式设计**: 完美适配桌面和移动设备
- **加载优化**: 文字优先显示，图片异步加载

## 部署与运维

### 生产环境
- **部署平台**: Vercel Serverless
- **域名**: https://mars-diary.vercel.app
- **状态**: 构建成功，功能完整

### 环境变量配置
```env
# AI服务
GEMINI_API_KEY=your_gemini_api_key
ARK_API_KEY=your_doubao_api_key

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 项目完成度

### ✅ 已完成功能
- 核心功能: 100%（用户认证、日记生成、图像生成、数据存储）
- UI/UX: 98%（响应式设计、深色主题、交互优化）
- AI集成: 100%（Gemini文本生成、豆包图像生成）
- 分享功能: 100%（文字复制、图片下载）
- 部署就绪: 100%（Vercel生产环境部署）

### 🎯 技术亮点
1. **创新的AI提示词设计**: 三层式提示词架构，确保生成内容的一致性和质量
2. **完整的世界观体系**: 详细的火星殖民设定，包含社会、经济、环境等多个维度
3. **智能元素映射**: 地球生活场景到火星环境的智能转换算法
4. **多模态AI集成**: 文本生成+图像生成的完整AI工作流
5. **性能优化策略**: 异步加载、缓存机制、错误处理的完整方案

## 商业价值

### 目标用户
- **科幻迷**: 追求沉浸式科幻体验的用户
- **文创工作者**: 需要创意灵感的插画师、作家
- **年轻用户**: 喜欢新奇应用的学生群体

### 市场定位
- 差异化强的垂直应用，"硬科幻 × 个人叙事"的独特结合
- 具备病毒式分享潜力的创意工具
- 可扩展为付费订阅模式（高级AI模型、更多功能）

## 总结

这个项目展示了现代Web开发的最佳实践，结合了前沿的AI技术和精心设计的用户体验，是一个技术与创意完美融合的优秀案例。通过创新的AI提示词设计和完整的技术架构，成功实现了将日常生活转换为科幻体验的独特价值主张。