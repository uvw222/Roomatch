import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  // Meeting participants
  requesterEmail: { 
    type: String, 
    required: true,
    index: true 
  },
  participantEmail: { 
    type: String, 
    required: true,
    index: true 
  },
  requesterName: { type: String, required: true },
  participantName: { type: String, required: true },
  
  // Meeting details
  title: { 
    type: String, 
    default: "" 
  },
  description: { type: String, default: "" },
  notes: { type: String, default: "" },
  
  // Date and time
  date: { type: Date, required: true },
  time: { type: String, required: true }, // Format: "HH:MM"
  duration: { type: Number, default: 60 }, // Duration in minutes
  
  // Location details
  locationType: { 
    type: String, 
    enum: ["Coffee Shop", "Apartment Viewing", "Video Call", "Restaurant", "Other"],
    required: true 
  },
  address: { type: String, default: "" },
  
  // Meeting status
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  },
  
  // Confirmation from participants
  requesterConfirmed: { type: Boolean, default: true }, // Creator auto-confirms
  participantConfirmed: { type: Boolean, default: false },
  
  // Additional metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Cancellation/reschedule info
  cancelledBy: { type: String, default: null },
  cancellationReason: { type: String, default: "" },
  
  // For rescheduling tracking
  originalMeetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
  isReschedule: { type: Boolean, default: false }
});

// Create compound index for efficient queries
MeetingSchema.index({ requesterEmail: 1, participantEmail: 1 });
MeetingSchema.index({ date: 1, status: 1 });

// Update the updatedAt field before saving
MeetingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for getting all participants
MeetingSchema.virtual('participants').get(function() {
  return [this.requesterEmail, this.participantEmail];
});

// Method to check if user is participant
MeetingSchema.methods.isParticipant = function(email: string) {
  return this.requesterEmail === email || this.participantEmail === email;
};

// Method to get the other participant's info
MeetingSchema.methods.getOtherParticipant = function(currentUserEmail: string) {
  if (this.requesterEmail === currentUserEmail) {
    return {
      email: this.participantEmail,
      name: this.participantName
    };
  } else {
    return {
      email: this.requesterEmail,
      name: this.requesterName
    };
  }
};

// Method to confirm meeting
MeetingSchema.methods.confirmMeeting = function(userEmail: string) {
  if (this.requesterEmail === userEmail) {
    this.requesterConfirmed = true;
  } else if (this.participantEmail === userEmail) {
    this.participantConfirmed = true;
  }
  
  // If both confirmed, update status
  if (this.requesterConfirmed && this.participantConfirmed) {
    this.status = 'confirmed';
  }
};

export default mongoose.models.Meeting || mongoose.model("Meeting", MeetingSchema);
