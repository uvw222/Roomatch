import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookies, UserSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const profiles = await getCollection("profiles");
    const user = await profiles.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, message: "No password stored for this user" },
        { status: 400 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // Create user session data
    const userSession: UserSession = {
      email: user.email,
      userId: user._id.toString(),
      userType: user.userType,
      name: user.name
    };

    const response = NextResponse.json(
      { 
        success: true, 
        message: "Login successful", 
        user: {
          email: user.email,
          name: user.name,
          userType: user.userType
        }
      },
      { status: 200 }
    );

    // Update last login time
    await profiles.updateOne(
      { email: user.email },
      { $set: { lastLoginAt: new Date() } }
    )

    // Set authentication cookies with JWT token
    return setAuthCookies(response, userSession);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
