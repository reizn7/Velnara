import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/layouts/AdminLayout";
import { toast } from "sonner";
import { Users, Store, Package, IndianRupee, TrendingUp, ArrowRight, Activity, ShoppingBag } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalUsers: 0, totalShops: 0, totalOrders: 0, totalCommission: 0 });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/orders?limit=5").catch(() => null),
        ]);
        const statsData = await statsRes.json();
        setStats(statsData.stats || {});

        if (ordersRes?.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.orders || []);
        }
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </AdminLayout>
    );
  }

  const avgOrderValue = stats.totalOrders > 0
    ? Math.round((stats.totalCommission / (parseFloat(process.env.NEXT_PUBLIC_COMMISSION_RATE || 5) / 100)) / stats.totalOrders)
    : 0;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your marketplace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalShops}</p>
          <p className="text-sm text-gray-500">Active Shops</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">Rs. {stats.totalCommission}</p>
          <p className="text-sm text-gray-500">Total Commission</p>
        </div>
      </div>

      {/* Quick Actions + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => router.push("/admin/shops")}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Manage Shops</p>
                  <p className="text-xs text-gray-500">Register new shops, view all</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => router.push("/admin/medicines")}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Medicine Catalog</p>
                  <p className="text-xs text-gray-500">Add medicine names to catalog</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => router.push("/admin/orders")}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">All Orders</p>
                  <p className="text-xs text-gray-500">View and manage all orders</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => router.push("/admin/commissions")}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Commissions</p>
                  <p className="text-xs text-gray-500">Track earnings from shops</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div key={order.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.items?.length > 0
                            ? order.items[0].medicineName + (order.items.length > 1 ? ` +${order.items.length - 1}` : "")
                            : "Order"}
                        </p>
                        <p className="text-xs text-gray-500">{order.shopName} &middot; {order.userName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">Rs. {order.totalAmount}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No orders yet. Orders will appear here once customers start ordering.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
