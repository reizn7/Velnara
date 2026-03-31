import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { toast } from "sonner";
import { Store, Plus, MapPin, Truck, Phone } from "lucide-react";

export default function AdminShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newShop, setNewShop] = useState({ name: "", address: "", ownerEmail: "", lat: 0, lng: 0, phone: "", hasDeliveryPartner: false, deliveryPartnerPhone: "" });
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
    if (!newShop.lat || !newShop.lng) {
      toast.error("Please select an address from the dropdown to get location coordinates");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShop),
      });
      if (res.ok) {
        toast.success("Shop registered");
        setNewShop({ name: "", address: "", ownerEmail: "", lat: 0, lng: 0, phone: "", hasDeliveryPartner: false, deliveryPartnerPhone: "" });
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

  const handleAddressChange = (address, lat, lng) => {
    setNewShop((prev) => ({ ...prev, address, lat, lng }));
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
            <div className="sm:col-span-2">
              <AddressAutocomplete
                value={newShop.address}
                onChange={handleAddressChange}
                placeholder="Search shop address..."
              />
              {newShop.lat !== 0 && (
                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location captured: {newShop.lat.toFixed(4)}, {newShop.lng.toFixed(4)}
                </p>
              )}
            </div>
            <input type="text" placeholder="Phone" value={newShop.phone} onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500" />
          </div>

          {/* Delivery Partner Toggle */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={newShop.hasDeliveryPartner}
                  onChange={(e) => setNewShop({ ...newShop, hasDeliveryPartner: e.target.checked, deliveryPartnerPhone: e.target.checked ? newShop.deliveryPartnerPhone : "" })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-purple-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Has Delivery Partner</span>
              </div>
            </label>
            {newShop.hasDeliveryPartner && (
              <div className="mt-3 ml-12">
                <input
                  type="tel"
                  placeholder="Delivery partner phone number"
                  value={newShop.deliveryPartnerPhone}
                  onChange={(e) => setNewShop({ ...newShop, deliveryPartnerPhone: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
                />
              </div>
            )}
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
                {shop.lat && shop.lng && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {shop.lat.toFixed(4)}, {shop.lng.toFixed(4)}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Owner: {shop.ownerEmail}</p>
                <p className="text-xs text-gray-400">Phone: {shop.phone || "-"}</p>
                {shop.hasDeliveryPartner && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-purple-500" />
                    Delivery: {shop.deliveryPartnerPhone}
                  </p>
                )}
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
