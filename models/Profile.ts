import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ["renter", "landlord"],
    required: true,
  },
  email: { type: String, required: true, unique: true }, // ✅ Add this
  name: String,
  age: Number,
  gender: String,
  occupation: String,
  bio: String,
  budget: Number,
  moveInDate: String,
  location: String,
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
});

export default mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
