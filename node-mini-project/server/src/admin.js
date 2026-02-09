import 'dotenv/config';
import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import mongoose from 'mongoose';

import User from './src/models/User.js';
import Product from './src/models/Product.js';

AdminJS.registerAdapter(AdminJSMongoose);

const app = express();

// ✅ AdminJS setup
const admin = new AdminJS({
  rootPath: '/admin',
  branding: { companyName: 'My Admin', withMadeWithLove: false },
  resources: [
    {
      resource: User,
      options: {
        properties: {
          password: { isVisible: false },
        },
      },
    },
    {
      resource: Product,
      options: {
        properties: {
          productImage: {
            isVisible: { list: true, edit: false, show: true, filter: false },
            components: {
              list: AdminJS.bundle('./src/components/ImageList.js'),
              show: AdminJS.bundle('./src/components/ImageList.js'),
            },
          },
        },
      },
    },
  ],
});

// ✅ Build router without authentication
const router = AdminJSExpress.buildRouter(admin);

// ✅ Middleware
app.use(admin.options.rootPath, router);
app.use('/uploads', express.static('uploads'));

// ✅ Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Admin running at http://localhost:${port}${admin.options.rootPath}`);
});
