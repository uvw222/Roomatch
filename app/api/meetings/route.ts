import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Meeting from '@/models/Meeting'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'
// Use project path alias to reliably resolve the sentry wrapper
import { captureException, captureMessage } from '@/lib/sentry'

const MeetingCreateSchema = z.object({
  with: z.string().min(1),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }),
  time: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    // debug: log incoming cookies/headers (safe to remove after debugging)
    try { console.log('[DBG] /api/meetings GET cookies:', (req as any).headers?.get?.('cookie')) } catch {}

    let user = await getCurrentUser(req)

    // fallback to cookie-provided email for deployed environments
    if (!user) {
      const cookieHeader = (req as any).headers?.get?.('cookie') || ''
      const match = cookieHeader.match(/(?:^|; )user_email=([^;]+)/)
      const emailFromCookie = match ? decodeURIComponent(match[1]) : null
      if (emailFromCookie) {
        user = { email: emailFromCookie, userId: '', userType: 'renter', name: '' }
        console.log('[DBG] /api/meetings GET using cookie fallback user_email=', emailFromCookie)
      }
    }

    // If still no user, return empty list (temporarily) and log so we can diagnose
    if (!user) {
      console.warn('[WARN] /api/meetings GET: no authenticated user and no fallback cookie — returning empty list for debug')
      return new Response(JSON.stringify({ meetings: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    await connectToDatabase()
    const meetings = await Meeting.find({ ownerEmail: user.email }).sort({ date: 1 }).lean()

    const serialized = (meetings || []).map((m: any) => ({
      _id: String(m._id),
      ownerEmail: m.ownerEmail,
      with: m.with,
      date: (m.date instanceof Date) ? m.date.toISOString() : m.date,
      time: m.time || "",
      location: m.location || "",
      address: m.address || "",
      notes: m.notes || "",
    }))

    return new Response(JSON.stringify({ meetings: serialized }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[ERR] /api/meetings GET error:', err)
    try { captureException(err) } catch {}
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST(req: Request) {
  try {
    let user = await getCurrentUser(req)

    const body = await req.json()

    // If no authenticated user, try fallback ownerEmail from body or cookies
    let fallbackEmail: string | null = null
    if (!user) {
      if (body?.ownerEmail) fallbackEmail = body.ownerEmail
      else {
        const cookieHeader = (req as any).headers?.get?.('cookie') || ''
        const match = cookieHeader.match(/(?:^|; )user_email=([^;]+)/)
        fallbackEmail = match ? decodeURIComponent(match[1]) : null
      }
      if (fallbackEmail) user = { email: fallbackEmail, userId: '', userType: 'renter', name: '' }
    }

    if (!user) {
      captureMessage('Unauthorized POST /api/meetings attempt')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const parse = MeetingCreateSchema.safeParse(body)
    if (!parse.success) return NextResponse.json({ error: parse.error.format() }, { status: 400 })

    const { with: withPerson, date, time, location, address, notes } = parse.data

    await connectToDatabase()
    const created = await Meeting.create({
      ownerEmail: user.email,
      with: withPerson,
      date: new Date(date),
      time,
      location,
      address,
      notes,
    })

    // Return a serialized meeting object (avoid sending raw mongoose document/ObjectId)
    const createdObj: any = created && typeof (created as any).toObject === 'function' ? (created as any).toObject() : created
    const safeMeeting = {
      ...createdObj,
      _id: createdObj?._id?.toString?.() ?? createdObj?._id,
      id: createdObj?._id?.toString?.() ?? createdObj?._id,
      date: createdObj?.date ? new Date(createdObj.date).toISOString() : createdObj?.date,
    }

    return NextResponse.json({ meeting: safeMeeting }, { status: 201 })
  } catch (e) {
    captureException(e)
    // eslint-disable-next-line no-console
    console.error('POST /api/meetings error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    let user = await getCurrentUser(req)

    // fallback to cookie-provided user_email if unauthenticated
    if (!user) {
      const cookieHeader = (req as any).headers?.get?.('cookie') || ''
      const match = cookieHeader.match(/(?:^|; )user_email=([^;]+)/)
      const emailFromCookie = match ? decodeURIComponent(match[1]) : null
      if (emailFromCookie) user = { email: emailFromCookie, userId: '', userType: 'renter', name: '' }
    }

    if (!user) {
      captureMessage('Unauthorized DELETE /api/meetings attempt')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await connectToDatabase()
    const deleted = await Meeting.findOneAndDelete({ _id: id, ownerEmail: user.email })
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    captureException(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
