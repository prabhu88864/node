import { combineReducers } from "redux"; // ✅ Import this
import loginReducer from "./loginReducer";
import registerReducer from "./registerReducer";
import productReducer from "./productReducer";
import cartReducer from "./cartReducer";
import orderReducer from "./orderReducer";

const rootReducer = combineReducers({
  // add other reducers here later
  login: loginReducer,
  register: registerReducer,
  products: productReducer,
  cart: cartReducer,
  order: orderReducer,
});

export default rootReducer; 
