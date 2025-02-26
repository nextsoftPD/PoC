const express = require('express');
const router = express.Router();
const ollamaController = require('../controllers/ollamaController');

router.post('/analyzeRequirement', ollamaController.analyzeRequirement);

module.exports = router;
