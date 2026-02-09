import * as types from "../actions/actionTypes";

// Load saved products from localStorage
const savedProducts = JSON.parse(localStorage.getItem("products"));

const initialState = {
  loading: false,
  list: savedProducts || [],
  error: null,
};

const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.PRODUCTS_FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.PRODUCTS_FETCH_SUCCESS:
      // Save products in localStorage
      localStorage.setItem("products", JSON.stringify(action.payload));

      return {
        ...state,
        loading: false,
        list: action.payload,
        error: null,
      };

    case types.PRODUCTS_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default productReducer;
