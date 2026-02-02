# 🚀 API Backend Seguro - Node.js + Express + MySQL (2026)

API backend **enterprise-grade** focada em autenticação, segurança e rastreabilidade de usuários.

---

## ✨ Visão Geral

* Autenticação segura com **tokens HMAC-SHA512 + SHA256**
* **Senhas fortes obrigatórias** (bcrypt salt 12)
* **Rate limit por IP** (5 tentativas / 15 min)
* Recuperação de senha com **token temporário**
* Histórico de login e IP
* Emails automáticos (Mailtrap)
* Arquitetura organizada e pronta para produção

---

## 🔌 Tech Stack

* Node.js + Express
* MySQL 8.x
* bcrypt
* crypto / crypto-js
* nodemailer (Mailtrap)
* dotenv
* Swagger (opcional)

---

## 🚀 Primeiros Passos

```bash
git clone git@github.com:wellarj/api_backend.git
cd api_backend
npm install
```

### Configurar ambiente

Crie um `.env` baseado no `.env.example`.

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASS=senha
DB_NAME=minha_api

TOKEN_SECRET=CHAVE_SUPER_SECRETA_64_CHARS
JWT_NOME_APLICACAO=API_BACKEND_2026
NODE_ENV=production
```

---

## 🟢 Health Check

| Método | Rota               | Descrição                     |
| ------ | ------------------ | ----------------------------- |
| GET    | `/api/public/ping` | Verifica se a API está online |

**Response**

```json
{
  "message": "API Pública OK",
  "timestamp": "2026-02-02T18:20:30.000Z",
  "version": "1.0.0"
}
```

---

## 🔓 Rotas Públicas (`/api/public`)

### 🔑 Login

| Método | Rota     |
| ------ | -------- |
| POST   | `/login` |

**Request**

```json
{
  "email": "user@email.com",
  "password": "SenhaForte@2026"
}
```

**Response**

```json
{
  "success": true,
  "uid": "user_1700000000_x9as12",
  "token": "TOKEN_GERADO",
  "message": "Login realizado com sucesso"
}
```

Rate limit: **5 tentativas / 15 min**

---

### ➕ Registro

| Método | Rota        |
| ------ | ----------- |
| POST   | `/register` |

**Request**

```json
{
  "email": "novo@email.com",
  "password": "MeuApp2026!23"
}
```

**Response**

```json
{
  "success": true,
  "uid": "user_1700001111_abcd99",
  "message": "Conta criada com sucesso! Verifique seu email."
}
```

Senha obrigatoriamente forte:

* 12+ caracteres
* Maiúscula, minúscula, número e símbolo

---

### 📧 Recuperação de senha

| Método | Rota        |
| ------ | ----------- |
| POST   | `/recovery` |

**Request**

```json
{
  "email": "user@email.com"
}
```

**Response**

```json
{
  "success": true,
  "message": "Instruções de recuperação enviadas para seu email."
}
```

Token válido por **1 hora**.

---

### 🔄 Reset de senha

| Método | Rota                     |
| ------ | ------------------------ |
| POST   | `/reset-password/:token` |

**Request**

```json
{
  "password": "NovaSenha@2026"
}
```

**Response**

```json
{
  "success": true,
  "message": "Senha redefinida com sucesso! Faça login."
}
```

Senha forte obrigatória.

---

## 🔒 Rotas Protegidas (`/api/user`)

🔐 **Autenticação obrigatória via middleware**

**Headers esperados**

```
Authorization: Bearer TOKEN
```

---

### 👤 Perfil do usuário

| Método | Rota  |
| ------ | ----- |
| GET    | `/me` |

**Response**

```json
{
  "success": true,
  "user": {
    "uid": "user_1700000000_x9as12",
    "email": "user@email.com",
    "role": "user",
    "is_admin": false,
    "last_ip": "192.168.0.10",
    "last_login": "02/02/2026 18:30",
    "login_attempts": 0,
    "created_at": "2026-01-15T12:00:00.000Z"
  }
}
```

---

### ✏️ Atualizar perfil

| Método | Rota       |
| ------ | ---------- |
| PUT    | `/profile` |

**Request**

```json
{
  "email": "novo@email.com"
}
```

---

### 🔐 Alterar senha

| Método | Rota               |
| ------ | ------------------ |
| POST   | `/change-password` |

**Request**

```json
{
  "currentPassword": "SenhaAntiga@2025",
  "newPassword": "SenhaNova@2026"
}
```

---

### 📋 Histórico de login

| Método | Rota             |
| ------ | ---------------- |
| GET    | `/login-history` |

**Response**

```json
{
  "success": true,
  "history": {
    "last_ip": "192.168.0.10",
    "formatted_login": "02/02/2026 18:30",
    "login_attempts": 0,
    "formatted_failed": "N/A"
  }
}
```

---

## 🔒 Segurança Implementada

| Item          | Implementação          |
| ------------- | ---------------------- |
| Hash senha    | bcrypt (salt 12)       |
| Token         | HMAC-SHA512 + SHA256   |
| Rate limit    | IP + ação              |
| SQL Injection | Queries preparadas     |
| Reset senha   | Token temporário (1h)  |
| Auditoria     | IP e login armazenados |

---

## 📧 Emails Automáticos

* Boas-vindas
* Login recente
* Recuperação de senha
* Alteração de email
* Troca de senha

---

## 🏗️ Estrutura do Projeto

```bash
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

## 📈 Status

✔ Produção pronta
✔ Segurança aplicada
✔ API funcional
✔ SSH Git configurado

---

## 📝 Próximos Passos

* Testes automatizados (Jest)
* Docker / Docker Compose
* CI/CD
* Integração frontend

---

**Feito no Brasil – 2026**
