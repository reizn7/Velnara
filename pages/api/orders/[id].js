import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Order ID required" });

  try {
    const orderDoc = await adminDb.collection("orders").doc(id).get();
    if (!orderDoc.exists) return res.status(404).json({ error: "Order not found" });

    const order = { id: orderDoc.id, ...orderDoc.data() };

    // Verify access
    if (user.role === "user" && order.userId !== user.uid) {
      return res.status(403).json({ error: "Not authorized" });
    }
    if (user.role === "shop" && order.shopId !== user.shopId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({ error: "Failed to get order" });
  }
}
