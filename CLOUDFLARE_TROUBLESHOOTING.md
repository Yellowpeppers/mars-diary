# Cloudflare Pages 部署故障排除文档

## 问题概述

**问题描述：** 所有API路由在Cloudflare Pages上都返回500内部服务器错误，包括最简单的ping API。

**影响范围：** 所有API端点（/api/ping, /api/health, /api/env-check, /api/test-db）

**当前状态：** 无法在Cloudflare Pages上成功部署任何API功能

## 已尝试的解决方案

### 1. Edge Runtime 配置调整
- ✅ **尝试移除Edge Runtime** - 导致部署失败，Cloudflare要求所有API必须使用Edge Runtime
- ✅ **重新添加Edge Runtime** - 部署成功但API仍返回500错误
- **结论：** Edge Runtime配置正确，问题不在此处

### 2. 兼容性配置优化
- ✅ **回退compatibility_date** - 从2024-07-01改为2023-05-18
- ✅ **保持nodejs_compat标志** - 确保Node.js兼容性
- **结论：** 兼容性配置合理，问题仍存在

### 3. 依赖版本降级
- ✅ **降级@cloudflare/next-on-pages** - 从1.13.13降级到1.12.0
- ✅ **重新安装依赖** - npm install成功
- **结论：** 版本降级未解决问题

### 4. API复杂度简化
- ✅ **创建最简单的ping API** - 仅返回"pong"文本
- ✅ **移除所有外部依赖** - 不使用任何第三方库
- **结论：** 即使最简单的API也无法工作

## 当前配置状态

### wrangler.toml
```toml
name = "mars-diary"
compatibility_date = "2023-05-18"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npm run pages:build"
output = ".vercel/output/static"
```

### next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### package.json关键依赖
```json
{
  "dependencies": {
    "next": "14.2.15",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@cloudflare/next-on-pages": "^1.12.0"
  }
}
```

## 测试端点

### 最新部署地址
https://a022762c.mars-diary.pages.dev

### 测试API
1. **Ping API:** `/api/ping` - 应返回"pong"
2. **Health API:** `/api/health` - 应返回健康状态JSON
3. **Env Check API:** `/api/env-check` - 应返回环境变量状态
4. **DB Test API:** `/api/test-db` - 应返回数据库连接状态

**当前状态：** 所有API都返回500错误

## 可能的根本原因分析

### 1. Next.js 14.2.15 与 Cloudflare Pages 兼容性问题
- Next.js 14.2.15可能包含与Cloudflare Pages不兼容的功能
- 建议尝试降级到Next.js 13.x或14.1.x

### 2. @cloudflare/next-on-pages 适配器问题
- 当前使用1.12.0版本，可能仍存在兼容性问题
- 建议尝试更早期版本如1.10.x或1.11.x

### 3. 构建输出配置问题
- 当前使用`.vercel/output/static`作为输出目录
- 可能需要调整为Cloudflare Pages专用的输出格式

### 4. Cloudflare Pages 平台限制
- 可能存在账户级别的限制或配置问题
- 建议检查Cloudflare Pages控制台的详细错误日志

## 下一步建议

### 短期解决方案
1. **切换到Vercel部署** - 作为临时解决方案
2. **使用传统的Cloudflare Workers** - 不使用Pages功能
3. **简化项目结构** - 移除所有非必要功能

### 长期调试方案
1. **版本回退测试**
   - 降级Next.js到13.5.x
   - 降级@cloudflare/next-on-pages到1.10.x
   - 测试最小可工作版本组合

2. **配置优化**
   - 研究Cloudflare Pages的最佳实践配置
   - 对比成功案例的配置文件
   - 调整构建和输出设置

3. **平台诊断**
   - 检查Cloudflare Pages控制台的详细日志
   - 联系Cloudflare技术支持
   - 在Cloudflare社区寻求帮助

## 备选部署方案

### Vercel 部署
- 优势：与Next.js原生兼容，部署简单
- 劣势：免费额度有限
- 配置：几乎零配置即可部署

### 传统服务器部署
- 优势：完全控制，无平台限制
- 劣势：需要服务器维护
- 适用：生产环境长期方案

## 总结

当前Cloudflare Pages部署存在根本性的兼容性问题，所有尝试的配置调整都未能解决500错误。建议优先考虑Vercel部署作为短期解决方案，同时继续调试Cloudflare Pages配置作为长期目标。

**创建时间：** 2024年12月
**最后更新：** 部署地址 https://a022762c.mars-diary.pages.dev
**状态：** 未解决，需要进一步调试或切换平台