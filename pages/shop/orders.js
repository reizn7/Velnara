import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ShopLayout from "@/components/layouts/ShopLayout";
import { toast } from "sonner";
import { Package, ChevronRight } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants";

export default function ShopOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders/list?role=shop");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
      <p className="text-gray-500 mb-6">Manage and track your orders</p>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => router.push(`/shop/order/${order.id}`)}
              className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{order.medicineName}</h3>
                  <p className="text-sm text-gray-500">Customer: {order.userName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} | COD
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Rs. {order.totalAmount}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </ShopLayout>
  );
}
