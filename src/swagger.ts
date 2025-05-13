import path from 'path';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerDocument from '../dist/swagger.json';

const swaggerOptions = {
  definition: swaggerDocument,
  apis: [path.join(__dirname, 'routes/*.ts')], // Path to the API docs
};

console.log('🚀 Swagger servers:', swaggerDocument.servers);
const swaggerSpecs = swaggerJsDoc(swaggerOptions);

export default swaggerSpecs;
