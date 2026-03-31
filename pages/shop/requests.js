import { useState, useEffect } from "react";
import ShopLayout from "@/components/layouts/ShopLayout";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function ShopRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [selectedItems, setSelectedItems] = useState({}); // { requestId: Set of item indices }

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests/list?role=shop");
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
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleItemSelection = (requestId, itemIndex, totalItems) => {
    setSelectedItems((prev) => {
      const current = new Set(prev[requestId] || []);
      if (current.has(itemIndex)) {
        current.delete(itemIndex);
      } else {
        current.add(itemIndex);
      }
      return { ...prev, [requestId]: current };
    });
  };

  const selectAllItems = (requestId, items) => {
    setSelectedItems((prev) => ({
      ...prev,
      [requestId]: new Set(items.map((_, i) => i)),
    }));
  };

  const handleRespond = async (requestId, action, request) => {
    setResponding(`${requestId}-${action}`);
    try {
      const body = { requestId, action };

      if (action === "accept") {
        const selected = selectedItems[requestId];
        // If nothing specifically selected, accept all
        const acceptedIndices = selected && selected.size > 0
          ? Array.from(selected)
          : (request.items || []).map((_, i) => i);
        body.acceptedItemIndices = acceptedIndices;
      }

      const res = await fetch("/api/requests/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(action === "accept" ? "Request accepted!" : "Request rejected.");
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to respond");
      }
    } catch (err) {
      toast.error("Failed to respond");
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <ShopLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Medicine Requests</h1>
      <p className="text-gray-500 mb-6">Accept or reject incoming requests. You can accept all or select specific items.</p>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isExpanded = expandedRequest === req.id;
            const selected = selectedItems[req.id] || new Set();

            return (
              <div
                key={req.id}
                className={`bg-white border rounded-xl overflow-hidden ${
                  req.shopStatus === "pending"
                    ? "border-yellow-300 bg-yellow-50/30"
                    : "border-gray-200"
                }`}
              >
                {/* Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">
                          {req.itemCount} item{req.itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Quick summary of items */}
                      <p className="text-sm font-medium text-gray-900">
                        {req.items?.slice(0, 2).map((item) => item.medicineName).join(", ")}
                        {req.items?.length > 2 && ` +${req.items.length - 2} more`}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Customer: {req.userName} | {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {req.shopStatus === "pending" ? (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleRespond(req.id, "accept", req)}
                          disabled={responding === `${req.id}-accept`}
                          className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {selected.size > 0 && selected.size < (req.items?.length || 0)
                            ? `Accept ${selected.size}`
                            : "Accept All"}
                        </button>
                        <button
                          onClick={() => handleRespond(req.id, "reject", req)}
                          disabled={responding === `${req.id}-reject`}
                          className="flex items-center gap-1 px-3 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ml-4 ${
                          req.shopStatus === "accepted"
                            ? "bg-purple-100 text-purple-700"
                            : req.shopStatus === "rejected"
                            ? "bg-red-100 text-red-700"
                            : req.shopStatus === "selected"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {req.shopStatus === "accepted"
                          ? "Accepted - Waiting"
                          : req.shopStatus === "selected"
                          ? "Customer chose you!"
                          : req.shopStatus === "not_selected"
                          ? "Not selected"
                          : req.shopStatus}
                      </span>
                    )}
                  </div>

                  {/* Expand toggle */}
                  {(req.items?.length > 0 || req.notes) && (
                    <button
                      onClick={() => setExpandedRequest(isExpanded ? null : req.id)}
                      className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-2"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? "Hide details" : "View details"}
                    </button>
                  )}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-3">
                    {/* Notes */}
                    {req.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer Notes</p>
                        <p className="text-sm text-gray-700">{req.notes}</p>
                      </div>
                    )}

                    {/* Items table - with checkboxes for pending requests */}
                    {req.items?.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-gray-500 uppercase">Items</p>
                          {req.shopStatus === "pending" && req.items.length > 1 && (
                            <button
                              onClick={() => selectAllItems(req.id, req.items)}
                              className="text-xs text-purple-600 hover:text-purple-700"
                            >
                              Select all
                            </button>
                          )}
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              {req.shopStatus === "pending" && (
                                <th className="text-left py-2 pr-2 w-8"></th>
                              )}
                              <th className="text-left py-2 text-xs font-medium text-gray-500">Medicine</th>
                              <th className="text-center py-2 text-xs font-medium text-gray-500">Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {req.items.map((item, idx) => {
                              const isChecked = selected.has(idx);
                              const wasAccepted = req.shopResponse?.acceptedItemIndices?.includes(idx);

                              return (
                                <tr key={idx} className={wasAccepted === false && req.shopStatus !== "pending" ? "opacity-40" : ""}>
                                  {req.shopStatus === "pending" && (
                                    <td className="py-2 pr-2">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleItemSelection(req.id, idx, req.items.length)}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                      />
                                    </td>
                                  )}
                                  <td className="py-2">
                                    <p className="font-medium text-gray-900">{item.medicineName}</p>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {item.company && (
                                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                                          {item.company}
                                        </span>
                                      )}
                                      {item.dosage && (
                                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-xs rounded">
                                          {item.dosage}
                                        </span>
                                      )}
                                      {item.form && (
                                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                          {item.form}
                                        </span>
                                      )}
                                    </div>
                                    {item.userNotes && (
                                      <p className="text-xs text-purple-600 mt-1 italic">Note: {item.userNotes}</p>
                                    )}
                                  </td>
                                  <td className="py-2 text-center text-gray-700">{item.quantity}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ShopLayout>
  );
}
