export function getAuthToken(): string | null {
  // Check if we are in the browser (Client Side)
  if (typeof document !== 'undefined') {
    console.log("Checking cookies in getAuthToken:", document.cookie);
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    if (match) {
      const token = decodeURIComponent(match[2]);
      console.log("Token found:", token.substring(0, 10) + "...");
      return token;
    } else {
        console.log("No token cookie found matching regexp");
    }
  } else {
      console.log("getAuthToken called on Server Side (document undefined)");
  }
  
  // NOTE: We cannot use `cookies()` from "next/headers" here because 
  // this function is used in Client Components (e.g., SetQuestionsView).
  // `cookies()` is Server-Side only.
  
  return null;
}
