const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🚀 API Backend Auth 3 Níveis',
      version: '1.0.0',
      description: `API Node.js completa com **Public/User/Admin**

**👥 Usuários Teste:**
| Email | Password | UID | Role |
|-------|----------|-----|------|
| \`user@teste.com\` | \`password\` | \`user123\` | \`user\` |
| \`admin@teste.com\` | \`password\` | \`admin456\` | \`admin\` |

**Headers Privadas:**
\`\`\`
X-UID: user123
X-TOKEN: [SHA256_hash_do_login]
\`\`\``,
    },
    servers: [{ url: 'http://localhost:3001' }],
    components: {
      securitySchemes: {
        XToken: { type: 'apiKey', in: 'header', name: 'X-TOKEN' },
        XUID: { type: 'apiKey', in: 'header', name: 'X-UID' }
      },
      schemas: {
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            uid: { type: 'string' },
            token: { type: 'string' }
          }
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            uid: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
