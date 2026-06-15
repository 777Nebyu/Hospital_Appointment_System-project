// middleware/logger.js
// Request Logging Middleware with Attack Detection

const logRequest = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';
    const userId = req.session?.userId || 'Anonymous';

    console.log(`[${timestamp}] ${method} ${url} | IP: ${ip} | User: ${userId} | UA: ${userAgent}`);

    const suspiciousPatterns = [
        /union\s+select/i,
        /exec\s*\(/i,
        /eval\s*\(/i,
        /<script/i,
        /javascript:/i,
        /\.\.\//,
        /etc\/passwd/,
        /\\x00/,
        /\\x1a/,
        /sleep\s*\(/i,
        /benchmark\s*\(/i
    ];

    const requestData = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
            console.warn(`SECURITY ALERT: Potential attack detected from IP ${ip}`);
            console.warn(`   Pattern: ${pattern}`);
            console.warn(`   URL: ${url}`);
            console.warn(`   Data: ${requestData.substring(0, 200)}`);
            break;
        }
    }

    next();
};

module.exports = { logRequest };
