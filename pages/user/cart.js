import { useState } from "react";
import { useRouter } from "next/router";
import UserLayout from "@/components/layouts/UserLayout";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "@/contexts/LocationContext";
import { Trash2, Plus, Minus, ShoppingCart, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart();
  const { location, address, setAddress, loading: locationLoading, error: locationError, requestLocation, hasLocation } = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Add medicines to your cart first");
      return;
    }

    if (!hasLocation) {
      toast.error("Please enable location to find nearby shops");
      requestLocation();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cart",
          items: items.map((item) => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            company: item.company || "",
            dosage: item.dosage || "",
            form: item.form || "",
            userNotes: item.userNotes || "",
            quantity: item.quantity,
          })),
          notes: notes.trim() || null,
          userLat: location.lat,
          userLng: location.lng,
          deliveryAddress: address.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Request sent to nearby shops!");
        clearCart();
        setNotes("");
        router.push("/user/requests");
      } else {
        toast.error(data.error || "Failed to create request");
      }
    } catch (err) {
      toast.error("Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Cart</h1>
        <p className="text-gray-500 mb-6">
          Review your items and send request to nearby shops
        </p>

        {/* Cart Items */}
        {items.length > 0 ? (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Cart Items ({totalItems})
              </h2>
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear all
              </button>
            </div>

            {/* Item Cards */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.medicineName}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.company && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {item.company}
                          </span>
                        )}
                        {item.dosage && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                            {item.dosage}
                          </span>
                        )}
                        {item.form && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {item.form}
                          </span>
                        )}
                      </div>
                      {item.userNotes && (
                        <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{item.userNotes}&rdquo;</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">Your cart is empty</p>
            <p className="text-sm text-gray-400">Search for medicines and add them to your cart</p>
            <button
              onClick={() => router.push("/user")}
              className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
            >
              Search Medicines
            </button>
          </div>
        )}

        {/* Notes */}
        {items.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Notes for Shop (Optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or additional info..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none resize-none"
            />
          </div>
        )}

        {/* Location Banner */}
        {items.length > 0 && (
          <div className={`border rounded-xl p-4 mb-6 ${hasLocation ? "bg-purple-50 border-purple-200" : locationError ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${hasLocation ? "text-purple-600" : "text-gray-500"}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {hasLocation ? "Location enabled" : "Location required"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {hasLocation
                      ? `Shops within 5km will receive your request`
                      : locationError || "Enable location to find nearby shops"}
                  </p>
                </div>
              </div>
              {!hasLocation && (
                <button
                  onClick={requestLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3 h-3" />
                      Enable Location
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {items.length > 0 && hasLocation && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              Delivery Address
            </h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your delivery address (auto-detected, you can edit)..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Auto-detected from your location. Edit if needed.</p>
          </div>
        )}

        {/* Submit */}
        {items.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">{totalItems} item{totalItems > 1 ? "s" : ""} in cart</p>
                <p className="text-xs text-gray-500">Shops will provide pricing</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !hasLocation}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Send Request to Nearby Shops
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
