const whitelist = [
    'https://127.0.0.1:3000',
    'https://localhost:3000',
    'https://localhost',
    'https://127.0.0.1',
];

const corsConfig = {
    origin: (requestOrigin, callback) => {
        const isWhitelistedOrigin = whitelist.includes(requestOrigin) || requestOrigin === null;

        if (isWhitelistedOrigin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsConfig;