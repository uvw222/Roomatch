import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ["renter", "landlord"],
    required: true,
  },
  email: { type: String, required: true, unique: true },
  name: String,
  age: Number,
  gender: String,
  occupation: String,
  bio: String,
  budget: Number,
  moveInDate: String,
  location: String,
  // Add coordinates for Google Maps
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
  hasPets: Boolean,
  isSmoker: Boolean,
  profileImage: String,
  lifestyle: {
    cleanliness: Number,
    noise: Number,
    guestsFrequency: Number,
    sleepSchedule: String,
  },
  preferences: {
    ageRange: [Number],
    genderPreference: String,
    petsAllowed: Boolean,
    smokingAllowed: Boolean,
  },

  //  Matching system
  likedProfiles: {
    type: [String],
    default: [],
  },
  dislikedProfiles: {
    type: [String],
    default: [],
  },
  views: {
  type: Number,
  default: 0,
},
  // Match notifications for users who were disconnected when matches occurred
  matchNotifications: {
    type: [{
      matchEmail: String,
      matchName: String,
      matchUserType: String,
      matchProfileImage: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      read: {
        type: Boolean,
        default: false,
      }
    }],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
