// workers/saleWorker.js
import 'dotenv/config';

// Ensure DB is connected before importing models so models register on the same connection
import { connectDB } from '../src/db.js';
await connectDB();

import mongoose from 'mongoose';
import saleQueue from '../src/queues/saleQueue.js';
import Sale from '../src/models/Sale.js';
import Product from '../src/models/Product.js';

// startup logs
console.log('WORKER starting. cwd =', process.cwd());
console.log('WORKER PID =', process.pid);
console.log('WORKER using MONGO_URI:', process.env.MONGO_URI);
console.log('WORKER using REDIS_URL:', process.env.REDIS_URL);

mongoose.set('bufferCommands', false);

// Queue event listeners (worker-only)
saleQueue.on('ready', () => console.log('SaleQueue READY (Redis connected)'));
saleQueue.on('error', err => console.error('SaleQueue ERROR', err));
saleQueue.on('failed', (job, err) => console.error(`Job ${job.id} FAILED (${job.name})`, err));
saleQueue.on('completed', job => console.log(`Job ${job.id} COMPLETED (${job.name})`));

// Helper: compute discounted price and round to integer (currency)
function computeDiscountedPrice(price, discountPercent) {
  const d = Math.max(0, Math.min(100, Number(discountPercent) || 0)); // clamp
  const p = Number(price || 0);
  return Math.round(p * (1 - d / 100));
}

// PROCESS startSale  (this will OVERWRITE product.price with discounted price computed from originalPrice when present)
saleQueue.process('startSale', async (job) => {
  console.log('\n=======================================');
  console.log('Processing startSale job:', job.data);
  console.log('=======================================');

  try {
    const { saleId, category, discount: jobDiscount } = job.data || {};

    if (!saleId) {
      console.error('startSale: missing saleId in job.data', job.data);
      return;
    }

    // Load sale (prefer sale.discount if present)
    const sale = await Sale.findById(saleId);
    if (!sale) {
      console.warn('startSale: sale not found', saleId);
      return;
    }

    const discount = Number(jobDiscount ?? sale.discount ?? 0);
    if (!(discount > 0)) {
      console.log('startSale: discount is 0 or invalid, skipping price changes');
      sale.isActive = true;
      await sale.save();
      return;
    }

    // Activate the sale
    sale.isActive = true;
    await sale.save();
    console.log(`WORKER: Sale ACTIVATED: ${saleId} (discount = ${discount}%)`);

    // Find products matching category (case-insensitive exact match)
    const products = await Product.find({
      category: new RegExp(`^${category}$`, 'i')
    }).lean();

    console.log('WORKER: matched products count =', products.length);

    if (products.length === 0) {
      console.log('WORKER: No products matched for category', category);
      return;
    }

    // Build bulk ops: overwrite price (preserve originalPrice if present, or set it if missing)
    const ops = products.map(p => {
      // Use originalPrice as the base if it exists; otherwise use current price and preserve it as originalPrice
      const basePrice = (p.originalPrice !== undefined && p.originalPrice !== null) ? Number(p.originalPrice) : Number(p.price ?? 0);

      const newPrice = computeDiscountedPrice(basePrice, discount);

      // If originalPrice already exists, keep it. Otherwise store originalPrice = current price.
      const originalPriceToStore = (p.originalPrice !== undefined && p.originalPrice !== null) ? p.originalPrice : (p.price ?? basePrice);

      return {
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              price: newPrice,
              onSale: true,
              saleDiscount: discount,
              originalPrice: originalPriceToStore
            }
          }
        }
      };
    });

    // Execute bulkWrite
    const bulkRes = await Product.bulkWrite(ops);
    console.log('WORKER: bulkWrite result', bulkRes);

  } catch (err) {
    console.error('ERROR in startSale:', err && err.stack ? err.stack : err);
    throw err;
  }
});

// PROCESS endSale (restore originalPrice -> price and remove sale fields)
saleQueue.process('endSale', async (job) => {
  console.log('\n=======================================');
  console.log('Processing endSale job:', job.data);
  console.log('=======================================');

  try {
    const { saleId } = job.data || {};

    if (!saleId) {
      console.error('endSale: missing saleId in job.data', job.data);
      return;
    }

    const sale = await Sale.findById(saleId);
    if (!sale) {
      console.warn('endSale: sale not found', saleId);
      return;
    }

    if (!sale.isActive) {
      console.log('endSale: sale already inactive', saleId);
      return;
    }

    // Deactivate sale
    sale.isActive = false;
    await sale.save();

    // Find products in this category that have originalPrice (or saleDiscount)
    const productsToRevert = await Product.find({
      category: new RegExp(`^${sale.category}$`, 'i'),
      $or: [{ originalPrice: { $exists: true } }, { saleDiscount: { $exists: true } }]
    }).lean();

    console.log('WORKER: products to revert count =', productsToRevert.length);

    if (productsToRevert.length === 0) {
      console.log('WORKER: No products to revert for category', sale.category);
      return;
    }

    // Build revert ops: restore price from originalPrice if present, remove sale fields
    const revertOps = productsToRevert.map(p => {
      const update = { $unset: { saleDiscount: '', onSale: '' } };
      if (p.originalPrice !== undefined && p.originalPrice !== null) {
        update.$set = { price: p.originalPrice };
    
      }
      return {
        updateOne: {
          filter: { _id: p._id },
          update
        }
      };
    });

    const revertRes = await Product.bulkWrite(revertOps);
    console.log('WORKER: revert bulkWrite result', revertRes);

  } catch (err) {
    console.error('ERROR in endSale:', err && err.stack ? err.stack : err);
    throw err;
  }
});

console.log('\nWORKER is READY and listening for jobs...\n');
