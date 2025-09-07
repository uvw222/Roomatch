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

  // Renter-specific fields
  renterInfo: {
    currentLivingSituation: String, // "living_with_parents", "shared_apartment", "own_apartment", "dorm", "other"
    reasonForMoving: String,
    employmentStatus: String, // "full_time", "part_time", "student", "freelance", "unemployed"
    monthlyIncome: Number,
    hasGuarantor: Boolean,
    guarantorInfo: String,
    moveInTimeframe: String, // "immediately", "within_month", "1-3_months", "3-6_months", "flexible"
    leaseDuration: String, // "short_term", "6_months", "1_year", "long_term", "flexible"
    housingPreferences: {
      roomType: String, // "private_room", "shared_room", "studio"
      bathroomType: String, // "private", "shared"
      furnished: String, // "furnished", "unfurnished", "partially_furnished", "flexible"
      utilities: [String], // ["wifi", "electricity", "water", "gas", "internet", "cable"]
      amenities: [String], // ["parking", "laundry", "gym", "pool", "garden", "balcony"]
      accessibility: [String], // ["wheelchair_accessible", "elevator", "ground_floor"]
    }
  },

  // Landlord-specific fields
  landlordInfo: {
    propertyType: String, // "apartment", "house", "condo", "townhouse", "room_in_house"
    propertySize: String, // "studio", "1_bedroom", "2_bedroom", "3_bedroom", "4+_bedroom"
    availableRooms: Number,
    totalRooms: Number,
    monthlyRent: Number,
    securityDeposit: Number,
    utilitiesIncluded: [String], // ["wifi", "electricity", "water", "gas", "internet", "cable"]
    furnished: String, // "furnished", "unfurnished", "partially_furnished"
    leaseDuration: String, // "month_to_month", "6_months", "1_year", "flexible"
    availableFrom: Date,
    propertyAmenities: [String], // ["parking", "laundry", "gym", "pool", "garden", "balcony", "dishwasher"]
    houseRules: {
      smokingAllowed: Boolean,
      petsAllowed: Boolean,
      guestsAllowed: Boolean,
      partiesAllowed: Boolean,
      quietHours: String, // "10pm-8am", "11pm-7am", "flexible", "none"
    },
    tenantPreferences: {
      preferredAge: String, // "18-25", "26-35", "36-45", "45+", "no_preference"
      preferredGender: String, // "male", "female", "no_preference"
      preferredOccupation: String, // "student", "professional", "freelancer", "no_preference"
      backgroundCheckRequired: Boolean,
      creditCheckRequired: Boolean,
      referencesRequired: Boolean,
    }
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
