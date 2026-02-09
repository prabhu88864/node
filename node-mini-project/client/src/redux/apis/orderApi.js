import API from "../../API/API";
const api = new API();

// Create Order
export const createOrderApi = (orderData) =>
  api.post("api/orders/create", orderData);

// Get Logged In User Orders
export const getUserOrdersApi = () =>
  api.get("api/orders/my-orders");

// Get Single Order Details
export const getOrderByIdApi = (orderId) =>
  api.get(`api/orders/${orderId}`);

// Cancel Order
export const cancelOrderApi = (orderId) =>
  api.patch(`api/orders/cancel/${orderId}`);

// Delete Order
export const deleteOrderApi = (orderId) =>
  api.delete(`api/orders/${orderId}`);
