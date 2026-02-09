import * as types from "./actionTypes";
import { getProductsApi } from "../../redux/apis/productsApi"; // we create this next

// START Action
export const productsFetchStart = () => ({
  type: types.PRODUCTS_FETCH_START,
});

// SUCCESS Action
export const productsFetchSuccess = (data) => ({
  type: types.PRODUCTS_FETCH_SUCCESS,
  payload: data,
});

// ERROR Action
export const productsFetchError = (error) => ({
  type: types.PRODUCTS_FETCH_ERROR,
  payload: error,
});

// MAIN Initiator (Thunk)
export const productsInitiate = () => {
  return function (dispatch) {
    dispatch(productsFetchStart());
    console.log("productsInitiate called");

    getProductsApi()
      .then((res) => {
        console.log("products response:", res);

        const productList = res?.data?.products || [];
        dispatch(productsFetchSuccess(productList));
      })
      .catch((error) => {
        console.error("products fetch error:", error);
        dispatch(productsFetchError(error.message || "Unable to fetch products"));
      });
  };
};

export default {
  productsInitiate,
};
