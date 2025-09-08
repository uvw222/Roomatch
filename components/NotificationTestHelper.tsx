"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

export default function NotificationTestHelper() {
  const { user } = useAuth()
  
  const createTestNotification = async (type: string) => {
    if (!user?.email) {
      alert('Please log in to test notifications');
      return;
    }

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          title: type === 'new_match' ? 'New Match! 🎉' : 'Meeting Request 📅',
          message: type === 'new_match' 
            ? 'You have a new match with Test User!' 
            : 'Test User wants to schedule a meeting with you.',
          toUserEmail: user.email, // Use actual current user email
          fromUser: {
            email: 'test@example.com',
            name: 'Test User',
            profileImage: '/placeholder.svg'
          },
          data: type === 'new_match' ? { matchedUserEmail: 'test@example.com' } : {
            meetingDate: new Date(),
            meetingTime: '2:00 PM',
            locationType: 'in-person'
          }
        })
      });

      if (response.ok) {
        console.log('Test notification created successfully');
        // Give a brief moment for the API to process, then refresh notifications
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.error('Failed to create test notification');
        alert('Failed to create test notification');
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
      alert('Error creating test notification');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Notification System Test</CardTitle>
        <CardDescription>
          Test the notification system by creating sample notifications. Click them to navigate to relevant pages!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          onClick={() => createTestNotification('new_match')}
          className="w-full"
          variant="outline"
        >
          Create Test Match Notification
        </Button>
        <Button 
          onClick={() => createTestNotification('meeting_request')}
          className="w-full"
          variant="outline"
        >
          Create Test Meeting Request
        </Button>
      </CardContent>
    </Card>
  )
}
