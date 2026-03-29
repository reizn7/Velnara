export const ORDER_STATUSES = {
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  ON_WAY: "on_way",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABELS = {
  confirmed: "Confirmed",
  preparing: "Preparing",
  on_way: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS = {
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-yellow-100 text-yellow-700",
  on_way: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const REQUEST_STATUSES = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  SELECTED: "selected",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};

export const ROLES = {
  USER: "user",
  SHOP: "shop",
  ADMIN: "admin",
};

export const COMMISSION_RATE = Number(process.env.COMMISSION_RATE || 5); // percentage

export const SEARCH_RADIUS_KM = Number(process.env.SEARCH_RADIUS_KM || 5);
