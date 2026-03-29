import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "shop") return res.status(403).json({ error: "Not authorized" });

  const { requestId, action, acceptedItemIndices, totalPrice } = req.body;
  const shopId = user.shopId;

  if (!requestId || !action || !shopId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const requestRef = adminDb.collection("medicine_requests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) return res.status(404).json({ error: "Request not found" });

    const requestData = requestDoc.data();

    // Don't allow response if already selected
    if (requestData.selectedShopId) {
      return res.status(400).json({ error: "A shop has already been selected for this request" });
    }

    if (action === "accept") {
      // For multi-item requests, shop can accept all or some items
      // acceptedItemIndices: array of item indices the shop can fulfill
      // If not provided, accept ALL items
      const allIndices = (requestData.items || []).map((_, i) => i);
      const accepted = acceptedItemIndices || allIndices;

      // Calculate total for accepted items
      let shopTotal = totalPrice || 0;
      if (!totalPrice && requestData.items?.length > 0) {
        shopTotal = requestData.items
          .filter((item) => accepted.includes(item.index))
          .reduce((sum, item) => sum + item.variantPrice * item.quantity, 0);
      }

      await requestRef.update({
        [`shopResponses.${shopId}`]: {
          status: "accepted",
          acceptedItemIndices: accepted,
          totalPrice: shopTotal,
          respondedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });
    } else if (action === "reject") {
      await requestRef.update({
        [`shopResponses.${shopId}`]: {
          status: "rejected",
          respondedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Respond error:", error);
    return res.status(500).json({ error: "Failed to respond" });
  }
}
