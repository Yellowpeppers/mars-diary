// 测试 Supabase Storage 配置的脚本
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseStorage() {
  console.log('🔍 开始测试 Supabase Storage 配置...')
  
  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.error('❌ 缺少必要的环境变量:')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
    return
  }
  
  console.log('✅ 环境变量配置正确')
  
  // 创建服务角色客户端
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // 1. 测试列出所有存储桶
    console.log('\n📦 检查存储桶列表...')
    const { data: buckets, error: bucketsError } = await supabaseService.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ 获取存储桶列表失败:', bucketsError.message)
      return
    }
    
    console.log('✅ 存储桶列表:', buckets.map(b => `${b.id} (${b.public ? '公共' : '私有'})`).join(', '))
    
    // 2. 检查 diary-images 存储桶是否存在
    const diaryImagesBucket = buckets.find(b => b.id === 'diary-images')
    if (!diaryImagesBucket) {
      console.error('❌ diary-images 存储桶不存在！')
      console.log('💡 请在 Supabase 控制台创建 diary-images 存储桶，或运行 supabase-setup.sql 脚本')
      return
    }
    
    console.log('✅ diary-images 存储桶存在，配置:', {
      id: diaryImagesBucket.id,
      name: diaryImagesBucket.name,
      public: diaryImagesBucket.public,
      created_at: diaryImagesBucket.created_at
    })
    
    // 3. 测试存储桶访问权限
    console.log('\n🔐 测试存储桶权限...')
    const { data: objects, error: listError } = await supabaseService.storage
      .from('diary-images')
      .list('', { limit: 1 })
    
    if (listError) {
      console.error('❌ 列出存储桶内容失败:', listError.message)
    } else {
      console.log('✅ 存储桶访问权限正常，当前文件数量:', objects.length)
    }
    
    // 4. 测试上传权限（创建一个测试文件）
    console.log('\n📤 测试上传权限...')
    const testContent = 'test-storage-configuration'
    const testFileName = `test-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from('diary-images')
      .upload(`test/${testFileName}`, testContent, {
        contentType: 'text/plain'
      })
    
    if (uploadError) {
      console.error('❌ 上传测试失败:', uploadError.message)
    } else {
      console.log('✅ 上传权限正常，测试文件路径:', uploadData.path)
      
      // 5. 测试获取公共URL
      const { data: { publicUrl } } = supabaseService.storage
        .from('diary-images')
        .getPublicUrl(`test/${testFileName}`)
      
      console.log('✅ 公共URL生成成功:', publicUrl)
      
      // 6. 清理测试文件
      const { error: deleteError } = await supabaseService.storage
        .from('diary-images')
        .remove([`test/${testFileName}`])
      
      if (deleteError) {
        console.warn('⚠️ 清理测试文件失败:', deleteError.message)
      } else {
        console.log('✅ 测试文件已清理')
      }
    }
    
    console.log('\n🎉 Supabase Storage 配置测试完成！')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

// 运行测试
testSupabaseStorage().catch(console.error)