import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { role } = req.query;

  try {
    let query;

    if (role === "user" && user.role === "user") {
      query = adminDb.collection("orders")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(50);
    } else if (role === "shop" && user.role === "shop") {
      if (!user.shopId) return res.status(400).json({ error: "No shop linked" });
      query = adminDb.collection("orders")
        .where("shopId", "==", user.shopId)
        .orderBy("createdAt", "desc")
        .limit(50);
    } else {
      return res.status(403).json({ error: "Not authorized" });
    }

    const snap = await query.get();
    const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("List orders error:", error);
    return res.status(500).json({ error: "Failed to list orders" });
  }
}
