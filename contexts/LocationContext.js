import { createContext, useContext, useState, useCallback, useEffect } from "react";

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null); // { lat, lng }
  const [address, setAddress] = useState(""); // reverse-geocoded address
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState("prompt"); // prompt | granted | denied

  // Check permission state on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      }).catch(() => {});
    }
  }, []);

  // Auto-request location if previously granted
  useEffect(() => {
    if (permissionState === "granted" && !location) {
      requestLocation();
    }
  }, [permissionState]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        setLoading(false);
        setPermissionState("granted");

        // Reverse geocode to get address (fire-and-forget)
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
          headers: { "User-Agent": "Sanjeevani-MedPlatform/1.0" },
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.display_name) setAddress(data.display_name);
          })
          .catch(() => {});
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location access denied. Please enable it in browser settings."
            : err.code === 2
            ? "Location unavailable. Please try again."
            : "Location request timed out. Please try again."
        );
        setLoading(false);
        if (err.code === 1) setPermissionState("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        setAddress,
        loading,
        error,
        permissionState,
        requestLocation,
        clearLocation,
        hasLocation: !!location,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within LocationProvider");
  return context;
}
