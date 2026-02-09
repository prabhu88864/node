import API from "../../API/API";
const api = new API();

export const getCartApi = () => api.get("api/cart");
export const addToCartApi = (productId, qty = 1) => api.post("api/cart", { productId, qty });
export const updateCartItemApi = (productId, qty) => api.patch(`api/cart/${productId}`, { qty });
export const removeCartItemApi = (productId) => api.delete(`api/cart/${productId}`);
