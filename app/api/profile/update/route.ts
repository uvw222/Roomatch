//app/api/profile/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// Helper function to convert image buffer to base64 data URL
function bufferToDataURL(buffer: Buffer, mimeType: string): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// Helper function to get MIME type from file
function getMimeType(file: File): string {
  if (file.type) return file.type;
  
  // Fallback based on file extension if type is not available
  const extension = file.name.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const email = user.email;

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

    let imageDataURL = "";
    let galleryDataURLs: string[] = [];

    const imageFile = formData.get("profileImage");
    if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = getMimeType(imageFile as File);
        imageDataURL = bufferToDataURL(buffer, mimeType);
      } catch (uploadErr) {
        console.error("Profile image processing failed:", uploadErr);
      }
    }

    // Handle gallery images
    const galleryImageCount = Number(formData.get("galleryImageCount") || 0);
    for (let i = 0; i < galleryImageCount; i++) {
      const galleryFile = formData.get(`galleryImage_${i}`);
      if (galleryFile && typeof galleryFile === "object" && "arrayBuffer" in galleryFile) {
        try {
          const arrayBuffer = await galleryFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = getMimeType(galleryFile as File);
          const galleryDataURL = bufferToDataURL(buffer, mimeType);
          if (galleryDataURL) {
            galleryDataURLs.push(galleryDataURL);
          }
        } catch (uploadErr) {
          console.error("Gallery image processing failed:", uploadErr);
        }
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

    if (imageDataURL) {
      updateDoc.$set.profileImage = imageDataURL;
    }

    // Handle gallery images - save base64 data URLs to MongoDB
    if (galleryDataURLs.length > 0) {
      updateDoc.$set.galleryImages = galleryDataURLs;
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
