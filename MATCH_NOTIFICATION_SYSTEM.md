# Match Notification System

## Overview

The match notification system provides real-time and offline notifications when two users match with each other. It ensures that users receive match notifications whether they are online or offline when the match occurs.

## Features

### Real-time Notifications
- When a user swipes right and creates a mutual match, both users receive immediate real-time notifications
- Uses Socket.IO for real-time communication
- Shows confetti animation and match notification modal

### Offline Notifications
- If a user is offline when a match occurs, they will see the notification when they next log in
- Notifications are stored in the database and retrieved on login
- Prevents users from missing important matches

### Enhanced UI
- Large confetti animation with 200+ particles
- Multiple confetti shapes (squares, circles, triangles)
- "You matched with [user name]" message
- Auto-dismiss after 8 seconds
- Options to view profile or start chat

## Technical Implementation

### Database Schema
The `Profile` model includes a `matchNotifications` field:
```javascript
matchNotifications: [{
  matchEmail: String,
  matchName: String,
  matchUserType: String,
  matchProfileImage: String,
  createdAt: Date,
  read: Boolean
}]
```

### API Endpoints

#### POST `/api/match/like`
- Handles user swipes
- Creates mutual matches
- Stores notifications for both users
- Sends real-time notifications via Socket.IO

#### GET `/api/matches/new-since-login`
- Checks for new matches since last login
- Returns unread match notifications
- Combines real-time and stored notifications

#### POST `/api/matches/mark-notifications-read`
- Marks specific match notifications as read
- Called when user views the notification

### Components

#### GlobalMatchNotification
- Global component that listens for match events
- Handles both real-time and stored notifications
- Manages notification state and display

#### MatchNotification
- Displays the match notification modal
- Shows confetti animation
- Handles user actions (view profile, start chat)

#### Confetti
- Enhanced confetti animation with 200+ particles
- Multiple shapes and colors
- Smooth physics-based animation

## User Experience

### For Online Users
1. User A swipes right on User B
2. If User B previously liked User A, it's a mutual match
3. Both users immediately see:
   - Large confetti animation
   - "You matched with [name]" notification
   - Options to view profile or start chat

### For Offline Users
1. User A swipes right on User B while User B is offline
2. Match notification is stored in database
3. When User B logs in, they see the stored notification
4. Same confetti and notification experience as online users

## Configuration

The system automatically:
- Stores notifications for all mutual matches
- Marks notifications as read when viewed
- Prioritizes unread notifications over new matches
- Handles connection errors gracefully

## Future Enhancements

Potential improvements could include:
- Push notifications for mobile devices
- Email notifications for important matches
- Notification preferences and settings
- Match history and analytics
