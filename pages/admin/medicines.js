import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { toast } from "sonner";
import { Plus, Pill, Trash2, Edit2, X, Save } from "lucide-react";

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    variants: [{ name: "", mg: "", price: "", manufacturer: "" }],
  });

  const fetchMedicines = async () => {
    try {
      const res = await fetch("/api/admin/medicines");
      const data = await res.json();
      setMedicines(data.medicines || []);
    } catch (err) {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, []);

  const resetForm = () => {
    setForm({ name: "", category: "", description: "", variants: [{ name: "", mg: "", price: "", manufacturer: "" }] });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (med) => {
    setForm({
      name: med.name,
      category: med.category || "",
      description: med.description || "",
      variants: med.variants?.length > 0
        ? med.variants.map((v) => ({ name: v.name, mg: v.mg, price: String(v.price), manufacturer: v.manufacturer || "" }))
        : [{ name: "", mg: "", price: "", manufacturer: "" }],
    });
    setEditingId(med.id);
    setShowForm(true);
  };

  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { name: "", mg: "", price: "", manufacturer: "" }] });
  };

  const removeVariant = (index) => {
    if (form.variants.length <= 1) return;
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
  };

  const updateVariant = (index, field, value) => {
    const updated = [...form.variants];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, variants: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Medicine name is required");

    // Validate variants
    const validVariants = form.variants.filter((v) => v.name.trim() && v.mg.trim() && v.price);
    if (validVariants.length === 0) return toast.error("Add at least one valid variant (name, mg, price)");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim(),
          variants: validVariants.map((v) => ({
            name: v.name.trim(),
            mg: v.mg.trim(),
            price: Number(v.price),
            manufacturer: v.manufacturer.trim(),
          })),
        }),
      });

      if (res.ok) {
        toast.success(editingId ? "Medicine updated" : "Medicine added");
        resetForm();
        fetchMedicines();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save medicine");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}" and all its variants?`)) return;
    try {
      const res = await fetch("/api/admin/medicines", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Medicine deleted");
        fetchMedicines();
      }
    } catch (err) {
      toast.error("Failed to delete");
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Catalog</h1>
          <p className="text-gray-500">Manage the global medicine catalog and variants</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Medicine"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? "Edit Medicine" : "Add New Medicine"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Medicine Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Category (e.g. Pain Relief)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
            />
          </div>

          {/* Variants */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Variants</h4>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-2">
              {form.variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Brand Name *"
                    value={v.name}
                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg) *"
                    value={v.mg}
                    onChange={(e) => updateVariant(i, "mg", e.target.value)}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Price (Rs.) *"
                    value={v.price}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Manufacturer"
                    value={v.manufacturer}
                    onChange={(e) => updateVariant(i, "manufacturer", e.target.value)}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
                  />
                  {form.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : editingId ? "Update Medicine" : "Add Medicine"}
          </button>
        </form>
      )}

      {/* Medicine list */}
      {medicines.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No medicines in catalog. Add your first medicine above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {medicines.map((med) => (
            <div key={med.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{med.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {med.category && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {med.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{med.variants?.length || 0} variants</span>
                  </div>
                  {med.description && (
                    <p className="text-sm text-gray-500 mt-1">{med.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(med)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(med.id, med.name)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Variants table */}
              {med.variants?.length > 0 && (
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Brand</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Dosage</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Manufacturer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {med.variants.map((v, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-sm text-gray-900">{v.name}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{v.mg}</td>
                          <td className="px-3 py-2 text-sm text-right font-medium text-purple-700">Rs. {v.price}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{v.manufacturer || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
