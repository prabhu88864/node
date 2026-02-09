import API from "../../API/API";
const api = new API();

// GET all products
export const getProductsApi = () => {
  return api.get("api/products");
};
