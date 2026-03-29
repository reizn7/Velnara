import { useState } from "react";
import UserLayout from "@/components/layouts/UserLayout";
import { useCart } from "@/contexts/CartContext";
import { Search, ShoppingBag, Pill, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";

export default function UserSearchPage() {
  const { addItem, items } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [addedVariants, setAddedVariants] = useState(new Set());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSelectedMedicine(null);
    setVariants([]);
    setAddedVariants(new Set());
    try {
      const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.medicines || []);
      if (data.medicines?.length === 0) {
        toast.info("No medicines found. Try a different search term.");
      }
    } catch (err) {
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedicine = async (medicine) => {
    setSelectedMedicine(medicine);
    setLoadingVariants(true);
    setAddedVariants(new Set());
    try {
      const res = await fetch(`/api/medicines/variants?medicineId=${medicine.id}`);
      const data = await res.json();
      setVariants(data.variants || []);
    } catch (err) {
      toast.error("Failed to load variants.");
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleAddToCart = (variant) => {
    addItem(selectedMedicine, variant, 1);
    setAddedVariants((prev) => new Set([...prev, variant.index]));
    toast.success(`${variant.name} added to cart`);
  };

  // Check if a variant is already in cart
  const isInCart = (variant) => {
    return items.some(
      (item) =>
        item.medicineId === selectedMedicine?.id && item.variantIndex === variant.index
    );
  };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Find Medicine</h1>
        <p className="text-gray-500 mb-6">
          Search medicines, add to cart, then send request to nearby shops
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines (e.g. Paracetamol, Amoxicillin)"
              className="w-full h-12 pl-12 pr-24 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>
        </form>

        {/* Search Results - medicine list */}
        {searchResults.length > 0 && !selectedMedicine && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Results</h2>
            {searchResults.map((med) => (
              <button
                key={med.id}
                onClick={() => handleSelectMedicine(med)}
                className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{med.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{med.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-purple-600">
                    <Pill className="w-4 h-4" />
                    <span>{med.variantCount} variant{med.variantCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Variants for selected medicine */}
        {selectedMedicine && (
          <div>
            <button
              onClick={() => { setSelectedMedicine(null); setVariants([]); setAddedVariants(new Set()); }}
              className="text-sm text-purple-600 hover:text-purple-700 mb-4"
            >
              &larr; Back to results
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedMedicine.name}</h2>
            <p className="text-sm text-gray-500 mb-4">
              Add variants to your cart. You can search more medicines and add those too.
            </p>

            {loadingVariants ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              </div>
            ) : variants.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No variants listed for this medicine yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((v) => {
                  const inCart = isInCart(v) || addedVariants.has(v.index);
                  return (
                    <div
                      key={v.id}
                      className={`p-4 bg-white border rounded-xl ${inCart ? "border-purple-300 bg-purple-50/30" : "border-gray-200"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{v.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{v.mg}</span>
                            <span className="text-sm font-semibold text-purple-700">Rs. {v.price}</span>
                            {v.manufacturer && (
                              <span className="text-xs text-gray-400">by {v.manufacturer}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(v)}
                          disabled={inCart}
                          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            inCart
                              ? "bg-purple-100 text-purple-600 cursor-default"
                              : "bg-purple-600 text-white hover:bg-purple-700"
                          }`}
                        >
                          {inCart ? (
                            <>
                              <Check className="w-4 h-4" />
                              In Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {searchResults.length === 0 && !loading && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Search for medicines</h3>
            <p className="text-sm text-gray-500">
              Add medicines to cart, then send to shops — or upload a prescription in the cart
            </p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
