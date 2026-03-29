import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  const user = await verifySession(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Not authorized" });

  if (req.method === "GET") {
    try {
      const snap = await adminDb.collection("shops").get();
      const shops = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ shops });
    } catch (error) {
      return res.status(500).json({ error: "Failed to list shops" });
    }
  }

  if (req.method === "POST") {
    const { name, address, ownerEmail, lat, lng, phone } = req.body;
    if (!name || !address || !ownerEmail) {
      return res.status(400).json({ error: "Name, address, and owner email required" });
    }

    try {
      // Create the shop
      const shopRef = await adminDb.collection("shops").add({
        name,
        address,
        ownerEmail,
        lat: lat || 0,
        lng: lng || 0,
        phone: phone || "",
        isActive: true,
        walletBalance: 0,
        createdAt: new Date().toISOString(),
      });

      // Link owner to shop in authorized_users
      await adminDb.collection("authorized_users").doc(ownerEmail).set({
        email: ownerEmail,
        role: "shop",
        shopId: shopRef.id,
        name: name,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      return res.status(200).json({ success: true, shopId: shopRef.id });
    } catch (error) {
      console.error("Register shop error:", error);
      return res.status(500).json({ error: "Failed to register shop" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
