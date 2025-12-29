// backend/src/routes/market.routes.js

const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// Public routes - no auth required
router.get('/crypto-prices', marketController.getCryptoPrices);
router.get('/indices', marketController.getMarketIndices);
router.get('/news', marketController.getMarketNews);
router.get('/sentiment', marketController.getMarketSentiment);
router.get('/recommendations', marketController.getInvestmentRecommendations);
router.get('/economics', marketController.getGlobalEconomics);

module.exports = router;
