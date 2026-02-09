// routes/cart.js
import { Router } from "express";
import mongoose from "mongoose";
// routes/cart.js
import { auth } from "../middleware/auth.js";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = Router();
const isValidId = (id) => mongoose.isValidObjectId(id);

// Require auth for all cart routes
router.use(auth);

// GET /api/cart
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product", "name price productImage");
    if (!cart) return res.json({ items: [] });

    // 🔥 Sync snapshots with latest product price
    let updated = false;

    cart.items.forEach((item) => {
      if (!item.product) return;

      if (item.priceSnapshot !== item.product.price) {
        item.priceSnapshot = item.product.price;
        updated = true;
      }
      if (item.nameSnapshot !== item.product.name) {
        item.nameSnapshot = item.product.name;
        updated = true;
      }
      if (item.imageSnapshot !== item.product.productImage) {
        item.imageSnapshot = item.product.productImage;
        updated = true;
      }
    });

    if (updated) await cart.save();

    return res.json({ items: cart.items });

  } catch (err) {
    console.error("GET /api/cart error", err);
    return res.status(500).json({ message: "Server error" });
  }
});


// POST /api/cart  { productId, qty }
router.post("/", async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, qty = 1 } = req.body;
    if (!isValidId(productId)) return res.status(400).json({ message: "Invalid productId" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const idx = cart.items.findIndex((it) => it.product.toString() === productId.toString());
    if (idx > -1) {
      cart.items[idx].qty = Math.max(1, cart.items[idx].qty + Number(qty));
      cart.items[idx].priceSnapshot = product.price;
    } else {
      cart.items.push({
        product: product._id,
        qty: Number(qty),
        priceSnapshot: product.price,
        nameSnapshot: product.name,
        imageSnapshot: product.productImage,
      });
    }

    await cart.save();
    await cart.populate("items.product", "name price productImage");
    return res.status(201).json({ items: cart.items });
  } catch (err) {
    console.error("POST /api/cart error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/cart/:productId  { qty }
router.patch("/:productId", async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { qty } = req.body;
    if (!isValidId(productId)) return res.status(400).json({ message: "Invalid productId" });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const idx = cart.items.findIndex((it) => it.product.toString() === productId.toString());
    if (idx === -1) return res.status(404).json({ message: "Item not found in cart" });

    cart.items[idx].qty = Math.max(1, Number(qty));
    await cart.save();
    await cart.populate("items.product", "name price productImage");
    return res.json({ items: cart.items });
  } catch (err) {
    console.error("PATCH /api/cart/:productId error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/cart/:productId
router.delete("/:productId", async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    if (!isValidId(productId)) return res.status(400).json({ message: "Invalid productId" });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((it) => it.product.toString() !== productId.toString());
    await cart.save();
    await cart.populate("items.product", "name price productImage");
    return res.json({ items: cart.items });
  } catch (err) {
    console.error("DELETE /api/cart/:productId error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// export both named and default
export { router as cartRoutes };
export default router;
