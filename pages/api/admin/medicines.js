import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  const user = await verifySession(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Not authorized" });

  // GET - list all medicines
  if (req.method === "GET") {
    try {
      const snap = await adminDb.collection("medicines").orderBy("name").get();
      const medicines = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ medicines });
    } catch (error) {
      return res.status(500).json({ error: "Failed to list medicines" });
    }
  }

  // POST - add new medicine or update existing
  if (req.method === "POST") {
    const { id, name, category } = req.body;

    if (!name) return res.status(400).json({ error: "Medicine name is required" });

    try {
      const data = {
        name,
        nameLower: name.toLowerCase(),
        category: category || "",
        updatedAt: new Date().toISOString(),
      };

      if (id) {
        // Update existing
        await adminDb.collection("medicines").doc(id).update(data);
        return res.status(200).json({ success: true, id });
      } else {
        // Create new
        data.createdAt = new Date().toISOString();
        const ref = await adminDb.collection("medicines").add(data);
        return res.status(200).json({ success: true, id: ref.id });
      }
    } catch (error) {
      console.error("Save medicine error:", error);
      return res.status(500).json({ error: "Failed to save medicine" });
    }
  }

  // DELETE - remove medicine
  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Medicine ID required" });

    try {
      await adminDb.collection("medicines").doc(id).delete();
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete medicine" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
