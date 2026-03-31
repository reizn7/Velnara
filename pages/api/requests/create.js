import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";
import { haversineDistance } from "@/lib/geo";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "user") return res.status(403).json({ error: "Not authorized" });

  const { items, notes, userLat, userLng } = req.body;

  // Validate: must have cart items
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Add medicines to your cart first" });
  }

  // Validate: must have user location
  if (!userLat || !userLng) {
    return res.status(400).json({ error: "Location is required to find nearby shops" });
  }

  const radiusKm = parseFloat(process.env.SEARCH_RADIUS_KM) || 5;

  try {
    // Get all active shops
    const shopsSnap = await adminDb.collection("shops")
      .where("isActive", "==", true)
      .get();

    // Filter shops within radius using Haversine
    const nearbyShops = [];
    shopsSnap.docs.forEach((doc) => {
      const shop = doc.data();
      if (!shop.lat || !shop.lng) return;

      const distance = haversineDistance(userLat, userLng, shop.lat, shop.lng);
      if (distance <= radiusKm) {
        nearbyShops.push({ id: doc.id, distance });
      }
    });

    if (nearbyShops.length === 0) {
      return res.status(400).json({
        error: `No active shops found within ${radiusKm}km of your location.`,
      });
    }

    const shopIds = nearbyShops.map((s) => s.id);

    // Build items array
    const requestItems = items.map((item, index) => ({
      index,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      company: item.company || "",
      dosage: item.dosage || "",
      form: item.form || "",
      userNotes: item.userNotes || "",
      quantity: item.quantity || 1,
    }));

    // Initialize shop responses with distance
    const shopResponses = {};
    for (const shop of nearbyShops) {
      shopResponses[shop.id] = { status: "pending", distance: Math.round(shop.distance * 10) / 10 };
    }

    // Create the request
    const requestRef = await adminDb.collection("medicine_requests").add({
      userId: user.uid,
      userEmail: user.email,
      userName: user.name || user.email,
      type: "cart",
      items: requestItems,
      itemCount: requestItems.length,
      notes: notes || null,
      status: "pending",
      targetShopIds: shopIds,
      shopResponses,
      selectedShopId: null,
      selectedShopName: null,
      orderId: null,
      userLat,
      userLng,
      radiusKm,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      requestId: requestRef.id,
      shopsNotified: shopIds.length,
    });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({ error: "Failed to create request" });
  }
}
