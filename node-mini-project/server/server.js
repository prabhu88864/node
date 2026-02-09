import 'dotenv/config.js';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { ComponentLoader } from 'adminjs';
import axios from 'axios';

import { connectDB } from './src/db.js';
import './src/schedulers/priceScheduler.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import productRoutes from './src/routes/products.js';
import saleRoutes from './src/routes/sale.js';
import cartRoutes from "./src/routes/cart.js";
import orderRoutes from "./src/routes/order.js";
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Sale from './src/models/Sale.js';
import Cart from './src/models/Cart.js';


await connectDB();

console.log("SERVER PID =====================", process.pid);

AdminJS.registerAdapter(AdminJSMongoose);

const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------
// Middlewares
// ----------------------
app.use(morgan('dev'));
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3001', // your frontend
    credentials: true, // important for cookies
  })
);

// ✅ Add express-session before AdminJS
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true if HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// ----------------------
// AdminJS Setup
// ----------------------
const componentLoader = new ComponentLoader();
const ImageList = componentLoader.add('ImageList', './src/components/ImageList.jsx');

const admin = new AdminJS({
  rootPath: '/admin',
  componentLoader,
  branding: {
    companyName: 'My Admin',
    withMadeWithLove: false,
  },
  resources: [
    {
      resource: User,
      options: {
        properties: { password: { isVisible: false } },
      },
    },
    {
      resource: Product,
      options: {
        properties: {
          productImage: {
            isVisible: { list: true, show: true, edit: false, filter: false },
            components: { list: ImageList, show: ImageList },
          },
        },
      },
    },
    {
      resource: Cart,
      options: {
        listProperties: ['user', 'items'],   // what shows in table list
        showProperties: ['user', 'items', 'createdAt', 'updatedAt'],
        editProperties: ['user', 'items'],
        filterProperties: ['user', 'createdAt', 'updatedAt'],
    
        properties: {
          // Show items as a table
          'items': {
            type: 'mixed',
            isArray: true,
          },
    
          // For each item field
          'items.product': {
            reference: 'Product',
            isVisible: { list: false, filter: false, show: true, edit: true },
          },
          'items.qty': { type: 'number' },
          'items.priceSnapshot': { type: 'number' },
          'items.nameSnapshot': { type: 'string' },
          'items.imageSnapshot': { type: 'string' },
    
          // Prevent Admin from manually changing timestamps
          createdAt: { isVisible: { edit: false } },
          updatedAt: { isVisible: { edit: false } },
        },
      },
    },
    
    {
      resource: Sale,
      options: {
        properties: {
          startTime: { type: 'datetime' },
          endTime: { type: 'datetime' },
          discount: { type: 'number' },
          isActive: { isVisible: false },
        },
        actions: {
          new: {
            isAccessible: true,
            handler: async (req, res, ctx) => {
              if (req.method === 'post') {
                const payload = req.payload || {};
                await axios.post("https://node-react-mini-project.onrender.com/api/sales/create", {
                  category: payload.category,
                  discount: payload.discount,
                  startTime: payload.startTime,
                  endTime: payload.endTime,
                });

                console.log("🔥 Sale created via AdminJS → /api/sales/create triggered");

                return {
                  redirectUrl: `/admin/resources/Sale`,
                  notice: { message: "Sale scheduled successfully!", type: "success" },
                };
              }
              return {};
            },
          },
        },
      },
    },
  ],
});

// ✅ Use session from express-session above
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email, password) => {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return { email };
    }
    return null;
  },
  cookieName: 'adminjs',
  cookiePassword: process.env.COOKIE_SECRET || 'secret',
});

app.use(admin.options.rootPath, adminRouter);

// ----------------------
// API Routes
// ----------------------
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/orders", orderRoutes);
// ----------------------
// Serve React Frontend
// ----------------------
const buildPath = path.join(__dirname, '../client/build');
app.use(express.static(buildPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

import("./workers/saleWorker.js")
  .then(() => console.log("🔥 Worker Loaded Inside Backend"))
  .catch((err) => console.error("❌ Worker Load Failed", err));

// ----------------------
// Start Server
// ----------------------
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}/admin`));
