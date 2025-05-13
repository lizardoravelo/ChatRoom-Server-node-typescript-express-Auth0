import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import config from '@config/constants';

dotenv.config();

// Paths
const basePath = path.resolve(__dirname, '../swagger.auth0.json');
const outputPath = path.resolve(__dirname, '../../dist/swagger.json');

// Log env used during build
console.log('🔍 Environment variables at build time:');
console.log('→ MONGODB_URL:', config.mongo.uri);
console.log('→ PORT:', config.port);
console.log('→ APP_SECRET:', config.secret);
console.log('→ CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('→ HOSTNAME:', config.hostname);

// Read base Swagger config
if (!fs.existsSync(basePath)) {
  console.error(`❌ Base swagger file not found at ${basePath}`);
  process.exit(1);
}
const swagger = JSON.parse(fs.readFileSync(basePath, 'utf8'));

// Inject production server URLs
swagger.servers = [
  {
    url: `${config.hostname}/api`,
    description: 'REST API',
  },
  {
    url: `ws://${config.hostname.replace(/^https?:\/\//, '')}`,
    description: 'WebSocket API',
  },
];

// Ensure dist exists and write file
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(swagger, null, 2));

console.log(`✅ Injected hostname into Swagger file at: ${outputPath}`);
console.log(`📡 Servers: ${JSON.stringify(swagger.servers, null, 2)}`);
