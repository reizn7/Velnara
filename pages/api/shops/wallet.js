import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "shop") return res.status(403).json({ error: "Not authorized" });

  const shopId = user.shopId;
  if (!shopId) return res.status(400).json({ error: "No shop linked" });

  try {
    // Get shop wallet info
    const shopDoc = await adminDb.collection("shops").doc(shopId).get();
    const shopData = shopDoc.exists ? shopDoc.data() : {};

    // Get all commissions for this shop
    const commissionsSnap = await adminDb.collection("commissions")
      .where("shopId", "==", shopId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    let totalCommission = 0;
    let totalPaid = 0;
    const transactions = [];

    for (const doc of commissionsSnap.docs) {
      const data = doc.data();
      totalCommission += data.amount || 0;
      if (data.status === "paid") totalPaid += data.amount || 0;

      transactions.push({
        id: doc.id,
        medicineName: data.medicineName,
        commission: data.amount,
        orderAmount: data.orderAmount,
        status: data.status,
        createdAt: data.createdAt,
      });
    }

    // Get total earned from delivered orders
    const ordersSnap = await adminDb.collection("orders")
      .where("shopId", "==", shopId)
      .where("status", "==", "delivered")
      .get();

    let totalEarned = 0;
    for (const doc of ordersSnap.docs) {
      totalEarned += doc.data().totalAmount || 0;
    }

    return res.status(200).json({
      wallet: {
        balance: shopData.walletBalance || 0,
        totalEarned,
        totalCommission,
        totalPaid,
        transactions,
      },
    });
  } catch (error) {
    console.error("Wallet error:", error);
    return res.status(500).json({ error: "Failed to load wallet" });
  }
}
