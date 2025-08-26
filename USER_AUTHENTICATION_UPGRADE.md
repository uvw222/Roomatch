# RoomMatch User Authentication & Data Management Upgrade

## Overview
This document outlines the comprehensive upgrade to implement user-based data management with proper authentication, role separation, and data isolation.

## Key Changes Made

### 1. Authentication System
- **New JWT-based authentication** with secure token management
- **User session management** with proper cookie handling
- **Role-based access control** (renter vs landlord)
- **Automatic session validation** and user verification

### 2. API Routes Updated
All API routes now use the new authentication system:

#### Authentication Routes:
- `app/api/login/route.ts` - Updated to use JWT tokens
- `app/api/register/route.ts` - Updated to use JWT tokens  
- `app/api/logout/route.ts` - Updated to clear all auth cookies

#### Profile Routes:
- `app/api/profile/me/route.ts` - Now requires authentication
- `app/api/profile/update/route.ts` - Now requires authentication

#### Matching Routes:
- `app/api/matches/route.ts` - Enhanced filtering by user type
- `app/api/match/like/route.ts` - User-specific likes with validation
- `app/api/match/dislike/route.ts` - User-specific dislikes with validation
- `app/api/match/liked/full/route.ts` - User-specific liked profiles

#### Messaging Routes:
- `app/api/messages/send/route.ts` - Authenticated message sending
- `app/api/messages/list/route.ts` - User-specific message lists
- `app/api/messages/mark-read/route.ts` - User-specific read status

### 3. New Authentication Utilities
- `lib/auth.ts` - Centralized authentication functions
- `hooks/useAuth.tsx` - Client-side authentication hook
- Updated `hooks/useProfile.tsx` - Enhanced with user type support

### 4. User Type Enforcement
- **Renters can only see landlords** in matching
- **Landlords can only see renters** in matching
- **Cross-type validation** in all matching operations
- **User type filtering** in all data queries

### 5. Data Isolation
- **User-specific likes/dislikes** - Each user has their own list
- **User-specific messages** - Messages are tied to user sessions
- **User-specific matches** - Matches are calculated per user
- **No shared state** between different users

## Environment Variables Required

Add these to your `.env.local` file:

```env
# JWT Secret (REQUIRED - change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Other existing variables...
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Database Schema Updates

The Profile model now includes:
- `userType: "renter" | "landlord"` - User role
- `likedProfiles: string[]` - User-specific likes
- `dislikedProfiles: string[]` - User-specific dislikes
- Enhanced profile fields for better matching

## Security Features

1. **JWT Token Validation** - All API routes validate tokens
2. **User Type Validation** - Prevents cross-type interactions
3. **Session Management** - Automatic session cleanup on logout
4. **Data Isolation** - Users can only access their own data
5. **Input Validation** - Enhanced validation on all endpoints

## User Experience Improvements

1. **Automatic Login** - Users stay logged in across sessions
2. **Role-based UI** - Different experiences for renters vs landlords
3. **Secure Logout** - Complete session cleanup
4. **Error Handling** - Better error messages and redirects

## Testing Checklist

### Authentication:
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Session persistence works
- [ ] Invalid credentials are rejected

### User Type Separation:
- [ ] Renters only see landlords in matching
- [ ] Landlords only see renters in matching
- [ ] Cross-type validation prevents invalid likes
- [ ] User type is preserved across sessions

### Data Isolation:
- [ ] Each user has their own likes/dislikes
- [ ] Each user has their own messages
- [ ] Each user has their own matches
- [ ] No data leakage between users

### Security:
- [ ] JWT tokens are properly validated
- [ ] Unauthorized access is blocked
- [ ] Session cleanup works on logout
- [ ] User type validation prevents abuse

## Migration Notes

### For Existing Users:
- Existing profiles will need to be updated with `userType` field
- Existing likes/dislikes will need to be migrated to new format
- Messages will continue to work but may need user type validation

### For Development:
- Clear all cookies and local storage when testing
- Use different browsers/incognito for testing multiple users
- Test both renter and landlord flows separately

## Future Enhancements

1. **Profile Completion Tracking** - Track profile completion percentage
2. **Advanced Matching Algorithm** - Consider user preferences
3. **Message Encryption** - End-to-end encryption for messages
4. **User Verification** - Email/phone verification system
5. **Rate Limiting** - Prevent abuse of matching system

## Troubleshooting

### Common Issues:

1. **"Authentication required" errors**
   - Check JWT_SECRET is set in environment
   - Clear browser cookies and try again
   - Ensure user is properly logged in

2. **No matches showing**
   - Verify user type is set correctly
   - Check if there are profiles of opposite type
   - Ensure profiles have required fields (name, etc.)

3. **Messages not working**
   - Check user authentication
   - Verify recipient exists
   - Check socket connection

4. **Profile not loading**
   - Check authentication status
   - Verify profile exists in database
   - Check API endpoint is working

## API Endpoints Summary

### Authentication:
- `POST /api/login` - User login
- `POST /api/register` - User registration  
- `POST /api/logout` - User logout

### Profile:
- `GET /api/profile/me` - Get current user profile
- `POST /api/profile/update` - Update user profile

### Matching:
- `GET /api/matches` - Get potential matches (filtered by user type)
- `POST /api/match/like` - Like a profile
- `POST /api/match/dislike` - Dislike a profile
- `GET /api/match/liked/full` - Get full liked profiles

### Messaging:
- `GET /api/messages/list?mode=contacts` - Get message contacts
- `GET /api/messages/list?mode=conversation&other=email` - Get conversation
- `POST /api/messages/send` - Send a message
- `POST /api/messages/mark-read` - Mark messages as read

All endpoints now require authentication and respect user type separation.
