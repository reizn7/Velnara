import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ShopLayout from "@/components/layouts/ShopLayout";
import { toast } from "sonner";
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, User, IndianRupee } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants";

const STATUS_ICONS = {
  confirmed: Clock,
  preparing: Package,
  on_way: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function ShopOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => {
        if (filter === "active") return ["confirmed", "preparing", "on_way"].includes(o.status);
        if (filter === "delivered") return o.status === "delivered";
        if (filter === "cancelled") return o.status === "cancelled";
        return true;
      });

  const activeCount = orders.filter((o) => ["confirmed", "preparing", "on_way"].includes(o.status)).length;
  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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
      <p className="text-gray-500 mb-4">Manage and fulfill customer orders</p>

      {orders.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-purple-700">{activeCount}</p>
              <p className="text-xs text-purple-600">Active</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-700">Rs. {totalRevenue}</p>
              <p className="text-xs text-green-600">Revenue</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "delivered", label: "Delivered" },
              { key: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-900 font-medium mb-1">No orders yet</p>
          <p className="text-sm text-gray-500">Orders will appear here when customers select your shop</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No {filter} orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const StatusIcon = STATUS_ICONS[order.status] || Package;
            const itemsSummary = order.items?.length > 0
              ? order.items.slice(0, 2).map((i) => i.medicineName).join(", ") + (order.items.length > 2 ? ` +${order.items.length - 2}` : "")
              : order.medicineName;

            return (
              <button
                key={order.id}
                onClick={() => router.push(`/shop/order/${order.id}`)}
                className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    order.status === "delivered" ? "bg-green-100" :
                    order.status === "cancelled" ? "bg-red-100" :
                    "bg-purple-100"
                  }`}>
                    <StatusIcon className={`w-5 h-5 ${
                      order.status === "delivered" ? "text-green-600" :
                      order.status === "cancelled" ? "text-red-600" :
                      "text-purple-600"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{itemsSummary}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-500">{order.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                      {order.itemCount > 0 && (
                        <span className="text-xs text-gray-400">{order.itemCount} items</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-gray-900">Rs. {order.totalAmount}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </ShopLayout>
  );
}
