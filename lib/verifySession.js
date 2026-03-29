import { adminAuth, db as adminDb } from "@/lib/firebaseadmin";

/**
 * Verifies session cookie and returns user data with role.
 * Use in API routes to protect endpoints.
 */
export async function verifySession(req) {
  const sessionCookie = req.cookies?.session || "";
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userEmail = decodedClaims.email;

    // Check authorized_users first (for shop/admin roles)
    const authDoc = await adminDb.collection("authorized_users").doc(userEmail).get();

    if (authDoc.exists) {
      const authData = authDoc.data();
      return {
        uid: decodedClaims.uid,
        email: userEmail,
        name: decodedClaims.name || authData.name || "",
        role: authData.role || "user",
        shopId: authData.shopId || null,
      };
    }

    // Regular user (anyone with valid Gmail session is a user)
    return {
      uid: decodedClaims.uid,
      email: userEmail,
      name: decodedClaims.name || "",
      role: "user",
      shopId: null,
    };
  } catch (error) {
    return null;
  }
}
