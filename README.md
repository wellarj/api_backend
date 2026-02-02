# 🚀 API Backend Seguro — Node.js + Express + MySQL (2026)

API backend **Enterprise Grade** focada em autenticação segura, controle de acesso e boas práticas de segurança para aplicações modernas.

---

## 📌 Visão Geral

Esta API fornece um sistema completo de autenticação e gerenciamento de usuários, com foco em **segurança**, **performance** e **organização de código**.

### Principais destaques

- ✅ 9 endpoints REST completos
- 🔐 Token criptográfico **HMAC-SHA512 + SHA256 (768 bits)**
- 🔑 Senhas protegidas com **bcrypt (salt 12)**
- 🚫 Rate limit customizado (5 tentativas / 15 minutos)
- 📧 5 tipos de emails automáticos (Mailtrap)
- 📚 Documentação Swagger
- 🗄️ MySQL otimizado
- 🌱 Variáveis de ambiente via `.env`

---

## 🔧 Stack Tecnológica

```
Node.js + Express
MySQL 8.x
bcrypt
crypto-js
nodemailer
Mailtrap
Swagger UI
dotenv
```

---

## 🚀 Primeiros Passos

### 1️⃣ Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd api_backend
npm install
```

---

### 2️⃣ Configurar variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
PORT=3001

DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=minha_api

JWT_NOME_APLICACAO=API_BACKEND_2026
NODE_ENV=development
TOKEN_SECRET=SUA_CHAVE_SECRETA_FORTE_AQUI

# Mailtrap
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=SEU_USER_MAILTRAP
SMTP_PASS=SEU_PASS_MAILTRAP

FRONTEND_URL=http://localhost:3000
```

⚠️ **Nunca suba o `.env` para o GitHub**

---

### 3️⃣ Criar estrutura do banco de dados

```sql
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
```

---

### 4️⃣ Rodar a aplicação

```bash
npm run dev     # Desenvolvimento (nodemon)
npm start       # Produção
```

---

## 🌐 URLs

- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api-docs`
- Health check: `http://localhost:3001/api/public/ping`

---

## 🔐 Endpoints

### Públicos (`/api/public`)

| Endpoint | Método | Rate Limit | Descrição |
|--------|--------|------------|-----------|
| /ping | GET | - | Health check |
| /login | POST | 5/15min | Login |
| /register | POST | 5/15min | Registro |
| /recovery | POST | 5/15min | Recuperação |
| /reset-password/:token | POST | - | Reset de senha |

---

### Protegidos (`/api/user`)

| Endpoint | Método | Auth | Descrição |
|--------|--------|------|-----------|
| /me | GET | X-UID + X-TOKEN | Perfil |
| /login-history | GET | X-UID + X-TOKEN | Histórico |
| /profile | PUT | X-UID + X-TOKEN | Atualizar email |
| /change-password | POST | X-UID + X-TOKEN | Trocar senha |

---

## 🧪 Testes Rápidos

### Health

```bash
curl http://localhost:3001/api/public/ping
```

### Login

```bash
curl -X POST http://localhost:3001/api/public/login \
-H "Content-Type: application/json" \
-d '{"email":"email@teste.com","password":"SenhaForte123!"}'
```

---

## 🔒 Segurança Implementada

| Camada | Implementação |
|------|---------------|
| Token | HMAC-SHA512 + SHA256 |
| Senhas | bcrypt (salt 12) |
| Rate limit | 5 tentativas / 15 min |
| SQL Injection | Queries preparadas |
| Recovery | Token temporário (1h) |
| Auditoria | IP e histórico de login |

---

## 📧 Emails Automáticos

- 👤 Novo login
- 🎉 Registro
- 🔓 Recuperação de senha
- ✅ Atualização de perfil
- 🔐 Troca de senha

---

## 🏗️ Estrutura do Projeto

```
api_backend/
├── src/
│   ├── routes/
│   │   ├── public.js
│   │   └── user.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   ├── tokenUtils.js
│   │   └── emailService.js
│   └── config/
│       └── database.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

## 📈 Status do Projeto

| Feature | Status |
|------|--------|
| Endpoints | ✅ |
| Tokens seguros | ✅ |
| Senhas fortes | ✅ |
| Rate limit | ✅ |
| Emails | ✅ |
| Swagger | ✅ |
| Produção | ✅ |

---

## 🛣️ Próximos Passos

- ⏳ Testes automatizados (Jest)
- ⏳ Docker / Docker Compose
- ⏳ CI/CD
- ⏳ Integração com frontend

---

**Feito em Sorocaba-SP, Brasil — 2026**
