// backend/src/services/marketDataService.js

const axios = require('axios');

class MarketDataService {
  /**
   * Obtener precios de crypto desde CoinGecko (gratis, sin key)
   */
  static async getCryptoPrices() {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'bitcoin,ethereum,cardano,ripple,solana,polkadot,dogecoin',
            vs_currencies: 'usd',
            include_market_cap: true,
            include_24hr_vol: true,
            include_24hr_change: true,
          },
          timeout: 5000,
        }
      );

      return {
        source: 'CoinGecko',
        timestamp: new Date(),
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Error fetching crypto prices:', error.message);
      return { error: 'Could not fetch crypto data', source: 'CoinGecko' };
    }
  }

  /**
   * Obtener datos de mercado general (FRED API - US Market data)
   */
  static async getMarketIndices() {
    try {
      // Usando un endpoint público sin API key para datos básicos
      const response = await axios.get(
        'https://www.alphavantage.co/query',
        {
          params: {
            function: 'CURRENCY_EXCHANGE_RATE',
            from_currency: 'USD',
            to_currency: 'EUR',
            apikey: process.env.ALPHA_VANTAGE_KEY || 'demo',
          },
          timeout: 5000,
        }
      );

      return {
        source: 'Alpha Vantage',
        timestamp: new Date(),
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Error fetching market data:', error.message);
      return { error: 'Could not fetch market data', source: 'Alpha Vantage' };
    }
  }

  /**
   * Obtener noticias de mercado
   */
  static async getMarketNews() {
    try {
      const response = await axios.get(
        'https://newsapi.org/v2/everything',
        {
          params: {
            q: 'stock market investment finance',
            language: 'es',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: process.env.NEWS_API_KEY || 'demo',
          },
          timeout: 5000,
        }
      );

      if (response.data.articles) {
        return {
          source: 'NewsAPI',
          timestamp: new Date(),
          articles: response.data.articles.slice(0, 10).map(article => ({
            title: article.title,
            description: article.description,
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt,
            image: article.urlToImage,
          })),
        };
      }

      return { error: 'No articles found', source: 'NewsAPI' };
    } catch (error) {
      console.error('❌ Error fetching news:', error.message);
      return { error: 'Could not fetch news', source: 'NewsAPI' };
    }
  }

  /**
   * Obtener sentimiento del mercado (datos simulados para demo)
   */
  static getMarketSentiment() {
    const sentiments = [
      {
        indicator: 'Fear & Greed',
        value: Math.floor(Math.random() * 100),
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
      {
        indicator: 'Market Volatility',
        value: Math.floor(Math.random() * 50) + 10,
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
      {
        indicator: 'Economic Growth',
        value: Math.floor(Math.random() * 30) + 50,
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
    ];

    return {
      timestamp: new Date(),
      indicators: sentiments,
      overall: 'Moderate', // Bullish, Neutral, Bearish
    };
  }

  /**
   * Obtener recomendaciones de inversión basadas en mercado
   */
  static async getInvestmentRecommendations() {
    try {
      // Estos son ejemplos basados en tendencias actuales del mercado
      const recommendations = [
        {
          category: 'Technology',
          sentiment: 'Bullish',
          confidence: '85%',
          reason: 'Strong earnings growth and innovation',
          topCompanies: ['AAPL', 'MSFT', 'GOOGLE'],
        },
        {
          category: 'Healthcare',
          sentiment: 'Neutral',
          confidence: '65%',
          reason: 'Stable but facing regulatory headwinds',
          topCompanies: ['JNJ', 'PFE', 'UNH'],
        },
        {
          category: 'Energy',
          sentiment: 'Bullish',
          confidence: '72%',
          reason: 'Rising energy prices support sector',
          topCompanies: ['XOM', 'CVX', 'COP'],
        },
        {
          category: 'Real Estate',
          sentiment: 'Bearish',
          confidence: '70%',
          reason: 'Interest rate concerns',
          topCompanies: ['SPG', 'DLR', 'PLD'],
        },
        {
          category: 'Cryptocurrencies',
          sentiment: 'Neutral',
          confidence: '55%',
          reason: 'Regulatory uncertainty',
          topCompanies: ['BTC', 'ETH', 'ADA'],
        },
      ];

      return {
        timestamp: new Date(),
        recommendations,
        disclaimer: 'These are educational recommendations. Always do your own research.',
      };
    } catch (error) {
      console.error('❌ Error generating recommendations:', error.message);
      return { error: 'Could not generate recommendations' };
    }
  }

  /**
   * Obtener economía global indicators
   */
  static getGlobalEconomics() {
    return {
      timestamp: new Date(),
      indicators: [
        {
          name: 'US Inflation Rate',
          value: '3.2%',
          change: '-0.3%',
          impact: 'High',
        },
        {
          name: 'US Unemployment',
          value: '3.8%',
          change: '+0.1%',
          impact: 'Medium',
        },
        {
          name: 'Fed Interest Rate',
          value: '5.50%',
          change: '+0%',
          impact: 'High',
        },
        {
          name: 'Dollar Index',
          value: '103.5',
          change: '+0.2%',
          impact: 'Medium',
        },
        {
          name: 'Oil Price',
          value: '$85.00/barrel',
          change: '+1.2%',
          impact: 'High',
        },
      ],
    };
  }
}

module.exports = MarketDataService;
