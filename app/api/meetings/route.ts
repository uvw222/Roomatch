import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Meeting from '@/models/Meeting'

// Helper to extract user email from request headers or cookies; fall back to query param
function getUserEmail(req: Request) {
  try {
    // check cookie header
    const cookieHeader = req.headers.get('cookie')
    if (cookieHeader) {
      const match = cookieHeader.split('; ').find((c) => c.startsWith('user_email='))
      if (match) return match.split('=')[1]
    }
    // check query param
    const url = new URL(req.url)
    return url.searchParams.get('user_email')
  } catch (e) {
    return null
  }
}

export async function GET(req: Request) {
  const userEmail = getUserEmail(req)
  if (!userEmail) return NextResponse.json({ error: 'Missing user email' }, { status: 400 })

  await connectToDatabase()
  const meetings = await Meeting.find({ ownerEmail: userEmail }).sort({ date: 1 }).lean()
  return NextResponse.json({ meetings })
}

export async function POST(req: Request) {
  const userEmail = getUserEmail(req)
  if (!userEmail) return NextResponse.json({ error: 'Missing user email' }, { status: 400 })

  const body = await req.json()
  const { with: withPerson, date, time, location, address, notes } = body
  if (!withPerson || !date) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  await connectToDatabase()
  const created = await Meeting.create({
    ownerEmail: userEmail,
    with: withPerson,
    date: new Date(date),
    time,
    location,
    address,
    notes,
  })

  return NextResponse.json({ meeting: created }, { status: 201 })
}

export async function DELETE(req: Request) {
  const userEmail = getUserEmail(req)
  if (!userEmail) return NextResponse.json({ error: 'Missing user email' }, { status: 400 })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await connectToDatabase()
  const deleted = await Meeting.findOneAndDelete({ _id: id, ownerEmail: userEmail })
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
