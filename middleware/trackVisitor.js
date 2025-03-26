// middleware/trackVisitor.js
const mongoose = require('mongoose');

module.exports = function createTrackVisitorMiddleware(portfolioDB) {
  const visitorSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    sysUsername: { type: String },
    userAgent: { type: String },
    visits: [{
      page: String,
      timestamp: { type: Date, default: Date.now }
    }]
  });

  const Visitor = portfolioDB.model("visitor", visitorSchema);

  return async function trackVisitor(req, res, next) {
    try {
      const ip = req.headers?.['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
      const userAgent = req.headers?.['user-agent'] || 'unknown';
      const page = req.originalUrl || 'unknown';

      // Upsert: Create if doesn't exist, else push new visit
      await Visitor.findOneAndUpdate(
        { ip },
        {
          $setOnInsert: { userAgent },
          $push: { visits: { page } }
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Tracked visit to ${page} from IP ${ip}`);
    } catch (error) {
      console.error('❌ Error tracking visitor:', error);
    }

    next();
  };
};
