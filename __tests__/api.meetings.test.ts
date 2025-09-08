import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import Meeting from '@/models/Meeting'

// Prepare a mock user and mock the auth module before importing the route handlers
const mockUser = { email: 'test@example.com', userId: '1', userType: 'renter', name: 'Test' }
vi.mock('@/lib/auth', () => ({ getCurrentUser: async () => mockUser }))
// Mock DB connector to avoid needing a real MONGODB_URI in unit tests
vi.mock('@/lib/mongodb', () => ({ default: async () => Promise.resolve() }))
import * as meetingsRoute from '@/app/api/meetings/route'

describe('Meetings API (route handlers) - unit (mocked DB)', () => {
  let createSpy: any
  let findSpy: any
  let deleteSpy: any

  beforeEach(() => {
    createSpy = vi.spyOn(Meeting, 'create').mockImplementation(async (data: any) => ({ _id: 'srvid', ...data }))
    findSpy = vi.spyOn(Meeting, 'find').mockImplementation(() => ({ sort: () => ({ lean: async () => [{ _id: 'srvid', ownerEmail: mockUser.email, with: 'Alice', date: new Date().toISOString() }] }) }))
    deleteSpy = vi.spyOn(Meeting, 'findOneAndDelete').mockResolvedValue({ _id: 'srvid' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates, lists and deletes a meeting', async () => {
    // Create
    const req = new Request('http://localhost/api/meetings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ with: 'Alice', date: new Date().toISOString() })
    })

    const postRes = await meetingsRoute.POST(req)
    const postJson = await postRes.json()
    expect(postRes.status).toBe(201)
    expect(postJson.meeting).toBeDefined()
    expect(createSpy).toHaveBeenCalled()

    // List
    const getReq = new Request('http://localhost/api/meetings')
    const getRes = await meetingsRoute.GET(getReq)
    const getJson = await getRes.json()
    expect(Array.isArray(getJson.meetings)).toBe(true)
    expect(getJson.meetings.length).toBe(1)

    const id = getJson.meetings[0]._id

    // Delete
    const delReq = new Request(`http://localhost/api/meetings?id=${id}`, { method: 'DELETE' })
    const delRes = await meetingsRoute.DELETE(delReq)
    const delJson = await delRes.json()
    expect(delJson.ok).toBe(true)
    expect(deleteSpy).toHaveBeenCalled()
  })
})
