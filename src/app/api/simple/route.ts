import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({
    message: 'Hello from Cloudflare Pages',
    timestamp: Date.now()
  })
}