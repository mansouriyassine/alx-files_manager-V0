const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes/index');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/', routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
