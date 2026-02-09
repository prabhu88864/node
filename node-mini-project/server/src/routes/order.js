import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

const router = Router();

// CREATE ORDER FROM CART
router.post("/create", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = cart.items.map((it) => ({
      product: it.product._id,
      name: it.nameSnapshot || it.product.name,
      image: it.imageSnapshot || it.product.productImage,
      price: it.priceSnapshot || it.product.price,
      qty: it.qty
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = new Order({
      user: userId,
      items,
      totalAmount
    });

    await order.save();

    // Clear cart after order
    cart.items = [];
    await cart.save();

    return res.status(201).json({ message: "Order placed successfully", order });

  } catch (error) {
    console.error("Order create error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET USER ORDERS
router.get("/my-orders", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.json({ orders });

  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
