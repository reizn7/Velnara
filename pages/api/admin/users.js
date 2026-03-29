import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  const user = await verifySession(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Not authorized" });

  if (req.method === "GET") {
    try {
      const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
      const users = snap.docs.map((doc) => ({ email: doc.id, ...doc.data() }));
      return res.status(200).json({ users });
    } catch (error) {
      return res.status(500).json({ error: "Failed to list users" });
    }
  }

  if (req.method === "POST") {
    const { email, role, name } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
      await adminDb.collection("authorized_users").doc(email).set({
        email,
        role: role || "user",
        name: name || "",
        createdAt: new Date().toISOString(),
      }, { merge: true });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to add user" });
    }
  }

  if (req.method === "DELETE") {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
      await adminDb.collection("authorized_users").doc(email).delete();
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete user" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
