import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

const COMMISSION_RATE = Number(process.env.COMMISSION_RATE || 5);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "user") return res.status(403).json({ error: "Not authorized" });

  const { requestId, shopId } = req.body;
  if (!requestId || !shopId) return res.status(400).json({ error: "Missing required fields" });

  try {
    const requestRef = adminDb.collection("medicine_requests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) return res.status(404).json({ error: "Request not found" });
    const requestData = requestDoc.data();

    if (requestData.userId !== user.uid) {
      return res.status(403).json({ error: "Not your request" });
    }

    if (requestData.selectedShopId) {
      return res.status(400).json({ error: "Shop already selected" });
    }

    // Verify the shop accepted
    const shopResponse = requestData.shopResponses?.[shopId];
    if (!shopResponse || shopResponse.status !== "accepted") {
      return res.status(400).json({ error: "This shop hasn't accepted the request" });
    }

    // Get shop details
    const shopDoc = await adminDb.collection("shops").doc(shopId).get();
    const shopData = shopDoc.exists ? shopDoc.data() : {};

    // Calculate totals from accepted items
    const acceptedIndices = shopResponse.acceptedItemIndices || [];
    const acceptedItems = (requestData.items || []).filter((item) =>
      acceptedIndices.includes(item.index)
    );

    const totalAmount = shopResponse.totalPrice || requestData.estimatedTotal || 0;
    const commission = Math.round(totalAmount * COMMISSION_RATE / 100);

    // Create order with all accepted items
    const orderRef = await adminDb.collection("orders").add({
      requestId,
      userId: user.uid,
      userEmail: user.email,
      userName: user.name || user.email,
      shopId,
      shopName: shopData.name || "Unknown",
      // Multi-item order data
      items: acceptedItems,
      itemCount: acceptedItems.length,
      notes: requestData.notes || null,
      totalAmount,
      commission,
      paymentMethod: "cod",
      hasDeliveryPartner: !!shopData.hasDeliveryPartner,
      deliveryPartnerPhone: shopData.hasDeliveryPartner ? (shopData.deliveryPartnerPhone || "") : "",
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update request as selected
    await requestRef.update({
      selectedShopId: shopId,
      selectedShopName: shopData.name || "Unknown",
      orderId: orderRef.id,
      status: "selected",
      updatedAt: new Date().toISOString(),
    });

    // Create commission entry
    await adminDb.collection("commissions").add({
      shopId,
      shopName: shopData.name || "Unknown",
      orderId: orderRef.id,
      itemCount: acceptedItems.length,
      amount: commission,
      orderAmount: totalAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    // Update shop wallet balance
    const currentBalance = shopData.walletBalance || 0;
    await adminDb.collection("shops").doc(shopId).update({
      walletBalance: currentBalance + commission,
    });

    return res.status(200).json({ success: true, orderId: orderRef.id });
  } catch (error) {
    console.error("Select shop error:", error);
    return res.status(500).json({ error: "Failed to select shop" });
  }
}
