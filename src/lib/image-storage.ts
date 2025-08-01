import fs from 'fs'
import path from 'path'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 图片存储配置
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'images')

// Supabase Storage 配置
const STORAGE_BUCKET = 'diary-images'

// 创建 Supabase 客户端
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 确保上传目录存在
export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

// 生成唯一文件名
export function generateFileName(originalUrl: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = getImageExtension(originalUrl)
  return `mars-diary-${timestamp}-${random}.${extension}`
}

// 从URL获取图片扩展名
function getImageExtension(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const extension = path.extname(pathname).toLowerCase().substring(1)
    
    // 支持的图片格式
    const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    if (supportedFormats.includes(extension)) {
      return extension
    }
    
    // 默认使用 jpg
    return 'jpg'
  } catch {
    return 'jpg'
  }
}

// 获取图片的 MIME 类型
function getContentType(url: string): string {
  const extension = getImageExtension(url)
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif'
  }
  return mimeTypes[extension] || 'image/jpeg'
}

// 上传图片到 Supabase Storage
export async function uploadImageToSupabase(imageUrl: string, userId: string): Promise<string> {
  try {
    const supabase = createSupabaseClient()
    
    // 下载图片数据
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    const imageBuffer = await response.arrayBuffer()
    const fileName = generateFileName(imageUrl)
    const filePath = `${userId}/${fileName}`
    
    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, imageBuffer, {
        contentType: getContentType(imageUrl),
        upsert: false
      })
    
    if (error) {
      console.error('Supabase upload error:', error)
      throw new Error(`Failed to upload to Supabase: ${error.message}`)
    }
    
    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)
    
    console.log('Image uploaded to Supabase:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('Upload to Supabase failed:', error)
    throw error
  }
}

// 下载图片到本地（保留作为备用方案）
export async function downloadImage(imageUrl: string): Promise<string> {
  try {
    ensureUploadDir()
    
    // 下载图片
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
    }
    
    // 验证内容类型
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Downloaded content is not an image')
    }
    
    // 生成文件名
    const fileName = generateFileName(imageUrl)
    const filePath = path.join(UPLOAD_DIR, fileName)
    
    // 保存文件
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)
    
    // 返回相对路径（用于数据库存储和前端访问）
    return `/uploads/images/${fileName}`
  } catch (error) {
    console.error('下载图片失败:', error)
    throw new Error(`图片下载失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 从 Supabase Storage 删除图片
export async function deleteImageFromSupabase(imageUrl: string, userId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()
    
    // 从公共URL中提取文件路径
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.indexOf(STORAGE_BUCKET)
    
    if (bucketIndex === -1) {
      console.error('Invalid Supabase storage URL:', imageUrl)
      return false
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    
    // 从 Supabase Storage 删除文件
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])
    
    if (error) {
      console.error('Supabase delete error:', error)
      return false
    }
    
    console.log('Image deleted from Supabase:', filePath)
    return true
  } catch (error) {
    console.error('Delete from Supabase failed:', error)
    return false
  }
}

// 删除本地图片文件（保留作为备用方案）
export function deleteLocalImage(imagePath: string): boolean {
  try {
    // 如果是相对路径，转换为绝对路径
    let fullPath: string
    if (imagePath.startsWith('/uploads/images/')) {
      fullPath = path.join(process.cwd(), 'public', imagePath)
    } else {
      fullPath = imagePath
    }
    
    // 检查文件是否存在
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      console.log('图片删除成功:', fullPath)
      return true
    } else {
      console.log('图片文件不存在:', fullPath)
      return false
    }
  } catch (error) {
    console.error('删除图片失败:', error)
    return false
  }
}

// 检查图片文件是否存在
export function imageExists(imagePath: string): boolean {
  try {
    if (!imagePath.startsWith('/uploads/images/')) {
      return false
    }
    
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    return fs.existsSync(fullPath)
  } catch {
    return false
  }
}