import * as types from "./actionTypes";
import { getCartApi, addToCartApi, updateCartItemApi, removeCartItemApi } from "../apis/cartApi";

// fetch cart
export const fetchCart = () => {
  return async (dispatch) => {
    dispatch({ type: types.CART_FETCH_START });
    try {
      const res = await getCartApi();
      const items = res.data?.items || [];
      dispatch({ type: types.CART_FETCH_SUCCESS, payload: items });
    } catch (err) {
      dispatch({ type: types.CART_FETCH_ERROR, payload: err.message || "Unable to fetch cart" });
    }
  };
};

// add item
export const addToCart = (productId, qty = 1) => {
  return async (dispatch) => {
    try {
      const res = await addToCartApi(productId, qty);
      const items = res.data?.items || [];
      dispatch({ type: types.CART_ADD_SUCCESS, payload: items });
    } catch (err) {
      console.error("addToCart error", err);
      // optionally dispatch error
    }
  };
};

// update quantity
export const updateCartItem = (productId, qty) => {
  return async (dispatch) => {
    try {
      const res = await updateCartItemApi(productId, qty);
      const items = res.data?.items || [];
      dispatch({ type: types.CART_UPDATE_SUCCESS, payload: items });
    } catch (err) {
      console.error("updateCartItem error", err);
    }
  };
};

// remove item
export const removeCartItem = (productId) => {
  return async (dispatch) => {
    try {
      const res = await removeCartItemApi(productId);
      const items = res.data?.items || [];
      dispatch({ type: types.CART_REMOVE_SUCCESS, payload: items });
    } catch (err) {
      console.error("removeCartItem error", err);
    }
  };
};
