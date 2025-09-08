import mongoose from 'mongoose'

const { Schema } = mongoose

const MeetingSchema = new Schema({
  ownerEmail: { type: String, required: true, index: true },
  with: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String },
  address: { type: String },
  notes: { type: String },
}, { timestamps: true })

// Use existing model if already compiled to avoid recompilation errors in dev
const Meeting = mongoose.models?.Meeting || mongoose.model('Meeting', MeetingSchema)

export default Meeting
