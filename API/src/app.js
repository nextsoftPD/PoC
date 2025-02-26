const express = require('express');
const bodyParser = require('body-parser');
const ollamaRoutes = require('./routes/ollamaRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/ollama', ollamaRoutes);

// Gestione degli errori
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;
