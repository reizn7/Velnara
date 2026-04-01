import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "shop") return res.status(403).json({ error: "Not authorized" });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "FCM token required" });

  const shopId = user.shopId;
  if (!shopId) return res.status(400).json({ error: "No shop linked to account" });

  try {
    // Use arrayUnion to add token without duplicates
    await adminDb.collection("shops").doc(shopId).update({
      fcmTokens: FieldValue.arrayUnion(token),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Save FCM token error:", error);
    return res.status(500).json({ error: "Failed to save token" });
  }
}
