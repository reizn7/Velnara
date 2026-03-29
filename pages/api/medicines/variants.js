import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { medicineId } = req.query;
  if (!medicineId) return res.status(400).json({ error: "medicineId required" });

  try {
    // Get variants from the global medicines catalog
    const medicineDoc = await adminDb.collection("medicines").doc(medicineId).get();

    if (!medicineDoc.exists) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    const medicineData = medicineDoc.data();
    const variants = (medicineData.variants || []).map((variant, index) => ({
      id: `${medicineId}_${index}`,
      name: variant.name,
      mg: variant.mg,
      price: variant.price,
      manufacturer: variant.manufacturer || "",
    }));

    // Sort by price ascending
    variants.sort((a, b) => a.price - b.price);

    return res.status(200).json({ variants });
  } catch (error) {
    console.error("Variants error:", error);
    return res.status(500).json({ error: "Failed to load variants" });
  }
}
