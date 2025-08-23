//app/api/profile/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { cookies } from "next/headers";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get("user_email")?.value;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Not logged in" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name")?.toString() || "";
    const age = Number(formData.get("age") || 0);
    const occupation = formData.get("occupation")?.toString() || "";
    const location = formData.get("location")?.toString() || "";
    const bio = formData.get("bio")?.toString() || "";
    
    // Handle coordinates
    const latitude = formData.get("latitude")?.toString();
    const longitude = formData.get("longitude")?.toString();
    const coordinates = latitude && longitude ? {
      latitude: Number(latitude),
      longitude: Number(longitude)
    } : undefined;

    let imageUrl = "";

    const imageFile = formData.get("profileImage");
    if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await uploadToCloudinary(
          buffer,
          email.replace(/[^a-zA-Z0-9]/g, "")
        );
        imageUrl = (uploadResult as any)?.secure_url || "";
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
      }
    }

    const profiles = await getCollection("profiles");

    const updateDoc: any = {
      $set: {
        name,
        age,
        occupation,
        location,
        bio,
        ...(coordinates && { coordinates }),
      },
    };

    if (imageUrl) {
      updateDoc.$set.profileImage = imageUrl;
    }

    await profiles.updateOne({ email }, updateDoc, { upsert: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { success: false, message: "Server error: " + (err as Error)?.message },
      { status: 500 }
    );
  }
}
