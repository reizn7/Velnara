import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Not authorized" });

  try {
    const [usersSnap, shopsSnap, ordersSnap, commissionsSnap] = await Promise.all([
      adminDb.collection("authorized_users").where("role", "==", "user").get(),
      adminDb.collection("shops").get(),
      adminDb.collection("orders").get(),
      adminDb.collection("commissions").get(),
    ]);

    let totalCommission = 0;
    for (const doc of commissionsSnap.docs) {
      totalCommission += doc.data().amount || 0;
    }

    return res.status(200).json({
      stats: {
        totalUsers: usersSnap.size,
        totalShops: shopsSnap.size,
        totalOrders: ordersSnap.size,
        totalCommission,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({ error: "Failed to load stats" });
  }
}
