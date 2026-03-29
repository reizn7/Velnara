import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Not authorized" });

  try {
    const snap = await adminDb.collection("orders")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error: "Failed to list orders" });
  }
}
