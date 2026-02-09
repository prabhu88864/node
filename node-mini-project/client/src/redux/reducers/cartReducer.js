import * as types from "../actions/actionTypes";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export default function cartReducer(state = initialState, action) {
  switch (action.type) {
    case types.CART_FETCH_START:
      return { ...state, loading: true, error: null };
    case types.CART_FETCH_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case types.CART_FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };

    case types.CART_ADD_SUCCESS:
    case types.CART_REMOVE_SUCCESS:
    case types.CART_UPDATE_SUCCESS:
      return { ...state, items: action.payload || [] };

    default:
      return state;
  }
}
