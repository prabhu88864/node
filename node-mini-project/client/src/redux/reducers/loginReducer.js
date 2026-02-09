import * as types from "../actions/actionTypes";

// Load saved token & user from localStorage
const savedToken = localStorage.getItem("token");
const savedUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
  loading: false,
  user: savedUser || null,
  token: savedToken || null,
  error: null,
  isLoggedIn: savedToken ? true : false,
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_START:
      return { ...state, loading: true, error: null };

    case types.LOGIN_SUCCESS:
      // Save user + token to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));

      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isLoggedIn: true,
      };

    case types.LOGIN_ERROR:
      return { ...state, loading: false, error: action.payload };

    case types.LOGOUT_USER:
      // Clear saved data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return {
        loading: false,
        user: null,
        token: null,
        error: null,
        isLoggedIn: false,
      };

    default:
      return state;
  }
};

export default loginReducer;
