import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

const VALID_STATUSES = ["confirmed", "preparing", "on_way", "delivered", "cancelled"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "shop") return res.status(403).json({ error: "Not authorized" });

  const { orderId, status } = req.body;
  if (!orderId || !status) return res.status(400).json({ error: "Missing required fields" });
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });

  try {
    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) return res.status(404).json({ error: "Order not found" });

    const order = orderDoc.data();
    if (order.shopId !== user.shopId) {
      return res.status(403).json({ error: "Not your order" });
    }

    await orderRef.update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ error: "Failed to update status" });
  }
}
