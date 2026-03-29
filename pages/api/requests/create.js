import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "user") return res.status(403).json({ error: "Not authorized" });

  const { type, items, prescriptionUrl, notes } = req.body;

  // Validate: must have cart items OR prescription
  if ((!items || items.length === 0) && !prescriptionUrl) {
    return res.status(400).json({ error: "Add medicines to cart or upload a prescription" });
  }

  try {
    // Get all active shops
    const shopsSnap = await adminDb.collection("shops")
      .where("isActive", "==", true)
      .get();

    const shopIds = shopsSnap.docs.map((doc) => doc.id);

    if (shopIds.length === 0) {
      return res.status(400).json({ error: "No active shops available right now. Try again later." });
    }

    // Build items array with indices for per-item accept/reject
    const requestItems = (items || []).map((item, index) => ({
      index,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      variantName: item.variantName || "",
      variantMg: item.variantMg || "",
      variantPrice: item.variantPrice || 0,
      manufacturer: item.manufacturer || "",
      quantity: item.quantity || 1,
    }));

    // Calculate estimated total
    const estimatedTotal = requestItems.reduce(
      (sum, item) => sum + item.variantPrice * item.quantity, 0
    );

    // Initialize shop responses
    const shopResponses = {};
    for (const shopId of shopIds) {
      shopResponses[shopId] = { status: "pending" };
    }

    // Create the request
    const requestRef = await adminDb.collection("medicine_requests").add({
      userId: user.uid,
      userEmail: user.email,
      userName: user.name || user.email,
      type: type || "cart", // "cart" or "prescription"
      items: requestItems,
      itemCount: requestItems.length,
      prescriptionUrl: prescriptionUrl || null,
      notes: notes || null,
      estimatedTotal,
      status: "pending",
      targetShopIds: shopIds,
      shopResponses,
      selectedShopId: null,
      selectedShopName: null,
      orderId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, requestId: requestRef.id });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({ error: "Failed to create request" });
  }
}
