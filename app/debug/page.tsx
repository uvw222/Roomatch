"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DebugPage() {
  const [targetEmail, setTargetEmail] = useState('')
  const [debugData, setDebugData] = useState<any>(null)
  const [matchesData, setMatchesData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkProfiles = async () => {
    if (!targetEmail) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/debug/profiles?targetEmail=${encodeURIComponent(targetEmail)}`, {
        credentials: 'include'
      })
      const data = await res.json()
      setDebugData(data)
    } catch (error) {
      console.error('Error checking profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/matches', {
        credentials: 'include'
      })
      const data = await res.json()
      setMatchesData(data)
    } catch (error) {
      console.error('Error checking matches:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Debug Match System</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Check Profile Interactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="targetEmail">Target User Email:</Label>
            <Input
              id="targetEmail"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="Enter target user email"
            />
          </div>
          <Button onClick={checkProfiles} disabled={loading || !targetEmail}>
            Check Profiles
          </Button>
          
          {debugData && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Profile Debug Data:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Check Available Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkMatches} disabled={loading}>
            Check Matches
          </Button>
          
          {matchesData && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Matches Debug Data:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(matchesData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
