/** Environment configuration for Pasty backend. */

export const config = {
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:5173/auth/callback',

  googleAuthUri: 'https://accounts.google.com/o/oauth2/v2/auth',
  googleTokenUri: 'https://oauth2.googleapis.com/token',
  googleUserInfoUri: 'https://www.googleapis.com/oauth2/v2/userinfo',

  scopes: [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/gmail.compose',
    'openid',
    'email',
    'profile',
  ],

  // JWT
  jwtSecret: (() => { const s = process.env.JWT_SECRET; if (!s) throw new Error('JWT_SECRET environment variable is required'); return s; })(),
  jwtExpiryHours: 24,

  // MySQL Database
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    user: process.env.DB_USER ?? 'arti3263_pasty',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'arti3263_pasty',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
  },

  // Frontend
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  // Rate Limiting
  rateLimitAuth: parseInt(process.env.RATE_LIMIT_AUTH ?? '20', 10),
  rateLimitSave: parseInt(process.env.RATE_LIMIT_SAVE ?? '10', 10),
  rateLimitHistory: parseInt(process.env.RATE_LIMIT_HISTORY ?? '30', 10),
  rateLimitDefault: parseInt(process.env.RATE_LIMIT_DEFAULT ?? '60', 10),

  // Redis (opcional — usado pelo rate limiter em multi-instância)
  redisUrl: process.env.REDIS_URL ?? '',

  // OrdoB Integration
  ordobApiUrl: process.env.ORDOB_API_URL ?? 'https://api.ordob.com/api',
  ordobProductSlug: process.env.ORDOB_PRODUCT_SLUG ?? 'pasty',

  // Server
  port: (() => {
    const p = parseInt(process.env.PORT ?? '8000', 10)
    return Number.isFinite(p) && p > 0 && p < 65536 ? p : 8000
  })(),
}
