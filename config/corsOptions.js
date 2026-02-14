const corsOptions = {
    origin: [
        "http://localhost:3000",
        "https://edchatflow.vercel.app",
        "https://zona-unadamant-unoffensively.ngrok-free.dev",
        "http://192.168.1.106:3000"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = corsOptions;
