import { createContext, useContext, useState, useCallback, useEffect } from "react";

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null); // { lat, lng }
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
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
        setPermissionState("granted");
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
