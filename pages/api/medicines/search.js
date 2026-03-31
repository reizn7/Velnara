import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: "Search query too short" });
  }

  try {
    const query = q.trim().toLowerCase();

    // Search global medicines catalog by lowercase name prefix
    const snapshot = await adminDb.collection("medicines")
      .where("nameLower", ">=", query)
      .where("nameLower", "<=", query + "\uf8ff")
      .limit(20)
      .get();

    const medicines = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        category: data.category || "",
      };
    });

    return res.status(200).json({ medicines });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Search failed" });
  }
}
