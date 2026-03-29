import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((medicine, variant, quantity = 1) => {
    setItems((prev) => {
      // Check if same medicine+variant already in cart
      const existing = prev.find(
        (item) => item.medicineId === medicine.id && item.variantIndex === variant.index
      );
      if (existing) {
        return prev.map((item) =>
          item.medicineId === medicine.id && item.variantIndex === variant.index
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `${medicine.id}_${variant.index}_${Date.now()}`,
          medicineId: medicine.id,
          medicineName: medicine.name,
          category: medicine.category,
          variantIndex: variant.index,
          variantName: variant.name,
          variantMg: variant.mg,
          variantPrice: variant.price,
          manufacturer: variant.manufacturer || "",
          quantity,
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

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.variantPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
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
