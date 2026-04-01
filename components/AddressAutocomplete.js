import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";

/**
 * Address autocomplete using OpenStreetMap Nominatim (free, no API key).
 * Props:
 *   value       - current address string
 *   onChange     - (address, lat, lng) => void
 *   placeholder  - input placeholder
 *   className    - additional className for wrapper
 */
export default function AddressAutocomplete({ value, onChange, placeholder = "Search address...", className = "" }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value]);

  const searchAddress = useCallback(async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchText)}&format=json&limit=5&countrycodes=in&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Sanjeevnai-MedPlatform/1.0",
          },
        }
      );
      const data = await res.json();
      setSuggestions(
        data.map((item) => ({
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type,
        }))
      );
      setShowDropdown(true);
    } catch (err) {
      console.error("Nominatim search error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    // Debounce: wait 500ms after user stops typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(val);
    }, 500);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.displayName);
    setShowDropdown(false);
    setSuggestions([]);
    onChange(suggestion.displayName, suggestion.lat, suggestion.lng);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    onChange("", 0, 0);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 animate-spin" />
        )}
        {!loading && query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-purple-50 border-b border-gray-100 last:border-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                <span className="text-gray-700 line-clamp-2">{s.displayName}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && !loading && query.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-500 text-center">No addresses found</p>
        </div>
      )}
    </div>
  );
}
