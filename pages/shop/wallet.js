import { useState, useEffect } from "react";
import ShopLayout from "@/components/layouts/ShopLayout";
import { toast } from "sonner";
import { Wallet, TrendingUp, IndianRupee, AlertCircle } from "lucide-react";

export default function ShopWalletPage() {
  const [wallet, setWallet] = useState({ balance: 0, totalEarned: 0, totalCommission: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch("/api/shops/wallet");
        const data = await res.json();
        setWallet(data.wallet || { balance: 0, totalEarned: 0, totalCommission: 0, transactions: [] });
      } catch (err) {
        toast.error("Failed to load wallet");
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wallet & Commission</h1>

      {/* Info banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-800">10% Commission on all orders</p>
          <p className="text-xs text-yellow-700 mt-0.5">
            Commission (10%) is calculated on each order. Please pay periodically to keep your account active.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">Rs. {wallet.balance}</p>
              <p className="text-sm text-gray-500">Pending Commission</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Rs. {wallet.totalEarned}</p>
              <p className="text-sm text-gray-500">Total Earned</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Rs. {wallet.totalCommission}</p>
              <p className="text-sm text-gray-500">Total Commission Paid</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Commission History</h2>
        </div>

        {wallet.transactions?.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No transactions yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {wallet.transactions?.map((tx, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Order: {tx.medicineName}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">-Rs. {tx.commission}</p>
                  <p className={`text-xs ${tx.status === "paid" ? "text-purple-600" : "text-yellow-600"}`}>
                    {tx.status === "paid" ? "Paid" : "Pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
