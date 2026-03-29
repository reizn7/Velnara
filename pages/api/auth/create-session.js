import { adminAuth, db as adminDb } from "@/lib/firebaseadmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "ID token is required" });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Check authorized_users for shop/admin roles
    const userDoc = await adminDb.collection("authorized_users").doc(userEmail).get();

    let role = "user"; // default - anyone can sign up as user
    let shopId = null;

    if (userDoc.exists) {
      const userData = userDoc.data();
      role = userData.role || "user";
      shopId = userData.shopId || null;
    } else {
      // Auto-register as regular user in users collection
      await adminDb.collection("users").doc(userEmail).set({
        email: userEmail,
        name: decodedToken.name || "",
        uid: decodedToken.uid,
        photoURL: decodedToken.picture || "",
        role: "user",
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }

    // Create session cookie (14 days)
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    res.setHeader("Set-Cookie", [
      `session=${sessionCookie}; Max-Age=${expiresIn / 1000}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    ]);

    return res.status(200).json({ success: true, uid: decodedToken.uid, role, shopId });
  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(401).json({ error: "Invalid ID token" });
  }
}
