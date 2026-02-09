import * as types from "../actions/actionTypes";

const initialState = {
  orders: [],
  loading: false,
  createdOrder: null,
  error: null,
};

export default function orderReducer(state = initialState, action) {
  switch (action.type) {
    case types.ORDER_CREATE_START:
    case types.ORDER_FETCH_START:
      return { ...state, loading: true, error: null };

    case types.ORDER_CREATE_SUCCESS:
      return { ...state, loading: false, createdOrder: action.payload };

    case types.ORDER_FETCH_SUCCESS:
      return { ...state, loading: false, orders: action.payload || [] };

    case types.ORDER_CREATE_ERROR:
    case types.ORDER_FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
