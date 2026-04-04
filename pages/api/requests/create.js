import { db as adminDb } from "@/lib/firebaseadmin";
import { getMessaging } from "firebase-admin/messaging";
import { verifySession } from "@/lib/verifySession";
import { haversineDistance } from "@/lib/geo";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "user") return res.status(403).json({ error: "Not authorized" });

  const { items, notes, userLat, userLng, deliveryAddress } = req.body;

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
      deliveryAddress: deliveryAddress || null,
      radiusKm,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Send push notifications to nearby shops (fire-and-forget, don't block response)
    sendPushToShops(shopIds, requestItems, user.name || user.email).catch((err) => {
      console.error("Push notification error (non-fatal):", err);
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

/**
 * Send FCM push notifications to all nearby shops.
 * Collects tokens from shop docs, sends individually, cleans up stale tokens.
 */
async function sendPushToShops(shopIds, items, customerName) {
  // Collect all FCM tokens from nearby shops
  const allTokens = []; // { token, shopId }
  for (const shopId of shopIds) {
    const shopDoc = await adminDb.collection("shops").doc(shopId).get();
    const tokens = shopDoc.data()?.fcmTokens || [];
    for (const token of tokens) {
      allTokens.push({ token, shopId });
    }
  }

  if (allTokens.length === 0) return;

  const itemSummary = items.slice(0, 3).map((i) => i.medicineName).join(", ")
    + (items.length > 3 ? ` +${items.length - 3} more` : "");

  const messaging = getMessaging();

  // Send to each token
  const results = await Promise.allSettled(
    allTokens.map(({ token }) =>
      messaging.send({
        token,
        notification: {
          title: "New Medicine Request!",
          body: `${customerName} needs: ${itemSummary}`,
        },
        data: {
          url: "/shop/requests",
          type: "new_request",
        },
        webpush: {
          fcmOptions: {
            link: "/shop/requests",
          },
        },
      })
    )
  );

  // Clean up stale tokens
  const staleTokensByShop = {};
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const errorCode = result.reason?.code;
      if (
        errorCode === "messaging/registration-token-not-registered" ||
        errorCode === "messaging/invalid-registration-token"
      ) {
        const { token, shopId } = allTokens[i];
        if (!staleTokensByShop[shopId]) staleTokensByShop[shopId] = [];
        staleTokensByShop[shopId].push(token);
      }
    }
  });

  // Remove stale tokens from Firestore
  for (const [shopId, tokens] of Object.entries(staleTokensByShop)) {
    await adminDb.collection("shops").doc(shopId).update({
      fcmTokens: FieldValue.arrayRemove(...tokens),
    });
    console.log(`Cleaned ${tokens.length} stale FCM tokens from shop ${shopId}`);
  }
}
