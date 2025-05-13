import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const roles = ['user', 'admin'] as const;

type Role = (typeof roles)[number];

interface Config {
  corsOrigin: string;
  port: string;
  app: string;
  env: string;
  secret: string;
  hostname: string;
  auth: {
    domain: string;
    audience: string;
    namespace: string;
  };
  mongo: {
    uri: string;
    testURI: string;
  };
  transporter: {
    host: string;
    port: string;
    username: string;
    password: string;
  };
  roles: readonly Role[];
  messages_per_page: number;
  rooms_per_page: number;
}

function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  const parsed = Number(value);
  return !isNaN(parsed) && value !== undefined ? parsed : defaultValue;
}

const config: Config = {
  corsOrigin: process.env.CORS_ORIGINS ?? '',
  port: process.env.PORT ?? '',
  app: process.env.APP ?? '',
  env: process.env.NODE_ENV ?? '',
  secret: process.env.APP_SECRET ?? '',
  hostname: process.env.HOSTNAME ?? `http://localhost:${process.env.PORT}`,
  auth: {
    domain: process.env.AUTH0_DOMAIN ?? '',
    audience: process.env.AUTH0_AUDIENCE ?? '',
    namespace: process.env.AUTH0_NAMESPACE ?? '',
  },
  mongo: {
    uri: process.env.MONGODB_URL ?? '',
    testURI: process.env.MONGOTESTURI ?? '',
  },
  transporter: {
    host: process.env.TRANSPORTER_HOST ?? '',
    port: process.env.TRANSPORTER_PORT ?? '',
    username: process.env.TRANSPORTER_USERNAME ?? '',
    password: process.env.TRANSPORTER_PASSWORD ?? '',
  },
  roles,
  messages_per_page: getNumberEnv('MESSAGE_PER_PAGE', 50),
  rooms_per_page: getNumberEnv('ROOMS_PER_PAGE', 10),
};

export default config;
