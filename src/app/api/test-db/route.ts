import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 开始数据库连接测试...')
    
    // 1. 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('环境变量检查:', {
      supabaseUrl: supabaseUrl ? '已设置' : '未设置',
      supabaseAnonKey: supabaseAnonKey ? '已设置' : '未设置',
      supabaseServiceKey: supabaseServiceKey ? '已设置' : '未设置'
    })
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: '缺少基础Supabase环境变量',
        details: {
          supabaseUrl: supabaseUrl ? '已设置' : '未设置',
          supabaseAnonKey: supabaseAnonKey ? '已设置' : '未设置'
        }
      }, { status: 500 })
    }
    
    // 2. 测试基础连接
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    console.log('🔗 测试基础连接...')
    
    // 3. 测试表是否存在
    const { data: tables, error: tablesError } = await supabase
      .from('diary_entries')
      .select('count', { count: 'exact', head: true })
    
    if (tablesError) {
      console.error('表查询错误:', tablesError)
      return NextResponse.json({
        success: false,
        error: '数据库表不存在或无法访问',
        details: {
          message: tablesError.message,
          code: tablesError.code,
          hint: tablesError.hint
        },
        solution: '请在Supabase中执行 supabase-setup.sql 脚本创建数据表'
      }, { status: 500 })
    }
    
    console.log('✅ 表存在，记录数:', tables)
    
    // 4. 测试Service Role Key连接（如果存在）
    let serviceRoleTest = null
    if (supabaseServiceKey) {
      try {
        const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey)
        const { data: serviceData, error: serviceError } = await serviceSupabase
          .from('diary_entries')
          .select('count', { count: 'exact', head: true })
        
        if (serviceError) {
          serviceRoleTest = {
            success: false,
            error: serviceError.message
          }
        } else {
          serviceRoleTest = {
            success: true,
            message: 'Service Role Key 连接正常'
          }
        }
      } catch (err) {
        serviceRoleTest = {
          success: false,
          error: err instanceof Error ? err.message : '未知错误'
        }
      }
    }
    
    // 5. 测试RLS策略
    console.log('🔒 测试RLS策略...')
    const { data: rlsData, error: rlsError } = await supabase
      .from('diary_entries')
      .select('*')
      .limit(1)
    
    let rlsTest = {
      success: !rlsError,
      message: rlsError ? rlsError.message : 'RLS策略正常'
    }
    
    return NextResponse.json({
      success: true,
      message: '数据库连接测试完成',
      timestamp: new Date().toISOString(),
      tests: {
        environmentVariables: {
          supabaseUrl: supabaseUrl ? '已设置' : '未设置',
          supabaseAnonKey: supabaseAnonKey ? '已设置' : '未设置',
          supabaseServiceKey: supabaseServiceKey ? '已设置' : '未设置'
        },
        tableAccess: {
          success: true,
          recordCount: tables
        },
        serviceRoleKey: serviceRoleTest,
        rlsPolicies: rlsTest
      },
      recommendations: [
        supabaseServiceKey ? null : '⚠️ 建议设置 SUPABASE_SERVICE_ROLE_KEY 环境变量',
        '✅ 基础连接正常',
        '✅ 数据表可访问'
      ].filter(Boolean)
    })
    
  } catch (error) {
    console.error('数据库测试失败:', error)
    return NextResponse.json({
      success: false,
      error: '数据库测试过程中发生错误',
      details: {
        message: error instanceof Error ? error.message : '未知错误',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}

// 测试写入功能
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 开始数据库写入测试...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: '缺少Service Role Key，无法进行写入测试'
      }, { status: 500 })
    }
    
    // 使用Service Role Key进行测试写入
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // 测试用户ID
      earth_diary: '测试地球日记内容',
      mars_diary: '测试火星日记内容',
      mars_event: '测试火星事件',
      sol_number: 1000,
      created_at: new Date().toISOString()
    }
    
    console.log('尝试插入测试数据:', testData)
    
    const { data, error } = await supabase
      .from('diary_entries')
      .insert(testData)
      .select()
      .single()
    
    if (error) {
      console.error('写入测试失败:', error)
      return NextResponse.json({
        success: false,
        error: '数据库写入失败',
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint
        }
      }, { status: 500 })
    }
    
    // 清理测试数据
    await supabase
      .from('diary_entries')
      .delete()
      .eq('id', data.id)
    
    return NextResponse.json({
      success: true,
      message: '数据库写入测试成功',
      testData: data
    })
    
  } catch (error) {
    console.error('写入测试过程中发生错误:', error)
    return NextResponse.json({
      success: false,
      error: '写入测试过程中发生错误',
      details: {
        message: error instanceof Error ? error.message : '未知错误'
      }
    }, { status: 500 })
  }
}