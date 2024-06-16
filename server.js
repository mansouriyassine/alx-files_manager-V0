import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
dotenv.config({ path: require.resolve('.env') });

import express from 'express';
import AppController from './controllers/AppController.js';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Load all routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
