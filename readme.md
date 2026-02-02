# 🚀 API Backend Seguro - Node.js + Express + MySQL (2026)

![Status](https://github.com/)
![Node.js](https://nodejs.org/)
![License](LICENSE)

## ✨ Visão Geral

API **Enterprise Grade** para autenticação de usuários com **segurança avançada**:

- **9 endpoints** completos (login, register, recovery, perfil, histórico)
- **Token HMAC-SHA512 + SHA256** (768 bits)
- **Senhas bcrypt** com validação forte obrigatória
- **Rate limiting** customizado (5 tentativas / 15 min)
- **5 emails automáticos** via Mailtrap
- **Swagger** documentado
- **MySQL** com estrutura otimizada (12 colunas)

---

## 🔌 Tech Stack

```bash
├── Node.js + Express (v4.x)
├── MySQL 8.x
├── bcrypt (salt 12)
├── crypto-js (HMAC-SHA512 / SHA256)
├── nodemailer + Mailtrap
├── Swagger UI
├── Rate limiting custom
└── dotenv (.env)
```
🚀 Primeiros Passos
1. Clone e instale
git clone <seu-repo>
cd api_backend
npm install

2. Configurar .env
# Banco MySQL
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=minha_api

# Email (Mailtrap)
SMTP_USER=a3663e2263b71ade25a40452c29997a1
SMTP_PASS=seu_mailtrap_password

# Tokens
TOKEN_SECRET=Ch4ng3Th1sT0Y0ur64Ch4rsS3cr3tK3yF0rPr0duct10n2026N0w
JWT_NOME_APLICACAO=MinhaApiSecure2026

PORT=3001
NODE_ENV=production

3. Migrar banco de dados
CREATE TABLE users (
    uid VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin') DEFAULT 'user',
    last_ip VARCHAR(45),
    last_login DATETIME,
    login_attempts INT DEFAULT 0,
    last_failed_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_token VARCHAR(64),
    recovery_expires DATETIME
);

4. Rodar a API
npm run dev   # desenvolvimento (nodemon)
npm start     # produção


✅ API: http://localhost:3001

📚 Swagger: http://localhost:3001/api-docs

🔐 Dados de Teste
UID: user_1770062281148_ko4bcj8f3
TOKEN: 3bff7f52401dff70003eefad8dd25040cfe0325d9bbede3eb8e6b20a671dde9d
EMAIL: leonel16basilio@gmail.com
SENHA: SuperApp2026!123

📋 Endpoints
🔓 Públicos (/api/public/)
Endpoint    Método  Rate Limit  Descrição
/ping   GET -   Health check
/login  POST    5/15min Login + token
/register   POST    5/15min Registro
/recovery   POST    5/15min Recuperação de senha
/reset-password/:token  POST    -   Reset (1h)
🔒 Protegidos (/api/user/)
Endpoint    Método  Auth    Descrição
/me GET X-UID + X-TOKEN Perfil
/login-history  GET X-UID + X-TOKEN Histórico
/profile    PUT X-UID + X-TOKEN Atualizar email
/change-password    POST    X-UID + X-TOKEN Trocar senha
🧪 Testes Rápidos
# Health
curl http://localhost:3001/api/public/ping

# Login
curl -X POST http://localhost:3001/api/public/login \
-H "Content-Type: application/json" \
-d '{"email":"leonel16basilio@gmail.com","password":"SuperApp2026!123"}'

# Perfil
curl -H "X-UID: user_1770062281148_ko4bcj8f3" \
-H "X-TOKEN: SEU_TOKEN" \
http://localhost:3001/api/user/me

🔒 Segurança Implementada
Proteção    Detalhe
Token   HMAC-SHA512 + SHA256 (768 bits)
Senhas  bcrypt salt 12
Rate Limit  5 tentativas / 15 min
SQL Injection   Queries preparadas
Recovery    Token único (1h)
IP Tracking last_ip
📧 Emails Automáticos

👤 Novo login

🎉 Registro

🔓 Recuperação

✅ Atualização de perfil

🔐 Troca de senha

🏗️ Estrutura
api_backend/
├── src/
│   ├── routes/
│   │   ├── public.js
│   │   └── user.js
│   ├── utils/
│   │   ├── tokenUtils.js
│   │   └── emailService.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── config/
│       └── database.js
├── server.js
├── package.json
└── .env.example

📈 Status
Feature Status
9 endpoints ✅
Token 768 bits  ✅
Senhas fortes   ✅
Rate limit  ✅
Emails  ✅
MySQL   ✅
Swagger ✅
Produção    ✅
🔗 Links

Swagger: http://localhost:3001/api-docs

Health: http://localhost:3001/api/public/ping

Mailtrap: https://mailtrap.io

📝 Próximos Passos

⏳ Testes automatizados (Jest)

⏳ Docker / Docker Compose

⏳ CI/CD

⏳ Integração frontend

<div align="center"> <strong>Feito em Sorocaba-SP, Brasil (2026)</strong> </div> ```