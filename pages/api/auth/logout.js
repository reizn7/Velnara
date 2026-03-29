import { adminAuth } from "@/lib/firebaseadmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sessionCookie = req.cookies.session || "";
    if (sessionCookie) {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      await adminAuth.revokeRefreshTokens(decodedClaims.sub);
    }
  } catch (error) {
    // Session may already be invalid
  }

  // Clear cookie
  res.setHeader("Set-Cookie", [
    "session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
  ]);

  return res.status(200).json({ success: true });
}
