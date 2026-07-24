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
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtExpiryHours: 24,

  // PostgreSQL
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/pasty',

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
  port: parseInt(process.env.PORT ?? '8000', 10),
}
