const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const publicRoutes = require('./src/routes/public');
const userRoutes = require('./src/routes/user');
const adminRoutes = require('./src/routes/admin');

// 🔧 SWAGGER - ADICIONE ESTAS 2 LINHAS
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// 🔥 SWAGGER ROUTES - ADICIONE ESTAS 2 LINHAS AQUI
app.use('/api-docs', swaggerUi.serve);
app.use('/api-docs', swaggerUi.setup(swaggerDocs));

// Rotas normais
app.use('/api/public', publicRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API rodando na porta ${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
});
