import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { role } = req.query;

  try {
    let requests = [];

    if (role === "user" && user.role === "user") {
      const snap = await adminDb.collection("medicine_requests")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      for (const doc of snap.docs) {
        const data = doc.data();

        // Build accepted shops list
        const acceptedShops = [];
        if (data.shopResponses) {
          for (const [shopId, response] of Object.entries(data.shopResponses)) {
            if (response.status === "accepted") {
              const shopDoc = await adminDb.collection("shops").doc(shopId).get();
              const shopData = shopDoc.exists ? shopDoc.data() : {};
              acceptedShops.push({
                shopId,
                shopName: shopData.name || "Unknown",
                address: shopData.address || "",
                totalPrice: response.totalPrice || data.estimatedTotal,
                acceptedItemIndices: response.acceptedItemIndices || [],
                acceptedCount: (response.acceptedItemIndices || []).length,
                distance: response.distance || null,
              });
            }
          }
        }

        // Determine effective status
        let status = data.status;
        if (status === "pending" && acceptedShops.length > 0) {
          status = "accepted";
        }

        // Fetch delivery info if order exists
        let deliveryInfo = null;
        if (data.orderId) {
          const orderDoc = await adminDb.collection("orders").doc(data.orderId).get();
          if (orderDoc.exists) {
            const orderData = orderDoc.data();
            if (orderData.hasDeliveryPartner) {
              deliveryInfo = {
                hasDeliveryPartner: true,
                deliveryPartnerPhone: orderData.deliveryPartnerPhone || "",
              };
            }
          }
        }

        requests.push({
          id: doc.id,
          ...data,
          status,
          acceptedShops,
          deliveryInfo,
        });
      }
    } else if (role === "shop" && user.role === "shop") {
      const shopId = user.shopId;
      if (!shopId) return res.status(400).json({ error: "No shop linked to account" });

      const snap = await adminDb.collection("medicine_requests")
        .where("targetShopIds", "array-contains", shopId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      for (const doc of snap.docs) {
        const data = doc.data();
        const shopResponse = data.shopResponses?.[shopId] || { status: "pending" };

        let shopStatus = shopResponse.status;
        if (data.selectedShopId === shopId) {
          shopStatus = "selected";
        } else if (data.selectedShopId && data.selectedShopId !== shopId) {
          shopStatus = "not_selected";
        }

        requests.push({
          id: doc.id,
          type: data.type || "cart",
          items: data.items || [],
          itemCount: data.itemCount || 0,
          notes: data.notes || null,
          estimatedTotal: data.estimatedTotal || 0,
          userName: data.userName,
          createdAt: data.createdAt,
          status: data.status,
          shopStatus,
          shopResponse: {
            acceptedItemIndices: shopResponse.acceptedItemIndices || [],
            totalPrice: shopResponse.totalPrice || 0,
          },
        });
      }
    }

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("List requests error:", error);
    return res.status(500).json({ error: "Failed to list requests" });
  }
}
