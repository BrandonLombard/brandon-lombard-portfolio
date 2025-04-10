const mongoose = require('mongoose');

module.exports = function createTrackVisitorMiddleware(portfolioDB) {
  const visitorSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    sysUsername: { type: String },
    userAgent: { type: String },
    isBot: { type: Boolean, default: false }, // Keeping this field in case you still want to flag bots manually
    visits: [{
      page: String,
      timestamp: { type: Date, default: Date.now }
    }]
  });

  const Visitor = portfolioDB.model("visitorData", visitorSchema);

  return async function trackVisitor(req, res, next) {
    try {
      const ip = req.headers?.['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
      const userAgent = req.headers?.['user-agent'] || 'unknown';
      const page = req.originalUrl || 'unknown';
      const suspiciousPages = ['/getcmd', '/.env', '/phpmyadmin', '/wp-login.php', '/admin/config'];
      const now = new Date();

      // Load existing visitor
      let visitor = await Visitor.findOne({ ip });

      const visitedSuspiciousPage = suspiciousPages.includes(page);
      let isSimultaneous = false;

      if (visitor) {
        const sameTimestampVisits = visitor.visits.filter(v => v.timestamp.getTime() === now.getTime());
        isSimultaneous = sameTimestampVisits.length >= 1;

        const isBotNow = visitedSuspiciousPage || isSimultaneous;

        console.log({
          ip,
          page,
          visitedSuspiciousPage,
          isSimultaneous,
          userAgent
        });

        await Visitor.findOneAndUpdate(
          { ip },
          {
            $push: { visits: { page, timestamp: now } },
            ...(isBotNow ? { $set: { isBot: true } } : {})
          }
        );
      } else {
        // New visitor — create fresh record
        await Visitor.create({
          ip,
          userAgent,
          visits: [{ page, timestamp: now }],
          isBot: visitedSuspiciousPage
        });
      }

      console.log(`✅ Tracked visit to ${page} from IP ${ip} (${visitedSuspiciousPage || isSimultaneous ? 'BOT' : 'REAL'})`);
    } catch (error) {
      console.error('❌ Error tracking visitor:', error);
    }

    next();
  };
};
