import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "shop") return res.status(403).json({ error: "Not authorized" });

  const shopId = user.shopId;
  if (!shopId) return res.status(400).json({ error: "No shop linked" });

  try {
    // Get pending requests count
    const requestsSnap = await adminDb.collection("medicine_requests")
      .where("targetShopIds", "array-contains", shopId)
      .where("status", "==", "pending")
      .get();

    // Count requests where this shop hasn't responded yet
    let pendingRequests = 0;
    const recentRequests = [];

    for (const doc of requestsSnap.docs) {
      const data = doc.data();
      const shopResponse = data.shopResponses?.[shopId];
      if (!shopResponse || shopResponse.status === "pending") {
        pendingRequests++;
        if (recentRequests.length < 5) {
          recentRequests.push({
            id: doc.id,
            items: data.items || [],
            itemCount: data.itemCount || 0,
            prescriptionUrl: data.prescriptionUrl || null,
            estimatedTotal: data.estimatedTotal || 0,
            createdAt: data.createdAt,
          });
        }
      }
    }

    // Get active orders count
    const ordersSnap = await adminDb.collection("orders")
      .where("shopId", "==", shopId)
      .where("status", "in", ["confirmed", "preparing", "on_way"])
      .get();

    // Get wallet balance
    const shopDoc = await adminDb.collection("shops").doc(shopId).get();
    const shopData = shopDoc.exists ? shopDoc.data() : {};

    return res.status(200).json({
      stats: {
        pendingRequests,
        activeOrders: ordersSnap.size,
        walletBalance: shopData.walletBalance || 0,
      },
      recentRequests,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ error: "Failed to load dashboard" });
  }
}
