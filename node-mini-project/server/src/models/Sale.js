import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Fashion', 'groceries'],
      },
  discount: Number, // e.g., 50 for 50%
  startTime: Date,
  endTime: Date,
  isActive: { type: Boolean, default: false },
});

export default mongoose.model('Sale', saleSchema);
