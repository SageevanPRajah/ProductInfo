import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const OpenApiValidator = require('express-openapi-validator');
import session from 'express-session';
import passport from './middleware/azureAuth.js';

// Load config
import { PORT, mongodbURL } from './config.js';

// Import routes
import userRoute from './routes/userRoute.js';
import authAzureRoute from './routes/authAzureRoute.js';
import authRoute from './routes/authRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import templateDataRoutes from "./routes/templateDataRoutes.js";
import fixedFieldRoutes from "./routes/fixedFieldRoutes.js";
import templateFieldRoutes from "./routes/templateFieldRoutes.js";
import activityLogRoutes from './routes/activityLogRoutes.js'; 

//api routes
import userRouteV1 from './routes/v1/userRoute.js';
import templateRoutesV1 from './routes/v1/templateRoutes.js';
import templateDataRoutesV1 from "./routes/v1/templateDataRoutes.js";
import fixedFieldRoutesV1 from "./routes/v1/fixedFieldRoutes.js";
import templateFieldRoutesV1 from "./routes/v1/templateFieldRoutes.js";
import activityLogRoutesV1 from './routes/v1/activityLogRoutes.js'; 


dotenv.config();

const app = express();

// fix __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const spec = path.join(__dirname, 'api-spec', 'openapi.yaml');


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'none',    // allow OAuth POSTs in most browsers
    secure: false      // must be HTTPS
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// OpenAPI Validator Middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
  swaggerOptions: { url: '/api-spec/openapi.yaml' }
}));
app.use('/api-spec', express.static(path.dirname(spec)));

app.use(
  '/api/v1',
  OpenApiValidator.middleware({
    apiSpec: spec,
    validateRequests: true,
    validateResponses: true,
  })
);


app.get('/', (req, res) => {
    return res.status(234).send('Welcome to MERN Stack');
});

// Main Routes
app.use('/users', userRoute);
app.use('/api/auth', authAzureRoute);
app.use('/auth', authRoute);
app.use('/templates', templateRoutes);
app.use('/templatedata', templateDataRoutes);
app.use('/fixedfields', fixedFieldRoutes);
app.use('/templatefields', templateFieldRoutes);
app.use("/api/activities", activityLogRoutes); 

// Versioned API Routes
app.use('/tmf-api/productCatalogManagement/v5/users', userRouteV1);
app.use('/tmf-api/productCatalogManagement/v5/productSpecification', templateRoutesV1);
app.use('/tmf-api/productCatalogManagement/v5/templatedata', templateDataRoutesV1);
app.use('/tmf-api/productCatalogManagement/v5/fixedfields', fixedFieldRoutesV1);
app.use('/tmf-api/productCatalogManagement/v5/templatefields', templateFieldRoutesV1);
app.use("/tmf-api/productCatalogManagement/v5/api/activities", activityLogRoutesV1); 

app.use((err, req, res, next) => {
  if (err.status && err.errors) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });
  }
  next(err);
})

// Connect to MongoDB and start server
mongoose.connect(mongodbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('App Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Failed to connect to MongoDB', error);
  });
