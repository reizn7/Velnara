import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((medicine, userDetails) => {
    setItems((prev) => {
      return [
        ...prev,
        {
          id: `${medicine.id}_${Date.now()}`,
          medicineId: medicine.id,
          medicineName: medicine.name,
          category: medicine.category || "",
          company: userDetails.company || "",
          dosage: userDetails.dosage || "",
          form: userDetails.form || "Tablet",
          quantity: userDetails.quantity || 1,
          userNotes: userDetails.notes || "",
        },
      ];
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, []);

  const updateItemNotes = useCallback((itemId, userNotes) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, userNotes } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, updateItemNotes, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
