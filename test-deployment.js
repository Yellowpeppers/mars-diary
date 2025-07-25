// 部署验证脚本
// 用于测试Cloudflare Pages部署的环境变量配置

const testUrls = [
  '/api/debug',
  '/api/simple'
];

// 请将 YOUR_SITE_URL 替换为你的实际Cloudflare Pages域名
const SITE_URL = 'https://YOUR_SITE_URL.pages.dev';

console.log('🔍 开始验证Cloudflare Pages部署...');
console.log('📝 请按以下步骤操作：');
console.log('');
console.log('1. 将 YOUR_SITE_URL 替换为你的实际域名');
console.log('2. 在浏览器中访问以下URL：');
console.log('');

testUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${SITE_URL}${url}`);
});

console.log('');
console.log('📊 预期结果：');
console.log('');
console.log('✅ /api/debug 应该返回：');
console.log(`{
  "environmentVariables": {
    "NEXT_PUBLIC_SUPABASE_URL": "已设置",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "已设置",
    "SUPABASE_SERVICE_ROLE_KEY": "已设置",
    "GEMINI_API_KEY": "已设置",
    "ARK_API_KEY": "已设置"
  }
}`);
console.log('');
console.log('✅ /api/simple 应该返回：');
console.log(`{
  "message": "Hello from Cloudflare Pages",
  "timestamp": 数字时间戳
}`);
console.log('');
console.log('❌ 如果看到任何 "未设置" 或 500 错误，说明环境变量配置有问题');
console.log('');
console.log('🔧 故障排除：');
console.log('- 检查Cloudflare Pages控制台的环境变量设置');
console.log('- 确保所有变量名拼写正确（区分大小写）');
console.log('- 确保变量值没有多余的空格或换行符');
console.log('- 设置完环境变量后需要重新部署');