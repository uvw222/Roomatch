import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out" },
    { status: 200 }
  );

  //  Clear the cookie
  response.cookies.set("user_email", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // forces cookie to expire
  });

  return response;
}
