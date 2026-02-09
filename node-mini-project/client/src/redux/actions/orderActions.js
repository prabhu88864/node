import * as types from "./actionTypes";
import { 
  createOrderApi, 
  getUserOrdersApi, 
  getOrderByIdApi 
} from "../apis/orderApi";

// ============================
// CREATE ORDER
// ============================
export const createOrder = (orderData) => {
  return async (dispatch) => {
    dispatch({ type: types.ORDER_CREATE_START });

    try {
      const res = await createOrderApi(orderData);
      const order = res.data || {};

      dispatch({ type: types.ORDER_CREATE_SUCCESS, payload: order });
    } catch (err) {
      dispatch({
        type: types.ORDER_CREATE_ERROR,
        payload: err.response?.data?.message || err.message || "Order creation failed",
      });
    }
  };
};

// ============================
// FETCH ALL ORDERS OF USER
// ============================
export const fetchOrders = () => {
  return async (dispatch) => {
    dispatch({ type: types.ORDER_FETCH_START });

    try {
      const res = await getUserOrdersApi();
      const orders = res.data.orders || [];

      dispatch({ type: types.ORDER_FETCH_SUCCESS, payload: orders });
    } catch (err) {
      dispatch({
        type: types.ORDER_FETCH_ERROR,
        payload: err.response?.data?.message || err.message,
      });
    }
  };
};

// ============================
// FETCH ORDER BY ID
// ============================
export const fetchOrderById = (orderId) => {
  return async (dispatch) => {
    dispatch({ type: types.ORDER_FETCH_BY_ID_START });

    try {
      const res = await getOrderByIdApi(orderId);
      const order = res.data || {};

      dispatch({ type: types.ORDER_FETCH_BY_ID_SUCCESS, payload: order });
    } catch (err) {
      dispatch({
        type: types.ORDER_FETCH_BY_ID_ERROR,
        payload: err.response?.data?.message || err.message || "Unable to fetch order details",
      });
    }
  };
};
