import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { captureException } from '@/lib/sentry'

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) return NextResponse.json({ user: null }, { status: 200 })
    return NextResponse.json({ user }, { status: 200 })
  } catch (e) {
    captureException(e)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
