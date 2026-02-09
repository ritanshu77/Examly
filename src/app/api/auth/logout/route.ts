import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  
  // Clear cookies with exact same options as they were set
  // (except maxAge=0 to expire them immediately)
  response.cookies.set("token", "", {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: false, 
    maxAge: 0,
    expires: new Date(0),
  });
  
  response.cookies.set("id", "", {
    path: "/",
    sameSite: "lax",
    secure: false, 
    maxAge: 0,
    expires: new Date(0),
  });
  
  return response;
}
