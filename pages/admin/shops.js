import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { toast } from "sonner";
import { Store, Plus } from "lucide-react";

export default function AdminShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newShop, setNewShop] = useState({ name: "", address: "", ownerEmail: "", lat: "", lng: "", phone: "" });
  const [adding, setAdding] = useState(false);

  const fetchShops = async () => {
    try {
      const res = await fetch("/api/admin/shops");
      const data = await res.json();
      setShops(data.shops || []);
    } catch (err) {
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShops(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/admin/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newShop,
          lat: parseFloat(newShop.lat),
          lng: parseFloat(newShop.lng),
        }),
      });
      if (res.ok) {
        toast.success("Shop registered");
        setNewShop({ name: "", address: "", ownerEmail: "", lat: "", lng: "", phone: "" });
        setShowAdd(false);
        fetchShops();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to register shop");
      }
    } catch (err) {
      toast.error("Failed to register shop");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
          <p className="text-gray-500">Manage registered medical shops</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Register Shop
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Shop Name" value={newShop.name} onChange={(e) => setNewShop({ ...newShop, name: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500" />
            <input type="email" placeholder="Owner Email" value={newShop.ownerEmail} onChange={(e) => setNewShop({ ...newShop, ownerEmail: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500" />
            <input type="text" placeholder="Address" value={newShop.address} onChange={(e) => setNewShop({ ...newShop, address: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500" />
            <input type="text" placeholder="Phone" value={newShop.phone} onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500" />
            <input type="text" placeholder="Latitude" value={newShop.lat} onChange={(e) => setNewShop({ ...newShop, lat: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500" />
            <input type="text" placeholder="Longitude" value={newShop.lng} onChange={(e) => setNewShop({ ...newShop, lng: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500" />
          </div>
          <button type="submit" disabled={adding} className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {adding ? "Registering..." : "Register"}
          </button>
        </form>
      )}

      {/* Shops list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shops.map((shop) => (
          <div key={shop.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                <p className="text-sm text-gray-500">{shop.address}</p>
                <p className="text-xs text-gray-400 mt-1">Owner: {shop.ownerEmail}</p>
                <p className="text-xs text-gray-400">Phone: {shop.phone || "-"}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${shop.isActive ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700"}`}>
                    {shop.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-500">Wallet: Rs. {shop.walletBalance || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
