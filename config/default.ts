/** Default configuration for Claude-Zen */
/* Comprehensive system configuration with TypeScript types */

const config = {
  app: {
    name: 'Claude-Zen',
    version: '2.0.0-alpha.73',
    environment: process.env.NODE_ENV ?? 'development',
    debug: process.env.DEBUG === 'true'},
  server: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    host: process.env.HOST ?? 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
      credentials: true},
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
    }},
  database: {
    url: process.env.DATABASE_URL ?? 'memory',
    pool: {
      min: 2,
      max: 10}},
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
    format: 'json'}};

export default config;
