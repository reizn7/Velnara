import { useState, useRef } from "react";
import { useRouter } from "next/router";
import UserLayout from "@/components/layouts/UserLayout";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "@/contexts/LocationContext";
import { storage } from "@/lib/firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Trash2, Plus, Minus, ShoppingCart, Camera, Upload, X, Image as ImageIcon, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { location, loading: locationLoading, error: locationError, requestLocation, hasLocation } = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [prescriptionUrl, setPrescriptionUrl] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPrescriptionPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    setUploading(true);
    try {
      const fileName = `prescriptions/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPrescriptionUrl(url);
      toast.success("Prescription uploaded!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload. Please try again.");
      setPrescriptionPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removePrescription = () => {
    setPrescriptionUrl(null);
    setPrescriptionPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (items.length === 0 && !prescriptionUrl) {
      toast.error("Add medicines to cart or upload a prescription");
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
          type: prescriptionUrl ? "prescription" : "cart",
          items: items.map((item) => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            variantName: item.variantName,
            variantMg: item.variantMg,
            variantPrice: item.variantPrice,
            manufacturer: item.manufacturer,
            quantity: item.quantity,
          })),
          prescriptionUrl: prescriptionUrl || null,
          notes: notes.trim() || null,
          userLat: location.lat,
          userLng: location.lng,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Request sent to nearby shops!");
        clearCart();
        setPrescriptionUrl(null);
        setPrescriptionPreview(null);
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
          Review items and/or upload a prescription, then send to nearby shops
        </p>

        {/* Prescription Upload */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-600" />
            Upload Prescription (Optional)
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Upload a photo of your prescription. Shops will see it alongside your cart items.
          </p>

          {prescriptionPreview ? (
            <div className="relative inline-block">
              <img
                src={prescriptionPreview}
                alt="Prescription"
                className="w-48 h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={removePrescription}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
              {uploading && (
                <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors w-full justify-center"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Click to upload prescription photo"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

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

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Medicine</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase px-2 py-3">Qty</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Price</th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{item.medicineName}</p>
                        <p className="text-xs text-gray-500">
                          {item.variantName} - {item.variantMg}
                          {item.manufacturer && ` | ${item.manufacturer}`}
                        </p>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-semibold text-purple-700">
                          Rs. {item.variantPrice * item.quantity}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">Rs. {item.variantPrice} each</p>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !prescriptionUrl ? (
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
        ) : null}

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Notes for Shop (Optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions, dosage notes, or additional info..."
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none resize-none"
          />
        </div>

        {/* Location Banner */}
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

        {/* Summary + Submit */}
        {(items.length > 0 || prescriptionUrl) && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  {items.length > 0 && `${totalItems} item${totalItems > 1 ? "s" : ""}`}
                  {items.length > 0 && prescriptionUrl && " + "}
                  {prescriptionUrl && "1 prescription"}
                </p>
                {items.length > 0 && (
                  <p className="text-lg font-bold text-gray-900">
                    Estimated Total: Rs. {totalPrice}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Final price may vary based on shop availability
                </p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Sending to shops..." : "Send Request to All Nearby Shops"}
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
