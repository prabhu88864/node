import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    price: { type: Number, required: true },

    description: { type: String },

    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Fashion', 'groceries'],
      },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    originalPrice: {type: Number},
    rating: { type: Number, default: 0 },
    productImage: { type: String },

    lastUpdatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
