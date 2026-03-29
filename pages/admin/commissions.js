import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { toast } from "sonner";
import { Coins, Store } from "lucide-react";

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [shopSummary, setShopSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const res = await fetch("/api/admin/commissions");
        const data = await res.json();
        setCommissions(data.commissions || []);
        setShopSummary(data.shopSummary || []);
      } catch (err) {
        toast.error("Failed to load commissions");
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  const handleMarkPaid = async (shopId) => {
    try {
      const res = await fetch("/api/admin/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, action: "mark_paid" }),
      });
      if (res.ok) {
        toast.success("Commission marked as paid");
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to update");
    }
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Commissions</h1>
      <p className="text-gray-500 mb-6">Track and manage shop commissions</p>

      {/* Per-shop summary */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Shop Commission Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {shopSummary.map((shop) => (
          <div key={shop.shopId} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Store className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Pending:</span>
                <span className="font-medium text-red-600">Rs. {shop.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid:</span>
                <span className="font-medium text-purple-600">Rs. {shop.paid}</span>
              </div>
            </div>
            {shop.pending > 0 && (
              <button
                onClick={() => handleMarkPaid(shop.shopId)}
                className="mt-3 w-full px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
              >
                Mark as Paid
              </button>
            )}
          </div>
        ))}
      </div>

      {/* All commission entries */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">All Commission Entries</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {commissions.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No commissions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-900">{c.shopName}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{c.medicineName}</td>
                    <td className="px-5 py-3 text-sm text-right font-medium">Rs. {c.amount}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        c.status === "paid" ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {c.status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
