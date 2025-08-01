// 调试认证状态的脚本
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugAuth() {
  console.log('=== 调试认证状态 ===');
  
  try {
    // 检查当前会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('当前会话:', session ? '存在' : '不存在');
    if (sessionError) {
      console.log('会话错误:', sessionError.message);
    }
    
    if (session) {
      console.log('用户ID:', session.user.id);
      console.log('访问令牌长度:', session.access_token.length);
      console.log('令牌前20字符:', session.access_token.substring(0, 20));
      
      // 测试API调用
      const response = await fetch('http://localhost:3000/api/diary/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      console.log('API响应状态:', response.status);
      const data = await response.json();
      console.log('API响应:', data);
    }
    
  } catch (error) {
    console.error('调试错误:', error);
  }
}

debugAuth();