import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  const user = await verifySession(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Not authorized" });

  if (req.method === "GET") {
    try {
      // Get all commissions
      const snap = await adminDb.collection("commissions")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

      const commissions = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Build per-shop summary
      const shopMap = {};
      for (const c of commissions) {
        if (!shopMap[c.shopId]) {
          shopMap[c.shopId] = { shopId: c.shopId, shopName: c.shopName, pending: 0, paid: 0 };
        }
        if (c.status === "paid") {
          shopMap[c.shopId].paid += c.amount;
        } else {
          shopMap[c.shopId].pending += c.amount;
        }
      }

      return res.status(200).json({
        commissions,
        shopSummary: Object.values(shopMap),
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to load commissions" });
    }
  }

  if (req.method === "POST") {
    const { shopId, action } = req.body;

    if (action === "mark_paid" && shopId) {
      try {
        // Mark all pending commissions for this shop as paid
        const snap = await adminDb.collection("commissions")
          .where("shopId", "==", shopId)
          .where("status", "==", "pending")
          .get();

        const batch = adminDb.batch();
        for (const doc of snap.docs) {
          batch.update(doc.ref, { status: "paid", paidAt: new Date().toISOString() });
        }
        await batch.commit();

        // Reset shop wallet balance
        await adminDb.collection("shops").doc(shopId).update({ walletBalance: 0 });

        return res.status(200).json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: "Failed to mark paid" });
      }
    }

    return res.status(400).json({ error: "Invalid action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
