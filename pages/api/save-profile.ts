import type { NextApiRequest, NextApiResponse } from "next"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      await connectToDatabase()
      const { email, ...updateData } = req.body

      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" })
      }

      const updatedProfile = await Profile.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true, upsert: false } // only update, don't create new
      )

      if (!updatedProfile) {
        return res.status(404).json({ success: false, message: "Profile not found" })
      }

      return res.status(200).json({ success: true, profile: updatedProfile })
    } catch (error) {
      console.error("Error updating profile:", error)
      return res.status(500).json({ success: false, message: "Server error" })
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" })
  }
}
