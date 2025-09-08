import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import * as meetingsRoute from '@/app/api/meetings/route'
import { generateToken } from '@/lib/auth'

let mongo: MongoMemoryServer

describe('Meetings API integration (mongodb-memory-server + real auth)', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    const uri = mongo.getUri()
    process.env.MONGODB_URI = uri
    await mongoose.connect(uri)
  }, 60000)

  afterAll(async () => {
    await mongoose.disconnect()
    if (mongo) await mongo.stop()
  })

  it('creates, lists and deletes a meeting with real auth', async () => {
  const user = { email: 'inttest@example.com', userId: '2', userType: 'renter' as const, name: 'Int Test' }
    const token = generateToken(user)

    // Create
    const req = new Request('http://localhost/api/meetings', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cookie': `auth_token=${token}` },
      body: JSON.stringify({ with: 'Bob', date: new Date().toISOString() })
    })

    const postRes = await meetingsRoute.POST(req)
    const postJson = await postRes.json()
    expect(postRes.status).toBe(201)
    expect(postJson.meeting).toBeDefined()

    // List
    const getReq = new Request('http://localhost/api/meetings', { headers: { 'cookie': `auth_token=${token}` } })
    const getRes = await meetingsRoute.GET(getReq)
    const getJson = await getRes.json()
    expect(Array.isArray(getJson.meetings)).toBe(true)
    expect(getJson.meetings.length).toBe(1)

    const id = getJson.meetings[0]._id

    // Delete
    const delReq = new Request(`http://localhost/api/meetings?id=${id}`, { method: 'DELETE', headers: { 'cookie': `auth_token=${token}` } })
    const delRes = await meetingsRoute.DELETE(delReq)
    const delJson = await delRes.json()
    expect(delJson.ok).toBe(true)
  })
})
