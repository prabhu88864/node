// checkSale.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Sale from './src/models/Sale.js'; // <-- correct relative path from server/

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node checkSale.js <saleId>');
    process.exit(2);
  }
  const sale = await Sale.findById(id).lean();
  console.log('findById result for', id, ':', sale ? 'FOUND' : 'NOT FOUND');
  if (sale) console.log(sale);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
