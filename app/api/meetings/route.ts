import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Meeting from '@/models/Meeting'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const MeetingCreateSchema = z.object({
  with: z.string().min(1),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }),
  time: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  await connectToDatabase()
  const meetings = await Meeting.find({ ownerEmail: user.email }).sort({ date: 1 }).lean()
  return NextResponse.json({ meetings })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const body = await req.json()
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

  return NextResponse.json({ meeting: created }, { status: 201 })
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await connectToDatabase()
  const deleted = await Meeting.findOneAndDelete({ _id: id, ownerEmail: user.email })
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
