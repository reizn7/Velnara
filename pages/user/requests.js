import { useState, useEffect } from "react";
import UserLayout from "@/components/layouts/UserLayout";
import { toast } from "sonner";
import { Clock, CheckCircle, Store, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";

export default function UserRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests/list?role=user");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);
  useEffect(() => {
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectShop = async (requestId, shopId) => {
    try {
      const res = await fetch("/api/requests/select-shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, shopId }),
      });
      if (res.ok) {
        toast.success("Shop selected! Order created.");
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to select shop");
      }
    } catch (err) {
      toast.error("Failed to select shop");
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Requests</h1>
      <p className="text-gray-500 mb-6">Track your requests and choose from shops that respond</p>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No requests yet. Search for medicines and send a request.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isExpanded = expandedRequest === req.id;

            return (
              <div key={req.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {req.prescriptionUrl && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            <ImageIcon className="w-3 h-3" />
                            Prescription
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {req.itemCount > 0
                            ? `${req.itemCount} item${req.itemCount > 1 ? "s" : ""}`
                            : "Prescription only"}
                        </span>
                      </div>

                      {/* Items summary */}
                      {req.items?.length > 0 && (
                        <p className="text-sm font-medium text-gray-900">
                          {req.items.slice(0, 3).map((item) => item.medicineName).join(", ")}
                          {req.items.length > 3 && ` +${req.items.length - 3} more`}
                        </p>
                      )}

                      {req.estimatedTotal > 0 && (
                        <p className="text-sm text-purple-700 font-semibold mt-0.5">
                          Estimated: Rs. {req.estimatedTotal}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "selected"
                          ? "bg-purple-100 text-purple-700"
                          : req.status === "expired"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {req.status === "pending"
                        ? "Waiting for shops"
                        : req.status === "accepted"
                        ? "Shops responded"
                        : req.status === "selected"
                        ? "Shop selected"
                        : req.status}
                    </span>
                  </div>

                  {/* Expand toggle */}
                  {req.items?.length > 0 && (
                    <button
                      onClick={() => setExpandedRequest(isExpanded ? null : req.id)}
                      className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-1"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? "Hide items" : "View items"}
                    </button>
                  )}

                  {/* Expanded items table */}
                  {isExpanded && req.items?.length > 0 && (
                    <div className="mt-3 border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Medicine</th>
                            <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Qty</th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {req.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-3">
                                <p className="font-medium text-gray-900">{item.medicineName}</p>
                                <p className="text-xs text-gray-500">
                                  {item.variantName} - {item.variantMg}
                                </p>
                              </td>
                              <td className="py-2 px-2 text-center text-gray-700">{item.quantity}</td>
                              <td className="py-2 px-3 text-right font-medium text-gray-900">
                                Rs. {item.variantPrice * item.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Accepted shops */}
                  {req.status === "accepted" && req.acceptedShops?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Choose a shop ({req.acceptedShops.length} responded):
                      </p>
                      {req.acceptedShops.map((shop) => (
                        <div
                          key={shop.shopId}
                          className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <Store className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{shop.shopName}</p>
                              <p className="text-xs text-gray-500">
                                {shop.address}
                                {shop.acceptedCount > 0 && req.itemCount > 0 && (
                                  <span className="ml-2 text-purple-600">
                                    ({shop.acceptedCount}/{req.itemCount} items available)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-purple-700">
                              Rs. {shop.totalPrice}
                            </span>
                            <button
                              onClick={() => handleSelectShop(req.id, shop.shopId)}
                              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {req.status === "selected" && req.orderId && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-700">
                          Order placed with {req.selectedShopName}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </UserLayout>
  );
}
