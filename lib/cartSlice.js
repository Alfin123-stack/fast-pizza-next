import { createSlice } from "@reduxjs/toolkit";

const initialState = { items: [], hydrated: false, lastAdded: null, addedSeq: 0 };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.hydrated = true;
    },
    addItem(state, action) {
      if (state.items.some((i) => i.pizzaId === action.payload.pizzaId)) return;
      state.items.push(action.payload);
      state.addedSeq += 1;
      state.lastAdded = { name: action.payload.name, seq: state.addedSeq };
    },
    deleteItem(state, action) {
      state.items = state.items.filter((i) => i.pizzaId !== action.payload);
    },
    increaseItemQuantity(state, action) {
      const item = state.items.find((i) => i.pizzaId === action.payload);
      if (!item) return;
      item.quantity++;
      item.totalPrice = item.quantity * item.unitPrice;
    },
    decreaseItemQuantity(state, action) {
      const item = state.items.find((i) => i.pizzaId === action.payload);
      if (!item) return;
      item.quantity--;
      item.totalPrice = item.quantity * item.unitPrice;
      if (item.quantity <= 0) {
        state.items = state.items.filter((i) => i.pizzaId !== action.payload);
      }
    },
    // kind: "add" | "remove"
    toggleIngredient(state, action) {
      const { pizzaId, kind, name } = action.payload;
      const item = state.items.find((i) => i.pizzaId === pizzaId);
      if (!item) return;
      const key = kind === "add" ? "addIngredients" : "removeIngredients";
      const list = item[key] ?? [];
      item[key] = list.includes(name) ? list.filter((n) => n !== name) : [...list, name];
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  hydrateCart, addItem, deleteItem, increaseItemQuantity,
  decreaseItemQuantity, toggleIngredient, clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;

export const getCartItems = (s) => s.cart.items;
export const getCartHydrated = (s) => s.cart.hydrated;
export const getLastAdded = (s) => s.cart.lastAdded;
export const getTotalCartQuantity = (s) => s.cart.items.reduce((n, i) => n + i.quantity, 0);
export const getTotalCartPrice = (s) => s.cart.items.reduce((n, i) => n + i.totalPrice, 0);
export const getItemQuantityById = (id) => (s) =>
  s.cart.items.find((i) => i.pizzaId === id)?.quantity ?? 0;
