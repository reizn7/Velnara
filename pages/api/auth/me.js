import { adminAuth, db as adminDb } from "@/lib/firebaseadmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sessionCookie = req.cookies.session || "";
    if (!sessionCookie) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userEmail = decodedClaims.email;

    // Check authorized_users first (for shop/admin)
    const authDoc = await adminDb.collection("authorized_users").doc(userEmail).get();

    if (authDoc.exists) {
      const authData = authDoc.data();
      return res.status(200).json({
        uid: decodedClaims.uid,
        email: userEmail,
        name: decodedClaims.name || authData.name || "",
        role: authData.role || "user",
        shopId: authData.shopId || null,
      });
    }

    // Regular user (auto-registered)
    const userDoc = await adminDb.collection("users").doc(userEmail).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    return res.status(200).json({
      uid: decodedClaims.uid,
      email: userEmail,
      name: decodedClaims.name || userData.name || "",
      role: "user",
      shopId: null,
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return res.status(401).json({ error: "Invalid session" });
  }
}
