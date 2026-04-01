import { useState, useEffect, useRef } from "react";
import ShopLayout from "@/components/layouts/ShopLayout";
import { toast } from "sonner";
import { Bell, Package, Wallet, ClipboardList, Volume2, BellRing } from "lucide-react";
import Link from "next/link";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/fcm";

export default function ShopDashboard() {
  const [stats, setStats] = useState({ pendingRequests: 0, activeOrders: 0, walletBalance: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifStatus, setNotifStatus] = useState("unknown"); // unknown | granted | denied | unsupported
  const prevCountRef = useRef(0);
  const fcmRegisteredRef = useRef(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/shops/dashboard");
      const data = await res.json();
      setStats(data.stats || { pendingRequests: 0, activeOrders: 0, walletBalance: 0 });
      setRecentRequests(data.recentRequests || []);

      // Play alarm if new requests came in (polling fallback)
      if (data.stats?.pendingRequests > prevCountRef.current && prevCountRef.current > 0) {
        toast.info("New medicine request received!", { duration: 5000 });
      }
      prevCountRef.current = data.stats?.pendingRequests || 0;
    } catch (err) {
      console.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Register FCM token on mount
  useEffect(() => {
    if (fcmRegisteredRef.current) return;
    fcmRegisteredRef.current = true;

    const registerFCM = async () => {
      if (typeof window === "undefined" || !("Notification" in window)) {
        setNotifStatus("unsupported");
        return;
      }

      // Check current permission state
      if (Notification.permission === "denied") {
        setNotifStatus("denied");
        return;
      }

      const token = await requestNotificationPermission();
      if (token) {
        setNotifStatus("granted");
        // Save token to backend
        try {
          await fetch("/api/shops/save-fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          console.log("FCM token saved");
        } catch (err) {
          console.error("Failed to save FCM token:", err);
        }
      } else {
        setNotifStatus(Notification.permission === "denied" ? "denied" : "unknown");
      }
    };

    registerFCM();
  }, []);

  // Listen for foreground FCM messages
  useEffect(() => {
    let unsubscribe = () => {};

    onForegroundMessage((payload) => {
      const title = payload.notification?.title || "New Request!";
      const body = payload.notification?.body || "Check your requests.";
      toast.info(`${title} - ${body}`, { duration: 8000 });
      // Refresh dashboard data immediately
      fetchDashboard();
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Poll every 15 seconds as fallback (reduced from 5s since we have push now)
  useEffect(() => {
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shop Dashboard</h1>

      {/* Notification status banner */}
      {notifStatus === "denied" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <BellRing className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Notifications blocked</p>
            <p className="text-xs text-red-600">Enable notifications in your browser settings to get instant alerts for new requests.</p>
          </div>
        </div>
      )}

      {notifStatus === "granted" && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <Bell className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">Push notifications active &mdash; alerts work even when this tab is closed.</p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
              <p className="text-sm text-gray-500">Active Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Rs. {stats.walletBalance}</p>
              <p className="text-sm text-gray-500">Pending Commission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent incoming requests */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
        </div>

        {recentRequests.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No pending requests right now</p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg animate-pulse">
                <div>
                  <p className="font-medium text-gray-900">
                    {req.items?.length > 0
                      ? req.items.slice(0, 2).map((i) => i.medicineName).join(", ")
                      : "Request"}
                    {req.items?.length > 2 && ` +${req.items.length - 2} more`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {req.itemCount || 0} item{(req.itemCount || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <Link
                  href="/shop/requests"
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
