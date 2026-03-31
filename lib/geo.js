/**
 * Haversine formula to calculate distance between two lat/lng points.
 * Returns distance in kilometers.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filter shops within a given radius (in km) from a point.
 * Returns shops with distance attached, sorted by nearest first.
 */
export function filterShopsByRadius(shops, userLat, userLng, radiusKm) {
  return shops
    .map((shop) => ({
      ...shop,
      distance: haversineDistance(userLat, userLng, shop.lat, shop.lng),
    }))
    .filter((shop) => shop.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
