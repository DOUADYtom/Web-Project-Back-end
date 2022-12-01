const rateLimit = require('express-rate-limit');
const { logEvents } = require('./logs');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    message: { message: 'Too many login attempts, please try again later' },
    handler: (req, res, next, options) => {
        logEvents(`Too many login attempts: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');
        res.status(options.statusCode).json(options.message);
    },
    standardHearders: true, // send standard rate limit headers
    legacyHeaders: false, // send legacy rate limit headers
});

module.exports = loginLimiter;
