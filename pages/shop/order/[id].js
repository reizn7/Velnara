import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ShopLayout from "@/components/layouts/ShopLayout";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants";

const STATUS_FLOW = ["confirmed", "preparing", "on_way", "delivered"];

export default function ShopOrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      setOrder(data.order || null);
    } catch (err) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Order marked as ${ORDER_STATUS_LABELS[newStatus]}`);
        fetchOrder();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
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

  if (!order) {
    return (
      <ShopLayout>
        <p className="text-center py-20 text-gray-500">Order not found</p>
      </ShopLayout>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIndex + 1]
    : null;

  return (
    <ShopLayout>
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-500 mt-1">Customer: <strong>{order.userName}</strong></p>
          </div>
          <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        {/* Items table */}
        {order.items?.length > 0 && (
          <div className="border-b border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-5 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-5 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{item.medicineName}</p>
                      <p className="text-xs text-gray-500">{item.variantName} - {item.variantMg}</p>
                    </td>
                    <td className="px-5 py-3 text-center text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-gray-900">
                      Rs. {item.variantPrice * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Prescription */}
        {order.prescriptionUrl && (
          <div className="px-5 py-3 border-b border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Prescription</p>
            <a href={order.prescriptionUrl} target="_blank" rel="noopener noreferrer">
              <img src={order.prescriptionUrl} alt="Prescription" className="w-40 h-auto rounded-lg border border-gray-200" />
            </a>
          </div>
        )}

        <div className="p-5 space-y-1">
          <p className="text-sm text-gray-500">Total: <strong className="text-purple-700">Rs. {order.totalAmount}</strong></p>
          <p className="text-sm text-gray-500">Commission: <strong className="text-red-600">Rs. {order.commission}</strong></p>
          <p className="text-sm text-gray-500">Payment: <strong>COD</strong></p>
        </div>
      </div>

      {/* Status update buttons */}
      {order.status !== "delivered" && order.status !== "cancelled" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-3">
            {nextStatus && (
              <button
                onClick={() => handleUpdateStatus(nextStatus)}
                disabled={updating}
                className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {updating ? "Updating..." : `Mark as ${ORDER_STATUS_LABELS[nextStatus]}`}
              </button>
            )}
            <button
              onClick={() => handleUpdateStatus("cancelled")}
              disabled={updating}
              className="px-5 py-2.5 bg-white text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        </div>
      )}
    </ShopLayout>
  );
}
