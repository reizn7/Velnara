import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserLayout from "@/components/layouts/UserLayout";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Clock, Truck, Package, XCircle } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/constants";

const TRACKING_STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "on_way", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </UserLayout>
    );
  }

  if (!order) {
    return (
      <UserLayout>
        <p className="text-center py-20 text-gray-500">Order not found</p>
      </UserLayout>
    );
  }

  const currentStepIndex = TRACKING_STEPS.findIndex((s) => s.key === order.status);

  return (
    <UserLayout>
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Order details */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
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

        {/* Order info */}
        <table className="w-full">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-5 py-3 text-sm text-gray-500 w-40">Shop</td>
              <td className="px-5 py-3 text-sm text-gray-900">{order.shopName}</td>
            </tr>
            <tr>
              <td className="px-5 py-3 text-sm text-gray-500">Total Amount</td>
              <td className="px-5 py-3 text-sm font-semibold text-purple-700">Rs. {order.totalAmount}</td>
            </tr>
            <tr>
              <td className="px-5 py-3 text-sm text-gray-500">Payment</td>
              <td className="px-5 py-3 text-sm text-gray-900">Cash on Delivery</td>
            </tr>
            <tr>
              <td className="px-5 py-3 text-sm text-gray-500">Ordered On</td>
              <td className="px-5 py-3 text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tracking table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Order Tracking</h2>
        </div>

        {order.status === "cancelled" ? (
          <div className="p-6 text-center">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Order Cancelled</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Step</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TRACKING_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <tr key={step.key} className={isCurrent ? "bg-purple-50" : ""}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <StepIcon className={`w-4 h-4 ${isCompleted ? "text-purple-600" : "text-gray-300"}`} />
                        <span className={`text-sm font-medium ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {isCurrent ? (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                          Current
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Done
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isCompleted ? "bg-purple-600" : "bg-gray-200"}`}
                          style={{ width: isCompleted ? "100%" : "0%" }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </UserLayout>
  );
}
