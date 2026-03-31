import { useState } from "react";
import UserLayout from "@/components/layouts/UserLayout";
import { useCart } from "@/contexts/CartContext";
import { Search, ShoppingCart, Check, Heart, Thermometer, Brain, Bone, Eye, Baby, Stethoscope, Leaf, Clock, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/router";

const QUICK_CATEGORIES = [
  { name: "Fever & Pain", icon: Thermometer, query: "paracetamol", color: "bg-red-50 text-red-600 border-red-100" },
  { name: "Heart & BP", icon: Heart, query: "amlodipine", color: "bg-pink-50 text-pink-600 border-pink-100" },
  { name: "Diabetes", icon: Stethoscope, query: "metformin", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { name: "Bone & Joint", icon: Bone, query: "calcium", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { name: "Eye Care", icon: Eye, query: "eye", color: "bg-cyan-50 text-cyan-600 border-cyan-100" },
  { name: "Mental Health", icon: Brain, query: "escitalopram", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { name: "Mother & Baby", icon: Baby, query: "folic", color: "bg-green-50 text-green-600 border-green-100" },
  { name: "Ayurveda", icon: Leaf, query: "ashwagandha", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
];

const POPULAR_SEARCHES = [
  "Paracetamol", "Azithromycin", "Cetirizine", "Omeprazole",
  "Amoxicillin", "Dolo 650", "Crocin", "Vitamin D3",
  "Pan 40", "Montair LC",
];

const FORM_OPTIONS = ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Gel", "Drops", "Inhaler", "Powder", "Other"];

export default function UserSearchPage() {
  const { addItem, items } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // User-entered details for selected medicine
  const [userDetails, setUserDetails] = useState({
    company: "",
    dosage: "",
    form: "Tablet",
    quantity: 1,
    notes: "",
  });

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSelectedMedicine(null);
    setHasSearched(true);
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

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    setLoading(true);
    setSelectedMedicine(null);
    setHasSearched(true);
    fetch(`/api/medicines/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        setSearchResults(data.medicines || []);
        if (data.medicines?.length === 0) toast.info("No medicines found.");
      })
      .catch(() => toast.error("Search failed."))
      .finally(() => setLoading(false));
  };

  const handleSelectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setUserDetails({ company: "", dosage: "", form: "Tablet", quantity: 1, notes: "" });
  };

  const handleAddToCart = () => {
    if (!selectedMedicine) return;
    
    addItem(selectedMedicine, userDetails);
    toast.success(`${selectedMedicine.name} added to cart`);
    
    // Reset and go back to results
    setSelectedMedicine(null);
    setUserDetails({ company: "", dosage: "", form: "Tablet", quantity: 1, notes: "" });
  };

  const isInCart = (medicineId) => {
    return items.some((item) => item.medicineId === medicineId);
  };

  const showHomepage = !hasSearched && searchResults.length === 0 && !selectedMedicine;

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Find Medicine</h1>
          <p className="text-gray-500">
            Search medicines, add details, then send request to nearby shops
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines (e.g. Paracetamol, Crocin)"
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

        {/* Homepage content */}
        {showHomepage && (
          <>
            {/* Quick Categories */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Browse by Category</h2>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleQuickSearch(cat.query)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center hover:shadow-sm transition-all ${cat.color}`}
                  >
                    <cat.icon className="w-5 h-5" />
                    <span className="text-xs font-medium leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Searches */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Popular Medicines</h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-purple-300 hover:text-purple-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-2xl p-6 mb-8">
              <h2 className="text-sm font-semibold text-purple-900 uppercase tracking-wide mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Search & Select Medicine</p>
                    <p className="text-xs text-gray-500">Find medicine name from our database</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Add Your Details</p>
                    <p className="text-xs text-gray-500">Specify company, dosage, form & quantity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Send to Nearby Shops</p>
                    <p className="text-xs text-gray-500">Shops within 5km receive your request</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Compare & Choose</p>
                    <p className="text-xs text-gray-500">Pick the best shop based on availability</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/user/cart")}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">View Cart</p>
                  <p className="text-xs text-gray-500">Review & send request</p>
                </div>
              </button>
              <button
                onClick={() => router.push("/user/requests")}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">My Requests</p>
                  <p className="text-xs text-gray-500">Check shop responses</p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Search Results - medicine list */}
        {searchResults.length > 0 && !selectedMedicine && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Results ({searchResults.length})</h2>
              <button
                onClick={() => { setHasSearched(false); setSearchResults([]); setSearchQuery(""); }}
                className="text-xs text-purple-600 hover:text-purple-700"
              >
                Clear results
              </button>
            </div>
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
                  <div className="flex items-center gap-2">
                    {isInCart(med.id) && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">In cart</span>
                    )}
                    <Plus className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results state */}
        {hasSearched && searchResults.length === 0 && !loading && !selectedMedicine && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No medicines found</h3>
            <p className="text-sm text-gray-500 mb-4">
              Try a different search term or browse categories
            </p>
            <button
              onClick={() => { setHasSearched(false); setSearchResults([]); setSearchQuery(""); }}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Browse Categories
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        )}

        {/* Add medicine details form */}
        {selectedMedicine && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedMedicine.name}</h2>
                <p className="text-sm text-gray-500">{selectedMedicine.category}</p>
              </div>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 bg-purple-50 p-3 rounded-lg">
            </p>              

            <div className="space-y-4">
              {/* Company/Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company / Brand Name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={userDetails.company}
                  onChange={(e) => setUserDetails({ ...userDetails, company: e.target.value })}
                  placeholder="e.g. Cipla, Sun Pharma, GSK"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage / Strength <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={userDetails.dosage}
                  onChange={(e) => setUserDetails({ ...userDetails, dosage: e.target.value })}
                  placeholder="e.g. 500mg, 650mg, 10mg/5ml"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>

              {/* Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form</label>
                <div className="flex flex-wrap gap-2">
                  {FORM_OPTIONS.map((form) => (
                    <button
                      key={form}
                      type="button"
                      onClick={() => setUserDetails({ ...userDetails, form })}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        userDetails.form === form
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                      }`}
                    >
                      {form}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setUserDetails({ ...userDetails, quantity: Math.max(1, userDetails.quantity - 1) })}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-lg">{userDetails.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setUserDetails({ ...userDetails, quantity: userDetails.quantity + 1 })}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">strips / bottles / units</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={userDetails.notes}
                  onChange={(e) => setUserDetails({ ...userDetails, notes: e.target.value })}
                  placeholder="Any specific requirements or instructions..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none"
                />
              </div>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              className="w-full mt-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>

            <button
              onClick={() => setSelectedMedicine(null)}
              className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
