import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { upload } from "../middleware/upload.js";  // adjust path if different


const productRoutes = Router();
const isValidId = (id) => mongoose.isValidObjectId(id);

productRoutes.post("/", upload.single("productImage"), async (req, res) => {
  try {
    const { name, price,minPrice, maxPrice, description, category ,rating} = req.body;

    const p = Number(price);
const minP = Number(minPrice);
const maxP = Number(maxPrice);

if (!name || category == null || price == null || minPrice == null || maxPrice == null) {
  return res.status(400).json({ error: "name, category, price, minPrice, maxPrice are required" });
}
if (![p, minP, maxP].every(Number.isFinite) || p < 0 || minP < 0 || maxP < 0) {
  return res.status(400).json({ error: "price/minPrice/maxPrice must be non-negative numbers" });
}
if (minP > maxP) {
  return res.status(400).json({ error: "minPrice cannot be greater than maxPrice" });
}
if (p < minP || p > maxP) {
  return res.status(400).json({ error: "price must be within [minPrice, maxPrice]" });
}
    // If file uploaded, save public URL; else allow empty or URL from body
    // const imageUrl = req.file
    // ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    // : null;
    const imageUrl = req.file
  ? `/uploads/${req.file.filename}`
  : null;


    const product = await Product.create({
        name,
        price: p,
        originalPrice: p,
        description,
        category,
        minPrice: minP,
        maxPrice: maxP,
        productImage: imageUrl,
        rating,
        lastUpdatedAt: new Date(),
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (e) {
    console.error("Create product error:", e);
    res.status(500).json({ error: "Server error" });
  }
});
// GET all
productRoutes.get("/", async (req, res) => {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  
      const base = `${req.protocol}://${req.get("host")}`;
      const items = products.map(p => ({
        ...p,
        productImageUrl: p.productImage ? (p.productImage.startsWith("http") ? p.productImage : `${base}${p.productImage}`) : "",
      }));
  
      res.json({ count: items.length, products: items });
    } catch (e) {
      console.error("Get all products error:", e);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // GET by id
  productRoutes.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ error: "Invalid product id" });
  
      const p = await Product.findById(id).lean();
      if (!p) return res.status(404).json({ error: "Product not found" });
  
      const base = `${req.protocol}://${req.get("host")}`;
      const product = {
        ...p,
        productImageUrl: p.productImage ? (p.productImage.startsWith("http") ? p.productImage : `${base}${p.productImage}`) : "",
      };
  
      res.json(product);
    } catch (e) {
      console.error("Get product by id error:", e);
      res.status(500).json({ error: "Server error" });
    }
  });
  

export default productRoutes;      // <-- default export
export { productRoutes };          // optional named export (helps auto-import)
